import { Controller, Get, Query, UseGuards, InternalServerErrorException } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
// @UseGuards(AuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboard(
    @Query('workspaceId') workspaceId?: string,
  ) {
    try {
      return await this.analyticsService.getDashboardStats(workspaceId);
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        error: error.message,
      });
    }
  }
}