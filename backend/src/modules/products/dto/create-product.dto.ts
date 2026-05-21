import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateIf,
} from 'class-validator';

import {
  DISCOUNT_TYPES,
  DiscountType,
} from '../entities/product.entity';

export class CreateProductDto {
  @IsUUID()
  workspaceId: string;

  @IsOptional()
  @IsString()
  articleId?: string;

  @IsString()
  name: string;

  @IsString()
  category: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  discountType?: DiscountType | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discountValue?: number | null;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock: number;

  @IsOptional()
  @ValidateIf((_, value) => typeof value === 'string')
  @IsString()
  @ValidateIf((_, value) => Array.isArray(value))
  @IsArray()
  @IsString({ each: true })
  imageUrl?: string | string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;

  @Type(() => Number)
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  size: number[];
}