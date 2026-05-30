import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WhatsappClientService {
  private readonly token =
    process.env.WHATSAPP_TOKEN;

  private readonly phoneNumberId =
    process.env.WHATSAPP_PHONE_NUMBER_ID;

  async sendTextMessage(
    phone: string,
    message: string,
  ) {
    return axios.post(
      `https://graph.facebook.com/v23.0/${this.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: {
          body: message,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      },
    );
  }

  async sendImage(
    phone: string,
    imageUrl: string,
    caption?: string,
  ) {
    return axios.post(
      `https://graph.facebook.com/v23.0/${this.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: phone,
        type: 'image',
        image: {
          link: imageUrl,
          caption,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      },
    );
  }

  async getMediaUrl(
    mediaId: string,
  ): Promise<string> {
    const response = await axios.get(
      `https://graph.facebook.com/v23.0/${mediaId}`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      },
    );

    return response.data.url;
  }
}