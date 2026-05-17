import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteProductImageDto {
  @IsString()
  @IsNotEmpty()
  publicId: string;
}
