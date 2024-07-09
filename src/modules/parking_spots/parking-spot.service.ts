import { Repository } from 'typeorm';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ParkingSpotEntity } from './parking_spot.entity';

@Injectable()
export class ParkingSpotService {
    private readonly _logger: Logger = new Logger(ParkingSpotService.name);

    constructor(
        @InjectRepository(ParkingSpotEntity)
        private readonly _repository: Repository<ParkingSpotEntity>,
    ) {}

    seed = async (): Promise<ParkingSpotEntity[]> => {
        const parkingSpots: ParkingSpotEntity[] = [];
        const targetNumberOfSpots = parseInt(process.env.NUMBER_OF_PARKING_SPOTS || '10', 10);
        const currentNumberOfSpots = await this._repository.count();

        if (targetNumberOfSpots <= currentNumberOfSpots) {
            this._logger.log('Target parking spot count already reached or exceeded');
            return;
        }

        try {
            for (let i = currentNumberOfSpots; i < targetNumberOfSpots; i++) {
                const placeNumber = i + 1;

                const newParkingSpot = new ParkingSpotEntity({
                    place_number: placeNumber,
                });
                const entity = await this._repository.save(newParkingSpot);
                parkingSpots.push(entity);

                this._logger.log(`Created parking spot with ID: ${entity.id}, Place Number: ${entity.place_number}`);
            }

            return parkingSpots;
        } catch (error) {
            this._logger.error('Error creating parking spots', error);
            throw error;
        }
    };
}
