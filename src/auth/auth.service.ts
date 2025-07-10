import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { MySql2Database } from "drizzle-orm/mysql2";
import { schema, users } from "../database/schema"
import { AuthDto } from "./dto";
import * as argon from 'argon2';
import { eq } from "drizzle-orm";
import { JwtService } from "@nestjs/jwt";
import { Config } from "drizzle-kit";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
    constructor(
        @Inject('DATABASE')
        private db: MySql2Database<typeof schema>,
        private jwt: JwtService,
        private config: ConfigService
    ) {}

    async login(dto: AuthDto) {
        // Find the user by email
        const userArr = await this.db
            .select()
            .from(users)
            .where(eq(users.email, dto.email))
            .limit(1);

        if (userArr.length === 0) {
            throw new BadRequestException('Invalid Credentials');
        }

        const user = userArr[0];

        // Verify password
        if (typeof user.passwordHash !== 'string') {
            throw new BadRequestException('Invalid credentials');
        }
        const pwMatches = await argon.verify(user.passwordHash, dto.password);
        if (!pwMatches) {
            throw new BadRequestException('Invalid credentials');
        }

        // For now, just return the user (omit passwordHash)
        const { passwordHash, ...userWithoutPassword } = user;
        if (!userWithoutPassword.id || !userWithoutPassword.email) {
            throw new BadRequestException('User creation failed');
        }
        return this.signToken(userWithoutPassword.id, userWithoutPassword.email);
    }

    async signup(dto: AuthDto) {
        const exists = await this.db.select().from(users).where(eq(users.email, dto.email)).limit(1);
        if (exists.length > 0) {
            // change this to a login if the user exists
            throw new BadRequestException('Email already exists');
        }
        // generat ethe password
        const hash = await argon.hash(dto.password);
        //save the new user
        
        // Create the input with fake values for test
        const result = await this.db.insert(users).values({
            email: dto.email,
            passwordHash: hash,
            authKey: 'fake-auth-key',
            dob: 19900101, // fake date of birth as int (e.g., YYYYMMDD)
            name: 'Test',
            lname: 'User',
            gender: 1,
            phone: '1234567890',
            country: 'Testland',
            status: 1,
            title: 'Tester',
            role: 1,
            dateBannedUntil: null,
            avatar: 'https://example.com/avatar.png',
            idEMerchant: 0,
            countryCode: 'TL',
            idTimezone: 1,
            streetName: 'Fake Street',
            streetNumber: '123',
            postCode: '00000',
            city: 'Test City',
            optionalAddress: 'Apt 1',
            notifications: 1,
            depositLimit: 1000,
            cid: 'fake-cid',
            idReferral: 'fake-referral',
            idMaster: 'fake-master',
            hadReferralDiscount: 0,
            language: 'en',
            timezoneApproved: 1,
            visitToken: 'fake-visit-token',
            migrate: 0,
            trxId: 0,
            idReferralUser: 0,
            fromWhere: 0,
            resetPassword: 0,
            commissionReferral: 0,
            commissionAgent: 0,
            type: 1,
            emailVerified: 1,
            phoneVerified: 1,
            tokenVerify: 'fake-token-verify',
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            mlmLevel: 0,
            idOwner: 0,
            idSuper: 0,
            idSales: 0,
            idAgent: 0,
            idTerminal: 0,
            idReferralHierarchyIds: '0,0,0',
            commissionSharesPercent: 0,
        });

        const insertId = result?.[0]?.insertId??null;
        // return the new user
        const [user] = await this.db
            .select()
            .from(users)
            .where(eq(users.id, insertId))
            .limit(1);

        if (user) {
            // Exclude passwordHash from the returned user object if present
            const { passwordHash, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        return null;
    }

    signToken(userId: number, email: string): Promise<{ access_token:string }> {
        const payload = {
            sub: userId,
            email
        }
        const secret = this.config.get('JWT_SECRET')

        const token = this.jwt.signAsync(payload, {
            expiresIn: '15m',
            secret: secret
        })

        return this.jwt.signAsync(payload, {
            expiresIn: '15m',
            secret: secret
        }).then((token: string) => {
            return { access_token: token };
        });
    }
}
