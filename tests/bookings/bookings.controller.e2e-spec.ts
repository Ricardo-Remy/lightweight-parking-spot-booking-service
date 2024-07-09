import request, { Response } from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AppModule } from '@app/modules';
import { UserService } from '@app/modules/users/user.service';
import { UserEntity } from '@app/modules/users/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '@app/commons';
import { ParkingSpotService } from '@app/modules/parking_spots/parking-spot.service';
import { ParkingSpotEntity } from '@app/modules/parking_spots/parking_spot.entity';

describe('AppModule', () => {
    let app: INestApplication;
    let userRepository: Repository<UserEntity>;
    let parkingSpotRepository: Repository<ParkingSpotEntity>;
    let userService: UserService;
    let parkingSpotService: ParkingSpotService;

    let bookingIdStandardUser1: string;
    let bookingIdStandardUser2: string;
    let bookingIdAdminUser1: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        userService = app.get<UserService>(UserService);
        parkingSpotService = app.get<ParkingSpotService>(ParkingSpotService);
        userRepository = app.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
        parkingSpotRepository = app.get<Repository<ParkingSpotEntity>>(getRepositoryToken(ParkingSpotEntity));

        await userService.seed();
        await parkingSpotService.seed();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('E2E Booking flow', () => {
        it('[SEED] - Should seed create the correct number of users', async () => {
            const users = await userRepository.find();
            expect(users.length).toBe(10);
            const standardUsers = users.filter((user) => user.role === Role.Standard);
            const adminUsers = users.filter((user) => user.role === Role.Admin);
            expect(standardUsers.length).toBe(8);
            expect(adminUsers.length).toBe(2);
        });

        it('[SEED] - Should seed create the correct number of parking spots', async () => {
            const parkingSpots = await parkingSpotRepository.find();
            expect(parkingSpots.length).toBe(10);
        });

        it('[POST] - Standard users can create bookings', async () => {
            const users = await userRepository.find();
            const standardUsers = users.filter((user) => user.role === Role.Standard);

            const standardUser1Token = standardUsers[0].token;
            const standardUser2Token = standardUsers[1].token;

            const parkingSpots = await parkingSpotRepository.find();

            const response1: Response = await request(app.getHttpServer()).post('/bookings').set('Authorization', `Bearer ${standardUser1Token}`).send({
                parkingSpotId: parkingSpots[0].id,
                startDateTime: '2024-07-22T07:50:00Z',
                endDateTime: '2024-07-22T11:30:00Z',
            });

            bookingIdStandardUser1 = response1.body.result.id;

            expect(response1.status).toEqual(HttpStatus.CREATED);
            expect(response1.body.result.parking_spot.id).toEqual(parkingSpots[0].id);

            const response2: Response = await request(app.getHttpServer()).post('/bookings').set('Authorization', `Bearer ${standardUser2Token}`).send({
                parkingSpotId: parkingSpots[1].id,
                startDateTime: '2024-07-22T08:00:00Z',
                endDateTime: '2024-07-22T12:00:00Z',
            });

            bookingIdStandardUser2 = response2.body.result.id;

            expect(response2.status).toEqual(HttpStatus.CREATED);
            expect(response2.body.result.parking_spot.id).toEqual(parkingSpots[1].id);
        });

        it('[POST] - Admin users can create bookings', async () => {
            const users = await userRepository.find();
            const adminUsers = users.filter((user) => user.role === Role.Admin);

            const adminUser1Token = adminUsers[0].token;
            const adminUser2Token = adminUsers[1].token;

            const parkingSpots = await parkingSpotRepository.find();

            const response1: Response = await request(app.getHttpServer()).post('/bookings').set('Authorization', `Bearer ${adminUser1Token}`).send({
                parkingSpotId: parkingSpots[3].id,
                startDateTime: '2024-07-22T07:50:00Z',
                endDateTime: '2024-07-22T11:30:00Z',
            });

            bookingIdAdminUser1 = response1.body.result.id;

            expect(response1.status).toEqual(HttpStatus.CREATED);
            expect(response1.body.result.parking_spot.id).toEqual(parkingSpots[3].id);

            const response2: Response = await request(app.getHttpServer()).post('/bookings').set('Authorization', `Bearer ${adminUser2Token}`).send({
                parkingSpotId: parkingSpots[4].id,
                startDateTime: '2024-07-22T08:00:00Z',
                endDateTime: '2024-07-22T12:00:00Z',
            });

            expect(response2.status).toEqual(HttpStatus.CREATED);
            expect(response2.body.result.parking_spot.id).toEqual(parkingSpots[4].id);
        });

        it('[POST] - Users cannot book another ongoing/overlapping booking', async () => {
            const users = await userRepository.find();
            const standardUsers = users.filter((user) => user.role === Role.Standard);

            const standardUser3Token = standardUsers[3].token;
            const parkingSpots = await parkingSpotRepository.find();

            const response3: Response = await request(app.getHttpServer()).post('/bookings').set('Authorization', `Bearer ${standardUser3Token}`).send({
                parkingSpotId: parkingSpots[0].id,
                startDateTime: '2024-07-22T07:50:00Z',
                endDateTime: '2024-07-22T11:30:00Z',
            });

            expect(response3.status).toEqual(HttpStatus.FORBIDDEN);

            const response4: Response = await request(app.getHttpServer()).post('/bookings').set('Authorization', `Bearer ${standardUser3Token}`).send({
                parkingSpotId: parkingSpots[0].id,
                startDateTime: '2024-07-22T06:50:00Z',
                endDateTime: '2024-07-22T10:30:00Z',
            });

            expect(response4.status).toEqual(HttpStatus.FORBIDDEN);

            const response5: Response = await request(app.getHttpServer()).post('/bookings').set('Authorization', `Bearer ${standardUser3Token}`).send({
                parkingSpotId: parkingSpots[0].id,
                startDateTime: '2024-07-22T06:50:00Z',
                endDateTime: '2024-07-21T10:30:00Z',
            });

            expect(response5.status).toEqual(HttpStatus.FORBIDDEN);
        });

        it('[PATCH] - Standard users can only update their own existing bookings', async () => {
            const users = await userRepository.find();
            const standardUsers = users.filter((user) => user.role === Role.Standard);

            const standardUser1Token = standardUsers[0].token;
            const standardUser2Token = standardUsers[1].token;
            const parkingSpots = await parkingSpotRepository.find();

            const response0: Response = await request(app.getHttpServer()).patch(`/bookings/${bookingIdAdminUser1}`).set('Authorization', `Bearer ${standardUser1Token}`).send({
                parkingSpotId: parkingSpots[3].id,
                startDateTime: '2024-07-26T07:50:00Z',
                endDateTime: '2024-07-26T11:30:00Z',
            });

            expect(response0.status).toEqual(HttpStatus.FORBIDDEN);

            const response1: Response = await request(app.getHttpServer()).patch(`/bookings/${bookingIdStandardUser1}`).set('Authorization', `Bearer ${standardUser1Token}`).send({
                parkingSpotId: parkingSpots[0].id,
                startDateTime: '2024-07-26T07:50:00Z',
                endDateTime: '2024-07-26T11:30:00Z',
            });

            expect(response1.status).toEqual(HttpStatus.OK);
            expect(response1.body.result.start_date_time).toEqual('2024-07-26T07:50:00.000Z');
            expect(response1.body.result.end_date_time).toEqual('2024-07-26T11:30:00.000Z');

            const response2: Response = await request(app.getHttpServer()).patch(`/bookings/${bookingIdStandardUser2}`).set('Authorization', `Bearer ${standardUser2Token}`).send({
                parkingSpotId: parkingSpots[1].id,
                startDateTime: '2024-07-26T08:00:00Z',
                endDateTime: '2024-07-26T12:00:00Z',
            });

            expect(response2.status).toEqual(HttpStatus.OK);
            expect(response2.body.result.start_date_time).toEqual('2024-07-26T08:00:00.000Z');
            expect(response2.body.result.end_date_time).toEqual('2024-07-26T12:00:00.000Z');
        });

        it('[PATCH] - Users can only update to a new parking spot place number that is available', async () => {
            const users = await userRepository.find();
            const standardUsers = users.filter((user) => user.role === Role.Standard);
            const parkingSpots = await parkingSpotRepository.find();

            const standardUser1Token = standardUsers[0].token;

            // Trying to take another standard user's spot at the same time
            const response0: Response = await request(app.getHttpServer()).patch(`/bookings/${bookingIdStandardUser1}`).set('Authorization', `Bearer ${standardUser1Token}`).send({
                parkingSpotId: parkingSpots[1].id,
                startDateTime: '2024-07-26T08:00:00Z',
                endDateTime: '2024-07-26T12:00:00Z',
            });

            // Could not update the parking spot
            expect(response0.status).toEqual(HttpStatus.FORBIDDEN);

            const response1: Response = await request(app.getHttpServer()).patch(`/bookings/${bookingIdStandardUser1}`).set('Authorization', `Bearer ${standardUser1Token}`).send({
                parkingSpotId: parkingSpots[1].id,
                startDateTime: '2024-09-22T08:00:00Z',
                endDateTime: '2024-09-22T12:00:00Z',
            });

            expect(response1.status).toEqual(HttpStatus.OK);
            expect(response1.body.result.parking_spot.id).toEqual(parkingSpots[1].id);
            expect(response1.body.result.start_date_time).toEqual('2024-09-22T08:00:00.000Z');
            expect(response1.body.result.end_date_time).toEqual('2024-09-22T12:00:00.000Z');
        });

        it('[PATCH] - Admin users can update everyones bookings', async () => {
            const users = await userRepository.find();
            const adminUsers = users.filter((user) => user.role === Role.Admin);

            const adminUser1Token = adminUsers[0].token;

            const parkingSpots = await parkingSpotRepository.find();

            const response: Response = await request(app.getHttpServer()).patch(`/bookings/${bookingIdStandardUser1}`).set('Authorization', `Bearer ${adminUser1Token}`).send({
                parkingSpotId: parkingSpots[0].id,
                startDateTime: '2024-07-28T07:50:00Z',
                endDateTime: '2024-07-28T11:30:00Z',
            });

            expect(response.status).toEqual(HttpStatus.OK);
            expect(response.body.result.start_date_time).toEqual('2024-07-28T07:50:00.000Z');
            expect(response.body.result.end_date_time).toEqual('2024-07-28T11:30:00.000Z');
        });

        it('[GET] - Standard Users can only view their own bookings', async () => {
            const users = await userRepository.find();
            const standardUsers = users.filter((user) => user.role === Role.Standard);

            const standardUser1Token = standardUsers[0].token;
            const standardUser2Token = standardUsers[1].token;

            const response1: Response = await request(app.getHttpServer()).get('/bookings').set('Authorization', `Bearer ${standardUser1Token}`);

            expect(response1.status).toEqual(HttpStatus.OK);
            expect(response1.body.result.length).toEqual(1);

            const response2: Response = await request(app.getHttpServer()).get('/bookings').set('Authorization', `Bearer ${standardUser2Token}`);

            expect(response2.status).toEqual(HttpStatus.OK);
            expect(response2.body.result.length).toEqual(1);
        });

        it('[GET]/:id - Standard Users can only view their own specific booking', async () => {
            const users = await userRepository.find();
            const standardUsers = users.filter((user) => user.role === Role.Standard);

            const standardUser1Token = standardUsers[0].token;
            const standardUser2Token = standardUsers[1].token;

            const response1: Response = await request(app.getHttpServer()).get(`/bookings/${bookingIdStandardUser1}`).set('Authorization', `Bearer ${standardUser1Token}`);

            expect(response1.status).toEqual(HttpStatus.OK);
            expect(response1.body.result.id).toEqual(bookingIdStandardUser1);

            const response2: Response = await request(app.getHttpServer()).get(`/bookings/${bookingIdStandardUser2}`).set('Authorization', `Bearer ${standardUser2Token}`);

            expect(response2.status).toEqual(HttpStatus.OK);
            expect(response2.body.result.id).toEqual(bookingIdStandardUser2);
        });

        it('[GET] - Admin users can view everyones bookings', async () => {
            const users = await userRepository.find();
            const adminUsers = users.filter((user) => user.role === Role.Admin);

            const adminUser = adminUsers[0].token;

            const response: Response = await request(app.getHttpServer()).get('/bookings').set('Authorization', `Bearer ${adminUser}`);

            expect(response.status).toEqual(HttpStatus.OK);
            expect(response.body.result.length).toEqual(4);
        });

        it('[GET]/:id - Admin users can view someones else specific booking', async () => {
            const users = await userRepository.find();
            const adminUsers = users.filter((user) => user.role === Role.Admin);

            const adminUser = adminUsers[0].token;

            const response: Response = await request(app.getHttpServer()).get(`/bookings/${bookingIdStandardUser1}`).set('Authorization', `Bearer ${adminUser}`);

            expect(response.status).toEqual(HttpStatus.OK);
            expect(response.body.result.id).toEqual(bookingIdStandardUser1);
        });

        it('[DELETE]/:id - Standard Users can only delete their own specific booking', async () => {
            const users = await userRepository.find();
            const standardUsers = users.filter((user) => user.role === Role.Standard);

            const standardUserToken = standardUsers[0].token;

            const response0: Response = await request(app.getHttpServer()).delete(`/bookings/${bookingIdAdminUser1}`).set('Authorization', `Bearer ${standardUserToken}`);

            expect(response0.status).toEqual(HttpStatus.FORBIDDEN);

            const response1: Response = await request(app.getHttpServer()).delete(`/bookings/${bookingIdStandardUser1}`).set('Authorization', `Bearer ${standardUserToken}`);
            expect(response1.status).toEqual(HttpStatus.OK);
            expect(response1.body.result).toBeUndefined();
        });

        it('[DELETE]/:id - Admin Users can delete everyones specific booking', async () => {
            const users = await userRepository.find();
            const adminUsers = users.filter((user) => user.role === Role.Admin);

            const adminUserToken = adminUsers[0].token;

            const response: Response = await request(app.getHttpServer()).delete(`/bookings/${bookingIdStandardUser2}`).set('Authorization', `Bearer ${adminUserToken}`);

            expect(response.status).toEqual(HttpStatus.OK);
            expect(response.body.result).toBeUndefined();
        });
    });
});
