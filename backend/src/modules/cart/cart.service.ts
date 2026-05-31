import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import pool from '../../config/database.config';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  async addToCart(userId: string, dto: AddToCartDto) {
    const { productId, size, quantity } = dto;

    const productCheck = await pool.query(
      'SELECT id FROM products WHERE id = $1',
      [productId]
    );
    if (!productCheck.rows.length) {
      throw new NotFoundException('Product not found');
    }

    const existing = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2 AND size = $3',
      [userId, productId, size]
    );

    if (existing.rows.length) {
      const newQuantity = existing.rows[0].quantity + quantity;
      await pool.query(
        'UPDATE cart_items SET quantity = $1 WHERE id = $2',
        [newQuantity, existing.rows[0].id]
      );
      return { success: true, message: 'Cart item quantity updated' };
    } else {
      const id = uuidv4();
      await pool.query(
        `INSERT INTO cart_items (id, user_id, product_id, size, quantity, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [id, userId, productId, size, quantity]
      );
      return { success: true, message: 'Added to cart' };
    }
  }

  async updateQuantity(userId: string, cartItemId: string, quantity: number) {
    const { rows } = await pool.query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING id',
      [quantity, cartItemId, userId]
    );

    if (!rows.length) {
      throw new NotFoundException('Cart item not found or unauthorized');
    }

    return { success: true, message: 'Quantity updated' };
  }

  async removeFromCart(userId: string, cartItemId: string) {
    const { rows } = await pool.query(
      'DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING id',
      [cartItemId, userId]
    );

    if (!rows.length) {
      throw new NotFoundException('Cart item not found or unauthorized');
    }

    return { success: true, message: 'Removed from cart' };
  }

  async clearCart(userId: string) {
    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
    return { success: true, message: 'Cart cleared successfully' };
  }

  async getCustomerCart(userId: string) {
    const { rows } = await pool.query(
      `
      SELECT 
        c.id as "cartItemId",
        c.size as "selectedSize",
        c.quantity,
        c.created_at as "addedAt",
        p.*
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1
      ORDER BY c.created_at ASC
      `,
      [userId]
    );

    return rows.map((row) => ({
      cartItemId: row.cartItemId,
      selectedSize: row.selectedSize,
      quantity: Number(row.quantity),
      addedAt: row.addedAt,
      id: row.id,
      workspaceId: row.workspaceId,
      articleId: row.articleId,
      name: row.name,
      category: row.category,
      price: Math.round((Number(row.price) || 0) * 100) / 100,
      discountType: row.discountType,
      discountValue: row.discountValue,
      stock: row.stock,
      imageUrls: row.imageUrl || [],
      description: row.description,
      size: row.size || [],
    }));
  }
}