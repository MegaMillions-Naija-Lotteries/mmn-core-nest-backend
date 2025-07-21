import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards, Version } from '@nestjs/common';
import { RadioShowSessionService } from './radio-show-session.service';
import { GetUser } from 'src/auth/decorator';
import { USER_ROLE } from 'src/auth/roles/roles.constant';
import { Roles } from 'src/auth/roles/roles.decorator';
import { CreateRadioShowSessionDto } from './dto/create-radio-show-session.dto';
import { JwtGuard } from 'src/auth/guard';
import { RolesGuard } from 'src/auth/roles/roles.guard';

@UseGuards(JwtGuard, RolesGuard)
@Controller('sessions')
export class RadioShowSessionController {
    constructor ( private radioShowSessionService:RadioShowSessionService) {}

    @Post()
    @Version('1')
    // @Roles(USER_ROLE.ROLE_OAP, USER_ROLE.ROLE_STATION)
    async create(@Body() createRadioShowSessionDto: CreateRadioShowSessionDto) {
        return this.radioShowSessionService.create(createRadioShowSessionDto);
    }
    // Get all sessions
    // GET /radio-show-sessions
    @Get()
    @Version('1')
    async getAllSessions(
        @GetUser() user:any,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('showId') showId?: string,
        @Query('status') status?: 'active' | 'ended' | 'paused',
        @Query('sessionDate') sessionDate?: string,
    ) {
        // Assume AuthService.getLoggedInUserId is available via req.user or similar
      

        const queryParams = {
            page: typeof page === 'string' ? parseInt(page, 10) || undefined : undefined,
            limit: typeof limit === 'string' ? parseInt(limit, 10) || undefined : undefined,
            showId: typeof showId === 'string' ? parseInt(showId, 10) || undefined : undefined,
            status: typeof status === 'string' ? status as 'active' | 'ended' | 'paused' : undefined,
            sessionDate: typeof sessionDate === 'string' ? sessionDate : undefined,
        };

        const data = await this.radioShowSessionService.getAll(
            user,
            queryParams
        );
        return data;
    }
    // Get a single radio show session by ID
    // GET /radio-show-sessions/:id

    @Get(':id')
    @Version('1')
    async getSessionById(
        @GetUser() user: any,
        @Param('id') id: string
    ) {
        const sessionId = Number(id);
        if (isNaN(sessionId)) {
            return {
                statusCode: 400,
                message: 'Invalid session id',
            };
        }
        const session = await this.radioShowSessionService.getById(sessionId);
        if (!session) {
            return {
                statusCode: 404,
                message: 'Radio show session not found',
            };
        }
        // Optionally, you could check here if the user is allowed to access this session
        // For example, if user is not admin/station, ensure session.userId === user.id
        if (
            user.role !== USER_ROLE.ROLE_ADMIN && // Not admin
            user.role !== USER_ROLE.ROLE_STATION && // Not station
            session.userId !== user.id
        ) {
            return {
                statusCode: 403,
                message: 'Forbidden',
            };
        }
        return session;
    }
    // Update a radio show session by ID
    // PATCH /radio-show-sessions/:id
    @Patch(':id')
    @Version('1')
    // @Roles(USER_ROLE.ROLE_ADMIN)
    async updateSession(
        @GetUser() user: any,
        @Param('id') id: string,
        @Body() updateDto: any // You may want to use UpdateRadioShowSessionDto
    ) {
        const sessionId = Number(id);
        if (isNaN(sessionId)) {
            return {
                statusCode: 400,
                message: 'Invalid session id',
            };
        }
        // Fetch the session
        const session = await this.radioShowSessionService.getById(sessionId);
        if (!session) {
            return {
                statusCode: 404,
                message: 'Radio show session not found',
            };
        }
        // Only allow update if user is admin, station, or the session owner
        if (
            user.role !== USER_ROLE.ROLE_ADMIN &&
            user.role !== USER_ROLE.ROLE_STATION &&
            session.userId !== user.id
        ) {
            return {
                statusCode: 403,
                message: 'Forbidden',
            };
        }
        // Call the service update method (you need to implement it in the service)
        try {
            const updated = await this.radioShowSessionService.updateById(sessionId, updateDto);
            return updated;
        } catch (err) {
            return {
                statusCode: 400,
                message: err?.message || 'Failed to update session',
            };
        }
    }
    // DELETE /radio-show-sessions/:id
    @Delete(':id')
    @Version('1')
    // @Roles(USER_ROLE.ROLE_ADMIN)
    async deleteSession(
        @GetUser() user: any,
        @Param('id') id: string
    ) {
        const sessionId = Number(id);
        if (isNaN(sessionId)) {
            return {
                statusCode: 400,
                message: 'Invalid session id',
            };
        }
        // Fetch the session
        const session = await this.radioShowSessionService.getById(sessionId);
        if (!session) {
            return {
                statusCode: 404,
                message: 'Radio show session not found',
            };
        }
        // Only allow delete if user is admin, station, or the session owner
        if (
            user.role !== USER_ROLE.ROLE_ADMIN &&
            user.role !== USER_ROLE.ROLE_STATION &&
            session.userId !== user.id
        ) {
            return {
                statusCode: 403,
                message: 'Forbidden',
            };
        }
        try {
            await this.radioShowSessionService.deleteById(sessionId);
            return {
                statusCode: 200,
                message: 'Radio show session deleted successfully',
            };
        } catch (err) {
            return {
                statusCode: 400,
                message: err?.message || 'Failed to delete session',
            };
        }
    }

