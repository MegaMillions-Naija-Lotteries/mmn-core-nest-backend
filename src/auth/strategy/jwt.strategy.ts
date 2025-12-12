// import { BadRequestException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
// import { ConfigService } from "@nestjs/config";
// import { PassportStrategy } from "@nestjs/passport";
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { MySql2Database } from "drizzle-orm/mysql2";
// import { schema, users } from "../../database/schema";
// import { eq } from "drizzle-orm";

// @Injectable()
// export class JwtStrategy extends PassportStrategy(
//     Strategy,
//     'jwt'
// ){
//     constructor(
//         config: ConfigService, 
//     @Inject('DATABASE')
//     private db: MySql2Database<typeof schema>
//     ) {
//         const jwtSecret = config.get<string>('JWT_SECRET');
//         console.log('🔑 JWT Secret exists:', !!jwtSecret); // DEBUG
//         if (!jwtSecret) {
//             throw new Error('JWT_SECRET is not defined in configuration');
//         }
//         super({
//             jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//             secretOrKey: jwtSecret,
//             ignoreExpiration: false, //DEBUG
//         });
//         console.log('✅ JWT Strategy initialized'); // DEBUG
//     }
//     async validate(payload: {sub: number, email: string}){
//         console.log('🔍 JWT Strategy validate called with payload:', payload);
//         // Complete the query to find the user by id (payload.sub)
//         const userArr = await this.db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
//         console.log('📊 Database query result:', userArr); // DEBUG
//         const user = userArr[0];
//         if (!user) {
//             console.log('❌ User not found for ID:', payload.sub);
//             throw new UnauthorizedException('User not found');
//           }
//           console.log('✅ User found:', { id: user.id, email: user.email });
//         // delete the password Hash
//         const stationLinks = await this.db
//             .select()
//             .from(schema.stationUsers)
//             .where(eq(schema.stationUsers.userId, user.id));
//         console.log('🏢 Station links:', stationLinks); // DEBUG
//         const stationIds = stationLinks.map((link) => link.stationId);

//         const { passwordHash, ...userWithoutPassword } = user;
//         console.log('👤 User without password:', userWithoutPassword); // DEBUG
//         // add stationIds to the userWithoutPassword
//         return { ...userWithoutPassword, stationIds };
//     }
// }

import { Injectable, UnauthorizedException, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { MySql2Database } from "drizzle-orm/mysql2";
import { schema, users } from "../../database/schema";
import { eq } from "drizzle-orm";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private config: ConfigService,
    @Inject('DATABASE')
    private db: MySql2Database<typeof schema>
  ) {
    const jwtSecret = config.get<string>('JWT_SECRET');
    
    console.log('🔑 JWT_SECRET from config:', jwtSecret ? 'EXISTS' : 'MISSING');
    console.log('🔑 JWT_SECRET length:', jwtSecret?.length || 0);
    
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in configuration');
    }
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
      ignoreExpiration: false,
    });
    
    console.log('✅ JWT Strategy constructor completed');
  }

  async validate(payload: { sub: number, email: string }) {
    console.log('🔍 ===== JWT STRATEGY VALIDATE CALLED =====');
    console.log('🔍 Payload:', JSON.stringify(payload, null, 2));
    
    try {
      console.log('🔍 Searching for user with ID:', payload.sub);
      
      const userArr = await this.db
        .select()
        .from(users)
        .where(eq(users.id, payload.sub))
        .limit(1);
      
      console.log('🔍 Database query result:', userArr);
      console.log('🔍 User found:', userArr.length > 0);
      
      const user = userArr[0];
      if (!user) {
        console.log('❌ User not found for ID:', payload.sub);
        throw new UnauthorizedException('User not found');
      }

      console.log('✅ User found:', { id: user.id, email: user.email });

      // Get user's station links
      const stationLinks = await this.db
        .select()
        .from(schema.stationUsers)
        .where(eq(schema.stationUsers.userId, user.id));
      
      console.log('🏢 Station links found:', stationLinks);
      const stationIds = stationLinks.map((link) => link.stationId);

      // Remove password hash
      const { passwordHash, ...userWithoutPassword } = user;
      const result = { ...userWithoutPassword, stationIds };
      
      console.log('✅ Final user object to return:', JSON.stringify(result, null, 2));
      console.log('🔍 ===== JWT STRATEGY VALIDATE COMPLETED =====');
      
      return result;
      
    } catch (error) {
      console.error('❌ JWT Strategy validation error:', error);
      throw new UnauthorizedException('Token validation failed');
    }
  }
}