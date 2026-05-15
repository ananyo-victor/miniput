import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('product-image')
  @UseGuards(AuthGuard)
  async uploadProductImage(@Body() body: any) {
    try {
      const { imageData } = body;

      if (!imageData) {
        throw new BadRequestException({ message: 'imageData is required' });
      }

      const result = await this.uploadsService.uploadProductImage(imageData);

      return {
        success: true,
        imageUrl: result.imageUrl,
        publicId: result.publicId,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException({ error: error.message });
    }
  }

  @Post('delete-image')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async deleteProductImage(@Body() body: any) {
    try {
      const { publicId } = body;

      if (!publicId) {
        throw new BadRequestException({ message: 'publicId is required to delete an image' });
      }

      await this.uploadsService.deleteProductImage(publicId);
      return { success: true, message: 'Image deleted from bucket' };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException({ error: error.message });
    }
  }
}
