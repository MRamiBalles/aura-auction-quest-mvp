import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() body: { address: string; signature: string; message: string }) {
        const isValid = await this.authService.validateWeb3Signature(body.address, body.signature, body.message);
        if (!isValid) {
            throw new UnauthorizedException('Invalid signature');
        }
        return this.authService.login(body.address);
    }
}
