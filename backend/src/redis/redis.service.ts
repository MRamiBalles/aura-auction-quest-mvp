import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: Redis;

    onModuleInit() {
        this.client = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
        });
        console.log('Redis Connected');
    }

    onModuleDestroy() {
        this.client.disconnect();
    }

    async set(key: string, value: string, ttl?: number) {
        if (ttl) {
            await this.client.set(key, value, 'EX', ttl);
        } else {
            await this.client.set(key, value);
        }
    }

    async get(key: string): Promise<string | null> {
        return await this.client.get(key);
    }

    async setPlayerLocation(address: string, lat: number, lon: number) {
        // Store as a geospatial item if we wanted to use GEOADD, 
        // but for simple caching:
        const data = JSON.stringify({ lat, lon, timestamp: Date.now() });
        await this.set(`player:${address}:loc`, data, 300); // Expires in 5 mins
    }

    async getPlayerLocation(address: string) {
        const data = await this.get(`player:${address}:loc`);
        return data ? JSON.parse(data) : null;
    }
}
