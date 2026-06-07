import { Injectable, InternalServerErrorException } from '@nestjs/common';
import pool from '../../config/database.config';

@Injectable()
export class AnalyticsService {
  async getDashboardStats(workspaceId?: string) {
    try {
      const params = workspaceId ? [workspaceId] : [];
      const workspaceFilter = workspaceId ? `WHERE "workspaceId" = $1` : ``;
      const workspaceFilterWithAnd = workspaceId ? `AND "workspaceId" = $1` : ``;

      // 1. KPI Query
      const kpisQuery = `
        SELECT
          (SELECT COALESCE(SUM("totalPrice"), 0) FROM orders WHERE status = 'approved' ${workspaceFilterWithAnd}) AS "totalRevenue",
          (SELECT COUNT(*) FROM orders WHERE status = 'pending' ${workspaceFilterWithAnd}) AS "pendingOrders",
          (SELECT COUNT(*) FROM orders WHERE status = 'approved' ${workspaceFilterWithAnd}) AS "approvedOrders",
          (SELECT COUNT(*) FROM products WHERE stock <= 15 ${workspaceFilterWithAnd}) AS "lowStockAlerts",
          (SELECT COUNT(*) FROM products WHERE "discountValue" IS NOT NULL AND "discountValue" > 0 ${workspaceFilterWithAnd}) AS "activeDiscounts"
      `;

      // 2. Order Status Distribution Query
      const orderStatusQuery = `
        SELECT status as name, COUNT(*) as count
        FROM orders
        ${workspaceFilter}
        GROUP BY status
      `;

      // 3. Stock Health Distribution Query
      const stockHealthQuery = `
        SELECT
          COUNT(*) FILTER (WHERE stock > 50) AS "inStock",
          COUNT(*) FILTER (WHERE stock > 15 AND stock <= 50) AS "limited",
          COUNT(*) FILTER (WHERE stock <= 15) AS "lowStock"
        FROM products
        ${workspaceFilter}
      `;

      // Execute all analytical queries in parallel
      const [kpisRes, orderStatusRes, stockHealthRes] = await Promise.all([
        pool.query(kpisQuery, params),
        pool.query(orderStatusQuery, params),
        pool.query(stockHealthQuery, params),
      ]);

      const kpis = kpisRes.rows[0];
      const stockData = stockHealthRes.rows[0];
      
      const totalRevenue = parseFloat(kpis.totalRevenue);
      const approvedOrdersCount = parseInt(kpis.approvedOrders, 10);

      // Format payload to exactly match the React component's expected structure
      return {
        kpis: {
          totalRevenue,
          pendingOrdersCount: parseInt(kpis.pendingOrders, 10),
          lowStockCount: parseInt(kpis.lowStockAlerts, 10),
          activeDiscountsCount: parseInt(kpis.activeDiscounts, 10),
          averageOrderValue: approvedOrdersCount > 0 ? totalRevenue / approvedOrdersCount : 0,
        },
        charts: {
          orderStatusData: orderStatusRes.rows.map((row) => ({
            name: row.name.charAt(0).toUpperCase() + row.name.slice(1),
            count: parseInt(row.count, 10),
          })),
          stockDistribution: [
            { name: 'In Stock (>50)', value: parseInt(stockData.inStock || '0', 10) },
            { name: 'Limited (16-50)', value: parseInt(stockData.limited || '0', 10) },
            { name: 'Low/Out (0-15)', value: parseInt(stockData.lowStock || '0', 10) },
          ],
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(`Failed to generate analytics: ${error.message}`);
    }
  }
}