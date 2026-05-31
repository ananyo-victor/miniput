import { IsDate, IsNumber, IsString, IsUUID } from 'class-validator';

export class CartItemEntity {
  @IsUUID()
  id: string;

  @IsUUID()
  userId: string;

  @IsUUID()
  productId: string;

  @IsString()
  size: string;

  @IsNumber()
  quantity: number;

  @IsDate()
  createdAt: Date;
}