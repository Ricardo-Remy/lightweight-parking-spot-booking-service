import { Request } from 'express';
import { IPagination } from './pagination.interface';

export interface IHttpRequest extends Request {
    pagination: IPagination;
}
