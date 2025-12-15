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
import LanguageSelector from "@/components/LanguageSelector";

// ... existing imports

const Index = () => {
  // ... existing code

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-card to-background pointer-events-none" />
      {/* ... effects */}

      {/* Header / Top Controls */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageSelector />
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {renderView()}
      </div>

      {/* ... rest of component */}


      {/* Bottom navigation */}
      {showNavigation && (
        <motion.nav
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl"
        >
          <div className="flex justify-around items-center p-4 max-w-lg mx-auto">
            <NavButton icon={Map} label={t("nav.map")} active={currentView === "map"} onClick={() => setCurrentView("map")} />
            <NavButton icon={Sparkles} label={t("nav.hunt")} active={currentView === "hunt"} onClick={() => setCurrentView("hunt")} />
            <NavButton icon={Swords} label={t("nav.pvp")} active={currentView === "pvp"} onClick={() => setCurrentView("pvp")} />
            <NavButton icon={Trophy} label={t("nav.market")} active={currentView === "marketplace"} onClick={() => setCurrentView("marketplace")} />
            <NavButton icon={Wallet} label={t("nav.wallet")} active={currentView === "wallet"} onClick={() => setCurrentView("wallet")} />
          </div>
        </motion.nav>
      )}
    </div>
  );
};

const NavButton = ({ icon: Icon, label, active, onClick }: { icon: any; label: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all ${active ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
      }`}
  >
    <Icon className={`w-6 h-6 ${active ? "drop-shadow-[0_0_8px_hsl(var(--primary))]" : ""}`} />
    <span className="text-xs font-medium">{label}</span>
  </button>
);

export default Index;
