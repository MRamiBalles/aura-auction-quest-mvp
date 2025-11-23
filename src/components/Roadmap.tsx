import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, CheckCircle2, Circle, Clock, Rocket } from "lucide-react";

interface RoadmapProps {
  onBack: () => void;
}

const phases = [
  {
    id: 1,
    phase: "Phase 1: Planning",
    status: "completed",
    items: [
      "Market research & competitor analysis ✓",
      "Define core mechanics (M2E + AR + Auctions) ✓",
      "Design system & wireframes ✓",
      "Tech stack selection ✓",
    ],
  },
  {
    id: 2,
    phase: "Phase 2: Design",
    status: "completed",
    items: [
      "UX/UI mockups for all screens ✓",
      "AR overlay prototypes ✓",
      "Blockchain flow diagrams ✓",
      "Brand identity (neon futuristic) ✓",
    ],
  },
  {
    id: 3,
    phase: "Phase 3: Frontend Dev",
    status: "current",
    items: [
      "React Native app setup ✓",
      "ARKit/ARCore simulation ✓",
      "Main game screens (Map, Hunt, PvP, Marketplace) ✓",
      "Wallet integration (mock) → In Progress",
    ],
  },
  {
    id: 4,
    phase: "Phase 4: Backend Dev",
    status: "pending",
    items: [
      "Node.js API server",
      "MongoDB/PostgreSQL database",
      "Polygon blockchain integration",
      "Real-time auction system",
    ],
  },
  {
    id: 5,
    phase: "Phase 5: Integrations",
    status: "pending",
    items: [
      "WalletConnect for crypto",
      "PayPal API for fiat",
      "GPS & Camera APIs (real)",
      "Anti-cheat AR verification",
    ],
  },
  {
    id: 6,
    phase: "Phase 6: Testing",
    status: "pending",
    items: [
      "Unit & integration tests",
      "Beta user testing (100 users)",
      "AR accuracy validation",
      "Security audit (smart contracts)",
    ],
  },
  {
    id: 7,
    phase: "Phase 7: Deployment",
    status: "pending",
    items: [
      "App Store submission (iOS/Android)",
      "Mainnet deployment (Polygon)",
      "Launch marketing campaign",
      "Influencer partnerships",
    ],
  },
  {
    id: 8,
    phase: "Phase 8: Maintenance",
    status: "pending",
    items: [
      "Monitor earnings & user feedback",
      "Balance game economy",
      "Add new NFT rarities",
      "Scale infrastructure",
    ],
  },
  {
    id: 9,
    phase: "Phase 9: Marketing",
    status: "pending",
    items: [
      "ASO optimization",
      "Crypto/fitness influencers",
      "Social media campaigns",
      "Referral program launch",
    ],
  },
];

const Roadmap = ({ onBack }: RoadmapProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-6 h-6 text-primary" />;
      case "current":
        return <Clock className="w-6 h-6 text-accent animate-pulse" />;
      default:
        return <Circle className="w-6 h-6 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-primary/50 bg-primary/5";
      case "current":
        return "border-accent/50 bg-accent/10 shadow-[0_0_20px_hsl(var(--accent)/0.2)]";
      default:
        return "border-muted/30 bg-muted/5";
    }
  };

  return (
    <div className="min-h-screen p-6 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold glow-text flex items-center gap-2">
            <Rocket className="w-6 h-6" />
            Development Roadmap
          </h1>
          <Button variant="ghost" size="icon" onClick={onBack}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress overview */}
        <Card className="p-6 bg-gradient-to-br from-primary/20 to-secondary/20 border-primary/30">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Overall Progress</span>
              <span className="font-bold">33% Complete</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-accent"
                initial={{ width: 0 }}
                animate={{ width: "33%" }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-primary rounded-full" />
                <span>3 Completed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-accent rounded-full animate-pulse" />
                <span>1 In Progress</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-muted rounded-full" />
                <span>5 Upcoming</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Timeline */}
        <div className="space-y-4 relative">
          {/* Connecting line */}
          <div className="absolute left-[1.5rem] top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary via-accent to-muted" />

          {phases.map((phase, index) => (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <Card className={`p-4 ml-12 ${getStatusColor(phase.status)}`}>
                {/* Status icon */}
                <div className="absolute -left-12 top-4 bg-background rounded-full p-1">
                  {getStatusIcon(phase.status)}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">{phase.phase}</h3>
                    {phase.status === "current" && (
                      <div className="px-2 py-1 bg-accent/20 rounded text-xs font-bold text-accent animate-pulse">
                        IN PROGRESS
                      </div>
                    )}
                    {phase.status === "completed" && (
                      <div className="px-2 py-1 bg-primary/20 rounded text-xs font-bold text-primary">
                        COMPLETE
                      </div>
                    )}
                  </div>

                  <ul className="space-y-2">
                    {phase.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <div className="mt-1">
                          {phase.status === "completed" || item.includes("✓") ? (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <span className={phase.status === "completed" || item.includes("✓") ? "text-foreground" : "text-muted-foreground"}>
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Next steps CTA */}
        <Card className="p-6 bg-gradient-to-br from-accent/20 to-primary/20 border-accent/30">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Rocket className="w-6 h-6 text-accent" />
              <h3 className="font-bold text-lg">Next Up: Backend Development</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Complete wallet integration, then move to Phase 4 to build the Node.js API and integrate real blockchain functionality on Polygon testnet.
            </p>
            <div className="flex gap-2">
              <Button className="bg-gradient-to-r from-accent to-secondary hover:opacity-90 text-white">
                View Phase 4 Details
              </Button>
              <Button variant="outline">
                Export Roadmap
              </Button>
            </div>
          </div>
        </Card>

        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 bg-card/50 text-center">
            <div className="text-2xl font-bold text-primary">6-8</div>
            <div className="text-xs text-muted-foreground mt-1">Months to Launch</div>
          </Card>
          <Card className="p-4 bg-card/50 text-center">
            <div className="text-2xl font-bold text-accent">$20M</div>
            <div className="text-xs text-muted-foreground mt-1">Year 1 Target</div>
          </Card>
          <Card className="p-4 bg-card/50 text-center">
            <div className="text-2xl font-bold text-secondary">100k</div>
            <div className="text-xs text-muted-foreground mt-1">Users Goal</div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
