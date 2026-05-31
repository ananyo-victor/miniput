import {
    IsEmail,
    IsOptional,
    IsString,
    IsUUID,
    MinLength,
} from 'class-validator';

export class CreateUserDto {
    @IsString()
    @MinLength(3)
    username: string;

    @IsOptional()
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