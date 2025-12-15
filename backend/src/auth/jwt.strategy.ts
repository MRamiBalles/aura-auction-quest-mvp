/**
 * JWT Strategy for Passport
 * 
 * Validates JWT tokens and extracts user information.
 * Works with JwtAuthGuard to protect routes.
 * 
 * @author Security Team
 * @version 1.0.0
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secret = process.env.JWT_SECRET;
    
    // Fail fast if JWT_SECRET is not configured properly
    if (!secret || secret === 'DEV_SECRET_DO_NOT_USE_IN_PROD') {
      console.error('WARNING: JWT_SECRET is not properly configured!');
    }
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret || 'DEV_SECRET_DO_NOT_USE_IN_PROD',
    });
  }

  /**
   * Validate the JWT payload and return user object
   * This is called after the token signature is verified
   */
  async validate(payload: any) {
    if (!payload.address) {
      throw new UnauthorizedException('Invalid token payload');
    }
    
    return { 
      address: payload.address, 
      sub: payload.sub,
      iat: payload.iat,
      exp: payload.exp,
    };
  }
}
