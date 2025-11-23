import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { UserSchema } from './schemas/user.schema';
import { UserRoleSchema } from './schemas/user-role.schema';
import { Connection } from 'mongoose';

export const usersProviders = [
    {
        provide: 'USER_MODEL',
        useFactory: (connection: Connection) => connection.model('User', UserSchema),
        inject: ['DATABASE_CONNECTION'],
    },
    {
        provide: 'USER_ROLE_MODEL',
        useFactory: (connection: Connection) => connection.model('UserRole', UserRoleSchema),
        inject: ['DATABASE_CONNECTION'],
    },
];

@Module({
    imports: [DatabaseModule],
    providers: [...usersProviders],
    exports: [...usersProviders],
})
export class UsersModule { }
