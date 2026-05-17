import { IsNotEmpty, IsString } from 'class-validator';

export class UploadProductImageDto {
  @IsString()
  @IsNotEmpty()
  imageData: string;
}
