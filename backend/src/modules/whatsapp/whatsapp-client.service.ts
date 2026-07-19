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
    fallbackTemplateVars: string[] = [],
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

    return this.sendTemplate(phone, fallbackTemplate, 'en', fallbackTemplateVars);
  }

  // Uploads a base64 data URL to WhatsApp media and returns the media ID
  async uploadMediaFromDataUrl(dataUrl: string): Promise<string> {
    const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) throw new Error('Invalid data URL format');

    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const ext = mimeType.split('/')[1] ?? 'jpg';

    return this.uploadMedia(buffer, mimeType, `qr.${ext}`);
  }

  // Uploads a raw buffer to WhatsApp media and returns the media ID
  async uploadMedia(buffer: Buffer, mimeType: string, filename: string): Promise<string> {
    const form = new FormData();
    form.append('messaging_product', 'whatsapp');
    form.append('type', mimeType);
    form.append('file', buffer, { filename, contentType: mimeType });

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
    fallbackTemplateVars: string[] = [],
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

    return this.sendTemplate(phone, fallbackTemplate, 'en', fallbackTemplateVars);
  }

  // Sends an already-uploaded WhatsApp media ID as an image if within 24h window, falls back to template
  async sendImageByMediaId(
    phone: string,
    mediaId: string,
    caption: string,
    lastCustomerMessageAt: Date | string | null,
    fallbackTemplate: string = 'hello_world',
    fallbackTemplateVars: string[] = [],
  ) {
    if (this.isWithinWindow(lastCustomerMessageAt)) {
      return axios.post(
        this.baseUrl,
        {
          messaging_product: 'whatsapp',
          to: phone,
          type: 'image',
          image: { id: mediaId, caption },
        },
        { headers: this.headers },
      );
    }

    return this.sendTemplate(phone, fallbackTemplate, 'en', fallbackTemplateVars);
  }

  // Sends a document (e.g. PDF) if within 24h window, falls back to template
  async sendDocument(
    phone: string,
    mediaId: string,
    filename: string,
    caption: string,
    lastCustomerMessageAt: Date | string | null,
    fallbackTemplate: string = 'hello_world',
    fallbackTemplateVars: string[] = [],
  ) {
    if (this.isWithinWindow(lastCustomerMessageAt)) {
      return axios.post(
        this.baseUrl,
        {
          messaging_product: 'whatsapp',
          to: phone,
          type: 'document',
          document: { id: mediaId, filename, caption },
        },
        { headers: this.headers },
      );
    }

    return this.sendTemplate(phone, fallbackTemplate, 'en', fallbackTemplateVars);
  }

  async sendTemplate(
    phone: string,
    templateName: string,
    languageCode: string = 'en',
    bodyVars: string[] = [],
    buttonVars: { index: number; text: string }[] = [],
    headerImageUrl?: string,
  ) {
    const components: any[] = [];

    if (headerImageUrl) {
      const imageParam = headerImageUrl.startsWith('data:')
        ? { id: await this.uploadMediaFromDataUrl(headerImageUrl) }
        : { link: headerImageUrl };
      components.push({ type: 'header', parameters: [{ type: 'image', image: imageParam }] });
    }

    if (bodyVars.length) {
      components.push({ type: 'body', parameters: bodyVars.map((text) => ({ type: 'text', text })) });
    }

    for (const btn of buttonVars) {
      components.push({
        type: 'button',
        sub_type: 'url',
        index: String(btn.index),
        parameters: [{ type: 'text', text: btn.text }],
      });
    }

    return axios.post(
      this.baseUrl,
      {
        messaging_product: 'whatsapp',
        to: phone,
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
          ...(components.length && { components }),
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
