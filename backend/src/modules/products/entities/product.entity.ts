import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
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

  @IsOptional()
  @IsString()
  sizeGroup?: string | null;

  @IsNumber()
  @Min(1)
  piecesPerPack: number;

  @IsBoolean()
  isTrending: boolean;

  @IsBoolean()
  isBestseller: boolean;

  @IsBoolean()
  isNewRelease: boolean;

  @IsOptional()
  @IsDate()
  createdAt?: Date;

  @IsOptional()
  @IsDate()
  updatedAt?: Date;
}