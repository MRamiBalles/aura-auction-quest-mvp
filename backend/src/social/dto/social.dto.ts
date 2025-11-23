import { IsEthereumAddress, IsString, IsEnum, IsOptional, IsInt, Min } from 'class-validator';

export class AddFriendDto {
    @IsEthereumAddress({ message: 'Invalid Ethereum address format' })
    address: string;

    @IsEthereumAddress({ message: 'Invalid friend address format' })
    friendAddress: string;

    @IsString()
    signature: string;

    @IsString()
    message: string;
}

export class AcceptFriendDto {
    @IsEthereumAddress({ message: 'Invalid Ethereum address format' })
    address: string;

    @IsString()
    friendshipId: string;

    @IsString()
    signature: string;

    @IsString()
    message: string;
}

export class CreateGuildDto {
    @IsEthereumAddress({ message: 'Invalid Ethereum address format' })
    address: string;

    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsString()
    signature: string;

    @IsString()
    message: string;
}

export class JoinGuildDto {
    @IsEthereumAddress({ message: 'Invalid Ethereum address format' })
    address: string;

    @IsString()
    guildId: string;

    @IsString()
    signature: string;

    @IsString()
    message: string;
}

export enum LeaderboardPeriod {
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    ALL_TIME = 'all-time',
}

export class GetLeaderboardDto {
    @IsEnum(LeaderboardPeriod)
    period: LeaderboardPeriod;

    @IsOptional()
    @IsInt()
    @Min(1)
    limit?: number;
}
