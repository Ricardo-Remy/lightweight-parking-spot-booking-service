import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Controller, Get, Logger } from '@nestjs/common';

import { Auth, AuthType, HealthResponse } from '@app/commons';

@Controller('health')
export class HealthController {
    private readonly _logger: Logger = new Logger(HealthController.name);
    constructor(
        private _health: HealthCheckService,
        private _db: TypeOrmHealthIndicator,
    ) {}

    @ApiOperation({ summary: 'Check API health' })
    @ApiOkResponse({ status: 200, type: HealthResponse })
    @Auth(AuthType.None)
    @Get('')
    @HealthCheck()
    async readiness() {
        const healthCheckResult = await this._health.check([async () => this._db.pingCheck('database', { timeout: 300 })]);

        if (healthCheckResult.status === 'ok') {
            this._logger.log(`Health check status: ${healthCheckResult.status}`);
        } else {
            this._logger.error(`Health check status: ${healthCheckResult.status}`);
        }

        if (healthCheckResult.info.database.status === 'up') {
            this._logger.log(`Database status: ${healthCheckResult.info.database.status}`);
        } else {
            this._logger.error(`Database status: ${healthCheckResult.info.database.status}`);
        }

        return healthCheckResult;
    }
}
