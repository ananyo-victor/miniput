import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { EventsGateway } from '../../events/events.gateway';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  async createOrder(@Body() body: any) {
    try {
      const newOrder = await this.ordersService.createOrder(body);
      this.eventsGateway.emitNewOrder(newOrder);
      return { success: true, order: newOrder };
    } catch (error) {
      throw new InternalServerErrorException({ error: error.message });
    }
  }

  @Get('stats')
  @UseGuards(AuthGuard)
  async getAdminStats() {
    try {
      return await this.ordersService.getAdminStats();
    } catch (error) {
      throw new InternalServerErrorException({ error: error.message });
    }
  }

  @Patch(':id/approve')
  @UseGuards(AuthGuard)
  async approveOrder(@Param('id') id: string) {
    try {
      return await this.ordersService.approveOrder(id);
    } catch (error) {
      if (error.message.includes('already processed')) {
        throw new BadRequestException({ error: error.message });
      }
      throw new InternalServerErrorException({ error: error.message });
    }
  }

  @Patch(':id/reject')
  @UseGuards(AuthGuard)
  async rejectOrder(@Param('id') id: string) {
    try {
      await this.ordersService.rejectOrder(id);
      return { success: true, message: 'Order Rejected. No stock changed.' };
    } catch (error) {
      throw new InternalServerErrorException({ error: error.message });
    }
  }
}
