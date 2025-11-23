import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Flame, X, TrendingUp, DollarSign } from "lucide-react";

interface MarketplaceProps {
  onBack: () => void;
}

const liveAuctions = [
  { id: 1, name: "Legendary Aura", currentBid: 450, timeLeft: 45, rarity: "Legendary", bidders: 23 },
  { id: 2, name: "Epic Nexus", currentBid: 180, timeLeft: 28, rarity: "Epic", bidders: 12 },
  { id: 3, name: "Rare Prism", currentBid: 65, timeLeft: 120, rarity: "Rare", bidders: 8 },
];

const Marketplace = ({ onBack }: MarketplaceProps) => {
  const [selectedAuction, setSelectedAuction] = useState(liveAuctions[0]);
  const [timeLeft, setTimeLeft] = useState(selectedAuction.timeLeft);
  const [bidAmount, setBidAmount] = useState(selectedAuction.currentBid + 10);
  const [hasPlacedBid, setHasPlacedBid] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePlaceBid = () => {
    setHasPlacedBid(true);
    setTimeout(() => setHasPlacedBid(false), 3000);
  };

  const rarityColors = {
    Legendary: "from-accent to-secondary",
    Epic: "from-secondary to-primary",
    Rare: "from-primary to-accent",
  };

  return (
    <div className="min-h-screen p-6 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold glow-text flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            Live Auctions
          </h1>
          <Button variant="ghost" size="icon" onClick={onBack}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Featured auction */}
        <Card className={`p-6 bg-gradient-to-br ${rarityColors[selectedAuction.rarity as keyof typeof rarityColors]} relative overflow-hidden`}>
          <div className="absolute top-0 right-0 p-2">
            <div className="flex items-center gap-1 text-white text-xs font-bold bg-destructive/80 px-2 py-1 rounded-full animate-pulse">
              <Flame className="w-3 h-3" />
              LIVE
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">{selectedAuction.name}</h2>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <span className="font-bold">{selectedAuction.rarity}</span>
                <span>•</span>
                <span>{selectedAuction.bidders} bidders</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-white/80">Current Bid</div>
              <div className="text-4xl font-bold text-white drop-shadow-lg">
                ${selectedAuction.currentBid}
              </div>
            </div>

            <div className="flex items-center justify-between bg-white/20 backdrop-blur rounded-lg p-3">
              <div className="text-white">
                <div className="text-xs">Time Remaining</div>
                <div className="text-xl font-bold">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</div>
              </div>
              <div className="text-white text-right">
                <div className="text-xs">Next Bid</div>
                <div className="text-xl font-bold">${bidAmount}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Bid button */}
        <Button
          onClick={handlePlaceBid}
          disabled={hasPlacedBid}
          size="lg"
          className="w-full bg-gradient-to-r from-accent to-secondary hover:opacity-90 text-white font-bold shadow-[0_0_20px_hsl(var(--accent)/0.5)]"
        >
          <DollarSign className="mr-2 w-5 h-5" />
          {hasPlacedBid ? "Bid Placed! 🎉" : `Place Bid - $${bidAmount}`}
        </Button>

        {/* FOMO alert */}
        {hasPlacedBid && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card className="p-4 bg-accent/20 border-accent/50">
              <div className="flex items-start gap-3">
                <Flame className="w-5 h-5 text-accent flex-shrink-0 animate-pulse" />
                <div>
                  <div className="font-bold text-sm">You're winning!</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Hold on to claim this {selectedAuction.rarity} NFT. Others are bidding too! 🔥
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Other auctions */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> More Auctions
          </h3>
          {liveAuctions.filter(a => a.id !== selectedAuction.id).map((auction) => (
            <Card
              key={auction.id}
              className="p-4 bg-card/50 hover:bg-card/70 cursor-pointer transition-all border-primary/20"
              onClick={() => {
                setSelectedAuction(auction);
                setTimeLeft(auction.timeLeft);
                setBidAmount(auction.currentBid + 10);
              }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold">{auction.name}</div>
                  <div className="text-sm text-muted-foreground">{auction.rarity}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Current</div>
                  <div className="text-lg font-bold text-accent">${auction.currentBid}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Market stats */}
        <Card className="p-4 bg-card/50">
          <h3 className="font-bold mb-3">Today's Market</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Volume</span>
              <span className="font-bold">$12,450</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Avg Sale Price</span>
              <span className="font-bold text-accent">$186</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Active Auctions</span>
              <span className="font-bold text-primary">47</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Marketplace;
