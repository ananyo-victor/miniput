import { IsString } from 'class-validator';

export class SendQrDto {
  @IsString()
  qrImageUrl: string;
}