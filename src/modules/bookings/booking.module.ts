import { RedisClientOptions } from 'redis';
import { redisStore } from 'cache-manager-redis-yet';

import { Module, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { DbTransactionFactory, HttpExceptionFilter, PaginationInterceptor, PayloadValidationOptions, ResponseInterceptor, AccessTokenGuard } from '@app/commons';

import { BookingEntity } from './booking.entity';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { ParkingSpotEntity } from '../parking_spots/parking_spot.entity';
import { UserService } from '../users/user.service';
import { UserEntity } from '../users/user.entity';

@Module({
    imports: [
        CacheModule.registerAsync<RedisClientOptions>({
            useFactory: async (configService: ConfigService) => {
                return {
                    store: await redisStore({ url: configService.get<string>('REDIS_URL'), ttl: 30 * 1000 }),
                    tls:
                        configService.get('ENV') === 'production'
                            ? {
                                  rejectUnauthorized: false,
                                  requestCert: true,
                              }
                            : null,
                };
            },
            inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([BookingEntity, ParkingSpotEntity, UserEntity]),
    ],
    controllers: [BookingController],
    providers: [
        UserService,
        BookingService,
        DbTransactionFactory,
        {
            provide: APP_GUARD,
            useClass: AccessTokenGuard,
        },
        { provide: APP_INTERCEPTOR, useClass: PaginationInterceptor },
        { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
        {
            provide: APP_PIPE,
            useFactory: () => new ValidationPipe(PayloadValidationOptions),
        },
        { provide: APP_FILTER, useClass: HttpExceptionFilter },
    ],
})
export class BookingModule {}
