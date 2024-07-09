import { Request } from 'express';

import { UserEntity } from '@app/modules/users/user.entity';

export interface RequestPagination {
    page: number;
    limit: number;
    offset: number;
}

export interface DeskbirdRequest extends Request {
    pagination: RequestPagination;
    user: UserEntity;
}
