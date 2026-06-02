import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class BillingProfileEntity {
  @IsUUID()
  id: string;

  @IsUUID()
  userId: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsString()
  billingName: string;

  @IsString()
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

  @IsString()
  country: string;

  @IsString()
  pincode: string;

  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @IsBoolean()
  isDefault: boolean;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}