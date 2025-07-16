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
} from '@nestjs/common';
import { SelectRadioDraw } from '../database/radio-draw.entity';
import { RadioJackpotDrawService, ConductDrawDto, DrawResult } from './radio-jackpot-draw.service';
import { CreateRadioDrawDto } from './dto/create-radio-draw.dto';

  
  @Controller('radio-draws')
  export class RadioJackpotDrawController {
    constructor(private readonly radioDrawService: RadioJackpotDrawService) {}
    /*
    * Create a new draw
    */
    @Post()
    async create(@Body() createRadioDrawDto: CreateRadioDrawDto){
      return this.radioDrawService.create(createRadioDrawDto);
    }
    /**
     * Conduct a new draw
     */
    @Post('create-conduct')
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
    async getDrawsBySession(@Param('sessionId', ParseIntPipe) sessionId: number): Promise<{
      success: boolean;
      message: string;
      data: SelectRadioDraw[];
    }> {
      try {
        const result = await this.radioDrawService.getDrawsBySession(sessionId);
        
        return {
          success: true,
          message: 'Draws retrieved successfully',
          data: result,
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