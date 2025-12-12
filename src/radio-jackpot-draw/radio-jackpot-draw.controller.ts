import { Controller, Post, Body, Param, Get, Patch, UseGuards, Version } from '@nestjs/common';
import { RadioJackpotDrawService } from './radio-jackpot-draw.service';
import { CreateRadioJackpotDrawDto } from './dto/create-radio-jackpot-draw.dto';
import { JwtGuard } from 'src/auth/guard';
import { RolesGuard } from 'src/auth/roles/roles.guard';
import { Roles } from 'src/auth/roles/roles.decorator';
import { USER_ROLE } from 'src/auth/roles/roles.constant';

@UseGuards(JwtGuard, RolesGuard)
@Controller('jackpot')
export class RadioJackpotDrawController {
  constructor(private readonly service: RadioJackpotDrawService) {}

  @Post()
  @Version('1')
  create(@Body() dto: CreateRadioJackpotDrawDto) {
    return this.service.create(dto);
  }

  @Post('create-and-conduct')
  @Version('1')
  createAndConduct(@Body() dto: CreateRadioJackpotDrawDto) {
    return this.service.createAndConduct(dto);
  }

  @Get()
  @Version('1')
  list() {
    return this.service.list();
  }

  @Get(':id')
  @Version('1')
  details(@Param('id') id: string) {
    return this.service.details(+id);
  }

  @Patch(':id/conduct/:showId')
  @Version('1')
  conduct(@Param('id') id: string, @Param('showId') showId: number) {
    return this.service.conduct(+id, +showId);
  }

  @Patch(':id/redraw')
  @Version('1')
  redraw(@Param('id') id: string) {
    return this.service.redraw(+id);
  }
}