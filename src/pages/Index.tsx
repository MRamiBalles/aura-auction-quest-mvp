import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Trophy, Zap, Wallet, Map, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import OnboardingTutorial from "@/components/OnboardingTutorial";
import ARHuntView from "@/components/ARHuntView";
import MapView from "@/components/MapView";
import PvPDuel from "@/components/PvPDuel";
import Marketplace from "@/components/Marketplace";
import WalletDashboard from "@/components/WalletDashboard";
import ProfileInventory from "@/components/ProfileInventory";
import Roadmap from "@/components/Roadmap";

type View = "onboarding" | "map" | "hunt" | "pvp" | "marketplace" | "wallet" | "profile" | "roadmap";

const Index = () => {
  const [currentView, setCurrentView] = useState<View>("onboarding");
  const [showNavigation, setShowNavigation] = useState(false);

  const handleStartGame = () => {
    setCurrentView("map");
    setShowNavigation(true);
  };

  const renderView = () => {
    switch (currentView) {
      case "onboarding":
        return <OnboardingTutorial onComplete={handleStartGame} />;
      case "map":
        return <MapView onStartHunt={() => setCurrentView("hunt")} onStartPvP={() => setCurrentView("pvp")} />;
      case "hunt":
        return <ARHuntView />;
      case "pvp":
        return <PvPDuel onComplete={() => setCurrentView("marketplace")} onBack={() => setCurrentView("map")} />;
      case "marketplace":
        return <Marketplace onBack={() => setCurrentView("map")} />;
      case "wallet":
        return <WalletDashboard />;
      case "profile":
        return <ProfileInventory onBack={() => setCurrentView("map")} />;
      case "roadmap":
        return <Roadmap onBack={() => setCurrentView("map")} />;
      default:
        return <OnboardingTutorial onComplete={handleStartGame} />;
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-card to-background pointer-events-none" />
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: "1s" }} />
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {renderView()}
      </div>

      {/* Bottom navigation */}
      {showNavigation && (
        <motion.nav
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl"
        >
          <div className="flex justify-around items-center p-4 max-w-lg mx-auto">
            <NavButton icon={Map} label="Map" active={currentView === "map"} onClick={() => setCurrentView("map")} />
            <NavButton icon={Sparkles} label="Hunt" active={currentView === "hunt"} onClick={() => setCurrentView("hunt")} />
            <NavButton icon={Swords} label="PvP" active={currentView === "pvp"} onClick={() => setCurrentView("pvp")} />
            <NavButton icon={Trophy} label="Market" active={currentView === "marketplace"} onClick={() => setCurrentView("marketplace")} />
            <NavButton icon={Wallet} label="Wallet" active={currentView === "wallet"} onClick={() => setCurrentView("wallet")} />
          </div>
        </motion.nav>
      )}
    </div>
  );
};

const NavButton = ({ icon: Icon, label, active, onClick }: { icon: any; label: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all ${
      active ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
    }`}
  >
    <Icon className={`w-6 h-6 ${active ? "drop-shadow-[0_0_8px_hsl(var(--primary))]" : ""}`} />
    <span className="text-xs font-medium">{label}</span>
  </button>
);

export default Index;
