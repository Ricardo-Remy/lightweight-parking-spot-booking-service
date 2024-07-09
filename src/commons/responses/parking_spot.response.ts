import { Expose } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

export class ParkingSpotResponse {
    @ApiProperty({ example: '042e5c95-8d64-4389-95f3-ffec57964676' })
    @Expose()
    id: string;

    @ApiProperty({ example: 10 })
    @Expose()
    place_number: number;

    @ApiProperty({ example: '2024-07-06T16:29:07.737Z' })
    @Expose()
    created_at: Date;

    @ApiProperty({ example: '2024-07-06T16:29:07.737Z' })
    @Expose()
    updated_at: Date;
}
