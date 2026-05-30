import { IsBoolean } from 'class-validator';

export class UpdateWhatsappReceiverDto {
  @IsBoolean()
  isWhatsappReceiver: boolean;
}