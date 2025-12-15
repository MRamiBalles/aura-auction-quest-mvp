/**
 * Index - Main game page with view switching and navigation.
 * 
 * Renders different game views based on user selection:
 * - Map: World overview with nearby crystals
 * - Hunt: AR camera view for crystal collection
 * - PvP: Player vs player dueling
 * - Marketplace: NFT trading and auctions
 * - Wallet: Balance and transactions
 * - Landlords: Virtual real estate management
 * 
 * @author Manuel Ramírez Ballesteros
 * @version 1.1.0 - Added Ghost Mode and Landlords integration
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Trophy, Wallet, Map, Swords, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import OnboardingTutorial from "@/components/OnboardingTutorial";
import ARHuntView from "@/components/ARHuntView";
import MapView from "@/components/MapView";
import PvPDuel from "@/components/PvPDuel";
import Marketplace from "@/components/Marketplace";
import WalletDashboard from "@/components/WalletDashboard";
import ProfileInventory from "@/components/ProfileInventory";
import LanguageSelector from "@/components/LanguageSelector";
import VisibilitySelector from "@/components/VisibilitySelector";
import LandlordsView from "@/components/LandlordsView";

type ViewType = "map" | "hunt" | "pvp" | "marketplace" | "wallet" | "profile" | "landlords";

const Index = () => {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState<ViewType>("map");
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showNavigation, setShowNavigation] = useState(true);

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem("aura_onboarding_complete", "true");
  };

  // Render the appropriate view based on currentView state
  const renderView = () => {
    switch (currentView) {
      case "hunt":
        return (
          <ARHuntView
            onComplete={() => setCurrentView("map")}
            onBack={() => setCurrentView("map")}
          />
        );
      case "pvp":
        return (
          <PvPDuel
            onComplete={() => setCurrentView("map")}
            onBack={() => setCurrentView("map")}
          />
        );
      case "marketplace":
        return <Marketplace onBack={() => setCurrentView("map")} />;
      case "wallet":
        return <WalletDashboard onBack={() => setCurrentView("map")} />;
      case "profile":
        return <ProfileInventory onBack={() => setCurrentView("map")} />;
      case "landlords":
        return <LandlordsView onBack={() => setCurrentView("map")} />;
      case "map":
      default:
        return (
          <MapView
            onStartHunt={() => setCurrentView("hunt")}
            onStartPvP={() => setCurrentView("pvp")}
          />
        );
    }
  };

  // Show onboarding if not completed
  if (showOnboarding && !localStorage.getItem("aura_onboarding_complete")) {
    return <OnboardingTutorial onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-card to-background pointer-events-none" />

      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-aura-purple/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-aura-cyan/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header controls */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <VisibilitySelector />
        <LanguageSelector />
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
          <div className="flex justify-around items-center p-3 max-w-lg mx-auto">
            <NavButton
              icon={Map}
              label={t("nav.map")}
              active={currentView === "map"}
              onClick={() => setCurrentView("map")}
            />
            <NavButton
              icon={Sparkles}
              label={t("nav.hunt")}
              active={currentView === "hunt"}
              onClick={() => setCurrentView("hunt")}
            />
            <NavButton
              icon={Swords}
              label={t("nav.pvp")}
              active={currentView === "pvp"}
              onClick={() => setCurrentView("pvp")}
            />
            <NavButton
              icon={Trophy}
              label={t("nav.market")}
              active={currentView === "marketplace"}
              onClick={() => setCurrentView("marketplace")}
            />
            <NavButton
              icon={MapPin}
              label="Land"
              active={currentView === "landlords"}
              onClick={() => setCurrentView("landlords")}
            />
            <NavButton
              icon={Wallet}
              label={t("nav.wallet")}
              active={currentView === "wallet"}
              onClick={() => setCurrentView("wallet")}
            />
          </div>
        </motion.nav>
      )}
    </div>
  );
};

/**
 * NavButton - Bottom navigation button component.
 */
interface NavButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all ${active
        ? "text-primary scale-110"
        : "text-muted-foreground hover:text-foreground"
      }`}
  >
    <Icon className={`w-5 h-5 ${active ? "drop-shadow-[0_0_8px_hsl(var(--primary))]" : ""}`} />
    <span className="text-xs font-medium">{label}</span>
  </button>
);

export default Index;
