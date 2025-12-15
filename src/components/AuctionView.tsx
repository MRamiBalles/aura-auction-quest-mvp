/**
 * AuctionView - Live NFT auction interface with real-time bidding.
 * 
 * Features:
 * - Live countdown timers for active auctions
 * - Real-time bid updates via WebSocket (planned)
 * - Anti-sniping: 2-minute extension on last-second bids
 * - Rarity-based visual indicators
 * - Sound effects for bid events
 * 
 * Integrates with:
 * - AuctionHouse.sol smart contract
 * - Web3Context for wallet connection
 * - SoundContext for audio feedback
 * 
 * @author Manuel Ramírez Ballesteros
 * @version 1.0.0
 * @see {@link contracts/AuctionHouse.sol}
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Gavel, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { toast } from 'sonner';
import { useSound } from '@/contexts/SoundContext';

/**
 * Auction item data structure.
 * Matches the data returned from AuctionHouse.sol getAuction().
 */
interface Auction {
    auctionId: number;
    tokenId: number;
    name: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    currentBid: string;
    currentBidder: string;
    endTime: number;
    seller: string;
    bidCount: number;
}

const AuctionView = () => {
    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
    const [bidAmount, setBidAmount] = useState('');
    const { account } = useWeb3();
    const { playSound } = useSound();

    useEffect(() => {
        // TODO: Fetch from blockchain
        const mockAuctions: Auction[] = [
            {
                auctionId: 1,
                tokenId: 101,
                name: 'Legendary Cosmic Crystal',
                rarity: 'legendary',
                currentBid: '500',
                currentBidder: '0x1234...5678',
                endTime: Date.now() + 3600000, // 1 hour
                seller: '0xabcd...efgh',
                bidCount: 12
            },
            {
                auctionId: 2,
                tokenId: 102,
                name: 'Epic Aura Shard',
                rarity: 'epic',
                currentBid: '150',
                currentBidder: '0x2345...6789',
                endTime: Date.now() + 7200000, // 2 hours
                seller: '0xbcde...fghi',
                bidCount: 7
            }
        ];
        setAuctions(mockAuctions);

        // Update countdown every second
        const interval = setInterval(() => {
            setAuctions(prev => [...prev]); // Force re-render for countdown
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const getTimeRemaining = (endTime: number) => {
        const now = Date.now();
        const diff = endTime - now;

        if (diff <= 0) return 'Ended';

        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        return `${hours}h ${minutes}m ${seconds}s`;
    };

    const handlePlaceBid = async (auction: Auction) => {
        if (!bidAmount || parseFloat(bidAmount) <= parseFloat(auction.currentBid)) {
            toast.error('Bid must be higher than current bid');
            return;
        }

        try {
            playSound('bid');
            toast.info('Preparing transaction...');
            // TODO: Call AuctionHouse.placeBid(auctionId) with bidAmount as msg.value
            toast.success('Bid placed successfully!');
            setSelectedAuction(null);
            setBidAmount('');
        } catch (error) {
            toast.error('Failed to place bid');
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

    return (
        <div className="min-h-screen p-6 pb-24">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold glow-text flex items-center gap-2">
                        <Gavel className="w-8 h-8 text-yellow-400" />
                        Live Auctions
                    </h1>
                    <Card className="p-3 bg-yellow-500/10 border-yellow-500/30">
                        <div className="flex items-center gap-2 text-yellow-400">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-bold">Anti-Sniping Active</span>
                        </div>
                    </Card>
                </div>

                {/* Active Auctions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {auctions.map((auction) => (
                        <motion.div
                            key={auction.auctionId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02 }}
                        >
                            <Card className="overflow-hidden bg-card/50 border-primary/30 hover:border-yellow-400/60 transition-all">
                                {/* NFT Preview */}
                                <div className={`h-48 bg-gradient-to-br ${getRarityColor(auction.rarity)} flex items-center justify-center relative`}>
                                    <Gavel className="w-24 h-24 text-white/80" />
                                    <div className="absolute top-2 left-2">
                                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-black/50 backdrop-blur-sm text-white capitalize">
                                            {auction.rarity}
                                        </span>
                                    </div>
                                    <div className="absolute top-2 right-2">
                                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-black/50 backdrop-blur-sm text-white">
                                            {auction.bidCount} bids
                                        </span>
                                    </div>
                                </div>

                                {/* Auction Info */}
                                <div className="p-4 space-y-3">
                                    <h3 className="font-bold text-lg">{auction.name}</h3>

                                    {/* Current Bid */}
                                    <div className="space-y-1">
                                        <div className="text-xs text-muted-foreground">Current Bid</div>
                                        <div className="text-2xl font-bold text-yellow-400">
                                            {auction.currentBid} MATIC
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            by {auction.currentBidder.slice(0, 6)}...{auction.currentBidder.slice(-4)}
                                        </div>
                                    </div>

                                    {/* Time Remaining */}
                                    <div className="flex items-center justify-between p-2 bg-accent/10 rounded">
                                        <div className="flex items-center gap-2 text-accent">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-sm font-bold">Ends In</span>
                                        </div>
                                        <span className="text-sm font-mono font-bold">
                                            {getTimeRemaining(auction.endTime)}
                                        </span>
                                    </div>

                                    {/* Place Bid Button */}
                                    <Button
                                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:opacity-90"
                                        onClick={() => setSelectedAuction(auction)}
                                        disabled={auction.seller.toLowerCase() === account?.toLowerCase()}
                                    >
                                        <Gavel className="w-4 h-4 mr-2" />
                                        Place Bid
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Bid Modal */}
                <AnimatePresence>
                    {selectedAuction && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                            onClick={() => setSelectedAuction(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.9 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-md"
                            >
                                <Card className="p-6 space-y-4">
                                    <h2 className="text-2xl font-bold">Place Bid</h2>

                                    <div className="space-y-2">
                                        <div className="text-sm text-muted-foreground">Auction Item</div>
                                        <div className="font-bold">{selectedAuction.name}</div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-sm text-muted-foreground">Current Bid</div>
                                        <div className="text-xl font-bold text-yellow-400">
                                            {selectedAuction.currentBid} MATIC
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-sm text-muted-foreground">
                                            Your Bid (must be higher)
                                        </div>
                                        <Input
                                            type="number"
                                            placeholder="Enter bid amount"
                                            value={bidAmount}
                                            onChange={(e) => setBidAmount(e.target.value)}
                                            min={parseFloat(selectedAuction.currentBid) + 0.01}
                                            step="0.01"
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => setSelectedAuction(null)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500"
                                            onClick={() => handlePlaceBid(selectedAuction)}
                                        >
                                            Confirm Bid
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AuctionView;
