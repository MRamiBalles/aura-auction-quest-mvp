import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ethers } from 'ethers';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService) { }

    async validateWeb3Signature(address: string, signature: string, message: string): Promise<boolean> {
        try {
            // Real Ethers.js verification
            const recoveredAddress = ethers.verifyMessage(message, signature);
            return recoveredAddress.toLowerCase() === address.toLowerCase();
        } catch (error) {
            console.error('Signature verification failed:', error);
            return false;
        }
    }

    async login(address: string) {
        const payload = { sub: address, address };
        return {
            access_token: this.jwtService.sign(payload),
            user: { address } // Roles removed from here, fetched via UserRoleService if needed
        };
    }
}
