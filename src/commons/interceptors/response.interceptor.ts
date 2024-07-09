import { Observable } from 'rxjs';

import { map } from 'rxjs/operators';

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';

export interface Response<T> {
    code: number;
    message?: string;
    result: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
        const request = context.switchToHttp().getRequest();
        const method = request.method;

        return next.handle().pipe(
            map((data) => ({
                ...data,
                code: method === 'POST' ? 201 : 200,
                message: data.message || '',
            })),
        );
    }
}
