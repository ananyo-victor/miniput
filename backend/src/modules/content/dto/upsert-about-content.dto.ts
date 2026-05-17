import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpsertAboutContentDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  miniputDetails?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  kwinkDetails?: string[];

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  whatsappNumber?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}