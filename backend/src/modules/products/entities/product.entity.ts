import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  ArrayMinSize,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export const DISCOUNT_TYPES = ['percent', 'fixed'] as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[number];

export class ProductEntity {
  @IsUUID()
  id: string;

  @IsUUID()
  workspaceId: string;

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

  @IsOptional()
  discountType?: DiscountType | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountValue?: number | null;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrl: string[] | null;

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