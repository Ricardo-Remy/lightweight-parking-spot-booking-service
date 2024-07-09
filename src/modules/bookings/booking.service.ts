import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { Repository } from 'typeorm';

dayjs.extend(isBetween);

import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DbTransactionFactory, TransactionRunner, Role, checkOverlappingDates } from '@app/commons';

import { BookingEntity } from './booking.entity';
import { ParkingSpotEntity } from '../parking_spots/parking_spot.entity';
import { CreateBookingDto } from './dtos/create-booking.dto';
import { UpdateBookingDto } from './dtos/update.booking.dto';
import { UserEntity } from '../users/user.entity';

@Injectable()
export class BookingService {
    private readonly _logger: Logger = new Logger(BookingService.name);

    constructor(
        @InjectRepository(BookingEntity)
        private readonly _bookingRepository: Repository<BookingEntity>,
        private readonly _transactionFactory: DbTransactionFactory,
    ) {}

    create = async (user: UserEntity, createBookingDto: CreateBookingDto): Promise<BookingEntity> => {
        const { parkingSpotId, startDateTime, endDateTime } = createBookingDto;
        // Check if endDateTime is not before startDateTime to stay consistent
        if (endDateTime <= startDateTime) {
            throw new ForbiddenException('endDateTime cannot be before startDateTime');
        }

        const transactionRunner: TransactionRunner = await this._transactionFactory.createTransaction();

        try {
            // Start transaction
            await transactionRunner.startTransaction();

            const parkingSpot = await transactionRunner.transactionManager.findOne(ParkingSpotEntity, {
                where: { id: parkingSpotId },
            });

            if (!parkingSpot) {
                throw new NotFoundException('Parking spot not found');
            }

            const existingBooking = await transactionRunner.transactionManager
                .createQueryBuilder(BookingEntity, 'booking')
                .leftJoinAndSelect('booking.parking_spot', 'parking_spot')
                .where('parking_spot.id = :parkingSpotId', { parkingSpotId })
                .orderBy('booking.end_date_time', 'DESC')
                .getOne();

            // Check to avoid double bookings
            if (existingBooking) {
                checkOverlappingDates(startDateTime, endDateTime, existingBooking.start_date_time.toString(), existingBooking.end_date_time.toString());
            }

            const booking = new BookingEntity({
                created_by: user,
                start_date_time: new Date(startDateTime),
                end_date_time: new Date(endDateTime),
                parking_spot: parkingSpot,
            });

            const savedBooking = await transactionRunner.transactionManager.save(BookingEntity, booking);
            await transactionRunner.commitTransaction();

            this._logger.log(`Booking created successfully for user: ${user.id}`);
            return savedBooking;
        } catch (error) {
            // Rollback transaction on error
            await transactionRunner.rollbackTransaction();
            this._logger.error('Error creating booking', error);
            throw error;
        } finally {
            // Release transaction
            await transactionRunner.releaseTransaction();
        }
    };

    findAll = async (user: UserEntity, limit: number, offset: number): Promise<[BookingEntity[], number]> => {
        const queryBuilder = this._bookingRepository
            .createQueryBuilder('booking')
            .leftJoinAndSelect('booking.created_by', 'user')
            .leftJoinAndSelect('booking.parking_spot', 'parking_spot')
            .take(limit)
            .skip(offset);

        if (user.role !== Role.Admin) {
            queryBuilder.where('booking.created_by.id = :userId', { userId: user.id });
        }

        const [bookings, count] = await queryBuilder.getManyAndCount();
        return [bookings, count];
    };

    findOne = async (id: string, user: UserEntity): Promise<BookingEntity> => {
        const booking = await this._bookingRepository.findOne({ where: { id }, relations: ['created_by', 'parking_spot'] });
        if (!booking) {
            throw new NotFoundException('Booking not found');
        }
        if (booking.created_by.id !== user.id && user.role !== Role.Admin) {
            throw new ForbiddenException('You can only access your own bookings');
        }
        return booking;
    };

    update = async (user: UserEntity, id: string, updateBookingDto: UpdateBookingDto): Promise<BookingEntity> => {
        const booking = await this.findOne(id, user);

        const { startDateTime, endDateTime, parkingSpotId } = updateBookingDto;
        // Check if endDateTime is not before startDateTime to stay consistent
        if (endDateTime <= startDateTime) {
            throw new ForbiddenException('endDateTime cannot be before startDateTime');
        }

        const transactionRunner: TransactionRunner = await this._transactionFactory.createTransaction();

        const existingStart = booking.start_date_time.toString();
        const existingEnd = booking.end_date_time.toString();

        // Check if there is not already a booking for the same parking spot
        if (booking) {
            // Check overlapping within the same parking spot
            checkOverlappingDates(startDateTime, endDateTime, existingStart, existingEnd);
        }

        // Check for overlapping bookings in case user wants to change parking spot
        if (updateBookingDto.parkingSpotId && updateBookingDto.parkingSpotId !== booking.parking_spot.id) {
            const overlappingBooking = await this._bookingRepository.findOne({
                where: {
                    parking_spot: { id: updateBookingDto.parkingSpotId },
                },
            });

            if (overlappingBooking) {
                checkOverlappingDates(startDateTime, endDateTime, overlappingBooking.start_date_time.toString(), overlappingBooking.end_date_time.toString());
            }
        }

        try {
            // Start transaction
            await transactionRunner.startTransaction();

            // update existing booking
            booking.start_date_time = dayjs(startDateTime).toDate();
            booking.end_date_time = dayjs(endDateTime).toDate();
            booking.updated_at = dayjs().toDate();
            booking.parking_spot.id = parkingSpotId;

            // Update the booking with new details
            await transactionRunner.transactionManager.update(BookingEntity, id, booking);

            await transactionRunner.commitTransaction();

            this._logger.log(`Booking updated successfully for user: ${user.id}`);
            return booking;
        } catch (error) {
            // Rollback transaction on error
            await transactionRunner.rollbackTransaction();

            this._logger.error('Error updating booking', error);
            throw error;
        } finally {
            // Release transaction
            await transactionRunner.releaseTransaction();
        }
    };

    remove = async (id: string, user: UserEntity): Promise<void> => {
        const booking = await this.findOne(id, user);
        if (booking.created_by.id !== user.id && user.role !== Role.Admin) {
            throw new ForbiddenException('You can only delete your own bookings');
        }

        const transactionRunner: TransactionRunner = await this._transactionFactory.createTransaction();

        try {
            // Start transaction
            await transactionRunner.startTransaction();

            await transactionRunner.transactionManager.remove(BookingEntity, booking);

            await transactionRunner.commitTransaction();

            this._logger.log(`Booking delete successfully for user: ${user.id}`);
            return;
        } catch (error) {
            // Rollback transaction on error
            await transactionRunner.rollbackTransaction();
            this._logger.error('Error deleting booking', error);
            throw error;
        } finally {
            // Release transaction
            await transactionRunner.releaseTransaction();
        }
    };
}
