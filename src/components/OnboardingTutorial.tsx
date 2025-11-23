import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, Map, Zap, Trophy, ArrowRight } from "lucide-react";

const steps = [
  {
    title: "Welcome to AuraAuction Quest",
    description: "The first AR Move-to-Earn game where your steps unlock rare NFT crystals worth real money.",
    icon: Sparkles,
    gradient: "from-primary to-secondary",
  },
  {
    title: "Explore & Scan",
    description: "Walk to real-world hotspots, scan AR crystals with your camera, and collect unique NFTs (1/1000 legendaries!).",
    icon: Map,
    gradient: "from-secondary to-accent",
  },
  {
    title: "PvP Duels",
    description: "Challenge nearby players to physical duels. Most active wins the NFT! Move faster, scan quicker.",
    icon: Zap,
    gradient: "from-accent to-primary",
  },
  {
    title: "Auction & Earn",
    description: "Sell your NFTs in live 60s auctions. Top rarities can fetch $500-$10k. Earn $2-5/day base or $300/day peaks!",
    icon: Trophy,
    gradient: "from-primary to-accent",
  },
];

interface OnboardingTutorialProps {
  onComplete: () => void;
}

const OnboardingTutorial = ({ onComplete }: OnboardingTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg w-full space-y-8"
        >
          {/* Logo/Title */}
          <motion.div
            className="text-center space-y-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className={`mx-auto w-24 h-24 rounded-full bg-gradient-to-br ${currentStepData.gradient} flex items-center justify-center animate-float`}>
              <Icon className="w-12 h-12 text-white drop-shadow-lg" />
            </div>
            <h1 className="text-4xl font-bold glow-text bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {currentStepData.title}
            </h1>
          </motion.div>

          {/* Description */}
          <motion.p
            className="text-lg text-center text-muted-foreground leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {currentStepData.description}
          </motion.p>

          {/* Progress dots */}
          <div className="flex justify-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? "w-8 bg-primary shadow-[0_0_10px_hsl(var(--primary))]"
                    : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              onClick={handleNext}
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold text-lg py-6 shadow-[0_0_20px_hsl(var(--primary)/0.5)] transition-all hover:shadow-[0_0_30px_hsl(var(--primary)/0.7)]"
            >
              {currentStep < steps.length - 1 ? (
                <>
                  Next <ArrowRight className="ml-2 w-5 h-5" />
                </>
              ) : (
                <>
                  Start Hunting <Sparkles className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </motion.div>

          {/* Skip button */}
          {currentStep < steps.length - 1 && (
            <button
              onClick={onComplete}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline w-full text-center"
            >
              Skip tutorial
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default OnboardingTutorial;
