import { Injectable, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import pool from '../../config/database.config';
import { WhatsappClientService } from './whatsapp-client.service';
import { EventsGateway } from '../../events/events.gateway';
import { ContentService } from '../content/content.service';
import { generateInvoicePdf } from './invoice.util';

@Injectable()
export class WhatsappService {

  constructor(
    private readonly whatsappClient: WhatsappClientService,
    private readonly eventsGateway: EventsGateway,
    private readonly contentService: ContentService,
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

  // WhatsApp template body parameters reject newlines/tabs and 4+ consecutive spaces
  private sanitizeTemplateText(text: string): string {
    return text.replace(/[\n\t]+/g, ' ').replace(/ {4,}/g, '   ').trim();
  }

  private generateOrderNumber(): string {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `ORD-${datePart}-${randomPart}`;
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

  async getAllOrders(search?: string) {
    const trimmed = search?.trim();
    const { rows } = trimmed
      ? await pool.query(
          `
          SELECT * FROM whatsapp_orders
          WHERE "orderNumber" ILIKE $1 OR id::text ILIKE $1 OR "customerPhone" ILIKE $1 OR "customerName" ILIKE $1
          ORDER BY "createdAt" DESC
          `,
          [`%${trimmed}%`],
        )
      : await pool.query(
          `SELECT * FROM whatsapp_orders ORDER BY "createdAt" DESC`,
        );

    if (!rows.length) {
      return rows;
    }

    const { rows: itemRows } = await pool.query(
      `SELECT * FROM whatsapp_order_items WHERE "whatsappOrderId" = ANY($1::uuid[]) ORDER BY "createdAt" ASC`,
      [rows.map((row) => row.id)],
    );

    const itemsByOrderId = new Map<string, any[]>();
    for (const item of itemRows) {
      const existing = itemsByOrderId.get(item.whatsappOrderId) || [];
      existing.push(item);
      itemsByOrderId.set(item.whatsappOrderId, existing);
    }

    return rows.map((row) => ({ ...row, items: itemsByOrderId.get(row.id) || [] }));
  }

  async createOrder(data: any) {
    const parsedOrder = this.parseOrderMessage(data.orderMessage);
    const orderId = uuidv4();
    const userId = parsedOrder.userId || null;

    let rows: any[] = [];
    for (let attempt = 0; attempt < 5; attempt++) {
      const orderNumber = this.generateOrderNumber();
      try {
        ({ rows } = await pool.query(
          `
          INSERT INTO whatsapp_orders (id, "orderNumber", "customerPhone", "customerName", "orderMessage", "parsedOrder", "messageId", "userId", "lastCustomerMessageAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
          ON CONFLICT ("messageId") DO NOTHING
          RETURNING *
          `,
          [orderId, orderNumber, data.customerPhone, data.customerName, data.orderMessage, JSON.stringify(parsedOrder), data.messageId, userId],
        ));
        break;
      } catch (err: any) {
        if (err?.code === '23505' && err?.constraint === 'whatsapp_orders_order_number_unique') {
          continue;
        }
        throw err;
      }
    }

    const order = rows[0] ?? null;

    if (order && parsedOrder.items.length > 0) {
      await this.insertOrderItems(order.id, parsedOrder.items);
    }

    if (order) {
      this.eventsGateway.emitNewOrder(await this.getOrder(order.id));
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

  private async resolvePrices(codes: string[]): Promise<Map<string, number>> {
    const priceByArticleId = new Map<string, number>();
    const articleIds = [...new Set(codes.filter(Boolean))];

    if (!articleIds.length) {
      return priceByArticleId;
    }

    const { rows } = await pool.query(
      `SELECT "articleId", price FROM products WHERE "articleId" = ANY($1::text[])`,
      [articleIds],
    );

    for (const row of rows) {
      priceByArticleId.set(row.articleId, Number(row.price));
    }

    return priceByArticleId;
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

      await this.whatsappClient.sendTemplate(ownerPhone, 'new_order_alert_1', 'en', [
        customerName || 'Customer',
        customerPhone,
        this.sanitizeTemplateText(message.text.body),
      ]);

      await this.whatsappClient.sendText(
        customerPhone,
        `Hi ${customerName || 'there'}! We have received your order and will confirm shortly.`,
        order.lastCustomerMessageAt,
        'order_received',
        [customerName || 'there'],
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
        await this.whatsappClient.sendImageByMediaId(
          ownerPhone,
          mediaId,
          `Payment screenshot received for order from ${customerName || 'Customer'} (${customerPhone}). Please review and confirm.`,
          new Date(),
          'payment_screenshot_received',
          [customerName || 'Customer', customerPhone],
        );
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
      'order_accepted_1',
      [order.customerName || 'there'],
    );

    this.eventsGateway.emitOrderUpdated(rows[0]);

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
      'order_rejected_1',
      [order.customerName || 'there'],
    );

    this.eventsGateway.emitOrderUpdated(rows[0]);

    return rows[0];
  }

  private async buildInvoicePdf(order: any) {
    const priceByArticleId = await this.resolvePrices(order.items.map((item: any) => item.code));

    const invoiceItems = order.items.map((item: any) => ({
      name: item.name,
      code: item.code,
      qty: item.qty,
      price: priceByArticleId.get(item.code) || 0,
    }));

    const aboutContent = await this.contentService.getAboutContent();

    return generateInvoicePdf({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      createdAt: order.createdAt,
      items: invoiceItems,
      businessPhone: aboutContent.phoneNumber,
      businessAddress: aboutContent.address,
    });
  }

  private async sendInvoice(order: any) {
    const pdfBuffer = await this.buildInvoicePdf(order);

    const filename = `Invoice-${order.orderNumber}.pdf`;
    const mediaId = await this.whatsappClient.uploadMedia(pdfBuffer, 'application/pdf', filename);

    await this.whatsappClient.sendDocument(
      order.customerPhone,
      mediaId,
      filename,
      'Here is your invoice. Thank you for shopping with us!',
      order.lastCustomerMessageAt,
    );
  }

  /**
   * Dev-only: generates the invoice PDF for an order without sending it via
   * WhatsApp or mutating any order state. Used to preview invoice changes.
   */
  async previewInvoice(orderId: string): Promise<{ buffer: Buffer; filename: string }> {
    const order = await this.getOrder(orderId);
    const buffer = await this.buildInvoicePdf(order);
    return { buffer, filename: `Invoice-${order.orderNumber}.pdf` };
  }

  async sendQr(orderId: string) {
    const order = await this.getOrder(orderId);
    const aboutContent = await this.contentService.getAboutContent();
    const qrImageUrl = aboutContent.qrCodeImageUrl;

    if (!qrImageUrl) {
      throw new BadRequestException('No QR code image has been configured. Please upload one in the About page.');
    }

    await this.whatsappClient.sendImage(
      order.customerPhone,
      qrImageUrl,
      'Please scan this QR to complete your payment.',
      order.lastCustomerMessageAt,
      'payment_qr',
    );

    await pool.query(
      `
      UPDATE whatsapp_orders
      SET "qrSent" = TRUE, status = 'payment_pending', "updatedAt" = NOW()
      WHERE id = $1
      `,
      [orderId],
    );

    this.eventsGateway.emitOrderUpdated(await this.getOrder(orderId));

    return { success: true };
  }

  async paymentConfirmed(orderId: string) {
    const order = await this.getOrder(orderId);

    await this.whatsappClient.sendText(
      order.customerPhone,
      'Payment received! Your order is confirmed and will be dispatched soon. Thank you! 🚚',
      order.lastCustomerMessageAt,
      'order_shipped',
      [order.customerName || 'there'],
    );

    await this.sendInvoice(order);

    await pool.query(
      `
      UPDATE whatsapp_orders
      SET status = 'shipped', "paymentConfirmed" = TRUE, "updatedAt" = NOW()
      WHERE id = $1
      `,
      [orderId],
    );

    this.eventsGateway.emitOrderUpdated(await this.getOrder(orderId));

    return { success: true };
  }

  async markPaymentReceived(orderId: string) {
    const order = await this.getOrder(orderId);

    await this.whatsappClient.sendText(
      order.customerPhone,
      `Hi ${order.customerName || 'there'}! We've received your payment. Your order is being processed and will be shipped soon. Thank you! 🚚`,
      order.lastCustomerMessageAt,
      'order_shipped',
      [order.customerName || 'there'],
    );

    await pool.query(
      `
      UPDATE whatsapp_orders
      SET status = 'payment_received', "updatedAt" = NOW()
      WHERE id = $1
      `,
      [orderId],
    );

    this.eventsGateway.emitOrderUpdated(await this.getOrder(orderId));

    return { success: true };
  }

  async markPaymentNotReceived(orderId: string) {
    const order = await this.getOrder(orderId);

    await this.whatsappClient.sendText(
      order.customerPhone,
      `Hi ${order.customerName || 'there'}, we haven't received your payment yet, so your order has been cancelled. Please contact us if you'd like to place the order again.`,
      order.lastCustomerMessageAt,
    );

    await pool.query(
      `
      UPDATE whatsapp_orders
      SET status = 'cancelled', "updatedAt" = NOW()
      WHERE id = $1
      `,
      [orderId],
    );

    this.eventsGateway.emitOrderUpdated(await this.getOrder(orderId));

    return { success: true };
  }
}
