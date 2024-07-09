import { Expose, Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

import { UserResponse } from './user.response';
import { ParkingSpotResponse } from './parking_spot.response';
import { DataResponse, DataResponseMetadata } from './data.response';

export class BookingResponse {
    @ApiProperty({ example: 'e2810045-f123-4afc-9e09-b410743354e3' })
    @Expose()
    id: string;

    @ApiProperty({ type: UserResponse })
    @Expose()
    @Type(() => UserResponse)
    created_by: UserResponse;

    @ApiProperty({ example: '2024-07-10T12:05:00.000Z' })
    @Expose()
    start_date_time: Date;

    @ApiProperty({ example: '2024-07-10T12:30:00.000Z' })
    @Expose()
    end_date_time: Date;

    @ApiProperty({ type: ParkingSpotResponse })
    @Expose()
    @Type(() => ParkingSpotResponse)
    parking_spot: ParkingSpotResponse;

    @ApiProperty({
        example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhNzY0ODQ1ZS1mYzhiLTRjZGUtYmFlMi0xMjU3YmFlYTI5MjgiLCJuYW1lIjoiUmFuZG9tIFVzZXIiLCJpYXQiOjE3MjA1MjcxMzJ9.ZmE5ODA0YWMtMjcwNi00MjQzLWJhOTMtOTczZTI1YThjZGE4',
    })
    @ApiProperty({ example: '2024-07-07T08:49:05.155Z' })
    @Expose()
    created_at: Date;

    @ApiProperty({ example: '2024-07-07T08:49:05.155Z' })
    @Expose()
    updated_at: Date;
}

export class BookingResponseWithMetadata extends DataResponse {
    @ApiProperty({ type: [BookingResponse] })
    @Type(() => BookingResponse)
    readonly result: BookingResponse[];

    @ApiProperty({ type: () => DataResponseMetadata })
    @Type(() => DataResponseMetadata)
    readonly metadata: DataResponseMetadata;

    constructor(data: Partial<BookingResponseWithMetadata>) {
        super(data);
        this.result = data.result;
        this.metadata = data.metadata;
    }
}