    // PATCH /radio-show-sessions/:id/end
    @Patch(':id/end')
    @Version('1')
    async endSession(
        @GetUser() user: any,
        @Param('id') id: string
    ) {
        const sessionId = Number(id);
        if (isNaN(sessionId)) {
            return {
                statusCode: 400,
                message: 'Invalid session id',
            };
        }
        // Fetch the session
        const session = await this.radioShowSessionService.getById(sessionId);
        if (!session) {
            return {
                statusCode: 404,
                message: 'Radio show session not found',
            };
        }
        // Only allow end if user is admin, station, or the session owner
        if (
            user.role !== USER_ROLE.ROLE_ADMIN &&
            user.role !== USER_ROLE.ROLE_STATION &&
            session.userId !== user.id
        ) {
            return {
                statusCode: 403,
                message: 'Forbidden',
            };
        }
        // Only allow ending if session is currently active
        if (session.status !== 'active') {
            return {
                statusCode: 400,
                message: 'Session is not active',
            };
        }
        try {
            // Only update status to 'ended'
            await this.radioShowSessionService.updateById(sessionId, { status: 'ended', endTime: new Date() });
            return {
                statusCode: 200,
                message: 'Radio show session ended successfully',
            };
        } catch (err) {
            return {
                statusCode: 400,
                message: err?.message || 'Failed to end session',
            };
        }
    }
    // GET /radio-show-session/:id/draws
    @Get(':id/draws')
    @Version('1')
    async getSessionDraws(
        @GetUser() user: any,
        @Param('id') id: string
    ) {
        const sessionId = Number(id);
        if (isNaN(sessionId)) {
            return {
                statusCode: 400,
                message: 'Invalid session id',
            };
        }

        // Fetch the session
        const session = await this.radioShowSessionService.getById(sessionId);
        if (!session) {
            return {
                statusCode: 404,
                message: 'Radio show session not found',
            };
        }

        // Only allow if user is admin, station, or the session owner
        if (
            user.role !== USER_ROLE.ROLE_ADMIN &&
            user.role !== USER_ROLE.ROLE_STATION &&
            session.userId !== user.id
        ) {
            return {
                statusCode: 403,
                message: 'Forbidden',
            };
        }
        // Move the logic to the service layer
        try {
            const draws = await this.radioShowSessionService.getSessionDraws(user, sessionId);
            return {
                statusCode: 200,
                data: draws,
            };
        } catch (err) {
            return {
                statusCode: err.statusCode || 500,
                message: err?.message || 'Failed to fetch draws for session',
            };
        }
    }

}
