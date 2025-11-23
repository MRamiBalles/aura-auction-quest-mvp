import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Camera, Sparkles, X, Target, Zap, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ARHuntViewProps {
  onComplete: () => void;
  onBack: () => void;
}

const crystals = [
  { id: 1, x: "30%", y: "40%", rarity: "Legendary", glow: "accent", value: "$500" },
  { id: 2, x: "60%", y: "25%", rarity: "Epic", glow: "secondary", value: "$120" },
  { id: 3, x: "45%", y: "65%", rarity: "Rare", glow: "primary", value: "$45" },
];

const ARHuntView = ({ onComplete, onBack }: ARHuntViewProps) => {
  const [scanning, setScanning] = useState(false);
  const [foundCrystal, setFoundCrystal] = useState<any>(null);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    if (scanning) {
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            const randomCrystal = crystals[Math.floor(Math.random() * crystals.length)];
            setFoundCrystal(randomCrystal);
            setScanning(false);
            return 100;
          }
          return prev + 2;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [scanning]);

  const handleScan = () => {
    setScanning(true);
    setScanProgress(0);
  };

  const handleClaim = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Camera mock background */}
      <div className="absolute inset-0 bg-gradient-to-br from-card/50 to-background/80">
        <div className="absolute inset-0 opacity-30">
          <div className="grid grid-cols-12 grid-rows-12 h-full">
            {[...Array(144)].map((_, i) => (
              <div key={i} className="border border-primary/20" />
            ))}
          </div>
        </div>
      </div>

      {/* AR Overlay UI */}
      <div className="relative z-10 p-6 h-screen flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="bg-card/80 backdrop-blur hover:bg-card"
          >
            <X className="w-5 h-5" />
          </Button>
          <Card className="px-4 py-2 bg-card/80 backdrop-blur">
            <div className="flex items-center gap-2 text-sm">
              <Camera className="w-4 h-4 text-primary animate-pulse" />
              <span className="font-bold">AR Mode Active</span>
            </div>
          </Card>
        </div>

        {/* Center scanning area */}
        <div className="flex-1 flex items-center justify-center relative">
          {/* Scanning reticle */}
          <motion.div
            className="relative w-64 h-64"
            animate={{ rotate: scanning ? 360 : 0 }}
            transition={{ duration: 2, repeat: scanning ? Infinity : 0, ease: "linear" }}
          >
            <div className="absolute inset-0 border-2 border-primary/50 rounded-full" />
            <div className="absolute inset-4 border-2 border-secondary/50 rounded-full" />
            <div className="absolute inset-8 border-2 border-accent/50 rounded-full animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Target className="w-12 h-12 text-primary drop-shadow-[0_0_10px_hsl(var(--primary))]" />
            </div>
          </motion.div>

          {/* Crystals to scan */}
          {!foundCrystal && !scanning && crystals.map((crystal) => (
            <motion.div
              key={crystal.id}
              className="absolute"
              style={{ left: crystal.x, top: crystal.y }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className={`relative cursor-pointer`}
                animate={{ y: [-10, 10, -10] }}
                transition={{ repeat: Infinity, duration: 3 }}
                whileHover={{ scale: 1.2 }}
              >
                <Sparkles className={`w-16 h-16 text-${crystal.glow} drop-shadow-[0_0_20px_hsl(var(--${crystal.glow}))]`} />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                  {crystal.rarity}
                </div>
              </motion.div>
            </motion.div>
          ))}

          {/* Scanning effect */}
          {scanning && (
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-primary to-transparent"
                animate={{ y: [0, 700, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              />
            </motion.div>
          )}
        </div>

        {/* Scan button */}
        {!foundCrystal && (
          <div className="space-y-4">
            {scanning && (
              <div className="space-y-2">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-secondary"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
                <p className="text-center text-sm text-muted-foreground">Scanning area... {scanProgress}%</p>
              </div>
            )}
            <Button
              onClick={handleScan}
              disabled={scanning}
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold shadow-[0_0_20px_hsl(var(--primary)/0.5)]"
            >
              <Zap className="mr-2 w-5 h-5" />
              {scanning ? "Scanning..." : "Scan for Crystals"}
            </Button>
          </div>
        )}
      </div>

      {/* Found crystal modal */}
      <AnimatePresence>
        {foundCrystal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/95 backdrop-blur-xl z-20 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="max-w-md w-full space-y-6 text-center"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                className="mx-auto w-32 h-32 relative"
              >
                <Sparkles className={`w-full h-full text-${foundCrystal.glow} drop-shadow-[0_0_40px_hsl(var(--${foundCrystal.glow}))]`} />
              </motion.div>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-bold glow-text-gold">{foundCrystal.rarity} Crystal Found!</h2>
                <p className="text-muted-foreground">
                  You discovered a {foundCrystal.rarity.toLowerCase()} aura crystal worth{" "}
                  <span className="text-accent font-bold text-xl">{foundCrystal.value}</span>
                </p>
              </div>

              <Card className="p-4 bg-card/50 border-accent/30">
                <p className="text-sm text-muted-foreground mb-2">Crystal Power</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Rarity</span>
                    <span className="font-bold text-accent">{foundCrystal.rarity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Market Value</span>
                    <span className="font-bold text-accent">{foundCrystal.value}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Drop Rate</span>
                    <span className="font-bold">{foundCrystal.rarity === "Legendary" ? "0.1%" : foundCrystal.rarity === "Epic" ? "5%" : "20%"}</span>
                  </div>
                </div>
              </Card>

              <div className="space-y-2">
                <Button
                  onClick={handleClaim}
                  size="lg"
                  className="w-full bg-gradient-to-r from-accent to-secondary hover:opacity-90 text-white font-bold shadow-[0_0_20px_hsl(var(--accent)/0.5)]"
                >
                  <Trophy className="mr-2 w-5 h-5" />
                  Claim & Auction NFT
                </Button>
                <Button
                  onClick={onBack}
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  Back to Map
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ARHuntView;
