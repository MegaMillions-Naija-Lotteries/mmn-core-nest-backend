import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { SelectRadioDraw, CreateRadioDraw, radioDraws } from '../database/radio-draw.entity';
import { SelectRadioTicket, radioTickets } from '../database/radio-ticket.entity';
import { radioShowSessions, SelectRadioShowSession } from '../database/radio-show-session.entity';
import { ExtendedRadioTicket } from './types/radio-ticket.types';
import { eq, and, gte, lt, desc, sql, isNull, asc, inArray } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { schema, users } from '../database/schema';
import { CreateRadioDrawDto } from './dto/create-radio-draw.dto';

export interface ConductDrawDto {
  sessionId: number;
  showId: number;
  title: string;
  description?: string;
  maxEntries?: number;
  prizes?: any;
  drawSettings?: any;
}

export interface DrawResult {
  draw: SelectRadioDraw;
  winningTicket: SelectRadioTicket | null;
  totalEligibleTickets: number;
  winnerDetails?: any;
}

@Injectable()
export class RadioDrawService {
  constructor(
    @Inject('DATABASE')
    private readonly db: MySql2Database<typeof schema>) {}
  /**
   * Create a new radio draw
   */
  private convertToDatabaseFormat(dto: CreateRadioDrawDto): CreateRadioDraw {
    return {
      ...dto,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : new Date(),
      conductedAt: dto.conductedAt ? new Date(dto.conductedAt) : new Date(),
      createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : new Date(),
      entryDeadline: dto.entryDeadline ? new Date(dto.entryDeadline) : null,
    };
  }

  async create(createRadioDrawDto: CreateRadioDrawDto): Promise<SelectRadioDraw> {
    const drawData = this.convertToDatabaseFormat(createRadioDrawDto);
    const result = await this.db.insert(radioDraws).values(drawData).execute();
    const [newDraw] = await this.db.select().from(radioDraws).where(eq(radioDraws.id, result[0].insertId)).execute();
    return newDraw;
  }
  /**
   * Conduct a new draw for a radio show session
   */
  // async conductDraw(conductDrawDto: ConductDrawDto): Promise<DrawResult> {
  //   const { sessionId, showId, title, description, maxEntries, prizes, drawSettings } = conductDrawDto;

  //   // Validate session exists and is active
  //   const session = await this.db
  //     .select()
  //     .from(radioShowSessions)
  //     .where(eq(radioShowSessions.id, sessionId))
  //     .limit(1);

  //   if (!session.length) {
  //     throw new NotFoundException('Radio show session not found');
  //   }

  //   if (session[0].status !== 'active') {
  //     throw new BadRequestException('Session must be active to conduct a draw');
  //   }

  //   // Get the next draw number for this session
  //   const lastDraw = await this.db
  //     .select({ drawNumber: radioDraws.drawNumber })
  //     .from(radioDraws)
  //     .where(eq(radioDraws.sessionId, sessionId))
  //     .orderBy(desc(radioDraws.drawNumber))
  //     .limit(1);

  //   const drawNumber = lastDraw.length ? lastDraw[0].drawNumber + 1 : 1;

  //   // Get eligible tickets
  //   const eligibleTickets = await this.getEligibleTickets(session[0].stationId);

  //   if (eligibleTickets.length === 0) {
  //     throw new BadRequestException('No eligible tickets found for this draw');
  //   }

  //   // Create the draw record
  //   const drawData: CreateRadioDraw = {
  //     title,
  //     description,
  //     sessionId,
  //     showId,
  //     drawNumber,
  //     scheduledAt: new Date(),
  //     conductedAt: new Date(),
  //     status: 'active',
  //     maxEntries,
  //     prizes,
  //     drawSettings: drawSettings || {},
  //     totalEntries: eligibleTickets.length,
  //   };
  //   console.log('Draw data being inserted:', drawData);
  //   const [newDraw] = await this.db
  //     .insert(radioDraws)
  //     .values(drawData)
  //     .$returningId();

  //   // Select a random winner
  //   const { winningTicket, winnerDetails } = await this.selectRandomWinner(eligibleTickets);

  //   // Update the draw with winner information
  //   await this.db
  //     .update(radioDraws)
  //     .set({
  //       winningTicketId: winningTicket.id,
  //       winnerDetails,
  //       updatedAt: new Date(),
  //     })
  //     .where(eq(radioDraws.id, newDraw.id));

  //   // Get the complete draw record
  //   const completeDraw = await this.getDrawById(newDraw.id);

