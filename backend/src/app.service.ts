import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    /**
     * Returns the API health check message.
     * @returns Welcome message with version info
     */
    getHello(): string {
        return 'Aura World Secure Backend v1.0.0-MVP';
    }
}
