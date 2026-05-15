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

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getProducts(@Query('includeHidden') includeHidden?: string) {
    try {
      return await this.productsService.getAllProducts(includeHidden === 'true');
    } catch (error) {
      throw new InternalServerErrorException({ error: error.message });
    }
  }

  @Post()
  @UseGuards(AuthGuard)
  async createProduct(@Body() body: any) {
    try {
      return await this.productsService.createProduct(body);
    } catch (error) {
      throw new InternalServerErrorException({ error: error.message });
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async updateProduct(@Param('id') id: string, @Body() body: any) {
    try {
      return await this.productsService.updateProduct(id, body);
    } catch (error) {
      throw new InternalServerErrorException({ error: error.message });
    }
  }

  @Patch(':id/visibility')
  @UseGuards(AuthGuard)
  async updateVisibility(@Param('id') id: string, @Body('isHidden') isHidden: boolean) {
    try {
      const updatedProduct = await this.productsService.updateVisibility(id, isHidden);
      return { success: true, product: updatedProduct };
    } catch (error) {
      throw new InternalServerErrorException({ error: error.message });
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async deleteProduct(@Param('id') id: string) {
    try {
      await this.productsService.deleteProduct(id);
      return { success: true, message: 'Product deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException({ error: error.message });
    }
  }
}
