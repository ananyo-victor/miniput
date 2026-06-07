import { IsArray, IsDate, IsOptional, IsString } from 'class-validator';

export class AboutContentEntity {
  @IsArray()
  @IsString({ each: true })
  miniputDetails: string[];

  @IsArray()
  @IsString({ each: true })
  kwinkDetails: string[];

  @IsString()
  address: string;

  @IsString()
  whatsappNumber: string;

  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  locationUrl?: string;

  @IsOptional()
  @IsString()
  qrCodeImageUrl?: string;

  @IsOptional()
  @IsDate()
  updatedAt?: Date;
}