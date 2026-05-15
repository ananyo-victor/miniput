import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import pool from '../../config/database.config';

@Injectable()
export class OrdersService {
  async createOrder(orderData: any) {
    const { customerPhone, items, totalPrice, address } = orderData;
    const query = `
      INSERT INTO orders (id, "customerPhone", items, "totalPrice", address)
      VALUES ($1, $2, $3, $4, $5) RETURNING *`;

    const values = [uuidv4(), customerPhone, JSON.stringify(items), totalPrice, address];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async approveOrder(orderId: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows: orderRows } = await client.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [orderId]);
      if (!orderRows.length) throw new Error('Order not found');

      const order = orderRows[0];
      if (order.status !== 'pending') throw new Error('Order already processed');

      const touchedProductIds = new Set<string>();

      for (const item of order.items) {
        const quantity = Math.max(1, Number(item.quantity || 1));
        const productId = item.productId || item.id;
        const explicitSize =
          item.size || item.selectedSize || (Array.isArray(item.selectedSizes) ? item.selectedSizes[0] : null);
        const size = explicitSize ? String(explicitSize) : null;
        const variantId = item.variantId || null;

        if (variantId) {
          const { rows: updatedVariantRows } = await client.query(
            `
            UPDATE product_variants
            SET stock = stock - $1
            WHERE id = $2 AND stock >= $1
            RETURNING product_id
            `,
            [quantity, variantId],
          );

          if (!updatedVariantRows.length) {
            throw new Error(`Insufficient stock for variant ${variantId}`);
          }

          touchedProductIds.add(updatedVariantRows[0].product_id);
          continue;
        }

        if (productId && size) {
          const { rows: updatedVariantRows } = await client.query(
            `
            UPDATE product_variants
            SET stock = stock - $1
            WHERE product_id = $2 AND size = $3 AND stock >= $1
            RETURNING product_id
            `,
            [quantity, productId, size],
          );

          if (!updatedVariantRows.length) {
            throw new Error(`Insufficient stock for product ${productId} size ${size}`);
          }

          touchedProductIds.add(updatedVariantRows[0].product_id);
          continue;
        }

        const { rows: fallbackVariantRows } = await client.query(
          `
          UPDATE product_variants
          SET stock = stock - $1
          WHERE product_id = $2 AND size = 'default' AND stock >= $1
          RETURNING product_id
          `,
          [quantity, productId],
        );

        if (!fallbackVariantRows.length) {
          const { rows: fallbackProductRows } = await client.query(
            `
            UPDATE products
            SET stock = stock - $1
            WHERE id = $2 AND stock >= $1
            RETURNING id
            `,
            [quantity, productId],
          );

          if (!fallbackProductRows.length) {
            throw new Error(`Insufficient stock for product ${productId}`);
          }

          touchedProductIds.add(fallbackProductRows[0].id);
        } else {
          touchedProductIds.add(fallbackVariantRows[0].product_id);
        }
      }

      for (const productId of touchedProductIds) {
        await client.query(
          `
          UPDATE products p
          SET stock = COALESCE((
            SELECT SUM(v.stock)
            FROM product_variants v
            WHERE v.product_id = p.id
          ), 0)
          WHERE p.id = $1
          `,
          [productId],
        );
      }

      await client.query(`UPDATE orders SET status = 'approved' WHERE id = $1`, [order.id]);
      await client.query('COMMIT');

      return { success: true, message: 'Inventory updated and order approved' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async rejectOrder(orderId: string) {
    const query = `UPDATE orders SET status = 'rejected' WHERE id = $1 RETURNING *`;
    const { rows } = await pool.query(query, [orderId]);
    if (!rows.length) throw new Error('Order not found');
    return rows[0];
  }

  async getAdminStats() {
    const query = `
      SELECT item->>'category' AS _id, SUM((item->>'price')::numeric) as "totalSales"
      FROM orders, jsonb_array_elements(items) AS item
      WHERE status = 'approved'
      GROUP BY item->>'category'
    `;
    const { rows } = await pool.query(query);
    return rows;
  }
}
