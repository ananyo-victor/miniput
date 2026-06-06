import { Injectable } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';

const WINDOW_HOURS = 24;

@Injectable()
export class WhatsappClientService {
  private readonly token = process.env.WHATSAPP_TOKEN;
  private readonly phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  private readonly apiVersion = 'v25.0';

  private get baseUrl() {
    return `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  isWithinWindow(lastCustomerMessageAt: Date | string | null): boolean {
    if (!lastCustomerMessageAt) return false;
    const elapsed =
      Date.now() - new Date(lastCustomerMessageAt).getTime();
    return elapsed < WINDOW_HOURS * 60 * 60 * 1000;
  }

  // Sends text if within 24h window, falls back to template
  async sendText(
    phone: string,
    message: string,
    lastCustomerMessageAt: Date | string | null,
    fallbackTemplate: string = 'hello_world',
  ) {
    if (this.isWithinWindow(lastCustomerMessageAt)) {
      return axios.post(
        this.baseUrl,
        {
          messaging_product: 'whatsapp',
          to: phone,
          type: 'text',
          text: { body: message },
        },
        { headers: this.headers },
      );
    }

    return this.sendTemplate(phone, fallbackTemplate);
  }

  // Uploads a base64 data URL to WhatsApp media and returns the media ID
  async uploadMediaFromDataUrl(dataUrl: string): Promise<string> {
    const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) throw new Error('Invalid data URL format');

    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');

    const ext = mimeType.split('/')[1] ?? 'jpg';
    const form = new FormData();
    form.append('messaging_product', 'whatsapp');
    form.append('type', mimeType);
    form.append('file', buffer, { filename: `qr.${ext}`, contentType: mimeType });

    const uploadUrl = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/media`;
    const response = await axios.post(uploadUrl, form, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        ...form.getHeaders(),
      },
    });

    return response.data.id as string;
  }

  // Sends image if within 24h window, falls back to template
  // Accepts either a public HTTPS URL or a base64 data URL
  async sendImage(
    phone: string,
    imageUrl: string,
    caption: string,
    lastCustomerMessageAt: Date | string | null,
    fallbackTemplate: string = 'hello_world',
  ) {
    if (this.isWithinWindow(lastCustomerMessageAt)) {
      let imagePayload: Record<string, string>;

      if (imageUrl.startsWith('data:')) {
        const mediaId = await this.uploadMediaFromDataUrl(imageUrl);
        imagePayload = { id: mediaId, caption };
      } else {
        imagePayload = { link: imageUrl, caption };
      }

      return axios.post(
        this.baseUrl,
        {
          messaging_product: 'whatsapp',
          to: phone,
          type: 'image',
          image: imagePayload,
        },
        { headers: this.headers },
      );
    }

    return this.sendTemplate(phone, fallbackTemplate);
  }

  async sendTemplate(
    phone: string,
    templateName: string,
    languageCode: string = 'en_US',
  ) {
    return axios.post(
      this.baseUrl,
      {
        messaging_product: 'whatsapp',
        to: phone,
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
        },
      },
      { headers: this.headers },
    );
  }

  async getMediaUrl(mediaId: string): Promise<string> {
    const response = await axios.get(
      `https://graph.facebook.com/${this.apiVersion}/${mediaId}`,
      { headers: this.headers },
    );
    return response.data.url;
  }

  async downloadMedia(mediaId: string): Promise<{ data: Buffer; contentType: string }> {
    const metaResponse = await axios.get(
      `https://graph.facebook.com/${this.apiVersion}/${mediaId}`,
      { headers: this.headers },
    );
    const mediaUrl: string = metaResponse.data.url;

    const mediaResponse = await axios.get(mediaUrl, {
      headers: { Authorization: `Bearer ${this.token}` },
      responseType: 'arraybuffer',
    });

    return {
      data: Buffer.from(mediaResponse.data),
      contentType: String(mediaResponse.headers['content-type'] ?? 'image/jpeg'),
    };
  }
}
