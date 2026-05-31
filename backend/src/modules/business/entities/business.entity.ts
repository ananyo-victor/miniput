import {
  IsBoolean,
  IsDate,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class BusinessEntity {
  @IsUUID()
  id: string;

  @IsUUID()
  userId: string;

  @IsOptional()
  @IsString()
  businessName?: string | null;

  @IsOptional()
  @IsString()
  businessPhone?: string | null;

  @IsOptional()
  @IsString()
  deliveryAddress?: string | null;

  @IsOptional()
  @IsString()
  transportCourier?: string | null;

  @IsOptional()
  @IsString()
  gstNumber?: string | null;

  @IsOptional()
  @IsString()
  agentName?: string | null;

  @IsOptional()
  @IsString()
  filledBy?: string | null;

  @IsOptional()
  @IsString()
  specialInstructions?: string | null;

  @IsBoolean()
  isDefault: boolean;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}