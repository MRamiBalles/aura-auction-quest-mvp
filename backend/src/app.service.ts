import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    getHello(): string {
        return 'AuraAuction Quest Secure Backend v0.1';
    }
}
