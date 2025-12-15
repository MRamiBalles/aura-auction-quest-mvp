/**
 * Application Bootstrap
 * 
 * Configures NestJS with security-hardened settings:
 * - Restricted CORS origins
 * - Input validation with whitelist
 * - Helmet for security headers (add as needed)
 * 
 * @author Security Team
 * @version 2.0.0 - Added CORS restrictions
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Configure CORS with restricted origins
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
        'http://localhost:5173',
        'http://localhost:3000',
    ];
    
    app.enableCors({
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, Postman, etc.)
            if (!origin) {
                callback(null, true);
                return;
            }
            
            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.warn(`CORS blocked request from: ${origin}`);
                callback(new Error('Not allowed by CORS'), false);
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        maxAge: 3600,
    });

    // Enable global validation for DTOs
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,  // Strip properties that don't have decorators
        forbidNonWhitelisted: true,  // Throw error if non-whitelisted properties are present
        transform: true,  // Automatically transform payloads to DTO instances
        transformOptions: {
            enableImplicitConversion: true,  // Convert string numbers to actual numbers
        },
    }));

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 Application is running on: ${await app.getUrl()}`);
    console.log(`📋 CORS allowed origins: ${allowedOrigins.join(', ')}`);
}
bootstrap();
