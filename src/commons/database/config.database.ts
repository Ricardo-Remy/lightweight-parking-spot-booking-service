import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

export const DatabaseConfig: TypeOrmModuleAsyncOptions = {
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
        const isDevelopment = configService.get('NODE_ENV') === 'development';
        return {
            type: 'postgres',
            password: configService.get('DATABASE_PASSWORD'),
            host: configService.get('DATABASE_HOST'),
            username: configService.get('DATABASE_USERNAME'),
            port: configService.get('DATABASE_PORT'),
            database: configService.get('DATABASE_NAME'),
            autoLoadEntities: true,
            synchronize: isDevelopment,
            logging: false,
            extra: isDevelopment
                ? {}
                : {
                      ssl: {
                          rejectUnauthorized: false,
                      },
                  },
        };
    },
};
