import { Module, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserService } from './user.service';
import { UserEntity } from './user.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
    imports: [
        CacheModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                store: await redisStore({ url: configService.get<string>('REDIS_URL'), ttl: 60 * 1000 }),
            }),
            inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([UserEntity]),
    ],
    providers: [UserService],
})
export class UserModule implements OnApplicationBootstrap {
    private readonly _logger: Logger = new Logger(UserModule.name);

    constructor(private readonly _userService: UserService) {}

    async onApplicationBootstrap() {
        this._logger.log('Initializing UserModule and seeding database...');
        try {
            const existingUsers = await this._userService.seed();
            if (existingUsers) {
                this._logger.log('Database seeded successfully');
            }
        } catch (error) {
            this._logger.error('Error seeding database', error);
        }
    }
}
