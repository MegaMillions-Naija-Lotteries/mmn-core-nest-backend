import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { RadioShowService } from './radio-show.service';
import { CreateRadioShowDto } from './dto/create-radio-show.dto';
import { UpdateRadioShowDto } from './dto/update-radio-show.dto';
import { JwtGuard } from 'src/auth/guard';
import { RolesGuard } from 'src/auth/roles/roles.guard';
import { Roles } from 'src/auth/roles/roles.decorator';
import { USER_ROLE } from 'src/auth/roles/roles.constant';
import { Public } from 'src/auth/decorator/public.decorator';
import { GetUser } from 'src/auth/decorator';

@UseGuards(JwtGuard, RolesGuard)
@Controller('shows')
export class RadioShowController {
    constructor(private readonly radioShowService: RadioShowService) {}

    @Post()
    @Roles(USER_ROLE.ROLE_ADMIN, USER_ROLE.ROLE_STATION)
    async create(@Body() createRadioShowDto: CreateRadioShowDto) {
        return this.radioShowService.create(createRadioShowDto);
    }

    @Public()
    @Get()
    async findAll(
        @Query('name') name?: string,
        @Query('stationId') stationId?: string,
        @Query('day') day?: string,
        @Query('airTime') airTime?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        // Build filters object for service
        const filters: any = {
            name,
            stationId: stationId ? Number(stationId) : undefined,
            day,
            airTime,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
        };
        return this.radioShowService.findAll(filters);
    }

    @Get('/user')
    async findAllByUser(
        @Query('name') name?: string,
        @Query('stationId') stationId?: string,
        @Query('day') day?: string,
        @Query('airTime') airTime?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @GetUser() user?: any,
    ) {
        // Build filters object for service
        const filters: any = {
            name,
            stationId: stationId ? Number(stationId) : undefined,
            day,
            airTime,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
        };
        return this.radioShowService.findAllByUser(user, filters);
    }
@Get('/station/:stationId')
@Public()
async getShowsByStation(
    @Param('stationId') stationId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
) {
    const filters: any = {
        stationId: Number(stationId),
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
    };
    return this.radioShowService.findAll(filters);
}
    @Get(':id')
    async findOne(@Param('id') id: string) {
        const show = await this.radioShowService.findOne(Number(id));
        if (!show) {
            // You may want to use NotFoundException from @nestjs/common
            // but for now, just return a 404-like object
            return {
                statusCode: 404,
                message: 'Radio show not found',
            };
        }
        // Optionally, parse days if it's a JSON string
        let parsedShow = { ...show };
        if (typeof parsedShow.days === 'string') {
            try {
                parsedShow.days = JSON.parse(parsedShow.days);
            } catch {
                // leave as is if parsing fails
            }
        }
        return parsedShow;
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateRadioShowDto: UpdateRadioShowDto) {
        return this.radioShowService.update(+id, updateRadioShowDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.radioShowService.remove(+id);
    }
}
