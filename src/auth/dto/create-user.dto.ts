import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export class CreateUserDto {
    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    authKey?: string;

    @IsNumber()
    @IsOptional()
    managerId?: number;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    lname?: string;

    @IsNumber()
    @IsOptional()
    dob?: number;

    @IsNumber()
    @IsOptional()
    gender?: number;

    @IsString()
    @IsOptional()
    passwordHash?: string;

    @IsString()
    @IsOptional()
    passwordResetToken?: string;

    @IsString()
    @IsOptional()
    country?: string;

    @IsNumber()
    @IsOptional()
    status?: number;

    @IsString()
    @IsOptional()
    title?: string;

    @IsNumber()
    @IsOptional()
    role?: number;

    @IsNumber()
    @IsOptional()
    dateBannedUntil?: number;

    @IsString()
    @IsOptional()
    avatar?: string;

    @IsNumber()
    @IsOptional()
    idEMerchant?: number;

    @IsString()
    @IsOptional()
    countryCode?: string;

    @IsNumber()
    @IsOptional()
    idTimezone?: number;

    @IsString()
    @IsOptional()
    streetName?: string;

    @IsString()
    @IsOptional()
    streetNumber?: string;

    @IsString()
    @IsOptional()
    postCode?: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsString()
    @IsOptional()
    optionalAddress?: string;

    @IsNumber()
    @IsOptional()
    notifications?: number;

    @IsNumber()
    @IsOptional()
    depositLimit?: number;

    @IsString()
    @IsOptional()
    cid?: string;

    @IsString()
    @IsOptional()
    idReferral?: string;

    @IsString()
    @IsOptional()
    idMaster?: string;

    @IsNumber()
    @IsOptional()
    hadReferralDiscount?: number;

    @IsString()
    @IsOptional()
    language?: string;

    @IsNumber()
    @IsOptional()
    timezoneApproved?: number;

    @IsString()
    @IsOptional()
    visitToken?: string;

    @IsNumber()
    @IsOptional()
    migrate?: number;

    @IsNumber()
    @IsOptional()
    trxId?: number;

    @IsNumber()
    @IsOptional()
    idReferralUser?: number;

    @IsNumber()
    @IsOptional()
    fromWhere?: number;

    @IsNumber()
    @IsOptional()
    resetPassword?: number;

    @IsNumber()
    @IsOptional()
    commissionReferral?: number;

    @IsNumber()
    @IsOptional()
    commissionAgent?: number;

    @IsNumber()
    @IsOptional()
    type?: number;

    @IsNumber()
    @IsOptional()
    emailVerified?: number;

    @IsNumber()
    @IsOptional()
    phoneVerified?: number;

    @IsString()
    @IsOptional()
    tokenVerify?: string;

    @IsNumber()
    @IsOptional()
    mlmLevel?: number;

    @IsNumber()
    @IsOptional()
    idOwner?: number;

    @IsNumber()
    @IsOptional()
    idSuper?: number;

    @IsNumber()
    @IsOptional()
    idSales?: number;

    @IsNumber()
    @IsOptional()
    idAgent?: number;

    @IsNumber()
    @IsOptional()
    idTerminal?: number;

    @IsString()
    @IsOptional()
    idReferralHierarchyIds?: string;

    @IsNumber()
    @IsOptional()
    commissionSharesPercent?: number;
}