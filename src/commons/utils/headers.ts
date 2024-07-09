import { Request } from 'express';

export const extractTokenFromHeader = (request: Request): string | undefined => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, token] = request.headers.authorization?.split(' ') ?? [];
    return token;
};
