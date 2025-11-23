import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trophy, TrendingUp, Medal, Crown } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface LeaderboardEntry {
    rank: number;
    address: string;
    username: string;
    score: number;
    wins: number;
    nfts: number;
}

const LeaderboardView = () => {
    const [period, setPeriod] = useState<'weekly' | 'monthly' | 'all-time'>('weekly');
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);

    useEffect(() => {
        // TODO: Fetch from API /social/leaderboard/:period
        const mockData: LeaderboardEntry[] = [
            { rank: 1, address: '0x1234...5678', username: 'CryptoKing', score: 15420, wins: 89, nfts: 156 },
            { rank: 2, address: '0x2345...6789', username: 'AuraHunter', score: 12850, wins: 74, nfts: 142 },
            { rank: 3, address: '0x3456...7890', username: 'PvPMaster', score: 11200, wins: 68, nfts: 128 },
            { rank: 4, address: '0x4567...8901', username: 'NFTCollector', score: 9800, wins: 55, nfts: 119 },
            { rank: 5, address: '0x5678...9012', username: 'QuestSeeker', score: 8500, wins: 48, nfts: 105 },
        ];
        setEntries(mockData);
        setCurrentUserRank(15); // Mock rank
    }, [period]);

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Crown className="w-6 h-6 text-yellow-400" />;
            case 2: return <Medal className="w-6 h-6 text-gray-400" />;
            case 3: return <Medal className="w-6 h-6 text-orange-600" />;
            default: return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
        }
    };

    const getPrize = (rank: number) => {
        switch (rank) {
            case 1: return '1000 $AURA';
            case 2: return '500 $AURA';
            case 3: return '250 $AURA';
            case 4:
            case 5: return '100 $AURA';
            default: return null;
        }
    };

    return (
        <div className="min-h-screen p-6 pb-24">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold glow-text flex items-center justify-center gap-3">
                        <Trophy className="w-10 h-10 text-yellow-400" />
                        Global Leaderboard
                    </h1>
                    <p className="text-muted-foreground">Compete for $AURA rewards and glory</p>
                </div>

                {/* Period Tabs */}
                <div className="flex justify-center gap-2">
                    <Button
                        variant={period === 'weekly' ? 'default' : 'outline'}
                        onClick={() => setPeriod('weekly')}
                    >
                        Weekly
                    </Button>
                    <Button
                        variant={period === 'monthly' ? 'default' : 'outline'}
                        onClick={() => setPeriod('monthly')}
                    >
                        Monthly
                    </Button>
                    <Button
                        variant={period === 'all-time' ? 'default' : 'outline'}
                        onClick={() => setPeriod('all-time')}
                    >
                        All-Time
                    </Button>
                </div>

                {/* Prize Pool */}
                <Card className="p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
                    <div className="text-center space-y-2">
                        <div className="text-sm text-muted-foreground">Total Prize Pool</div>
                        <div className="text-3xl font-bold text-yellow-400">2,000 $AURA</div>
                        <div className="text-xs text-muted-foreground">Distributed to top 10 players</div>
                    </div>
                </Card>

                {/* Leaderboard */}
                <div className="space-y-3">
                    {entries.map((entry, index) => (
                        <motion.div
                            key={entry.rank}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className={`p-4 ${entry.rank <= 3 ? 'bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/50' : 'bg-card/50'}`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 flex justify-center">
                                        {getRankIcon(entry.rank)}
                                    </div>
                                    <Avatar className="w-12 h-12 bg-gradient-to-br from-primary to-secondary">
                                        <AvatarFallback className="bg-transparent text-white font-bold">
                                            {entry.username.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="font-bold text-lg">{entry.username}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <div className="text-xs text-muted-foreground">Score</div>
                                            <div className="font-bold text-primary">{entry.score.toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground">Wins</div>
                                            <div className="font-bold">{entry.wins}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground">NFTs</div>
                                            <div className="font-bold">{entry.nfts}</div>
                                        </div>
                                    </div>
                                    {getPrize(entry.rank) && (
                                        <div className="text-right min-w-[100px]">
                                            <div className="text-xs text-muted-foreground">Prize</div>
                                            <div className="font-bold text-yellow-400">{getPrize(entry.rank)}</div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Current User Rank */}
                {currentUserRank && currentUserRank > 10 && (
                    <Card className="p-4 bg-accent/10 border-accent/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="w-6 h-6 text-accent" />
                                <div>
                                    <div className="font-bold">Your Current Rank</div>
                                    <div className="text-sm text-muted-foreground">Keep climbing!</div>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-accent">#{currentUserRank}</div>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default LeaderboardView;
