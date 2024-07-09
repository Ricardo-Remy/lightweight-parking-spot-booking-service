import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthType, AUTH_TYPE_KEY, extractTokenFromHeader } from '@app/commons';

import { UserService } from '@app/modules/users/user.service';

@Injectable()
export class AccessTokenGuard implements CanActivate {
    constructor(
        private readonly _reflector: Reflector,
        private readonly _userService: UserService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const authTypes = this._reflector.get<AuthType[]>(AUTH_TYPE_KEY, context.getHandler());

        if (authTypes && authTypes.includes(AuthType.None)) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const token = extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException();
        }

        const user = await this._userService.findByToken(token);
        if (!user) {
            throw new UnauthorizedException();
        }

        request.user = user;

        return true;
    }
}
