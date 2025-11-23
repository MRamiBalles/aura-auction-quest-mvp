import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ethers } from 'ethers';

interface EarningsData {
    totalFeesCollected: string;
    todayFees: string;
    weeklyFees: string;
    monthlyFees: string;
    totalVolume: string;
    transactionCount: number;
    topSeller: {
        address: string;
        volume: string;
    };
    recentTransactions: Array<{
        type: 'marketplace' | 'auction';
        amount: string;
        fee: string;
        timestamp: number;
        from: string;
    }>;
}

export default function AdminDashboard() {
    const [earnings, setEarnings] = useState<EarningsData | null>(null);
    const [ownerAddress, setOwnerAddress] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEarnings();
        const interval = setInterval(fetchEarnings, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchEarnings = async () => {
        try {
            setLoading(true);

            // TODO: Replace with actual blockchain queries
            const mockData: EarningsData = {
                totalFeesCollected: '125.5',
                todayFees: '12.3',
                weeklyFees: '48.7',
                monthlyFees: '125.5',
                totalVolume: '5020',
                transactionCount: 234,
                topSeller: {
                    address: '0x1234...5678',
                    volume: '850',
                },
                recentTransactions: [
                    { type: 'marketplace', amount: '100', fee: '2.5', timestamp: Date.now() - 3600000, from: '0x1234...5678' },
                    { type: 'auction', amount: '500', fee: '12.5', timestamp: Date.now() - 7200000, from: '0x2345...6789' },
                    { type: 'marketplace', amount: '50', fee: '1.25', timestamp: Date.now() - 10800000, from: '0x3456...7890' },
                ],
            };

            setEarnings(mockData);
            setOwnerAddress('0xYOUR...WALLET'); // TODO: Get from contract
            setLoading(false);
        } catch (error) {
            console.error('Error fetching earnings:', error);
            setLoading(false);
        }
    };

    const formatMATIC = (amount: string) => {
        return `${parseFloat(amount).toLocaleString()} MATIC`;
    };

    const formatUSD = (matic: string) => {
        const usd = parseFloat(matic) * 0.8; // Approximate rate
        return `≈ $${usd.toFixed(2)} USD`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4">⏳</div>
                    <p className="text-muted-foreground">Loading earnings data...</p>
                </div>
            </div>
        );
    }

    if (!earnings) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4">❌</div>
                    <p className="text-muted-foreground">Failed to load earnings data</p>
                    <Button onClick={fetchEarnings} className="mt-4">Retry</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold glow-text mb-2">💰 Earnings Dashboard</h1>
                        <p className="text-muted-foreground">
                            Owner Wallet: <span className="font-mono text-primary">{ownerAddress}</span>
                        </p>
                    </div>
                    <Button onClick={fetchEarnings} variant="outline">
                        🔄 Refresh
                    </Button>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
                        <div className="text-sm text-muted-foreground mb-2">Total Fees Collected</div>
                        <div className="text-3xl font-bold text-primary mb-1">{formatMATIC(earnings.totalFeesCollected)}</div>
                        <div className="text-xs text-muted-foreground">{formatUSD(earnings.totalFeesCollected)}</div>
                    </Card>

                    <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
                        <div className="text-sm text-muted-foreground mb-2">Today's Fees</div>
                        <div className="text-3xl font-bold text-green-400 mb-1">{formatMATIC(earnings.todayFees)}</div>
                        <div className="text-xs text-muted-foreground">{formatUSD(earnings.todayFees)}</div>
                    </Card>

                    <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
                        <div className="text-sm text-muted-foreground mb-2">This Week</div>
                        <div className="text-3xl font-bold text-blue-400 mb-1">{formatMATIC(earnings.weeklyFees)}</div>
                        <div className="text-xs text-muted-foreground">{formatUSD(earnings.weeklyFees)}</div>
                    </Card>

                    <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
                        <div className="text-sm text-muted-foreground mb-2">This Month</div>
                        <div className="text-3xl font-bold text-yellow-400 mb-1">{formatMATIC(earnings.monthlyFees)}</div>
                        <div className="text-xs text-muted-foreground">{formatUSD(earnings.monthlyFees)}</div>
                    </Card>
                </div>

                {/* Platform Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="text-5xl">📊</div>
                            <div>
                                <div className="text-sm text-muted-foreground">Total Volume</div>
                                <div className="text-2xl font-bold">{formatMATIC(earnings.totalVolume)}</div>
                                <div className="text-xs text-muted-foreground">{formatUSD(earnings.totalVolume)}</div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="text-5xl">💳</div>
                            <div>
                                <div className="text-sm text-muted-foreground">Transactions</div>
                                <div className="text-2xl font-bold">{earnings.transactionCount.toLocaleString()}</div>
                                <div className="text-xs text-muted-foreground">All-time</div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="text-5xl">👑</div>
                            <div>
                                <div className="text-sm text-muted-foreground">Top Seller</div>
                                <div className="text-sm font-mono font-bold">{earnings.topSeller.address}</div>
                                <div className="text-xs text-muted-foreground">{formatMATIC(earnings.topSeller.volume)} volume</div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Recent Transactions */}
                <Card className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Recent Fee Transactions</h2>
                    <div className="space-y-3">
                        {earnings.recentTransactions.map((tx, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="text-2xl">
                                        {tx.type === 'marketplace' ? '🛒' : '🔨'}
                                    </div>
                                    <div>
                                        <div className="font-bold">
                                            {tx.type === 'marketplace' ? 'Marketplace Sale' : 'Auction Won'}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            From {tx.from}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(tx.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-green-400">
                                        +{tx.fee} MATIC
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Fee from {tx.amount} MATIC sale
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Fee Settings */}
                <Card className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Platform Fee Settings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="text-sm text-muted-foreground mb-2">Marketplace Fee</div>
                            <div className="text-4xl font-bold text-primary">2.5%</div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Applied on all marketplace sales
                            </p>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground mb-2">Auction Fee</div>
                            <div className="text-4xl font-bold text-primary">2.5%</div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Applied on finalized auction proceeds
                            </p>
                        </div>
                    </div>
                    <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">⚠️</div>
                            <div>
                                <div className="font-bold text-yellow-400">Fee Change Requires Contract Update</div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    To change platform fees, you must call <code className="bg-black/30 px-2 py-1 rounded">updatePlatformFee()</code> on the smart contract.
                                    Maximum allowed: 5%
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Withdrawal Info */}
                <Card className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5">
                    <h2 className="text-2xl font-bold mb-4">💸 How to Withdraw Your Earnings</h2>
                    <div className="space-y-4 text-sm">
                        <div className="flex items-start gap-3">
                            <div className="text-xl">1️⃣</div>
                            <div>
                                <div className="font-bold">Check Your Wallet Balance</div>
                                <p className="text-muted-foreground">
                                    Fees are sent automatically to {ownerAddress}. Check your MetaMask on Polygon network.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="text-xl">2️⃣</div>
                            <div>
                                <div className="font-bold">Send to Exchange</div>
                                <p className="text-muted-foreground">
                                    Transfer MATIC to Binance, Coinbase, or Kraken using Polygon network.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="text-xl">3️⃣</div>
                            <div>
                                <div className="font-bold">Convert to Fiat</div>
                                <p className="text-muted-foreground">
                                    Sell MATIC for USD/EUR and withdraw to your bank account.
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
