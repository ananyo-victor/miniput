import { IsDate, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class ProductVariantEntity {
  @IsUUID()
  id: string;

  @IsUUID()
  productId: string;

  @IsString()
  size: string;

  @IsNumber()
  stock: number;

  @IsOptional()
  @IsNumber()
  price: number | null;

  @IsOptional()
  @IsString()
  sku: string | null;

  @IsOptional()
  @IsDate()
  createdAt?: Date;
}
