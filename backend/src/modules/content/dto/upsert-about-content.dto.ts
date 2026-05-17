import { IsOptional, IsString } from 'class-validator';

export class UpsertAboutContentDto {
  @IsOptional()
  @IsString()
  miniputDetails?: string;

  @IsOptional()
  @IsString()
  kwinkDetails?: string;

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
