import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { AuthGuard } from '../../common/guards/auth.guard';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(
    private readonly whatsappService: WhatsappService,
  ) { }

  @Get('webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    console.log('Webhook verification request received:', {
      mode,
      token,
      challenge,
    });
    if (
      mode === 'subscribe' &&
      token === process.env.WHATSAPP_VERIFY_TOKEN
    ) {
      return challenge;
    }

    throw new UnauthorizedException();
  }

  @Post('webhook')
  webhook(@Body() body: any) {
    console.count("-------------------------------")
    console.log('Webhook event received:', JSON.stringify(body, null, 2));
    // Return 200 immediately — Meta retries the webhook if response is slow
    this.whatsappService.processWebhook(body).catch((err) =>
      console.error('processWebhook error:', err),
    );
    return { received: true };
  }

  @Get('orders')
  // @UseGuards(AuthGuard)
  async getAllOrders() {
    return this.whatsappService.getAllOrders();
  }

  @Get('orders/my-orders')
  @UseGuards(AuthGuard)
  async getMyOrders(@Req() req: any) {
    return this.whatsappService.getMyOrders(req.user.id);
  }

  @Get('media/:mediaId')
  @UseGuards(AuthGuard)
  async proxyMedia(@Param('mediaId') mediaId: string, @Res() res: Response) {
    const { data, contentType } = await this.whatsappService.proxyMedia(mediaId);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.end(data);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getOrder(@Param('id') id: string) {
    return this.whatsappService.getOrder(id);
  }

  @Patch(':id/accept')
  @UseGuards(AuthGuard)
  async acceptOrder(@Param('id') id: string) {
    return this.whatsappService.acceptOrder(id);
  }

  @Patch(':id/reject')
  @UseGuards(AuthGuard)
  async rejectOrder(@Param('id') id: string) {
    return this.whatsappService.rejectOrder(id);
  }

  @Patch(':id/send-qr')
  @UseGuards(AuthGuard)
  async sendQr(
    @Param('id') id: string,
  ) {
    return this.whatsappService.sendQr(id);
  }

  @Patch(':id/payment-confirmed')
  @UseGuards(AuthGuard)
  async paymentConfirmed(@Param('id') id: string) {
    return this.whatsappService.paymentConfirmed(id);
  }
}
