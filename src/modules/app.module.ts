import Joi from 'joi';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigEnv, ConfigMap, DatabaseConfig } from '@app/commons';

import { UserModule } from './users';
import { BookingModule } from './bookings';
import { ParkingModule } from './parking_spots';
import { HealthModule } from './health';

const isDevelopment = process.env.NODE_ENV === 'development';
const envFilePath = isDevelopment ? '.env.development' : '.env';
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath,
            validationSchema: Joi.object(ConfigEnv),
            load: [ConfigMap],
        }),
        TypeOrmModule.forRootAsync(DatabaseConfig),
        UserModule,
        BookingModule,
        ParkingModule,
        HealthModule,
    ],
})
export class AppModule {}
