/**
 * JWT Authentication Guard
 * 
 * Protects routes by validating JWT tokens from Authorization header.
 * Used with @UseGuards(JwtAuthGuard) decorator on controllers.
 * 
 * @author Security Team
 * @version 1.0.0
 */
import { Injectable, UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Check if the request can be activated (user is authenticated)
   */
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  /**
   * Handle the request after passport validation
   * @throws UnauthorizedException if token is invalid or missing
   */
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or missing JWT token');
    }
    return user;
  }
}
