import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Web3Provider } from "./contexts/Web3Context";
import { InventoryProvider } from "./contexts/InventoryContext";
import { SoundProvider } from "./contexts/SoundContext";
import { VisibilityProvider } from "./contexts/VisibilityContext";
import { LandlordsProvider } from "./contexts/LandlordsContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TutorialOverlay from "./components/TutorialOverlay";
import DonationBanner from "./components/DonationBanner";

const queryClient = new QueryClient();

/**
 * Main App component with all context providers.
 * Provider hierarchy:
 * - QueryClient (React Query)
 * - Web3Provider (Wallet connection)
 * - SoundProvider (Audio effects)
 * - InventoryProvider (Player inventory)
 * - VisibilityProvider (Ghost Mode)
 * - LandlordsProvider (Virtual real estate)
 * 
 * @author Manuel Ramírez Ballesteros
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <Web3Provider>
      <SoundProvider>
        <InventoryProvider>
          <VisibilityProvider>
            <LandlordsProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <TutorialOverlay />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  {/* Donation Banner - non-intrusive floating button */}
                  <DonationBanner />
                </BrowserRouter>
              </TooltipProvider>
            </LandlordsProvider>
          </VisibilityProvider>
        </InventoryProvider>
      </SoundProvider>
    </Web3Provider>
  </QueryClientProvider>
);

export default App;

