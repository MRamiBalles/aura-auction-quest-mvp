import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { verifyMessage } from 'ethers';

interface Listing {
    id: number;
    seller: string;
    nftContract: string;
    tokenId: number;
    price: number;
    active: boolean;
    createdAt: Date;
}

@Injectable()
export class MarketplaceService {
    private listings: Listing[] = []; // In production, use MongoDB
    private nextId = 1;

    async getListings(activeOnly: boolean = true): Promise<Listing[]> {
        if (activeOnly) {
            return this.listings.filter(l => l.active);
        }
        return this.listings;
    }

    async getListing(listingId: number): Promise<Listing> {
        const listing = this.listings.find(l => l.id === listingId);
        if (!listing) {
            throw new NotFoundException(`Listing ${listingId} not found`);
        }
        return listing;
    }

    async createListing(
        address: string,
        nftContract: string,
        tokenId: number,
        price: number,
        signature: string,
        message: string,
    ): Promise<Listing> {
        // Verify signature
        this.verifySignature(address, signature, message);

        // TODO: Verify NFT ownership via smart contract
        // const nft = new ethers.Contract(nftContract, ABI, provider);
        // const owner = await nft.ownerOf(tokenId);
        // if (owner.toLowerCase() !== address.toLowerCase()) throw error;

        const listing: Listing = {
            id: this.nextId++,
            seller: address,
            nftContract,
            tokenId,
            price,
            active: true,
            createdAt: new Date(),
        };

        this.listings.push(listing);
        return listing;
    }

    async buyListing(
        buyer: string,
        listingId: number,
        amount: number,
        signature: string,
        message: string,
    ): Promise<{ success: boolean; listing: Listing }> {
        // Verify signature
        this.verifySignature(buyer, signature, message);

        const listing = await this.getListing(listingId);

        if (!listing.active) {
            throw new BadRequestException('Listing is no longer active');
        }

        if (listing.seller.toLowerCase() === buyer.toLowerCase()) {
            throw new BadRequestException('Cannot buy your own listing');
        }

        if (amount < listing.price) {
            throw new BadRequestException('Insufficient payment amount');
        }

        // TODO: Call smart contract Marketplace.buyItem(listingId)
        // This should be done via blockchain, not here
        // For now, just mark as inactive

        listing.active = false;

        return { success: true, listing };
    }

    async cancelListing(
        seller: string,
        listingId: number,
        signature: string,
        message: string,
    ): Promise<{ success: boolean }> {
        // Verify signature
        this.verifySignature(seller, signature, message);

        const listing = await this.getListing(listingId);

        if (listing.seller.toLowerCase() !== seller.toLowerCase()) {
            throw new BadRequestException('Only the seller can cancel this listing');
        }

        if (!listing.active) {
            throw new BadRequestException('Listing is already inactive');
        }

        // TODO: Call smart contract Marketplace.cancelListing(listingId)

        listing.active = false;

        return { success: true };
    }

    private verifySignature(address: string, signature: string, message: string): void {
        try {
            const recoveredAddress = verifyMessage(message, signature);
            if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
                throw new BadRequestException('Invalid signature');
            }
        } catch (error) {
            throw new BadRequestException('Signature verification failed');
        }
    }

    /**
     * 🔒 FIX P2-1: Invalidate a listing (called by cleanup service)
     * Marks a listing as inactive when seller no longer owns the NFT
     */
    async invalidateListing(listingId: number, reason: string = 'NFT transferred'): Promise<boolean> {
        const listing = this.listings.find(l => l.id === listingId);
        if (!listing || !listing.active) {
            return false;
        }

        listing.active = false;
        // In production with MongoDB, you'd also add a 'invalidatedReason' field
        // and emit an event or log for analytics

        return true;
    }

    /**
     * 🔒 FIX P2-1: Find listings by NFT contract and token
     */
    getListingsByNFT(nftContract: string, tokenId: number): Listing[] {
        return this.listings.filter(
            l => l.nftContract.toLowerCase() === nftContract.toLowerCase() &&
                l.tokenId === tokenId &&
                l.active
        );
    }
}
