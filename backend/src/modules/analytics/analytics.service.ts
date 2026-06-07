import { Injectable, InternalServerErrorException } from '@nestjs/common';
import pool from '../../config/database.config';

@Injectable()
export class AnalyticsService {
  async getDashboardStats(workspaceId?: string, startDate?: string, endDate?: string) {
    try {
      // Product-scoped queries only ever bind the workspaceId ($1)
      const productParams: string[] = [];
      if (workspaceId) productParams.push(workspaceId);
      const productWorkspaceFilter = workspaceId ? `WHERE "workspaceId" = $1` : ``;
      const productWorkspaceFilterWithAnd = workspaceId ? `AND "workspaceId" = $1` : ``;

      // Order-scoped queries additionally bind the optional reporting-period bounds,
      // so they need their own param list/placeholder numbering ($1 stays workspaceId).
      const orderParams: string[] = [...productParams];
      let orderDateFilter = '';
      if (startDate) {
        orderParams.push(startDate);
        orderDateFilter += ` AND wo."createdAt" >= $${orderParams.length}`;
      }
      if (endDate) {
        orderParams.push(endDate);
        orderDateFilter += ` AND wo."createdAt" <= $${orderParams.length}`;
      }

      // whatsapp_orders has no workspaceId column directly; scope it via its line items
      const orderWorkspaceFilter = workspaceId
        ? `AND EXISTS (
             SELECT 1 FROM whatsapp_order_items woi
             WHERE woi."whatsappOrderId" = wo.id AND woi."workspaceId" = $1
           )`
        : ``;
      const revenueWorkspaceFilter = workspaceId ? `AND woi."workspaceId" = $1` : ``;

      // 1. KPI Query
      const kpisQuery = `
        SELECT
          (
            SELECT COALESCE(SUM(woi.qty * p.price), 0)
            FROM whatsapp_orders wo
            JOIN whatsapp_order_items woi ON woi."whatsappOrderId" = wo.id
            JOIN products p ON p."articleId" = woi.code
            WHERE wo.status = 'shipped' ${revenueWorkspaceFilter} ${orderDateFilter}
          ) AS "totalRevenue",
          (SELECT COUNT(*) FROM whatsapp_orders wo WHERE wo.status NOT IN ('shipped', 'cancelled') ${orderWorkspaceFilter} ${orderDateFilter}) AS "pendingOrders",
          (SELECT COUNT(*) FROM whatsapp_orders wo WHERE wo.status = 'shipped' ${orderWorkspaceFilter} ${orderDateFilter}) AS "completedOrders",
          (SELECT COUNT(*) FROM products WHERE stock <= 15 ${productWorkspaceFilterWithAnd}) AS "lowStockAlerts",
          (SELECT COUNT(*) FROM products WHERE "discountValue" IS NOT NULL AND "discountValue" > 0 ${productWorkspaceFilterWithAnd}) AS "activeDiscounts"
      `;

      // 2. Order Status Distribution Query
      const orderStatusQuery = `
        SELECT wo.status as name, COUNT(*) as count
        FROM whatsapp_orders wo
        WHERE TRUE ${orderWorkspaceFilter} ${orderDateFilter}
        GROUP BY wo.status
      `;

      // 3. Stock Health Distribution Query
      const stockHealthQuery = `
        SELECT
          COUNT(*) FILTER (WHERE stock > 50) AS "inStock",
          COUNT(*) FILTER (WHERE stock > 15 AND stock <= 50) AS "limited",
          COUNT(*) FILTER (WHERE stock <= 15) AS "lowStock"
        FROM products
        ${productWorkspaceFilter}
      `;

      // Execute all analytical queries in parallel
      const [kpisRes, orderStatusRes, stockHealthRes] = await Promise.all([
        pool.query(kpisQuery, orderParams),
        pool.query(orderStatusQuery, orderParams),
        pool.query(stockHealthQuery, productParams),
      ]);

      const kpis = kpisRes.rows[0];
      const stockData = stockHealthRes.rows[0];

      const totalRevenue = parseFloat(kpis.totalRevenue);
      const completedOrdersCount = parseInt(kpis.completedOrders, 10);

      // Format payload to exactly match the React component's expected structure
      return {
        kpis: {
          totalRevenue,
          pendingOrdersCount: parseInt(kpis.pendingOrders, 10),
          lowStockCount: parseInt(kpis.lowStockAlerts, 10),
          activeDiscountsCount: parseInt(kpis.activeDiscounts, 10),
          averageOrderValue: completedOrdersCount > 0 ? totalRevenue / completedOrdersCount : 0,
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