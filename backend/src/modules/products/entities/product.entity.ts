import { IsArray, IsBoolean, IsDate, IsIn, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export const PRODUCT_BRANDS = ['Miniput', 'Kwink'] as const;
export type ProductBrand = (typeof PRODUCT_BRANDS)[number];

export class ProductEntity {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsNumber()
  price: number;

  @IsNumber()
  stock: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrl: string[] | null;

  @IsIn(PRODUCT_BRANDS)
  brand: ProductBrand;

  @IsString()
  description: string;

  @IsBoolean()
  isHidden: boolean;

  @IsOptional()
  @IsDate()
  createdAt?: Date;
}
