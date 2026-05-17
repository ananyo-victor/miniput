import { IsString } from 'class-validator';

export class UploadAssetEntity {
  @IsString()
  imageUrl: string;

  @IsString()
  publicId: string;
}
