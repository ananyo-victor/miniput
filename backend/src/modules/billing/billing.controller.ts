import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { BillingService } from './billing.service';

import { CreateBillingProfileDto } from './dto/create-billing-profile.dto';
import { UpdateBillingProfileDto } from './dto/update-billing-profile.dto';

@Controller('billing-profiles')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
  ) { }

  @Post(':userId')
  create(
    @Param('userId') userId: string,
    @Body() dto: CreateBillingProfileDto,
  ) {
    return this.billingService.create(
      userId,
      dto,
    );
  }

  @Get('user/:userId')
  findAll(
    @Param('userId') userId: string,
  ) {
    return this.billingService.findAll(
      userId,
    );
  }

  @Get('user/:userId/default')
  findDefault(
    @Param('userId') userId: string,
  ) {
    return this.billingService.findDefault(
      userId,
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.billingService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBillingProfileDto,
  ) {
    return this.billingService.update(
      id,
      dto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
  ) {
    return this.billingService.remove(id);
  }
}