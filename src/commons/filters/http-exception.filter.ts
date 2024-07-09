import { Request, Response } from 'express';
import { isArray, ValidationError } from 'class-validator';

import { ArgumentsHost, Catch, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

import { getDescriptionFromErrors } from '@app/commons';

@Catch()
export class HttpExceptionFilter extends BaseExceptionFilter {
    catch = (error: Error, host: ArgumentsHost): void => {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let code: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'error';
        let result: any = null;

        if (error instanceof InternalServerErrorException) {
            message = error.message;
        } else if (isArray(error) && error.length > 0 && error[0] instanceof ValidationError) {
            code = HttpStatus.BAD_REQUEST;
            message = 'payload_validation_failed';
            result = {
                errors: getDescriptionFromErrors(error as ValidationError[]),
            };
        } else {
            if ((error as any).status !== undefined && (error as any).status !== null) {
                code = (error as any).status;
            }
            if (error.message !== undefined && error.message !== null) {
                message = error.message;
            }
        }

        response.status(code).json({
            code,
            message,
            result: {
                url: request.url,
                ...result,
            },
        });
    };
}
