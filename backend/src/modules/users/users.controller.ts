import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { UpdateWhatsappReceiverDto } from './dto/update-whatsapp-receiver.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) { }

  // @Post()
  // create(
  //   @Body() dto: CreateUserDto,
  // ) {
  //   return this.usersService.create(dto);
  // }

  // @Get()
  // findAll() {
  //   return this.usersService.findAll();
  // }

  // @Get(':id')
  // findOne(
  //   @Param('id') id: string,
  // ) {
  //   return this.usersService.findOne(id);
  // }

  // @Put(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() dto: UpdateUserDto,
  // ) {
  //   return this.usersService.update(
  //     id,
  //     dto,
  //   );
  // }

  @Patch(':id/workspace/:workspaceId')
  updateWorkspace(
    @Param('id') id: string,
    @Param('workspaceId')
    workspaceId: string,
  ) {
    return this.usersService.updateActiveWorkspace(
      id,
      workspaceId,
    );
  }

  @Get(':id/workspace')
  getActiveWorkspace(
    @Param('id') id: string,
  ) {
    return this.usersService.getActiveWorkspace(id);
  }

  @Patch(':id/whatsapp-receiver')
  @UseGuards(AuthGuard)
  async updateWhatsappReceiver(
    @Param('id') id: string,
    @Body() body: UpdateWhatsappReceiverDto,
  ) {
    return this.usersService.updateWhatsappReceiver(
      id,
      body.isWhatsappReceiver,
    );
  }
}