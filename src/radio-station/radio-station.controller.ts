import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ParseIntPipe,
    UseGuards,
    Version,
  } from '@nestjs/common';
  import { RadioStationService } from './radio-station.service';
  import { CreateRadioStationDto } from './dto/create-radio-station.dto';
  import { UpdateRadioStationDto } from './dto/update-radio-station.dto';
import { JwtGuard } from 'src/auth/guard';
import { RolesGuard } from 'src/auth/roles/roles.guard';
import { Roles } from 'src/auth/roles/roles.decorator';
import { USER_ROLE } from 'src/auth/roles/roles.constant';
import { GetUser } from 'src/auth/decorator';
import { Public } from 'src/auth/decorator/public.decorator';

  @UseGuards(JwtGuard, RolesGuard)
  @Controller('stations')
  export class RadioStationController{
    constructor(private readonly radioStationService: RadioStationService) {}

    @Post()
    @Version('1')
    @Roles(USER_ROLE.ROLE_ADMIN, USER_ROLE.ROLE_STATION)
    create(@Body() createRadioStationDto: CreateRadioStationDto){
        return this.radioStationService.create(createRadioStationDto)
    }

    @Public()
    @Get()
    @Version('1')
    findAll(
        @Query('name') name?: string,
        @Query('isActive') isActive?: string,
    ) {
        const filters = {
            name,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        };
        
        return this.radioStationService.findAll(filters);
    }

    @Get('/user')
    @Version('1')
    findAllByUser(
        @GetUser() user: any,
        @Query('name') name?: string,
        @Query('isActive') isActive?: string,
    ) {
        const filters = {
        name,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        };
        
        return this.radioStationService.findAllByUser(user, filters);
    }

    @Get(':id')
    @Version('1')
    findOne(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: any) {
        return this.radioStationService.findOne(id, user);
    }

    // attach the station to a user and change the user to oap or station
    @Post(':id/attach-user')
    @Version('1')
    @Roles(USER_ROLE.ROLE_ADMIN, USER_ROLE.ROLE_STATION)
    async attachUserToStation(
      @Param('id', ParseIntPipe) stationId: number,
      @Body() body: { userId: number; newRole: number }
    ) {
      // body: { userId, newRole }
      // newRole should be USER_ROLE.ROLE_OAP or USER_ROLE.ROLE_STATION
      return this.radioStationService.attachUserToStation(stationId, body.userId, body.newRole);
    }
    
    @Patch(':id')
    @Version('1')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateRadioStationDto: UpdateRadioStationDto,
    ) {
        return this.radioStationService.update(id, updateRadioStationDto);
    }

    @Delete(':id')
    @Version('1')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.radioStationService.remove(id);
    }
  }