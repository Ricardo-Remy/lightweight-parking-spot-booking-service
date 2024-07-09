import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './modules/app.module';

async function bootstrap() {
    // API module setup
    const app = await NestFactory.create(AppModule);
    // To adapt based on the domain
    app.enableCors();
    // Acquire the config service
    const config = app.get(ConfigService);
    // Swagger
    const swagger = new DocumentBuilder().setTitle('Deskbird').setDescription('Deskbird api documentation').setVersion('1.0').build();
    const document = SwaggerModule.createDocument(app, swagger);
    SwaggerModule.setup('docs', app, document);
    await app.listen(config.get<string>('API_PORT'));
}

bootstrap();
