import { IsEthereumAddress, IsNumber, Min, IsInt, IsString, IsOptional } from 'class-validator';

export class CreateListingDto {
    @IsEthereumAddress({ message: 'Invalid Ethereum address format' })
    address: string;

    @IsString()
    nftContract: string;

    @IsInt()
    @Min(1)
    tokenId: number;

    @IsNumber()
    @Min(0)
    price: number; // in MATIC

    @IsString()
    signature: string;

    @IsString()
    message: string;
}

export class BuyListingDto {
    @IsEthereumAddress({ message: 'Invalid Ethereum address format' })
    address: string;

    @IsInt()
    @Min(1)
    listingId: number;

    @IsNumber()
    @Min(0)
    amount: number;

    @IsString()
    signature: string;

    @IsString()
    message: string;
}

export class CancelListingDto {
    @IsEthereumAddress({ message: 'Invalid Ethereum address format' })
    address: string;

    @IsInt()
    @Min(1)
    listingId: number;

    @IsString()
    signature: string;

    @IsString()
    message: string;
}
