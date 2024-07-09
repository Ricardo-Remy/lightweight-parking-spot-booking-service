import { plainToInstance } from 'class-transformer';

import { CacheInterceptor } from '@nestjs/cache-manager';
import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';

import { AccessTokenGuard, BookingResponse, BookingResponseWithMetadata, DataResponse, DataResponseMetadata, DefaultTake, DeskbirdRequest } from '@app/commons';

import { BookingService } from './booking.service';
import { CreateBookingDto } from './dtos/create-booking.dto';
import { UpdateBookingDto } from './dtos/update.booking.dto';

@ApiTags('bookings')
@Controller('bookings')
@UseGuards(AccessTokenGuard)
export class BookingController {
    constructor(private readonly _bookingService: BookingService) {}

    @ApiOkResponse({ status: 201, type: BookingResponse })
    @ApiBody({
        type: CreateBookingDto,
        description: 'The booking request payload',
    })
    @Post()
    async create(@Req() request: DeskbirdRequest, @Body() booking: CreateBookingDto): Promise<DataResponse> {
        const result = await this._bookingService.create(request.user, booking);

        return new DataResponse({
            result: plainToInstance(BookingResponse, result, { excludeExtraneousValues: true }),
        });
    }

    @ApiOkResponse({ status: 200, type: BookingResponse })
    @ApiParam({ name: 'id', type: String, description: 'Booking ID', example: 'e2810045-f123-4afc-9e09-b410743354e3' })
    @ApiBody({
        type: UpdateBookingDto,
        description: 'The booking update request payload',
    })
    @Patch(':id')
    async update(@Req() request: DeskbirdRequest, @Param('id') id: string, @Body() booking: UpdateBookingDto): Promise<DataResponse> {
        const result = await this._bookingService.update(request.user, id, booking);

        return new DataResponse({
            result: plainToInstance(BookingResponse, result, { excludeExtraneousValues: true }),
        });
    }

    @ApiOkResponse({ status: 200, type: [BookingResponseWithMetadata] })
    // DefaultTake returns 10 results per request - can be increased with limit query params
    @DefaultTake(10)
    @Get()
    async findAll(@Req() request: DeskbirdRequest): Promise<DataResponse> {
        const { limit, offset } = request.pagination;
        const [results, total] = await this._bookingService.findAll(request.user, limit, offset);

        return new DataResponse({
            result: results.map((repo) => plainToInstance(BookingResponse, repo, { excludeExtraneousValues: true })),
            metadata: new DataResponseMetadata({
                page: request.pagination.page,
                limit: request.pagination.limit,
                items_count: results.length,
                items_total: total,
            }),
        });
    }

    @ApiOkResponse({ status: 200, type: [BookingResponse] })
    @ApiParam({ name: 'id', type: String, description: 'Booking ID', example: 'e2810045-f123-4afc-9e09-b410743354e3' })
    // Cache interceptor to 30 seconds to reduce latency
    @UseInterceptors(CacheInterceptor)
    @Get(':id')
    async findOne(@Param('id') id: string, @Req() request: DeskbirdRequest): Promise<DataResponse> {
        const result = await this._bookingService.findOne(id, request.user);

        return new DataResponse({
            result: plainToInstance(BookingResponse, result, { excludeExtraneousValues: true }),
        });
    }

    @ApiOkResponse({ status: 200, description: 'Booking deleted successfully', type: String })
    @ApiParam({ name: 'id', type: String, description: 'Booking ID', example: 'e2810045-f123-4afc-9e09-b410743354e3' })
    @Delete(':id')
    async remove(@Param('id') id: string, @Req() request: DeskbirdRequest): Promise<DataResponse> {
        await this._bookingService.remove(id, request.user);

        return new DataResponse({
            message: `Booking with id: ${id} has been successfully delete`,
        });
    }
}
