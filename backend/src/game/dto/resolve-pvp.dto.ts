import { IsEthereumAddress, IsString, Matches, MaxLength } from 'class-validator';

export class ResolvePvPDto {
    @IsEthereumAddress({ message: 'Invalid Ethereum address format' })
    address: string;

    @IsString()
    @Matches(/^0x[a-fA-F0-9]{130}$/, { message: 'Invalid signature format (must be 0x followed by 130 hex characters)' })
    signature: string;

    @IsString()
    @MaxLength(200, { message: 'Message too long' })
    message: string;
}
