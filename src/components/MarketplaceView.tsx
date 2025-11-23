import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Filter, TrendingUp, Sparkles } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { toast } from 'sonner';

interface NFTListing {
    listingId: number;
    tokenId: number;
    name: string;
    image: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    price: string;
    seller: string;
}

const MarketplaceView = () => {
    const [listings, setListings] = useState<NFTListing[]>([]);
    const [filter, setFilter] = useState<string>('all');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
    const { account } = useWeb3();

    useEffect(() => {
        // TODO: Fetch listings from blockchain
        // Mock data for now
        const mockListings: NFTListing[] = [
            { listingId: 1, tokenId: 42, name: 'Cosmic Crystal', image: '', rarity: 'legendary', price: '500', seller: '0x123...' },
            { listingId: 2, tokenId: 43, name: 'Aura Shard', image: '', rarity: 'epic', price: '150', seller: '0x456...' },
            { listingId: 3, tokenId: 44, name: 'Energy Core', image: '', rarity: 'rare', price: '50', seller: '0x789...' },
        ];
        setListings(mockListings);
    }, []);

    const handleBuy = async (listingId: number, price: string) => {
        try {
            toast.info('Preparing transaction...');
            // TODO: Call Marketplace.buyItem(listingId) with price as msg.value
            toast.success('NFT purchased successfully!');
        } catch (error) {
            toast.error('Purchase failed');
        }
    };

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'legendary': return 'from-yellow-500 to-orange-500';
            case 'epic': return 'from-purple-500 to-pink-500';
            case 'rare': return 'from-blue-500 to-cyan-500';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    const filteredListings = listings.filter(l => {
        if (filter !== 'all' && l.rarity !== filter) return false;
        const price = parseFloat(l.price);
        return price >= priceRange[0] && price <= priceRange[1];
    });

    return (
        <div className="min-h-screen p-6 pb-24">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold glow-text flex items-center gap-2">
                        <ShoppingCart className="w-8 h-8" />
                        NFT Marketplace
                    </h1>
                </div>

                {/* Filters */}
                <Card className="p-4 bg-card/50 border-primary/30">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex gap-2">
                            <Button
                                variant={filter === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter('all')}
                            >
                                All
                            </Button>
                            <Button
                                variant={filter === 'legendary' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter('legendary')}
                            >
                                Legendary
                            </Button>
                            <Button
                                variant={filter === 'epic' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter('epic')}
                            >
                                Epic
                            </Button>
                            <Button
                                variant={filter === 'rare' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter('rare')}
                            >
                                Rare
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            <span className="text-sm">Price Range:</span>
                            <Input
                                type="number"
                                className="w-24"
                                value={priceRange[0]}
                                onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                            />
                            <span>-</span>
                            <Input
                                type="number"
                                className="w-24"
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                            />
                        </div>
                    </div>
                </Card>

                {/* Listings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredListings.map((listing) => (
                        <motion.div
                            key={listing.listingId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02 }}
                        >
                            <Card className="overflow-hidden bg-card/50 border-primary/30 hover:border-primary/60 transition-all">
                                <div className={`h-48 bg-gradient-to-br ${getRarityColor(listing.rarity)} flex items-center justify-center relative`}>
                                    <Sparkles className="w-24 h-24 text-white/80" />
                                    <div className="absolute top-2 right-2">
                                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-black/50 backdrop-blur-sm text-white capitalize">
                                            {listing.rarity}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4 space-y-3">
                                    <h3 className="font-bold text-lg">{listing.name}</h3>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-xs text-muted-foreground">Price</div>
                                            <div className="text-xl font-bold text-primary">{listing.price} MATIC</div>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="bg-gradient-to-r from-primary to-secondary"
                                            onClick={() => handleBuy(listing.listingId, listing.price)}
                                            disabled={listing.seller.toLowerCase() === account?.toLowerCase()}
                                        >
                                            <ShoppingCart className="w-4 h-4 mr-1" />
                                            Buy Now
                                        </Button>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Seller: {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {filteredListings.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                        <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No listings match your filters</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketplaceView;
