import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, ArrowUpRight, ArrowDownLeft, Coins } from "lucide-react";
import { useWeb3 } from "@/contexts/Web3Context";
import { useSound } from "@/contexts/SoundContext";
import { toast } from "sonner";
import { ethers } from "ethers";

const WalletDashboard = () => {
  const { account, connectWallet, isConnecting, balance, chainId } = useWeb3();
  const { playSound } = useSound();
  const [isMinting, setIsMinting] = useState(false);

  const handleMint = async () => {
    if (!account) {
      toast.error("Connect wallet first!");
      playSound('error');
      return;
    }

    setIsMinting(true);
    try {
      // Simulate minting delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Real transaction logic (mocked for now)
      // const tx = await contract.mint(account);
      // await tx.wait();

      toast.success("Successfully minted 100 AURA!");
      playSound('mint');
    } catch (error) {
      console.error("Minting failed:", error);
      toast.error("Minting failed. See console.");
      playSound('error');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto pt-20">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-aura-cyan to-aura-purple">
          My Wallet
        </h1>
        <Button
          variant={account ? "outline" : "default"}
          className={account ? "border-aura-cyan text-aura-cyan" : "bg-aura-cyan text-black hover:bg-aura-cyan/80"}
          onClick={connectWallet}
          disabled={isConnecting}
        >
          <Wallet className="w-4 h-4 mr-2" />
          {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : (isConnecting ? "Connecting..." : "Connect Wallet")}
        </Button>
      </header>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-black/40 border-aura-purple/30 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Balance (MATIC)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{balance ? parseFloat(balance).toFixed(4) : '0.0000'}</div>
            <p className="text-xs text-aura-purple mt-1">
              {chainId === '0x13882' ? 'Polygon Amoy Testnet' : 'Network: ' + (chainId || 'Not Connected')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-aura-cyan/30 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Aura Tokens (Mock)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">1,250.00</div>
            <p className="text-xs text-aura-cyan mt-1">≈ $125.00 USD</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button className="bg-aura-purple hover:bg-aura-purple/80 text-white" onClick={handleMint} disabled={isMinting}>
          <ArrowDownLeft className="w-4 h-4 mr-2" />
          {isMinting ? "Minting..." : "Mint NFT"}
        </Button>
        <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white">
          <ArrowUpRight className="w-4 h-4 mr-2" />
          Withdraw
        </Button>
      </div>

      {/* Transaction History */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-aura-cyan/20 text-aura-cyan">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Auction Reward</p>
                  <p className="text-xs text-gray-400">2 hours ago</p>
                </div>
              </div>
              <span className="text-aura-cyan font-medium">+500 AURA</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WalletDashboard;
