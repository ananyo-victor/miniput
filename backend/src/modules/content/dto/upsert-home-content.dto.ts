import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpsertHomeContentDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  heroImageUrls?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  heroImages?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  promoTags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  offerTexts?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  badges?: string[];
}
