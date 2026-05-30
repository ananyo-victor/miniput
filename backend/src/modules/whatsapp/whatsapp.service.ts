import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import pool from '../../config/database.config';
import { WhatsappClientService } from './whatsapp-client.service';

@Injectable()
export class WhatsappService {

  constructor(
    private readonly whatsappClient: WhatsappClientService,
  ) { }

  private async getWhatsappReceiverPhone(): Promise<string> {
    const { rows } = await pool.query(
      `
    SELECT phone
    FROM users
    WHERE "isWhatsappReceiver" = TRUE
    LIMIT 1
    `,
    );

    if (!rows.length) {
      throw new Error(
        'No WhatsApp receiver configured',
      );
    }

    return rows[0].phone;
  }

  async createOrder(data: any) {
    const query = `
    INSERT INTO whatsapp_orders (
      id,
      "customerPhone",
      "customerName",
      "orderMessage"
    )
    VALUES ($1,$2,$3,$4)
    RETURNING *
  `;

    const values = [
      uuidv4(),
      data.customerPhone,
      data.customerName,
      data.orderMessage,
    ];

    const { rows } =
      await pool.query(query, values);

    return rows[0];
  }

  async getOrder(id: string) {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM whatsapp_orders
      WHERE id = $1
      `,
      [id],
    );

    if (!rows.length) {
      throw new Error('Order not found');
    }

    return rows[0];
  }

  async processWebhook(payload: any) {
    const message =
      payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) {
      return { success: true };
    }

    const customerPhone = message.from;

    const customerName =
      payload?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]
        ?.profile?.name || '';

    if (message.type === 'text') {
      const orderMessage = message.text.body;

      const sellerPhone = await this.getWhatsappReceiverPhone();

      const order = await this.createOrder({
        customerPhone,
        customerName,
        orderMessage,
      });

      await this.sendTextMessage(
        sellerPhone,
        `
          New Order
          Order ID: ${order.id}
          Customer: ${customerName}
          Phone: ${customerPhone}
          Message: ${orderMessage}
        `,
      );
    }

    if (message.type === 'image') {
      const mediaId = message.image.id;

      console.log('Payment Screenshot:', mediaId);

      // download media
      // upload to storage
      // update order
    }

    return {
      success: true,
    };
  }

  async sendQr(
    orderId: string,
    qrImageUrl: string,
  ) {
    const order =
      await this.getOrder(orderId);

    const sellerPhone =
      await this.getWhatsappReceiverPhone();

    await this.whatsappClient.sendImage(
      sellerPhone,
      qrImageUrl,
      'Customer Payment QR',
    );

    await pool.query(
      `
    UPDATE whatsapp_orders
    SET
      "qrSent" = TRUE,
      status = 'payment_pending',
      "updatedAt" = NOW()
    WHERE id = $1
    `,
      [orderId],
    );

    return {
      success: true,
    };
  }

  async paymentConfirmed( orderId: string) {
    const order =
      await this.getOrder(orderId);

    await this.whatsappClient.sendTextMessage(
      order.customerPhone,
      'Payment received. Your order is on the way 🚚',
    );

    await pool.query(
      `
    UPDATE whatsapp_orders
    SET
      status = 'shipped',
      "paymentConfirmed" = TRUE,
      "updatedAt" = NOW()
    WHERE id = $1
    `,
      [orderId],
    );

    return {
      success: true,
    };
  }

  async sendTextMessage(
    phone: string,
    message: string,
  ) {
    // WhatsApp Cloud API call
  }

  async acceptOrder(id: string) {
    const { rows } = await pool.query(
      `
        UPDATE whatsapp_orders
        SET
          status = 'accepted',
          "updatedAt" = NOW()
        WHERE id = $1
        RETURNING *
        `,
      [id],
    );

    if (!rows.length) {
      throw new Error('Order not found');
    }

    return rows[0];
  }
}