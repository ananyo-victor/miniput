import {
    IsEmail,
    IsOptional,
    IsString,
    IsUUID,
    MinLength,
    ValidateIf,
} from 'class-validator';

export class CreateUserDto {
    @IsString()
    @MinLength(3)
    username: string;

    @IsOptional()
    @ValidateIf(o => o.email !== "") // <-- Add this to allow empty strings
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    fullName: string;

    @IsOptional()
    @IsString()
    role?: string;

    @IsOptional()
    @IsUUID()
    activeWorkspaceId?: string;

    @IsOptional()
    @IsString()
    profilePictureUrl?: string;
}