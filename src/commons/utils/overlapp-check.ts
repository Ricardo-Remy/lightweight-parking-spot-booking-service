import dayjs from 'dayjs';
import { ForbiddenException } from '@nestjs/common';

export const checkOverlappingDates = (startDateTime: string, endDateTime: string, existingStartDateTime: string, existingEndDateTime: string): void => {
    const newStart = dayjs(startDateTime);
    const newEnd = dayjs(endDateTime);
    const existingStart = dayjs(existingStartDateTime);
    const existingEnd = dayjs(existingEndDateTime);

    if (
        newStart.isBetween(existingStart, existingEnd, null, '[)') ||
        newEnd.isBetween(existingStart, existingEnd, null, '(]') ||
        existingStart.isBetween(newStart, newEnd, null, '[)') ||
        existingEnd.isBetween(newStart, newEnd, null, '(]')
    ) {
        throw new ForbiddenException('Parking spot is already booked for the selected time range');
    }
};
