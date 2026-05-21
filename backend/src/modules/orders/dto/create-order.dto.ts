import { Type } from 'class-transformer';

import {
  IsArray,
  IsNumber,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

import { OrderItemEntity } from '../entities/order.entity';

export class CreateOrderDto {
  @IsUUID()
  workspaceId: string;

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
}