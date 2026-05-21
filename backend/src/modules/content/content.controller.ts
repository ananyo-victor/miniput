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

import { UpsertAboutContentDto } from './dto/upsert-about-content.dto';
import { UpsertHomeContentDto } from './dto/upsert-home-content.dto';

@Controller('content')
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
  ) { }

  @Get('home/workspace/:workspaceId')
  async getHomeContent(
    @Param('workspaceId') workspaceId: string,
  ) {
    try {
      return await this.contentService.getHomeContent(
        workspaceId,
      );
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }

  @Put('home/workspace/:workspaceId')
  @UseGuards(AuthGuard)
  async upsertHomeContent(
    @Param('workspaceId') workspaceId: string,
    @Body() body: UpsertHomeContentDto,
  ) {
    try {
      return await this.contentService.upsertHomeContent(
        workspaceId,
        body || {},
      );
    } catch (error) {
      throw new BadRequestException({
        error: error.message,
      });
    }
  }

  @Get('about')
  async getAboutContent() {
    try {
      return await this.contentService.getAboutContent();
    } catch (error) {
      throw new InternalServerErrorException({
        error: error.message,
      });
    }
  }

  @Put('about')
  @UseGuards(AuthGuard)
  async upsertAboutContent(
    @Body() body: UpsertAboutContentDto,
  ) {
    try {
      return await this.contentService.upsertAboutContent(
        body || {},
      );
    } catch (error) {
      throw new InternalServerErrorException({
        error: error.message,
      });
    }
  }
}