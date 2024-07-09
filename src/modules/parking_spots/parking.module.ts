import { Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ParkingSpotService } from './parking-spot.service';
import { ParkingSpotEntity } from './parking_spot.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ParkingSpotEntity])],
    providers: [ParkingSpotService],
})
export class ParkingModule implements OnApplicationBootstrap {
    private readonly _logger: Logger = new Logger(ParkingModule.name);

    constructor(private readonly _parkingSpotService: ParkingSpotService) {}

    async onApplicationBootstrap() {
        this._logger.log('Initializing ParkingModule and seeding database...');
        try {
            const existingSpots = await this._parkingSpotService.seed();
            if (existingSpots) {
                this._logger.log('Database seeded successfully.');
            }
        } catch (error) {
            this._logger.error('Error seeding database', error);
        }
    }
}
