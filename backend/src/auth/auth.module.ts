/**
 * Auth Module
 * 
 * Provides JWT authentication with fail-fast secret validation.
 * CRITICAL: JWT_SECRET must be set in production (min 32 chars).
 * 
 * @author Security Team
 * @version 2.0.0 - Added fail-fast validation and Passport integration
 */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';

// Validate JWT_SECRET at module load time
const jwtSecret = process.env.JWT_SECRET;
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && (!jwtSecret || jwtSecret.length < 32)) {
    throw new Error(
        'SECURITY ERROR: JWT_SECRET must be set and at least 32 characters in production. ' +
        'Generate one with: openssl rand -base64 48'
    );
}

if (!jwtSecret) {
    console.warn(
        '⚠️  WARNING: JWT_SECRET not set. Using development fallback. ' +
        'DO NOT deploy to production without setting JWT_SECRET!'
    );
}

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            global: true,
            secret: jwtSecret || 'DEV_SECRET_DO_NOT_USE_IN_PROD',
            signOptions: { expiresIn: '24h' },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, JwtAuthGuard],
    exports: [AuthService, JwtStrategy, JwtAuthGuard, PassportModule],
})
export class AuthModule { }
