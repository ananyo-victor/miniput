import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '../../common/guards/auth.guard';
import { ProductsService } from './products.service';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductVisibilityDto } from './dto/update-product-visibility.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Get()
  async getProducts(
    @Query('includeHidden') includeHidden?: string,
    @Query('workspaceId') workspaceId?: string,
    @Query('badge') badge?: string,
  ) {
    try {
      return await this.productsService.getAllProducts(
        includeHidden === 'true',
        workspaceId,
        badge
      );
    } catch (error) {
      throw new InternalServerErrorException({
        error: error.message,
      });
    }
  }

  @Post()
  @UseGuards(AuthGuard)
  async createProduct(@Body() body: CreateProductDto) {
    try {
      return await this.productsService.createProduct(body);
    } catch (error) {
      throw new InternalServerErrorException({
        error: error.message,
      });
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async updateProduct(
    @Param('id') id: string,
    @Body() body: UpdateProductDto,
  ) {
    try {
      return await this.productsService.updateProduct(id, body);
    } catch (error) {
      throw new InternalServerErrorException({
        error: error.message,
      });
    }
  }

  @Patch(':id/visibility')
  @UseGuards(AuthGuard)
  async updateVisibility(
    @Param('id') id: string,
    @Body() body: UpdateProductVisibilityDto,
  ) {
    try {
      const updatedProduct =
        await this.productsService.updateVisibility(
          id,
          body.isHidden,
        );

      return {
        success: true,
        product: updatedProduct,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        error: error.message,
      });
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async deleteProduct(@Param('id') id: string) {
    try {
      await this.productsService.deleteProduct(id);

      return {
        success: true,
        message: 'Product deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException({
        error: error.message,
      });
    }
  }
}