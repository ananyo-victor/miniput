import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateBillingProfileDto {
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsString()
  billingName: string;

  @IsString()
  @Length(10, 20)
  billingPhone: string;

  @IsOptional()
  @IsEmail()
  billingEmail?: string;

  @IsOptional()
  @IsString()
  gstNumber?: string;

  @IsOptional()
  @IsString()
  panNumber?: string;

  @IsString()
  addressLine1: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  taluka?: string;

  @IsString()
  state: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsString()
  pincode: string;

  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}