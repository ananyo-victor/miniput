import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshAdminTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
