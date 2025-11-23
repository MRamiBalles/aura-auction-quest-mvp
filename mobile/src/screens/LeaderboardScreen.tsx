import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
} from 'react-native';

type Period = 'weekly' | 'monthly' | 'all-time';

interface LeaderboardEntry {
    rank: number;
    address: string;
    username: string;
    score: number;
    wins: number;
    nfts: number;
}

export default function LeaderboardScreen() {
    const [period, setPeriod] = useState<Period>('weekly');
    const [entries] = useState<LeaderboardEntry[]>([
        { rank: 1, address: '0x1234...5678', username: 'CryptoKing', score: 15420, wins: 127, nfts: 89 },
        { rank: 2, address: '0x2345...6789', username: 'AuraHunter', score: 12890, wins: 98, nfts: 76 },
        { rank: 3, address: '0x3456...7890', username: 'NFTCollector', score: 10250, wins: 82, nfts: 65 },
        { rank: 4, address: '0x4567...8901', username: 'Player4', score: 8900, wins: 71, nfts: 54 },
        { rank: 5, address: '0x5678...9012', username: 'Player5', score: 7650, wins: 63, nfts: 48 },
    ]);

    const getPrizeAmount = (rank: number, period: Period) => {
        const prizes = {
            weekly: [1000, 500, 250],
            monthly: [5000, 2500, 1000],
            'all-time': [10000, 5000, 2500],
        };
        return prizes[period][rank - 1] || 0;
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return '👑';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return null;
        }
    };

    const renderItem = ({ item }: { item: LeaderboardEntry }) => {
        const prize = getPrizeAmount(item.rank, period);
        const icon = getRankIcon(item.rank);

        return (
            <View style={[
                styles.entryCard,
                item.rank <= 3 && styles.entryCardTop
            ]}>
                <View style={styles.entryRank}>
                    {icon ? (
                        <Text style={styles.entryRankIcon}>{icon}</Text>
                    ) : (
                        <Text style={styles.entryRankNumber}>#{item.rank}</Text>
                    )}
                </View>

                <View style={styles.entryInfo}>
                    <Text style={styles.entryUsername}>{item.username}</Text>
                    <Text style={styles.entryAddress}>{item.address}</Text>
                    <View style={styles.entryStats}>
                        <Text style={styles.entryStat}>🏆 {item.wins} wins</Text>
                        <Text style={styles.entryStat}>💎 {item.nfts} NFTs</Text>
                    </View>
                </View>

                <View style={styles.entryScore}>
                    <Text style={styles.entryScoreValue}>{item.score.toLocaleString()}</Text>
                    <Text style={styles.entryScoreLabel}>points</Text>
                    {prize > 0 && (
                        <Text style={styles.entryPrize}>🎁 {prize} AURA</Text>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Period Tabs */}
            <View style={styles.tabs}>
                {(['weekly', 'monthly', 'all-time'] as Period[]).map((p) => (
                    <TouchableOpacity
                        key={p}
                        style={[styles.tab, period === p && styles.tabActive]}
                        onPress={() => setPeriod(p)}
                    >
                        <Text style={[styles.tabText, period === p && styles.tabTextActive]}>
                            {p === 'all-time' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Prize Pool */}
            <View style={styles.prizePool}>
                <Text style={styles.prizePoolTitle}>🏆 Prize Pool</Text>
                <Text style={styles.prizePoolAmount}>
                    {period === 'weekly' && '2,000 AURA'}
                    {period === 'monthly' && '10,000 AURA'}
                    {period === 'all-time' && '20,000 AURA'}
                </Text>
                <View style={styles.prizeBreakdown}>
                    <Text style={styles.prizeItem}>1st: {getPrizeAmount(1, period)} AURA</Text>
                    <Text style={styles.prizeItem}>2nd: {getPrizeAmount(2, period)} AURA</Text>
                    <Text style={styles.prizeItem}>3rd: {getPrizeAmount(3, period)} AURA</Text>
                </View>
            </View>

            {/* Leaderboard */}
            <FlatList
                data={entries}
                renderItem={renderItem}
                keyExtractor={(item) => item.rank.toString()}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    tabs: {
        flexDirection: 'row',
        padding: 16,
        gap: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#1a1a1a',
        alignItems: 'center',
    },
    tabActive: {
        backgroundColor: '#8b5cf6',
    },
    tabText: {
        color: '#9ca3af',
        fontSize: 14,
        fontWeight: '600',
    },
    tabTextActive: {
        color: '#ffffff',
    },
    prizePool: {
        padding: 20,
        backgroundColor: '#1a1a1a',
        margin: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#fbbf24',
        alignItems: 'center',
    },
    prizePoolTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
    },
    prizePoolAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fbbf24',
        marginBottom: 12,
    },
    prizeBreakdown: {
        flexDirection: 'row',
        gap: 16,
    },
    prizeItem: {
        fontSize: 12,
        color: '#9ca3af',
    },
    listContent: {
        padding: 16,
        paddingTop: 0,
    },
    entryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    entryCardTop: {
        borderWidth: 2,
        borderColor: '#fbbf24',
    },
    entryRank: {
        width: 48,
        alignItems: 'center',
        marginRight: 12,
    },
    entryRankIcon: {
        fontSize: 32,
    },
    entryRankNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#6b7280',
    },
    entryInfo: {
        flex: 1,
    },
    entryUsername: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    entryAddress: {
        fontSize: 11,
        color: '#6b7280',
        marginBottom: 6,
        fontFamily: 'monospace',
    },
    entryStats: {
        flexDirection: 'row',
        gap: 12,
    },
    entryStat: {
        fontSize: 11,
        color: '#9ca3af',
    },
    entryScore: {
        alignItems: 'flex-end',
    },
    entryScoreValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#8b5cf6',
        marginBottom: 2,
    },
    entryScoreLabel: {
        fontSize: 10,
        color: '#9ca3af',
        marginBottom: 4,
    },
    entryPrize: {
        fontSize: 12,
        color: '#fbbf24',
        fontWeight: 'bold',
    },
});
