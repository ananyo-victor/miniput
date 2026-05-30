import { Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { WhatsappClientService } from './whatsapp-client.service';

@Module({
  controllers: [WhatsappController],
  providers: [
    WhatsappService,
    WhatsappClientService,
  ],
})
export class WhatsappModule {}