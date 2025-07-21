import {
    Controller,
    Post,
    Get,
    Put,
    Delete,
    Param,
    Body,
    ParseIntPipe,
    HttpStatus,
    HttpException,
    Version,
    UseGuards,
} from '@nestjs/common';
import { SelectRadioDraw } from '../database/radio-draw.entity';
import { RadioDrawService, ConductDrawDto, DrawResult } from './radio-draw.service';
import { CreateRadioDrawDto } from './dto/create-radio-draw.dto';
import { JwtGuard } from 'src/auth/guard';
import { RolesGuard } from 'src/auth/roles/roles.guard';
import { Roles } from 'src/auth/roles/roles.decorator';
import { USER_ROLE } from 'src/auth/roles/roles.constant';

  @UseGuards(JwtGuard, RolesGuard)
  @Controller('draws')
  export class RadioDrawController {
    constructor(private readonly radioDrawService: RadioDrawService) {}
    /*
    * Create a new draw
    */
    @Post()
    @Version('1')
    async create(@Body() createRadioDrawDto: CreateRadioDrawDto){
      return this.radioDrawService.create(createRadioDrawDto);
    }
    /**
     * Conduct a new draw
     */
    @Post('create-conduct')
    @Version('1')
    async conductDraw(@Body() conductDrawDto: ConductDrawDto): Promise<{
      success: boolean;
      message: string;
      data: DrawResult;
    }> {
      try {
        const result = await this.radioDrawService.conductDraw(conductDrawDto);
        
        return {
          success: true,
          message: 'Draw conducted successfully',
          data: result,
        };
      } catch (error) {
        throw new HttpException(
          {
            success: false,
            message: error.message || 'Failed to conduct draw',
          },
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    /**
     * Redraw if current winner doesn't pick up
     */
    @Put(':drawId/redraw')
    @Version('1')
    async redraw(@Param('drawId', ParseIntPipe) drawId: number): Promise<{
      success: boolean;
      message: string;
      data: DrawResult;
    }> {
      try {
        const result = await this.radioDrawService.redraw(drawId);
        
        return {
          success: true,
          message: 'Redraw conducted successfully',
          data: result,
        };
      } catch (error) {
        throw new HttpException(
          {
            success: false,
            message: error.message || 'Failed to conduct redraw',
          },
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    /**
     * Mark draw as completed (winner picked up)
     */
    @Put(':drawId/complete')
    @Version('1')
    async completeDraw(@Param('drawId', ParseIntPipe) drawId: number): Promise<{
      success: boolean;
      message: string;
      data: SelectRadioDraw;
    }> {
      try {
        const result = await this.radioDrawService.completeDraw(drawId);
        
        return {
          success: true,
          message: 'Draw completed successfully',
          data: result,
        };
      } catch (error) {
        throw new HttpException(
          {
            success: false,
            message: error.message || 'Failed to complete draw',
          },
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    /**
     * Cancel a draw
     */
    @Delete(':drawId')
    @Version('1')
    async cancelDraw(@Param('drawId', ParseIntPipe) drawId: number): Promise<{
      success: boolean;
      message: string;
      data: SelectRadioDraw;
    }> {
      try {
        const result = await this.radioDrawService.cancelDraw(drawId);
        
        return {
          success: true,
          message: 'Draw cancelled successfully',
          data: result,
        };
      } catch (error) {
        throw new HttpException(
          {
            success: false,
            message: error.message || 'Failed to cancel draw',
          },
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    /**
     * Get draw by ID
     */
    @Get(':drawId')
    @Version('1')
    async getDrawById(@Param('drawId', ParseIntPipe) drawId: number): Promise<{
      success: boolean;
      message: string;
      data: SelectRadioDraw;
    }> {
      try {
        const result = await this.radioDrawService.getDrawById(drawId);
        
        return {
          success: true,
          message: 'Draw retrieved successfully',
          data: result,
        };
      } catch (error) {
        throw new HttpException(
          {
            success: false,
            message: error.message || 'Failed to retrieve draw',
          },
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    /**
     * Get all draws for a session
     */
    @Get('session/:sessionId')
    @Version('1')
    async getDrawsBySession(@Param('sessionId', ParseIntPipe) sessionId: number): Promise<{
      success: boolean;
      message: string;
      data: {
        success: boolean;
        message: string;
        data: SelectRadioDraw[];
      };
    }> {
      try {
        const result = await this.radioDrawService.getDrawsBySession(sessionId);
        
        return {
          success: true,
          message: 'Draws retrieved successfully',
          data: result.data,
        };
      } catch (error) {
        throw new HttpException(
          {
            success: false,
            message: error.message || 'Failed to retrieve draws',
          },
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    /**
     * Get draw statistics
     */
    @Get(':drawId/stats')
    @Version('1')
    async getDrawStats(@Param('drawId', ParseIntPipe) drawId: number): Promise<{
      success: boolean;
      message: string;
      data: {
        draw: SelectRadioDraw;
        totalEligibleTickets: number;
        totalEntries: number;
        winnerDetails: any;
      };
    }> {
      try {
        const result = await this.radioDrawService.getDrawStats(drawId);
        
        return {
          success: true,
          message: 'Draw statistics retrieved successfully',
          data: result,
        };
      } catch (error) {
        throw new HttpException(
          {
            success: false,
            message: error.message || 'Failed to retrieve draw statistics',
          },
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
  
  /**
   * DTO for conducting a draw
   */
  export class ConductDrawRequest {
    sessionId: number;
    showId: number;
    title: string;
    description?: string;
    maxEntries?: number;
    prizes?: any;
    drawSettings?: any;
  }
  
  /**
   * Response interfaces
   */
  export interface DrawResponse {
    success: boolean;
    message: string;
    data: DrawResult;
  }
  
  export interface DrawListResponse {
    success: boolean;
    message: string;
    data: SelectRadioDraw[];
  }
  
  export interface DrawStatsResponse {
    success: boolean;
    message: string;
    data: {
      draw: SelectRadioDraw;
      totalEligibleTickets: number;
      totalEntries: number;
      winnerDetails: any;
    };
  }