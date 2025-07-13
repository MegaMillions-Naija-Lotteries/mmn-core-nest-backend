import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { MySql2Database } from "drizzle-orm/mysql2";
import { schema, type Schema } from "../database/schema";
import { users } from "../database/user.entity";
import { AuthDto } from "./dto";
import * as argon from 'argon2';
import { desc, eq, or } from "drizzle-orm";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { CreateUserDto } from "./dto/create-user.dto";
import * as utils from "../common/utils";
import { title } from "process";

@Injectable()
export class AuthService {
    private jwt: JwtService;
    private config: ConfigService;
    private db: MySql2Database<typeof schema>;

    constructor(
        @Inject('DATABASE')
        db: MySql2Database<typeof schema>,
        jwt: JwtService,
        configService: ConfigService
    ) {
        this.db = db;
        this.jwt = jwt;
        this.config = configService;
    }

    async login(dto: AuthDto) {
        // Find the user by email
        const userArr = await this.db
            .select()
            .from(schema.users)
            .where(eq(schema.users.email, dto.email))
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
        const token = await this.signToken(userWithoutPassword.id, userWithoutPassword.email);
        return {
            ...userWithoutPassword,
            ...token,
            expiresIn: 864000, // 10 days in seconds
            tokenType: 'Bearer',
            refreshToken: await this.jwt.signAsync({
                sub: userWithoutPassword.id,
                email: userWithoutPassword.email
            }, {
                expiresIn: '14d',
                secret: this.config.get('JWT_SECRET')
            }),
            idAgent: userWithoutPassword.id,
            idTerminal: 0
        };
    }

    async signup(dto: CreateUserDto) {
        const exists = await this.db
            .select()
            .from(schema.users)
            .where(
                or(
                    eq(schema.users.email, dto.email as string),
                    eq(schema.users.phone, dto.phone as string)
                )
            )
            .limit(1);
        if (exists.length > 0) {
            // change this to a login if the user exists
            throw new BadRequestException('Account with these details already exists on Megamillionsnaija.');
        }
        // generat ethe password
        const hash = await argon.hash(dto.password);
        //save the new user
        const idRef = await this.generateIdReferral();
        // Create the input with fake values for test
        const existsEmail = dto.email ? await this.db.select().from(users).where(eq(users.email, dto.email)).limit(1) : null;
        const result = await this.db.insert(users).values({
            email: dto.email || null,
            passwordHash: hash,
            authKey: utils.getUniqueCodev2(),
            managerId: dto.managerId,
            name: dto.name,
            lname: dto.lname,
            gender: dto.gender,
            dob: new Date(dto.dob??"01/01/1970").getTime(),
            country: dto.country,
            phone: dto.phone,
            passwordResetToken: dto.passwordResetToken,
            status: 1,
            role: 10,
            title: 'Tester',
            dateBannedUntil: null,
            avatar: null,
            idEMerchant: null,
            countryCode: null,
            idTimezone: null,
            streetName: null,
            streetNumber: null,
            postCode: null,
            city: null,
            optionalAddress: null,
            notifications: 1,
            depositLimit: 0,
            cid: null,
            idReferral: idRef?.toString() || null,
            idMaster: '',
            hadReferralDiscount: 0,
            language: 'en',
            timezoneApproved: 0,
            visitToken: '',
            idReferralUser: null,
            fromWhere: 5,
            resetPassword: 0,
            commissionReferral: 0,
            commissionAgent: 0,
            type: 1,
            emailVerified: 1,
            phoneVerified: 1,
            tokenVerify: this.tokenVerify(),
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            mlmLevel: 0,
            idOwner: null,
            idSuper: null,
            idSales: null,
            idAgent: null,
            idTerminal: null,
            idReferralHierarchyIds: null,
            commissionSharesPercent: null
        });

        const insertId = result?.[0]?.insertId??null;
        // return the new user
        const [user] = await this.db
            .select()
            .from(users)
            .where(eq(users.id, insertId))
            .limit(1);

        if (user) {
        const { passwordHash, ...userWithoutPassword } = user;
        return {
            ...userWithoutPassword,
            ...(await this.signToken(insertId, user.email??user.phone??''))
        };
        }
        return null;
    }

    async signToken(userId: number, email: string): Promise<{ access_token:string }> {
        if(!email){
            throw new BadRequestException('Email is required');
        }
        const payload = {
            sub: userId,
            email
        }
        const secret = this.config.get('JWT_SECRET')

        const token = await this.jwt.signAsync(payload, {
            expiresIn: '10d',
            secret: secret
        })
        return { access_token: token };
    }
    tokenVerify(): string {
        const uniqueCode = utils.getUniqueCodev2();
        return this.jwt.sign({
            code: uniqueCode,
            timestamp: Date.now()
        }, {
            secret: this.config.get('JWT_SECRET'),
            expiresIn: '1d'
        });
    }
    generateIdReferral = async (): Promise<number | null> => {
        let idReferral = 0
            
        // If you want to get the first result directly (since it returns an array)
        const [lastUser] = await this.db
        .select()
        .from(schema.users)
        .orderBy(desc(schema.users.id))
        .limit(1);
        if (lastUser && lastUser.id) idReferral = 100888 + lastUser.id + 1
        else idReferral = 100888 + 1
    
        return idReferral
    }
    generateTokenExpiration(minutes: number){
        return new Date(Date.now() + minutes * 60 * 60 * 1000);
    }
}
