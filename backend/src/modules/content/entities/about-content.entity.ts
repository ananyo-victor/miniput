import { IsDate, IsOptional, IsString } from 'class-validator';

export class AboutContentEntity {
  @IsString()
  miniputDetails: string;

  @IsString()
  kwinkDetails: string;

  @IsString()
  address: string;

  @IsString()
  whatsappNumber: string;

  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsDate()
  updatedAt?: Date;
}
