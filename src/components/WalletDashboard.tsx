import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, TrendingUp, DollarSign, X, ArrowUpRight, ArrowDownLeft, Coins } from "lucide-react";

interface WalletDashboardProps {
  onBack: () => void;
}

const transactions = [
  { id: 1, type: "earn", amount: 4.20, description: "Daily steps (8.2k)", time: "2 hours ago" },
  { id: 2, type: "sell", amount: 180, description: "Epic Crystal auction", time: "5 hours ago" },
  { id: 3, type: "earn", amount: 3.80, description: "Daily steps (7.6k)", time: "1 day ago" },
  { id: 4, type: "sell", amount: 65, description: "Rare Prism auction", time: "1 day ago" },
];

const WalletDashboard = ({ onBack }: WalletDashboardProps) => {
  const totalBalance = 1247.80;
  const cryptoBalance = 0.0234; // ETH example
  const todayEarnings = 4.20;
  const weekEarnings = 156.40;

  return (
    <div className="min-h-screen p-6 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold glow-text flex items-center gap-2">
            <Wallet className="w-6 h-6" />
            Wallet
          </h1>
          <Button variant="ghost" size="icon" onClick={onBack}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Balance card */}
        <Card className="p-6 bg-gradient-to-br from-primary/20 to-secondary/20 border-primary/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="relative space-y-4">
            <div className="text-sm text-muted-foreground">Total Balance</div>
            <div className="space-y-1">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-5xl font-bold glow-text"
              >
                ${totalBalance.toLocaleString()}
              </motion.div>
              <div className="text-sm text-muted-foreground">
                ≈ {cryptoBalance} ETH on Polygon
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button className="bg-primary/20 hover:bg-primary/30 border border-primary/50">
                <ArrowDownLeft className="w-4 h-4 mr-2" />
                Deposit
              </Button>
              <Button className="bg-accent/20 hover:bg-accent/30 border border-accent/50">
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Withdraw
              </Button>
            </div>
          </div>
        </Card>

        {/* Earnings stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-card/50">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              <TrendingUp className="w-4 h-4" />
              Today
            </div>
            <div className="text-2xl font-bold text-primary">+${todayEarnings}</div>
          </Card>
          <Card className="p-4 bg-card/50">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              <Coins className="w-4 h-4" />
              This Week
            </div>
            <div className="text-2xl font-bold text-accent">+${weekEarnings}</div>
          </Card>
        </div>

        {/* Payment methods */}
        <Card className="p-4 bg-card/50">
          <h3 className="font-bold mb-3">Payment Methods</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-bold text-sm">PayPal</div>
                  <div className="text-xs text-muted-foreground">user@email.com</div>
                </div>
              </div>
              <div className="px-2 py-1 bg-primary/20 rounded text-xs font-bold text-primary">
                Primary
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg border border-secondary/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <div className="font-bold text-sm">Crypto Wallet</div>
                  <div className="text-xs text-muted-foreground">0x7a...c4d2</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Transaction history */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-muted-foreground">Recent Activity</h3>
          <div className="space-y-2">
            {transactions.map((tx) => (
              <Card key={tx.id} className="p-4 bg-card/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === "earn" ? "bg-primary/20" : "bg-accent/20"
                    }`}>
                      {tx.type === "earn" ? (
                        <ArrowDownLeft className={`w-5 h-5 text-primary`} />
                      ) : (
                        <ArrowUpRight className={`w-5 h-5 text-accent`} />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{tx.description}</div>
                      <div className="text-xs text-muted-foreground">{tx.time}</div>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${tx.type === "earn" ? "text-primary" : "text-accent"}`}>
                    {tx.type === "earn" ? "+" : ""}${tx.amount}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Earnings projection */}
        <Card className="p-4 bg-gradient-to-br from-accent/20 to-primary/20 border-accent/30">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-accent flex-shrink-0" />
            <div className="space-y-1">
              <div className="font-bold text-sm">Projected Monthly Earnings</div>
              <div className="text-2xl font-bold text-accent">$670</div>
              <div className="text-xs text-muted-foreground">
                Based on 10k steps/day + 5 NFT sales/week average
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WalletDashboard;
