import { Exclude, Expose } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

export class UserResponse {
    @ApiProperty({ example: '8addddd3-d206-4943-9be9-e03150ba5893' })
    @Expose()
    id: string;

    @ApiProperty({ example: 'John' })
    @Expose()
    first_name: string;

    @ApiProperty({ example: 'Smith' })
    @Expose()
    last_name: string;

    @ApiProperty({ example: 'john.smith0@example.com' })
    @Expose()
    email: string;

    @ApiProperty({ example: 'Standard' })
    @Expose()
    role: string;

    @Exclude()
    token: string;
}
