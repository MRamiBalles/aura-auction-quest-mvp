/**
 * MapView - Main game map showing AR hotspots and player statistics.
 * 
 * Features:
 * - Interactive map with nearby crystal hotspots
 * - Real-time player count at each location
 * - Daily stats (steps, earnings, NFTs found)
 * - Live activity feed showing recent finds
 * - Quick access to AR Hunt and PvP modes
 * 
 * UI Elements:
 * - Pulsing user location indicator
 * - Rarity-colored hotspot markers
 * - Hover tooltips with location details
 * - Animated scan line effect
 * 
 * @author Manuel Ramírez Ballesteros
 * @version 1.0.0
 */
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Sparkles, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

/**
 * Props for MapView component.
 */
interface MapViewProps {
  /** Callback when user wants to start AR crystal hunting */
  onStartHunt: () => void;
  /** Callback when user wants to find a PvP opponent */
  onStartPvP: () => void;
}

/**
 * Mock hotspot data - in production would come from backend.
 * Represents nearby locations with crystal spawn activity.
 */
const hotspots = [
  { id: 1, name: "Central Park", distance: "0.3 km", rarity: "Legendary", players: 12, x: "30%", y: "40%" },
  { id: 2, name: "Tech Plaza", distance: "0.8 km", rarity: "Epic", players: 8, x: "60%", y: "25%" },
  { id: 3, name: "River Walk", distance: "1.2 km", rarity: "Rare", players: 5, x: "45%", y: "65%" },
  { id: 4, name: "Mall District", distance: "0.5 km", rarity: "Epic", players: 15, x: "75%", y: "50%" },
];

/**
 * Rarity-based styling for hotspot markers.
 */
const rarityColors = {
  Legendary: "border-accent shadow-[0_0_20px_hsl(var(--accent)/0.5)]",
  Epic: "border-secondary shadow-[0_0_15px_hsl(var(--secondary)/0.4)]",
  Rare: "border-primary shadow-[0_0_10px_hsl(var(--primary)/0.3)]",
};

/**
 * MapView component - The main hub for game navigation.
 */
const MapView = ({ onStartHunt, onStartPvP }: MapViewProps) => {
  return (
    <div className="min-h-screen pb-24 relative">
      {/* Header stats */}
      <div className="p-6 space-y-4">
        <h1 className="text-3xl font-bold glow-text">AR World Map</h1>
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 bg-card/50 backdrop-blur border-primary/20">
            <div className="text-xs text-muted-foreground">Today's Steps</div>
            <div className="text-xl font-bold text-primary">8,247</div>
          </Card>
          <Card className="p-3 bg-card/50 backdrop-blur border-accent/20">
            <div className="text-xs text-muted-foreground">Earnings</div>
            <div className="text-xl font-bold text-accent">$4.20</div>
          </Card>
          <Card className="p-3 bg-card/50 backdrop-blur border-secondary/20">
            <div className="text-xs text-muted-foreground">NFTs Found</div>
            <div className="text-xl font-bold text-secondary">23</div>
          </Card>
        </div>
      </div>

      {/* Map area */}
      <div className="relative h-[500px] mx-6 mb-6 rounded-2xl border-2 border-primary/30 overflow-hidden bg-gradient-to-br from-card/80 to-background/80 backdrop-blur">
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-8 grid-rows-8 h-full">
            {[...Array(64)].map((_, i) => (
              <div key={i} className="border border-primary/30" />
            ))}
          </div>
        </div>

        {/* User location */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-4 h-4 bg-primary rounded-full shadow-[0_0_20px_hsl(var(--primary))]" />
        </motion.div>

        {/* Hotspots */}
        {hotspots.map((spot, index) => (
          <motion.div
            key={spot.id}
            className="absolute"
            style={{ left: spot.x, top: spot.y }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <motion.div
              className={`relative cursor-pointer group`}
              whileHover={{ scale: 1.1 }}
              onClick={onStartHunt}
            >
              <div className={`w-12 h-12 rounded-full border-2 ${rarityColors[spot.rarity as keyof typeof rarityColors]} bg-card/90 backdrop-blur flex items-center justify-center animate-pulse-glow`}>
                <Sparkles className="w-6 h-6 text-accent" />
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-card border border-primary/30 rounded-lg p-2 whitespace-nowrap text-xs shadow-lg">
                  <div className="font-bold text-accent">{spot.name}</div>
                  <div className="text-muted-foreground">{spot.distance} • {spot.rarity}</div>
                  <div className="flex items-center gap-1 text-primary">
                    <Users className="w-3 h-3" />
                    {spot.players} hunting
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ))}

        {/* Scan pulse effect */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"
          animate={{ y: [0, 500, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        />
      </div>

      {/* Action buttons */}
      <div className="px-6 space-y-3">
        <Button
          onClick={onStartHunt}
          size="lg"
          className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
        >
          <Sparkles className="mr-2 w-5 h-5" />
          Start AR Hunt
        </Button>
        <Button
          onClick={onStartPvP}
          size="lg"
          variant="outline"
          className="w-full border-secondary/50 hover:bg-secondary/10 font-bold"
        >
          <Users className="mr-2 w-5 h-5" />
          Find PvP Duel (3 nearby)
        </Button>
      </div>

      {/* Live feed */}
      <div className="px-6 mt-6 space-y-2">
        <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Live Activity
        </h3>
        <Card className="p-3 bg-card/50 backdrop-blur border-accent/20">
          <div className="text-sm">
            <span className="font-bold text-accent">@CryptoHunter</span> found a <span className="text-accent">Legendary Crystal</span> at Central Park! 💎
          </div>
          <div className="text-xs text-muted-foreground mt-1">2 minutes ago</div>
        </Card>
        <Card className="p-3 bg-card/50 backdrop-blur border-secondary/20">
          <div className="text-sm">
            <span className="font-bold text-secondary">@FitnessKing</span> won PvP duel, earned $250 NFT 🏆
          </div>
          <div className="text-xs text-muted-foreground mt-1">5 minutes ago</div>
        </Card>
      </div>
    </div>
  );
};

export default MapView;
