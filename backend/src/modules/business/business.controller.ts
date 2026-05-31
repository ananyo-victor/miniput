import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Controller('businesses')
export class BusinessController {
  constructor(
    private readonly businessService: BusinessService,
  ) {}

  @Post(':userId')
  create(
    @Param('userId') userId: string,
    @Body() dto: CreateBusinessDto,
  ) {
    return this.businessService.create(
      userId,
      dto,
    );
  }

  @Get('user/:userId')
  findAll(
    @Param('userId') userId: string,
  ) {
    return this.businessService.findAll(
      userId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.businessService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBusinessDto,
  ) {
    return this.businessService.update(
      id,
      dto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.businessService.remove(id);
  }
}