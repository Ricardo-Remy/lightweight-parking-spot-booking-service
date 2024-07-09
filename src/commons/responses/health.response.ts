import { Exclude, Expose } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

class DatabaseStatus {
    @ApiProperty()
    @Expose()
    status: string;
}

class Details {
    @ApiProperty()
    @Expose()
    database: DatabaseStatus;
}

@Exclude()
export class HealthResponse {
    @ApiProperty()
    @Expose()
    status: string;

    @ApiProperty()
    @Expose()
    info: {
        database: DatabaseStatus;
    };

    @ApiProperty()
    @Expose()
    error: any;

    @ApiProperty()
    @Expose()
    details: Details;
}
