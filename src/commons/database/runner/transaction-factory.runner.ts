import { DataSource } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { TransactionRunner } from './transaction-runner.runner';

@Injectable()
export class DbTransactionFactory {
    constructor(private readonly dataSource: DataSource) {}

    async createTransaction(): Promise<TransactionRunner> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        return new TransactionRunner(queryRunner);
    }
}
