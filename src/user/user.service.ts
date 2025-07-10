import { Inject, Injectable } from '@nestjs/common';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { schema, users } from '../database/schema';
import { EditUserDto } from './dto';
import { eq } from 'drizzle-orm';

@Injectable()
export class UserService {
    constructor(
        @Inject('DATABASE')
        private db: MySql2Database<typeof schema>
    ){}
    async editUser(userId: number, dto:EditUserDto) {
        const [user] = await this.db
            .update(users)
            .set({ ...dto })
            .where(eq(users.id, userId));

        // Fetch the updated user to remove passwordHash
        const [updatedUser] = await this.db
            .select()
            .from(users)
            .where(eq(users.id, userId));

        if (!updatedUser) {
            return null;
        }

        // remove hash 
        const { passwordHash, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }
}
