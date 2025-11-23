import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Web3Provider } from "./contexts/Web3Context";
import Index from "./pages/Index";

const queryClient = new QueryClient();
import { InventoryProvider } from "./contexts/InventoryContext";
import { SoundProvider } from "./contexts/SoundContext";
import NotFound from "./pages/NotFound";
import TutorialOverlay from "./components/TutorialOverlay";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Web3Provider>
      <SoundProvider>
        <InventoryProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <TutorialOverlay />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </InventoryProvider>
      </SoundProvider>
    </Web3Provider>
  </QueryClientProvider>
);

export default App;
