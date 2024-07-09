import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { MetadataKeys } from '@app/commons';

export const DefaultTake = (take: number): CustomDecorator => {
    return SetMetadata(MetadataKeys.DEFAULT_TAKE, take);
};
