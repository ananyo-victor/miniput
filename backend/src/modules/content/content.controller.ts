import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ContentService } from './content.service';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('home/:brand')
  async getHomeContentByBrand(@Param('brand') brand: string) {
    try {
      return await this.contentService.getHomeContentByBrand(brand);
    } catch (error) {
      if (error.message.includes('Invalid brand')) {
        throw new BadRequestException({ error: error.message });
      }
      throw new InternalServerErrorException({ error: error.message });
    }
  }

  @Put('home/:brand')
  @UseGuards(AuthGuard)
  async upsertHomeContentByBrand(@Param('brand') brand: string, @Body() body: any) {
    try {
      return await this.contentService.upsertHomeContentByBrand(brand, body || {});
    } catch (error) {
      if (error.message.includes('Invalid brand') || error.message.includes('cannot exceed 4')) {
        throw new BadRequestException({ error: error.message });
      }
      throw new InternalServerErrorException({ error: error.message });
    }
  }

  @Get('about')
  async getAboutContent() {
    try {
      return await this.contentService.getAboutContent();
    } catch (error) {
      throw new InternalServerErrorException({ error: error.message });
    }
  }

  @Put('about')
  @UseGuards(AuthGuard)
  async upsertAboutContent(@Body() body: any) {
    try {
      return await this.contentService.upsertAboutContent(body || {});
    } catch (error) {
      throw new InternalServerErrorException({ error: error.message });
    }
  }
}
