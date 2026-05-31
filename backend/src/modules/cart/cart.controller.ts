import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartQuantityDto } from './dto/update-cart-quantity.dto';

@Controller('cart')
@UseGuards(AuthGuard) // Guard access to individual user records
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getMyCart(@Req() req: any) {
    const userId = req.user.id;
    return this.cartService.getCustomerCart(userId);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async addItem(@Req() req: any, @Body() body: AddToCartDto) {
    const userId = req.user.id;
    return this.cartService.addToCart(userId, body);
  }

  @Patch(':id')
  async updateQuantity(
    @Req() req: any,
    @Param('id') cartItemId: string,
    @Body() body: UpdateCartQuantityDto,
  ) {
    const userId = req.user.id;
    return this.cartService.updateQuantity(userId, cartItemId, body.quantity);
  }

  @Delete('clear')
  @HttpCode(HttpStatus.OK)
  async clearCart(@Req() req: any) {
    const userId = req.user.id;
    return this.cartService.clearCart(userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async removeItem(@Req() req: any, @Param('id') cartItemId: string) {
    const userId = req.user.id;
    return this.cartService.removeFromCart(userId, cartItemId);
  }
}