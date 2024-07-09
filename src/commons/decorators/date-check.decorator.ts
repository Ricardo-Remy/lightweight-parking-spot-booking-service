import dayjs from 'dayjs';

import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsFutureDate(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'isFutureDate',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    return typeof value === 'string' && dayjs(value, 'YYYY-MM-DD HH:mm:ss', true).isAfter(dayjs());
                },
                defaultMessage() {
                    return `${propertyName} must be a date in the future`;
                },
            },
        });
    };
}
