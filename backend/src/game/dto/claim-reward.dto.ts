import { IsEthereumAddress, IsString, Matches, IsNumber, Min, Max, IsInt, MaxLength } from 'class-validator';

export class ClaimRewardDto {
    @IsEthereumAddress({ message: 'Invalid Ethereum address format' })
    address: string;

    @IsString()
    @Matches(/^0x[a-fA-F0-9]{130}$/, { message: 'Invalid signature format (must be 0x followed by 130 hex characters)' })
    signature: string;

    @IsString()
    @MaxLength(200, { message: 'Message too long' })
    message: string;

    @IsNumber({}, { message: 'currLat must be a number' })
    @Min(-90, { message: 'currLat must be >= -90' })
    @Max(90, { message: 'currLat must be <= 90' })
    currLat: number;

    @IsNumber({}, { message: 'currLon must be a number' })
    @Min(-180, { message: 'currLon must be >= -180' })
    @Max(180, { message: 'currLon must be <= 180' })
    currLon: number;

    @IsNumber({}, { message: 'prevLat must be a number' })
    @Min(-90, { message: 'prevLat must be >= -90' })
    @Max(90, { message: 'prevLat must be <= 90' })
    prevLat: number;

    @IsNumber({}, { message: 'prevLon must be a number' })
    @Min(-180, { message: 'prevLon must be >= -180' })
    @Max(180, { message: 'prevLon must be <= 180' })
    prevLon: number;

    @IsInt({ message: 'currTime must be an integer' })
    @Min(0, { message: 'currTime cannot be negative' })
    currTime: number;

    @IsInt({ message: 'prevTime must be an integer' })
    @Min(0, { message: 'prevTime cannot be negative' })
    prevTime: number;
}
