import {
  IsArray,
  IsBoolean,
  IsDate,
  IsIn,
  IsNumber,
  IsOptional,
  ArrayMinSize,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export const PRODUCT_BRANDS = ['Miniput', 'Kwink'] as const;
export type ProductBrand = (typeof PRODUCT_BRANDS)[number];

export class ProductEntity {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsString()
  articleId?: string;

  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
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

  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  size: number[];

  @IsNumber()
  @Min(1)
  piecesPerPack: number;

  @IsOptional()
  @IsDate()
  createdAt?: Date;
}
