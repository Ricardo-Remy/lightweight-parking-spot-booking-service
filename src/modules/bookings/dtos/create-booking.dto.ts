import { IsDateString, IsUUID } from 'class-validator';

import { IsFutureDate } from '@app/commons';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
    @ApiProperty({ example: '1c619586-8688-4784-8a4a-ad431f0a10e0', description: 'The ID of the parking spot' })
    @IsUUID()
    parkingSpotId: string;

    @ApiProperty({ example: '2024-07-22T07:50:00Z', description: 'The start date and time of the booking' })
    @IsDateString()
    @IsFutureDate({ message: 'startDateTime must be a date in the future' })
    startDateTime: string;

    @ApiProperty({ example: '2024-07-22T11:30:00Z', description: 'The end date and time of the booking' })
    @IsDateString()
    @IsFutureDate({ message: 'endDateTime must be a date in the future' })
    endDateTime: string;
}
