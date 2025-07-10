import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { MySql2Database } from "drizzle-orm/mysql2";
import { schema, users } from "../../database/schema";
import { eq } from "drizzle-orm";

@Injectable()
export class JwtStrategy extends PassportStrategy(
    Strategy,
    'jwt'
){
    constructor(
        config: ConfigService, 
    @Inject('DATABASE')
    private db: MySql2Database<typeof schema>
    ) {
        const jwtSecret = config.get<string>('JWT_SECRET');
        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not defined in configuration');
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtSecret
        });
    }
    async validate(payload: {sub: number, email: string}){
        // Complete the query to find the user by id (payload.sub)
        const userArr = await this.db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
        const user = userArr[0];
        // delete the password Hash
        const stationLinks = await this.db
            .select()
            .from(schema.stationUsers)
            .where(eq(schema.stationUsers.userId, user.id));
        const stationIds = stationLinks.map((link) => link.stationId);

        const { passwordHash, ...userWithoutPassword } = user;
        // add stationIds to the userWithoutPassword
        return { ...userWithoutPassword, stationIds };
    }
}