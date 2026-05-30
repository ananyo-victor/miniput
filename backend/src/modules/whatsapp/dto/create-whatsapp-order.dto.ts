import {
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateWhatsappOrderDto {
  @IsString()
  customerPhone: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsString()
  orderMessage: string;
}