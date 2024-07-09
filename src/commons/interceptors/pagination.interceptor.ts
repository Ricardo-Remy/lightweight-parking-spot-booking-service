import { Observable } from 'rxjs';

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { IHttpRequest, MetadataKeys } from '@app/commons';

@Injectable()
export class PaginationInterceptor implements NestInterceptor {
    constructor(private readonly _reflector: Reflector) {}
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
        const req: IHttpRequest = context.switchToHttp().getRequest() as IHttpRequest;

        if (!req || !req.query) {
            return next.handle();
        }

        const defaultTake = this._reflector.get<number>(MetadataKeys.DEFAULT_TAKE, context.getHandler());

        const page = parseInt((req.query.page as string) || '0');
        const limit = parseInt((req.query.limit as string) || (defaultTake as unknown as string) || '5');
        const offset = page === 0 ? 0 : page * limit;

        req.pagination = {
            page,
            limit,
            offset,
        };
        return next.handle();
    }
}
