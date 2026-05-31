import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { FavoritesService } from './favorites.service';
import { ToggleFavoriteDto } from './dto/toggle-favorite.dto';

@Controller('favorites')
@UseGuards(AuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('toggle')
  @HttpCode(HttpStatus.OK)
  async toggleFavorite(
    @Req() req: any,
    @Body() body: ToggleFavoriteDto,
  ) {
    const userId = req.user.id; 
    return this.favoritesService.toggleFavorite(userId, body.productId);
  }

  @Get()
  async getMyFavorites(@Req() req: any) {
    const userId = req.user.id;
    return this.favoritesService.getCustomerFavorites(userId);
  }
}