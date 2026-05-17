import { Injectable } from '@nestjs/common';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import s3Client from '../../config/s3.config';
import 'dotenv/config';
import { UploadAssetEntity } from './entities/upload.entity';

@Injectable()
export class UploadsService {
  async uploadProductImage(imageData: string): Promise<UploadAssetEntity> {
    const matches = imageData.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);

    if (!matches || matches.length !== 3) {
      throw new Error('Invalid image data format. Expected base64 string.');
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    const extension = mimeType.split('/')[1];
    const key = `products/${uuidv4()}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    });

    await s3Client.send(command);

    const imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return {
      imageUrl,
      publicId: key,
    };
  }

  async deleteProductImage(fileKey: string) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileKey,
      });
      await s3Client.send(command);
      return true;
    } catch (error) {
      console.error('Error deleting from S3:', error);
      throw new Error('Failed to delete image from bucket');
    }
  }

  async deleteImageByUrl(imageUrl: string) {
    if (!imageUrl) return;
    try {
      const url = new URL(imageUrl);
      const key = url.pathname.substring(1);
      await this.deleteProductImage(key);
    } catch (error) {
      console.error(`Failed to delete image by URL: ${imageUrl}`, error);
    }
  }
}
