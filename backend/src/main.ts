import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Enable CORS for frontend communication
    app.enableCors();

    // Enable global validation for DTOs
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,  // Strip properties that don't have decorators
        forbidNonWhitelisted: true,  // Throw error if non-whitelisted properties are present
        transform: true,  // Automatically transform payloads to DTO instances
        transformOptions: {
            enableImplicitConversion: true,  // Convert string numbers to actual numbers
        },
    }));

    await app.listen(3000);
    console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
