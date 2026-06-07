import { Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { WhatsappClientService } from './whatsapp-client.service';
import { EventsModule } from '../../events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [WhatsappController],
  providers: [
    WhatsappService,
    WhatsappClientService,
  ],
  exports: [WhatsappClientService]
})
export class WhatsappModule {}