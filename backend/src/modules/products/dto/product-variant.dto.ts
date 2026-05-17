import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ProductVariantDto {
  @IsString()
  size: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

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
  sku?: string;
}
