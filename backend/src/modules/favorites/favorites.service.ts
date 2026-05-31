import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import pool from '../../config/database.config';

@Injectable()
export class FavoritesService {
  
  async toggleFavorite(userId: string, productId: string) {
    // 1. Check if product exists
    const productCheck = await pool.query(
      'SELECT id FROM products WHERE id = $1',
      [productId]
    );
    if (!productCheck.rows.length) {
      throw new NotFoundException('Product not found');
    }

    // 2. Check if already favorited
    const existing = await pool.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );

    if (existing.rows.length) {
      // If it exists, remove it (Unfavorite)
      await pool.query(
        'DELETE FROM favorites WHERE user_id = $1 AND product_id = $2',
        [userId, productId]
      );
      return { favorited: false, message: 'Removed from favorites' };
    } else {
      // If it doesn't exist, insert it (Favorite)
      const id = uuidv4();
      await pool.query(
        `INSERT INTO favorites (id, user_id, product_id, created_at)
         VALUES ($1, $2, $3, NOW())`,
        [id, userId, productId]
      );
      return { favorited: true, message: 'Added to favorites' };
    }
  }

  async getCustomerFavorites(userId: string) {
    // Fetches all favorited items for a user joining product information
    const { rows } = await pool.query(
      `
      SELECT 
        f.id as "favoriteId",
        f.created_at as "favoritedAt",
        p.*
      FROM favorites f
      JOIN products p ON f.product_id = p.id
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC
      `,
      [userId],
    );

    // Maps rows through your price/discount rounding patterns if needed
    return rows.map((product) => ({
      favoriteId: product.favoriteId,
      favoritedAt: product.favoritedAt,
      id: product.id,
      workspaceId: product.workspaceId,
      articleId: product.articleId,
      name: product.name,
      category: product.category,
      price: Math.round((Number(product.price) || 0) * 100) / 100,
      discountType: product.discountType,
      discountValue: product.discountValue,
      stock: product.stock,
      imageUrls: product.imageUrl || [],
      description: product.description,
      size: product.size || [],
    }));
  }
}