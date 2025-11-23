import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, X, Trophy, Zap, Sparkles, Award, TrendingUp } from "lucide-react";

interface ProfileInventoryProps {
  onBack: () => void;
}

const nftInventory = [
  { id: 1, name: "Legendary Aura #42", rarity: "Legendary", value: "$500", image: "🔮" },
  { id: 2, name: "Epic Nexus #127", rarity: "Epic", value: "$180", image: "💎" },
  { id: 3, name: "Rare Prism #89", rarity: "Rare", value: "$65", image: "✨" },
  { id: 4, name: "Epic Crystal #201", rarity: "Epic", value: "$175", image: "💠" },
];

const achievements = [
  { id: 1, name: "First Hunt", description: "Complete your first AR scan", icon: "🎯", unlocked: true },
  { id: 2, name: "Speed Demon", description: "Win 10 PvP duels", icon: "⚡", unlocked: true },
  { id: 3, name: "Auction Master", description: "Sell 5 NFTs", icon: "🏆", unlocked: true },
  { id: 4, name: "Walking Legend", description: "Walk 100km total", icon: "👟", unlocked: false },
];

import { useInventory } from "@/contexts/InventoryContext";

const ProfileInventory = ({ onBack }: ProfileInventoryProps) => {
  const { items } = useInventory();
  const stats = {
    level: 15,
    totalSteps: 142350,
    totalEarnings: 1247.80,
    nftsFound: items.length,
    pvpWins: 12,
    rank: "Gold Hunter",
  };

  return (
    <div className="min-h-screen p-6 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold glow-text flex items-center gap-2">
            <User className="w-6 h-6" />
            Profile
          </h1>
          <Button variant="ghost" size="icon" onClick={onBack}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* User card */}
        <Card className="p-6 bg-gradient-to-br from-primary/20 to-secondary/20 border-primary/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl font-bold">
              YOU
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold glow-text">@AuraHunter</h2>
              <div className="text-sm text-muted-foreground">Level {stats.level} • {stats.rank}</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="px-2 py-1 bg-accent/20 rounded text-xs font-bold text-accent">
                  Top 5% Earners
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-card/50">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Zap className="w-4 h-4" />
              Steps
            </div>
            <div className="text-2xl font-bold text-primary">{stats.totalSteps.toLocaleString()}</div>
          </Card>
          <Card className="p-4 bg-card/50">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Trophy className="w-4 h-4" />
              Earnings
            </div>
            <div className="text-2xl font-bold text-accent">${stats.totalEarnings}</div>
          </Card>
          <Card className="p-4 bg-card/50">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Sparkles className="w-4 h-4" />
              NFTs
            </div>
            <div className="text-2xl font-bold text-secondary">{stats.nftsFound}</div>
          </Card>
          <Card className="p-4 bg-card/50">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Award className="w-4 h-4" />
              PvP Wins
            </div>
            <div className="text-2xl font-bold text-primary">{stats.pvpWins}</div>
          </Card>
        </div>

        {/* NFT Inventory */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> NFT Inventory ({items.length})
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    delay: index * 0.05
                  }}
                  layout
                >
                  <Card className="relative p-4 bg-black/40 backdrop-blur-xl border-white/10 hover:border-aura-cyan/50 cursor-pointer transition-all group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative z-10">
                      <div className="text-5xl mb-2 group-hover:scale-110 transition-transform duration-300 filter drop-shadow-lg">
                        {item.type === 'crystal' ? '🔮' : '🏺'}
                      </div>
                      <div className="space-y-1">
                        <div className="font-bold text-sm line-clamp-1 text-white group-hover:text-aura-cyan transition-colors">
                          {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)} {item.type === 'crystal' ? 'Crystal' : 'Artifact'}
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-medium ${item.rarity === "legendary" ? "text-amber-400 drop-shadow-glow" :
                            item.rarity === "rare" ? "text-aura-purple" : "text-aura-cyan"
                            }`}>
                            {item.rarity.toUpperCase()}
                          </span>
                          <span className="font-bold text-white/90">${item.value}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Achievements */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
            <Award className="w-4 h-4" /> Achievements
          </h3>
          <div className="space-y-2">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`p-4 ${achievement.unlocked ? "bg-card/50 border-primary/30" : "bg-muted/20 border-muted opacity-60"}`}>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="font-bold text-sm">{achievement.name}</div>
                      <div className="text-xs text-muted-foreground">{achievement.description}</div>
                    </div>
                    {achievement.unlocked && (
                      <div className="text-primary">✓</div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Streak tracker */}
        <Card className="p-4 bg-gradient-to-br from-accent/20 to-primary/20 border-accent/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Daily Streak</div>
              <div className="text-3xl font-bold text-accent">7 Days 🔥</div>
              <div className="text-xs text-muted-foreground mt-1">
                Keep going for bonus rewards!
              </div>
            </div>
            <TrendingUp className="w-12 h-12 text-accent/50" />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfileInventory;
