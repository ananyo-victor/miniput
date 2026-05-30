import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UserEntity {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsEmail()
  email?: string | null;

  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  phone?: string | null;

  @IsOptional()
  @IsString()
  passwordHash?: string | null;

  @IsOptional()
  @IsString()
  fullName?: string | null;

  @IsString()
  role: string;

  @IsOptional()
  @IsUUID()
  activeWorkspaceId?: string | null;

  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsDate()
  lastLoginAt?: Date | null;

  @IsOptional()
  isWhatsappReceiver?: boolean;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}