  //   return {
  //     draw: completeDraw,
  //     winningTicket,
  //     totalEligibleTickets: eligibleTickets.length,
  //     winnerDetails,
  //   };
  // }
  async conductDraw(conductDrawDto: ConductDrawDto): Promise<DrawResult> {
    try {
      console.log('🔍 Starting conductDraw with DTO:', JSON.stringify(conductDrawDto, null, 2));
      
      const { sessionId, showId, title, description, maxEntries, prizes, drawSettings } = conductDrawDto;
      
      // Validate session exists and is active
      console.log('🔍 Validating session with ID:', sessionId);
      const session = await this.db
        .select()
        .from(radioShowSessions)
        .where(eq(radioShowSessions.id, sessionId))
        .limit(1);
        
      if (!session.length) {
        console.error('❌ Session not found for ID:', sessionId);
        throw new NotFoundException('Radio show session not found');
      }
      
      if (session[0].status !== 'active') {
        console.error('❌ Session not active. Status:', session[0].status);
        throw new BadRequestException('Session must be active to conduct a draw');
      }
      
      console.log('✅ Session validated:', session[0]);
  
      // Get the next draw number for this session
      console.log('🔍 Getting next draw number for session:', sessionId);
      const lastDraw = await this.db
        .select({ drawNumber: radioDraws.drawNumber })
        .from(radioDraws)
        .where(eq(radioDraws.sessionId, sessionId))
        .orderBy(desc(radioDraws.drawNumber))
        .limit(1);
        
      const drawNumber = lastDraw.length ? lastDraw[0].drawNumber + 1 : 1;
      console.log('✅ Next draw number:', drawNumber);
  
      // Get eligible tickets
      console.log('🔍 Getting eligible tickets for station:', session[0].stationId);
      const eligibleTickets = await this.getEligibleTickets(session[0].stationId);
      
      if (eligibleTickets.length === 0) {
        console.error('❌ No eligible tickets found for station:', session[0].stationId);
        throw new BadRequestException('No eligible tickets found for this draw');
      }
      
      console.log('✅ Found eligible tickets:', eligibleTickets.length);
  
      // Create the draw record
      const drawData: CreateRadioDraw = {
        title,
        description,
        sessionId,
        showId,
        drawNumber,
        scheduledAt: new Date(),
        conductedAt: new Date(),
        status: 'active',
        maxEntries,
        prizes,
        drawSettings: drawSettings || {},
        totalEntries: eligibleTickets.length,
      };
      
      console.log('🔍 Draw data being inserted:', JSON.stringify(drawData, null, 2));
      console.log('🔍 Draw data types:', {
        title: typeof drawData.title,
        description: typeof drawData.description,
        sessionId: typeof drawData.sessionId,
        showId: typeof drawData.showId,
        drawNumber: typeof drawData.drawNumber,
        scheduledAt: typeof drawData.scheduledAt,
        conductedAt: typeof drawData.conductedAt,
        status: typeof drawData.status,
        maxEntries: typeof drawData.maxEntries,
        prizes: typeof drawData.prizes,
        drawSettings: typeof drawData.drawSettings,
        totalEntries: typeof drawData.totalEntries,
      });
  
      let newDraw;
      try {
        console.log('🔍 Attempting to insert draw record...');
        [newDraw] = await this.db
          .insert(radioDraws)
          .values(drawData)
          .$returningId();
        console.log('✅ Draw record inserted successfully with ID:', newDraw.id);
      } catch (insertError) {
        console.error('❌ Database insert error:', {
          message: insertError.message,
          code: insertError.code,
          detail: insertError.detail,
          stack: insertError.stack,
          query: insertError.query,
          parameters: insertError.parameters
        });
        
        // Re-throw with more context
        throw new Error(`Failed to insert draw record: ${insertError.message}`);
      }
  
      // Select a random winner
      console.log('🔍 Selecting random winner...');
      const { winningTicket, winnerDetails } = await this.selectRandomWinner(eligibleTickets);
      console.log('✅ Winner selected:', { ticketId: winningTicket.id, winnerDetails });
  
      // Update the draw with winner information
      try {
        console.log('🔍 Updating draw with winner information...');
        await this.db
          .update(radioDraws)
          .set({
            winningTicketId: winningTicket.id,
            winnerDetails,
            updatedAt: new Date(),
          })
          .where(eq(radioDraws.id, newDraw.id));
        console.log('✅ Draw updated with winner information');
      } catch (updateError) {
        console.error('❌ Error updating draw with winner:', updateError);
        throw new Error(`Failed to update draw with winner: ${updateError.message}`);
      }
  
      // Get the complete draw record
      console.log('🔍 Fetching complete draw record...');
      const completeDraw = await this.getDrawById(newDraw.id);
      console.log('✅ Complete draw fetched');
  
      const result = {
        draw: completeDraw,
        winningTicket,
        totalEligibleTickets: eligibleTickets.length,
        winnerDetails,
      };
  
      console.log('✅ Draw conducted successfully:', result);
      return result;
  
    } catch (error) {
      console.error('❌ Error in conductDraw:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code
      });
      
      // Re-throw the error to be handled by the controller
      throw error;
    }
  }

  /**
   * Redraw if the current winner doesn't pick up
   */
  async redraw(drawId: number): Promise<DrawResult> {
    const draw = await this.getDrawById(drawId);

    if (!draw) {
      throw new NotFoundException('Draw not found');
    }

    if (draw.status !== 'active') {
      throw new BadRequestException('Can only redraw active draws');
    }

    // Get session details
    const session = await this.db
      .select()
      .from(radioShowSessions)
      .where(eq(radioShowSessions.id, draw.sessionId))
      .limit(1);

    if (!session.length) {
      throw new NotFoundException('Associated session not found');
    }

    // Get eligible tickets (excluding previous winners from this draw)
    const eligibleTickets = await this.getEligibleTickets(
      session[0].stationId,
      draw.winningTicketId ? [draw.winningTicketId] : []
    );

    if (eligibleTickets.length === 0) {
      // No more eligible tickets, mark draw as completed
      await this.db
        .update(radioDraws)
        .set({
          status: 'completed',
          updatedAt: new Date(),
        })
        .where(eq(radioDraws.id, drawId));

      throw new BadRequestException('No more eligible tickets available for redraw');
    }

    // Select a new random winner
    const { winningTicket, winnerDetails } = await this.selectRandomWinner(eligibleTickets);

    // Update the draw with new winner
    await this.db
      .update(radioDraws)
      .set({
        winningTicketId: winningTicket.id,
        winnerDetails,
        conductedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(radioDraws.id, drawId));

    // Get updated draw
    const updatedDraw = await this.getDrawById(drawId);

    return {
      draw: updatedDraw,
      winningTicket,
      totalEligibleTickets: eligibleTickets.length,
      winnerDetails,
    };
  }

  /**
   * Mark draw as completed (winner picked up)
   */
  async completeDraw(drawId: number): Promise<SelectRadioDraw> {
    const draw = await this.getDrawById(drawId);

    if (!draw) {
      throw new NotFoundException('Draw not found');
    }

    if (draw.status !== 'active') {
      throw new BadRequestException('Draw is not active');
    }

    await this.db
      .update(radioDraws)
      .set({
        status: 'completed',
        updatedAt: new Date(),
      })
      .where(eq(radioDraws.id, drawId));

    return this.getDrawById(drawId);
  }

  /**
   * Get eligible tickets for a station
   * Eligible tickets are those bought between the end of the last session and now
   */
  private async getEligibleTickets(
    stationId: number,
    excludeTicketIds: number[] = []
  ): Promise<SelectRadioTicket[]> {
    // Get the last ended session for this station
    const lastEndedSession = await this.db
      .select()
      .from(radioShowSessions)
      .where(
        and(
          eq(radioShowSessions.stationId, stationId),
          eq(radioShowSessions.status, 'ended')
        )
      )
      .orderBy(desc(radioShowSessions.endTime))
      .limit(1);

    // Determine the start time for eligible tickets
    const eligibilityStartTime = lastEndedSession.length 
      ? lastEndedSession[0].endTime 
      : new Date('1970-01-01'); // If no previous session, include all tickets

    // Build the query for eligible tickets
    let query = this.db
      .select({
        id: radioTickets.id,
        ticketUuid: radioTickets.ticketUuid,
        userId: radioTickets.userId,
        stationId: radioTickets.stationId,
        drawId: radioTickets.drawId,
        quantity: radioTickets.quantity,
        usedCount: radioTickets.usedCount,
        isActive: radioTickets.isActive,
        expiresAt: radioTickets.expiresAt,
        invalidatedAt: radioTickets.invalidatedAt,
        createdAt: radioTickets.createdAt,
        updatedAt: radioTickets.updatedAt,
        userName: users.name || '',
        userEmail: users.email || '',
      })
      .from(radioTickets)
      .leftJoin(users, eq(radioTickets.userId, users.id))
      .where(
        and(
          eq(radioTickets.stationId, stationId),
          eq(radioTickets.isActive, true),
          gte(radioTickets.createdAt, eligibilityStartTime??new Date('1970-01-01')),
          lt(radioTickets.createdAt, new Date()), // Only tickets created before now
          isNull(radioTickets.invalidatedAt), // Not invalidated
          // Check if ticket hasn't expired
          sql`(${radioTickets.expiresAt} IS NULL OR ${radioTickets.expiresAt} > NOW())`,
          // Exclude specific ticket IDs if provided
          ...(excludeTicketIds.length > 0 ? [sql`${radioTickets.id} NOT IN (${excludeTicketIds.join(',')})`] : [])
        )
      )
      .orderBy(asc(radioTickets.createdAt));

    return await query;
  }

  /**
   * Select a random winner from eligible tickets
   */
  private async selectRandomWinner(eligibleTickets: SelectRadioTicket[]): Promise<{
    winningTicket: SelectRadioTicket;
    winnerDetails: any;
  }> {
    // First, get the user details for all tickets
    const ticketsWithUsers = await this.db
      .select({
        ticket: radioTickets,
        userName: users.name,
        userEmail: users.email
      })
      .from(radioTickets)
      .innerJoin(users, eq(radioTickets.userId, users.id))
      .where(inArray(radioTickets.id, eligibleTickets.map(t => t.id)));

    // Create a weighted array based on ticket quantity
    const weightedTickets: ExtendedRadioTicket[] = [];
    
    for (const { ticket, userName, userEmail } of ticketsWithUsers) {
      const availableQuantity = ticket.quantity - ticket.usedCount;
      for (let i = 0; i < availableQuantity; i++) {
        weightedTickets.push({
          ...ticket,
          userName: userName || '',
          userEmail: userEmail || ''
        });
      }
    }

    if (weightedTickets.length === 0) {
      throw new BadRequestException('No available ticket entries for draw');
    }

    // Select random winner
    const randomIndex = Math.floor(Math.random() * weightedTickets.length);
    const winningTicket = weightedTickets[randomIndex]; // This now has the correct type with user details

    // Increment used count for the winning ticket
    await this.db
      .update(radioTickets)
      .set({
        usedCount: sql`${radioTickets.usedCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(radioTickets.id, winningTicket.id));

    // Prepare winner details
    const winnerDetails = {
      ticketUuid: winningTicket.ticketUuid,
      userId: winningTicket.userId,
      userName: winningTicket.userName,
      userEmail: winningTicket.userEmail,
      selectedAt: new Date(),
      entryNumber: randomIndex + 1,
      totalEntries: weightedTickets.length,
    };

    return { winningTicket, winnerDetails };
  }

  /**
   * Get draw by ID with full details
   */
  async getDrawById(drawId: number): Promise<SelectRadioDraw> {
    const [draw] = await this.db
      .select()
      .from(radioDraws)
      .where(eq(radioDraws.id, drawId))
      .limit(1);

    if (!draw) {
      throw new NotFoundException('Draw not found');
    }

    return draw;
  }

  /**
   * Get all draws for a session
   */
  async getDrawsBySession(sessionId: number): Promise<{
    success: boolean;
    message: string;
    data: SelectRadioDraw[];
  }> {
    try {
      const draws = await this.db
        .select()
        .from(radioDraws)
        .where(eq(radioDraws.sessionId, sessionId))
        .orderBy(asc(radioDraws.conductedAt));

      return {
        success: true,
        message: 'Draws retrieved successfully',
        data: draws,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed query: ${error.query}\nparams: ${error.params.join(', ')}`,
        data: [],
      };
    }
  }

  /**
   * Get draw statistics
   */
  async getDrawStats(drawId: number): Promise<{
    draw: SelectRadioDraw;
    totalEligibleTickets: number;
    totalEntries: number;
    winnerDetails: any;
  }> {
    const draw = await this.getDrawById(drawId);
    
    // Get session to find station
    const [session] = await this.db
      .select()
      .from(radioShowSessions)
      .where(eq(radioShowSessions.id, draw.sessionId))
      .limit(1);

    const eligibleTickets = await this.getEligibleTickets(session.stationId);
    
    return {
      draw,
      totalEligibleTickets: eligibleTickets.length,
      totalEntries: draw.totalEntries,
      winnerDetails: draw.winnerDetails,
    };
  }

  /**
   * Cancel a draw
   */
  async cancelDraw(drawId: number): Promise<SelectRadioDraw> {
    const draw = await this.getDrawById(drawId);

    if (draw.status === 'completed') {
      throw new BadRequestException('Cannot cancel a completed draw');
    }

    // If there was a winning ticket, decrease its used count
    if (draw.winningTicketId) {
      await this.db
        .update(radioTickets)
        .set({
          usedCount: sql`${radioTickets.usedCount} - 1`,
          updatedAt: new Date(),
        })
        .where(eq(radioTickets.id, draw.winningTicketId));
    }

    await this.db
      .update(radioDraws)
      .set({
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(eq(radioDraws.id, drawId));

    return this.getDrawById(drawId);
  }
}