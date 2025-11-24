import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, Filter, TrendingUp, Sparkles, Loader2, X } from 'lucide-react';
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
    const [isLoading, setIsLoading] = useState(true);
    const [isBuying, setIsBuying] = useState<number | null>(null);
    const [showMyListings, setShowMyListings] = useState(false);
    const { account } = useWeb3();

    useEffect(() => {
        const fetchListings = async () => {
            setIsLoading(true);
            // Simulate network delay for realistic feel
            await new Promise(resolve => setTimeout(resolve, 1500));

            const mockListings: NFTListing[] = [
                { listingId: 1, tokenId: 42, name: 'Cosmic Crystal', image: '', rarity: 'legendary', price: '500', seller: '0x1234567890123456789012345678901234567890' },
                { listingId: 2, tokenId: 43, name: 'Aura Shard', image: '', rarity: 'epic', price: '150', seller: '0x456...' },
                { listingId: 3, tokenId: 44, name: 'Energy Core', image: '', rarity: 'rare', price: '50', seller: '0x789...' },
                { listingId: 4, tokenId: 45, name: 'Void Essence', image: '', rarity: 'rare', price: '75', seller: account || '0x999...' }, // Mock user listing
                { listingId: 5, tokenId: 46, name: 'Solar Flare', image: '', rarity: 'epic', price: '200', seller: '0xabc...' },
                { listingId: 6, tokenId: 47, name: 'Nebula Dust', image: '', rarity: 'common', price: '10', seller: '0xdef...' },
            ];
            setListings(mockListings);
            setIsLoading(false);
        };
        fetchListings();
    }, [account]);

    const handleBuy = async (listingId: number, price: string) => {
        if (!account) {
            toast.error('Please connect your wallet first');
            return;
        }

        try {
            setIsBuying(listingId);
            toast.info('Preparing transaction...');
            // Simulate transaction delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // TODO: Call Marketplace.buyItem(listingId) with price as msg.value

            toast.success('NFT purchased successfully!');
            // Remove item from list to simulate purchase
            setListings(prev => prev.filter(l => l.listingId !== listingId));
        } catch (error) {
            toast.error('Purchase failed');
        } finally {
            setIsBuying(null);
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
        if (price < priceRange[0] || price > priceRange[1]) return false;
        if (showMyListings && l.seller.toLowerCase() !== account?.toLowerCase()) return false;
        return true;
    });

    const clearFilters = () => {
        setFilter('all');
        setPriceRange([0, 1000]);
        setShowMyListings(false);
    };

    return (
        <div className="min-h-screen p-6 pb-24">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold glow-text flex items-center gap-2">
                        <ShoppingCart className="w-8 h-8" />
                        NFT Marketplace
                    </h1>
                    {account && (
                        <Button
                            variant={showMyListings ? "secondary" : "outline"}
                            onClick={() => setShowMyListings(!showMyListings)}
                            className="gap-2"
                        >
                            {showMyListings ? "Show All" : "My Listings"}
                        </Button>
                    )}
                </div>

                {/* Filters */}
                <Card className="p-4 bg-card/50 border-primary/30 backdrop-blur-sm">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="flex gap-2">
                                {['all', 'legendary', 'epic', 'rare', 'common'].map((f) => (
                                    <Button
                                        key={f}
                                        variant={filter === f ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setFilter(f)}
                                        className="capitalize"
                                    >
                                        {f}
                                    </Button>
                                ))}
                            </div>
                            <div className="h-6 w-px bg-border mx-2 hidden md:block" />
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Price:</span>
                                <Input
                                    type="number"
                                    className="w-20 h-8"
                                    value={priceRange[0]}
                                    onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                                />
                                <span className="text-muted-foreground">-</span>
                                <Input
                                    type="number"
                                    className="w-20 h-8"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 0])}
                                />
                            </div>
                        </div>

                        {(filter !== 'all' || priceRange[0] !== 0 || priceRange[1] !== 1000 || showMyListings) && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                                <X className="w-4 h-4 mr-1" /> Clear Filters
                            </Button>
                        )}
                    </div>
                </Card>

                {/* Listings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {isLoading ? (
                        // Loading Skeletons
                        Array.from({ length: 8 }).map((_, i) => (
                            <Card key={i} className="overflow-hidden bg-card/50 border-primary/10">
                                <Skeleton className="h-48 w-full" />
                                <div className="p-4 space-y-3">
                                    <Skeleton className="h-6 w-3/4" />
                                    <div className="flex justify-between">
                                        <Skeleton className="h-10 w-20" />
                                        <Skeleton className="h-10 w-24" />
                                    </div>
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </Card>
                        ))
                    ) : filteredListings.length > 0 ? (
                        filteredListings.map((listing) => (
                            <motion.div
                                key={listing.listingId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Card className="overflow-hidden bg-card/50 border-primary/30 hover:border-primary/60 transition-all group">
                                    <div className={`h-48 bg-gradient-to-br ${getRarityColor(listing.rarity)} flex items-center justify-center relative overflow-hidden`}>
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                                        <Sparkles className="w-24 h-24 text-white/80 drop-shadow-lg transform group-hover:scale-110 transition-transform duration-500" />
                                        <div className="absolute top-2 right-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold bg-black/50 backdrop-blur-sm text-white capitalize border border-white/20`}>
                                                {listing.rarity}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <h3 className="font-bold text-lg truncate" title={listing.name}>{listing.name}</h3>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-xs text-muted-foreground">Price</div>
                                                <div className="text-xl font-bold text-primary">{listing.price} MATIC</div>
                                            </div>
                                            <Button
                                                size="sm"
                                                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity min-w-[100px]"
                                                onClick={() => handleBuy(listing.listingId, listing.price)}
                                                disabled={listing.seller.toLowerCase() === account?.toLowerCase() || isBuying === listing.listingId}
                                            >
                                                {isBuying === listing.listingId ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : listing.seller.toLowerCase() === account?.toLowerCase() ? (
                                                    "Your Item"
                                                ) : (
                                                    <>
                                                        <ShoppingCart className="w-4 h-4 mr-1" />
                                                        Buy Now
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                                            <span>Seller:</span>
                                            <span className="font-mono bg-muted px-1.5 py-0.5 rounded">
                                                {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))
                    ) : (
                        // Empty State
                        <div className="col-span-full text-center py-20 text-muted-foreground bg-card/30 rounded-xl border border-dashed border-border">
                            <div className="bg-muted/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShoppingCart className="w-10 h-10 opacity-50" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No listings found</h3>
                            <p className="mb-6 max-w-md mx-auto">
                                We couldn't find any NFTs matching your current filters. Try adjusting your price range or rarity filter.
                            </p>
                            <Button variant="outline" onClick={clearFilters}>
                                Clear All Filters
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MarketplaceView;
