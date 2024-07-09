import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Cache } from 'cache-manager';

import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { Role } from '@app/commons';

import { UserEntity } from './user.entity';

@Injectable()
export class UserService {
    private readonly _logger: Logger = new Logger(UserService.name);

    constructor(
        @InjectRepository(UserEntity)
        private readonly _repository: Repository<UserEntity>,
        @Inject(CACHE_MANAGER) private _cacheManager: Cache,
    ) {}

    get = async (id: string): Promise<UserEntity | null> => {
        if (!id) {
            return null;
        }

        const user = await this._repository.findOne({ where: { id } });
        return user;
    };

    seed = async (): Promise<UserEntity[]> => {
        const users: UserEntity[] = [];
        const firstNames = ['John', 'Jane', 'Alice', 'Bob', 'Charlie', 'Diana', 'Edward', 'Fiona'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];

        // 8 standard users and 2 admin users
        const targetUserCount = 10;
        const currentNumberOfUsers = await this._repository.count();

        if (targetUserCount <= currentNumberOfUsers) {
            this._logger.log('Target user count already reached or exceeded');
            return;
        }

        // Simulate jwt token as we skip signup and signin process
        const generateRandomToken = (): string => {
            const header = Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64').replace(/=/g, '');
            const payload = Buffer.from(`{"sub":"${randomUUID()}","name":"Random User","iat":${Math.floor(Date.now() / 1000)}}`)
                .toString('base64')
                .replace(/=/g, '');
            const signature = Buffer.from(randomUUID()).toString('base64').replace(/=/g, '');
            return `${header}.${payload}.${signature}`;
        };

        const generateUser = (index: number, role: Role): UserEntity => {
            const firstName = firstNames[index % firstNames.length];
            const lastName = lastNames[index % lastNames.length];
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@example.com`;
            const token = generateRandomToken();
            return new UserEntity({
                first_name: firstName,
                last_name: lastName,
                email,
                role,
                token,
            });
        };

        try {
            // Create users
            for (let i = 0; i < targetUserCount; i++) {
                const role = i < 8 ? Role.Standard : Role.Admin;
                const newUser = generateUser(i, role);
                this._logger.log(`Creating ${role === Role.Standard ? Role.Standard : Role.Admin} user with email: ${newUser.email} and token: ${newUser.token}`);
                const entity = await this._repository.save(newUser);
                users.push(entity);
            }

            return users;
        } catch (error) {
            this._logger.error('Error creating users', error);
            throw error;
        }
    };

    async findByToken(token: string): Promise<UserEntity | undefined> {
        const cacheKey = `user_token_${token}`;
        const cachedUser = await this._cacheManager.get<UserEntity>(cacheKey);

        if (cachedUser) {
            return cachedUser;
        }

        const user = await this._repository.findOne({ where: { token } });

        if (user) {
            await this._cacheManager.set(cacheKey, user, 30 * 1000);
        }

        return user;
    }
}
