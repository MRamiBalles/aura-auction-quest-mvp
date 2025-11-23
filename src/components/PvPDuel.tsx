import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Swords, Trophy, Zap, X, TrendingUp } from "lucide-react";
import { api } from "@/services/api";
import { useWeb3 } from "@/contexts/Web3Context";
import { ethers } from "ethers";

interface PvPDuelProps {
  onComplete: () => void;
  onBack: () => void;
}

const PvPDuel = ({ onComplete, onBack }: PvPDuelProps) => {
  const [phase, setPhase] = useState<"matching" | "duel" | "result">("matching");
  const [myProgress, setMyProgress] = useState(0);
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [winner, setWinner] = useState<"player" | "opponent" | null>(null);

  useEffect(() => {
    if (phase === "matching") {
      const timer = setTimeout(() => setPhase("duel"), 2000);
      return () => clearTimeout(timer);
    }

    if (phase === "duel") {
      const interval = setInterval(() => {
        setMyProgress((prev) => Math.min(prev + Math.random() * 3, 100));
        setOpponentProgress((prev) => Math.min(prev + Math.random() * 2.5, 100));
        // Fallback for demo if backend fails
        setWinner(myProgress >= 100 ? "player" : "opponent");
      }
  };

    return (
      <div className="min-h-screen p-6 pb-24 relative">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold glow-text flex items-center gap-2">
              <Swords className="w-6 h-6" />
              PvP Duel
            </h1>
            <Button variant="ghost" size="icon" onClick={onBack}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {phase === "matching" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 text-center pt-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
              >
                <Swords className="w-12 h-12 text-white" />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold">Finding opponent...</h2>
                <p className="text-muted-foreground mt-2">Searching for nearby players</p>
              </div>
            </motion.div>
          )}

          {phase === "duel" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Opponent */}
              <Card className="p-4 bg-card/50 border-destructive/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-destructive to-secondary flex items-center justify-center font-bold text-lg">
                      CK
                    </div>
                    <div>
                      <div className="font-bold">@CryptoKing</div>
                      <div className="text-xs text-muted-foreground">Level 42 • 89 Wins</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Activity</span>
                    <span className="font-bold">{Math.floor(opponentProgress)}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-destructive to-secondary"
                      style={{ width: `${opponentProgress}%` }}
                    />
                  </div>
                </div>
              </Card>

              {/* VS indicator */}
              <div className="relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-2xl shadow-[0_0_30px_hsl(var(--primary)/0.5)]"
                  >
                    VS
                  </motion.div>
                </div>
              </div>

              {/* Player */}
              <Card className="p-4 bg-card/50 border-primary/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-lg">
                      YOU
                    </div>
                    <div>
                      <div className="font-bold">You</div>
                      <div className="text-xs text-muted-foreground">Level 15 • 23 Wins</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Activity</span>
                    <span className="font-bold text-primary">{Math.floor(myProgress)}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-secondary shadow-[0_0_10px_hsl(var(--primary)/0.5)]"
                      style={{ width: `${myProgress}%` }}
                    />
                  </div>
                </div>
              </Card>

              {/* Instructions */}
              <Card className="p-4 bg-accent/10 border-accent/30">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-sm">Move faster to win!</div>
                    <div className="text-xs text-muted-foreground">
                      Walk, run, or scan quickly. First to 100% wins the NFT!
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {phase === "result" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center pt-10"
            >
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: 10 }}
                transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.5 }}
                className="mx-auto w-32 h-32 relative"
              >
                {winner === "player" ? (
                  <Trophy className="w-full h-full text-accent drop-shadow-[0_0_40px_hsl(var(--accent))]" />
                ) : (
                  <Swords className="w-full h-full text-muted-foreground" />
                )}
              </motion.div>

              <div className="space-y-2">
                <h2 className={`text-3xl font-bold ${winner === "player" ? "glow-text-gold" : "text-muted-foreground"}`}>
                  {winner === "player" ? "Victory!" : "Defeat"}
                </h2>
                <p className="text-muted-foreground">
                  {winner === "player"
                    ? "You outpaced your opponent and claimed the NFT!"
                    : "Your opponent was faster this time. Try again!"}
                </p>
              </div>

              {winner === "player" && (
                <Card className="p-4 bg-card/50 border-accent/30">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Duel Reward</div>
                    <div className="text-3xl font-bold text-accent">+$180</div>
                    <div className="text-sm">Epic Crystal NFT</div>
                  </div>
                </Card>
              )}

              <div className="space-y-2">
                <Button
                  onClick={winner === "player" ? onComplete : onBack}
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold shadow-[0_0_20px_hsl(var(--primary)/0.5)]"
                >
                  {winner === "player" ? (
                    <>
                      <Trophy className="mr-2 w-5 h-5" />
                      Claim & Auction
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 w-5 h-5" />
                      Find New Duel
                    </>
                  )}
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
          )}
        </div>
      </div>
    );
  };

  export default PvPDuel;
