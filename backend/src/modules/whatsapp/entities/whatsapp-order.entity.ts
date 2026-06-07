import {
  IsBoolean,
  IsDate,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export const WHATSAPP_ORDER_STATUSES = [
  'pending',
  'accepted',
  'payment_pending',
  'payment_received',
  'shipped',
  'cancelled',
] as const;

export type WhatsappOrderStatus =
  (typeof WHATSAPP_ORDER_STATUSES)[number];

export class WhatsappOrderEntity {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsString()
  customerPhone: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsString()
  orderMessage: string;

  @IsIn(WHATSAPP_ORDER_STATUSES)
  status: WhatsappOrderStatus;

  @IsBoolean()
  qrSent: boolean;

  @IsOptional()
  @IsString()
  paymentScreenshotUrl?: string;

  @IsBoolean()
  paymentConfirmed: boolean;

  @IsOptional()
  @IsDate()
  createdAt?: Date;

  @IsOptional()
  @IsDate()
  updatedAt?: Date;
}