import {
  IsArray,
  IsDate,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export const ORDER_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export class OrderItemEntity {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  @IsUUID()
  variantId?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  selectedSize?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectedSizes?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  category?: string;
}

export class OrderEntity {
  @IsUUID()
  id: string;

  @IsString()
  customerPhone: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemEntity)
  items: OrderItemEntity[];

  @IsNumber()
  @Min(0)
  totalPrice: number;

  @IsString()
  address: string;

  @IsIn(ORDER_STATUSES)
  status: OrderStatus;

  @IsOptional()
  @IsDate()
  createdAt?: Date;
}
