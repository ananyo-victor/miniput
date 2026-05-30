import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '../../common/guards/auth.guard';
import { WhatsappService } from './whatsapp.service';
import { SendQrDto } from './dto/send-qr.dto';

@Controller('whatsapp')
export class WhatsappController {
  constructor(
    private readonly whatsappService: WhatsappService,
  ) { }

  @Post('webhook')
  async webhook(@Body() body: any) {
    try {
      return await this.whatsappService.processWebhook(
        body,
      );
    } catch (error) {
      throw new InternalServerErrorException({
        error: error.message,
      });
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getOrder(
    @Param('id') id: string,
  ) {
    return this.whatsappService.getOrder(id);
  }

  @Patch(':id/send-qr')
  @UseGuards(AuthGuard)
  async sendQr(
    @Param('id') id: string,
    @Body() body: SendQrDto,
  ) {
    return this.whatsappService.sendQr(
      id,
      body.qrImageUrl,
    );
  }

  @Patch(':id/payment-confirmed')
  @UseGuards(AuthGuard)
  async paymentConfirmed(
    @Param('id') id: string,
  ) {
    return this.whatsappService.paymentConfirmed(
      id,
    );
  }

  @Get('webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    if (
      mode === 'subscribe' &&
      token === process.env.WHATSAPP_VERIFY_TOKEN
    ) {
      return challenge;
    }

    throw new UnauthorizedException();
  }

  @Patch(':id/accept')
  @UseGuards(AuthGuard)
  async acceptOrder(
    @Param('id') id: string,
  ) {
    return this.whatsappService.acceptOrder(id);
  }
}