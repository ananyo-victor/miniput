import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class AddToCartDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  size: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}