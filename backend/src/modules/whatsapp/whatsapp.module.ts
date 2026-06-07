import { Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { WhatsappClientService } from './whatsapp-client.service';
import { EventsModule } from '../../events/events.module';
import { ContentModule } from '../content/content.module';

@Module({
  imports: [EventsModule, ContentModule],
  controllers: [WhatsappController],
  providers: [
    WhatsappService,
    WhatsappClientService,
  ],
  exports: [WhatsappClientService]
})
export class WhatsappModule {}