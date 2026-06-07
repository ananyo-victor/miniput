import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import pool from '../../config/database.config';
import { WhatsappClientService } from './whatsapp-client.service';

@Injectable()
export class WhatsappService {

  constructor(
    private readonly whatsappClient: WhatsappClientService,
  ) { }

  private parseOrderMessage(text: string) {
    const fields: Record<string, string> = {};
    const items: { name: string; code: string; qty: number }[] = [];
    let inItems = false;

    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (/^order items:/i.test(trimmed)) {
        inItems = true;
        continue;
      }

      if (inItems) {
        const m = trimmed.match(/^\d+\.\s+(.+?)\s+\[([^\]]+)\]\s+-\s+Qty:\s*(\d+)/i);
        if (m) items.push({ name: m[1].trim(), code: m[2].trim(), qty: parseInt(m[3], 10) });
        continue;
      }

      const kv = trimmed.match(/^([^:]+):\s*(.+)$/);
      if (kv) {
        const key = kv[1].trim().toLowerCase().replace(/\s+/g, '_');
        fields[key] = kv[2].trim();
      }
    }

    return {
      userId: fields['user_id'] || '',
      partyName: fields['party_name'] || '',
      phone: fields['phone'] || '',
      address: fields['address'] || '',
      transport: fields['transport'] || '',
      gst: fields['gst'] || '',
      agent: fields['agent'] || '',
      filledBy: fields['filled_by'] || '',
      remarks: fields['remarks'] || '',
      items,
    };
  }

  private async getWhatsappReceiverPhone(): Promise<string> {
    const { rows } = await pool.query(
      `SELECT phone FROM users WHERE "isWhatsappReceiver" = TRUE LIMIT 1`,
    );

    if (!rows.length || !rows[0].phone) {
      throw new Error('No WhatsApp receiver configured');
    }

    return rows[0].phone;
  }

  async proxyMedia(mediaId: string): Promise<{ data: Buffer; contentType: string }> {
    return this.whatsappClient.downloadMedia(mediaId);
  }

  async getAllOrders() {
    const { rows } = await pool.query(
      `SELECT * FROM whatsapp_orders ORDER BY "createdAt" DESC`,
    );
    return rows;
  }

  async createOrder(data: any) {
    const parsedOrder = this.parseOrderMessage(data.orderMessage);
    const orderId = uuidv4();
    const userId = parsedOrder.userId || null;
    const { rows } = await pool.query(
      `
      INSERT INTO whatsapp_orders (id, "customerPhone", "customerName", "orderMessage", "parsedOrder", "messageId", "userId", "lastCustomerMessageAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT ("messageId") DO NOTHING
      RETURNING *
      `,
      [orderId, data.customerPhone, data.customerName, data.orderMessage, JSON.stringify(parsedOrder), data.messageId, userId],
    );

    const order = rows[0] ?? null;

    if (order && parsedOrder.items.length > 0) {
      await this.insertOrderItems(order.id, parsedOrder.items);
    }

    return order;
  }

  private async resolveWorkspaceIds(codes: string[]): Promise<Map<string, string>> {
    const workspaceByArticleId = new Map<string, string>();
    const articleIds = [...new Set(codes.filter(Boolean))];

    if (!articleIds.length) {
      return workspaceByArticleId;
    }

    const { rows } = await pool.query(
      `SELECT "articleId", "workspaceId" FROM products WHERE "articleId" = ANY($1::text[])`,
      [articleIds],
    );

    for (const row of rows) {
      workspaceByArticleId.set(row.articleId, row.workspaceId);
    }

    return workspaceByArticleId;
  }

  private async insertOrderItems(whatsappOrderId: string, items: { name: string; code: string; qty: number }[]) {
    const workspaceByArticleId = await this.resolveWorkspaceIds(items.map((item) => item.code));

    const values: string[] = [];
    const params: any[] = [];

    items.forEach((item, index) => {
      const offset = index * 5;
      values.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`);
      params.push(whatsappOrderId, item.name, item.code, item.qty, workspaceByArticleId.get(item.code) || null);
    });

    await pool.query(
      `INSERT INTO whatsapp_order_items ("whatsappOrderId", name, code, qty, "workspaceId") VALUES ${values.join(', ')}`,
      params,
    );
  }


  async getMyOrders(userId: string) {
    const { rows: userRows } = await pool.query(
      `SELECT phone FROM users WHERE id = $1`,
      [userId],
    );

    const phone = userRows[0]?.phone || null;

    const { rows } = await pool.query(
      `SELECT * FROM whatsapp_orders WHERE "userId" = $1 OR "customerPhone" = $2 ORDER BY "createdAt" DESC`,
      [userId, phone],
    );
    return rows;
  }

  async getOrder(id: string) {
    const { rows } = await pool.query(
      `SELECT * FROM whatsapp_orders WHERE id = $1`,
      [id],
    );

    if (!rows.length) {
      throw new Error('Order not found');
    }

    const { rows: items } = await pool.query(
      `SELECT * FROM whatsapp_order_items WHERE "whatsappOrderId" = $1 ORDER BY "createdAt" ASC`,
      [id],
    );

    return { ...rows[0], items };
  }

  private async touchCustomerWindow(orderId: string) {
    await pool.query(
      `UPDATE whatsapp_orders SET "lastCustomerMessageAt" = NOW(), "updatedAt" = NOW() WHERE id = $1`,
      [orderId],
    );
  }

  async processWebhook(payload: any) {
    const message =
      payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) {
      return { success: true };
    }

    const customerPhone = message.from;
    const customerName = payload?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile?.name || '';

    if (message.type === 'text') {
      const order = await this.createOrder({
        customerPhone,
        customerName,
        orderMessage: message.text.body,
        messageId: message.id,
      });

      if (!order) {
        console.log('Duplicate message, skipping:', message.id);
        return { success: true };
      }

      const ownerPhone = await this.getWhatsappReceiverPhone();

      await this.whatsappClient.sendTemplate(ownerPhone, 'hello_world');

      await this.whatsappClient.sendText(
        customerPhone,
        `Hi ${customerName || 'there'}! We have received your order and will confirm shortly.`,
        order.lastCustomerMessageAt,
      );
    }

    if (message.type === 'image') {
      const mediaId = message.image.id;

      const { rows } = await pool.query(
        `
        SELECT * FROM whatsapp_orders
        WHERE "customerPhone" = $1 AND status = 'payment_pending'
        ORDER BY "createdAt" DESC
        LIMIT 1
        `,
        [customerPhone],
      );

      if (rows.length) {
        const order = rows[0];
        await pool.query(
          `
          UPDATE whatsapp_orders
          SET "paymentScreenshotUrl" = $1, status = 'payment_received', "updatedAt" = NOW()
          WHERE id = $2
          `,
          [mediaId, order.id],
        );

        await this.touchCustomerWindow(order.id);

        const ownerPhone = await this.getWhatsappReceiverPhone();
        await this.whatsappClient.sendTemplate(ownerPhone, 'hello_world');
      }
    }

    return { success: true };
  }

  async acceptOrder(id: string) {
    const order = await this.getOrder(id);

    const { rows } = await pool.query(
      `
      UPDATE whatsapp_orders
      SET status = 'accepted', "updatedAt" = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [id],
    );

    if (!rows.length) {
      throw new Error('Order not found');
    }

    await this.whatsappClient.sendText(
      order.customerPhone,
      `Hi ${order.customerName || 'there'}! Your order has been accepted. We will send you a payment QR code shortly.`,
      order.lastCustomerMessageAt,
    );

    return rows[0];
  }

  async rejectOrder(id: string) {
    const order = await this.getOrder(id);

    const { rows } = await pool.query(
      `
      UPDATE whatsapp_orders
      SET status = 'cancelled', "updatedAt" = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [id],
    );

    if (!rows.length) {
      throw new Error('Order not found');
    }

    await this.whatsappClient.sendText(
      order.customerPhone,
      `Hi ${order.customerName || 'there'}, unfortunately your order has been rejected. Please contact us for more details.`,
      order.lastCustomerMessageAt,
    );

    return rows[0];
  }

  async sendQr(orderId: string, qrImageUrl: string) {
    const order = await this.getOrder(orderId);

    await this.whatsappClient.sendImage(
      order.customerPhone,
      qrImageUrl,
      'Please scan this QR to complete your payment.',
      order.lastCustomerMessageAt,
    );

    await pool.query(
      `
      UPDATE whatsapp_orders
      SET "qrSent" = TRUE, status = 'payment_pending', "updatedAt" = NOW()
      WHERE id = $1
      `,
      [orderId],
    );

    return { success: true };
  }

  async paymentConfirmed(orderId: string) {
    const order = await this.getOrder(orderId);

    await this.whatsappClient.sendText(
      order.customerPhone,
      'Payment received! Your order is confirmed and will be dispatched soon. Thank you! 🚚',
      order.lastCustomerMessageAt,
    );

    await pool.query(
      `
      UPDATE whatsapp_orders
      SET status = 'shipped', "paymentConfirmed" = TRUE, "updatedAt" = NOW()
      WHERE id = $1
      `,
      [orderId],
    );

    return { success: true };
  }
}
