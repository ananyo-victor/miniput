import { IsArray, IsDate, IsIn, IsOptional, IsString } from 'class-validator';

export const BRAND_NAMES = ['Miniput', 'Kwink'] as const;
export type BrandName = (typeof BRAND_NAMES)[number];

export class BrandHomeContentEntity {
  @IsIn(BRAND_NAMES)
  brand: BrandName;

  @IsArray()
  @IsString({ each: true })
  heroImageUrls: string[];

  @IsArray()
  @IsString({ each: true })
  promoTags: string[];

  @IsOptional()
  @IsDate()
  updatedAt?: Date;
}
