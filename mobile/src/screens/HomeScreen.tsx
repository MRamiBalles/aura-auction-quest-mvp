import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useWeb3 } from '../contexts/Web3Context';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const navigation = useNavigation();
    const { account, disconnect } = useWeb3();

    const menuItems = [
        { title: 'AR Hunt', subtitle: 'Find crystals nearby', icon: '🔍', screen: 'ARHunt', color: '#8b5cf6' },
        { title: 'PvP Duel', subtitle: 'Challenge players', icon: '⚔️', screen: 'PvPDuel', color: '#ef4444' },
        { title: 'Inventory', subtitle: 'View your NFTs', icon: '🎒', screen: 'Inventory', color: '#3b82f6' },
        { title: 'Marketplace', subtitle: 'Buy & sell items', icon: '🛒', screen: 'Marketplace', color: '#10b981' },
        { title: 'Auctions', subtitle: 'Live bidding wars', icon: '🔨', screen: 'Auction', color: '#f59e0b' },
        { title: 'Staking', subtitle: 'Earn passive rewards', icon: '💰', screen: 'Staking', color: '#06b6d4' },
        { title: 'Leaderboard', subtitle: 'Global rankings', icon: '🏆', screen: 'Leaderboard', color: '#fbbf24' },
        { title: 'Guilds', subtitle: 'Join a clan', icon: '🛡️', screen: 'Guilds', color: '#a855f7' },
        { title: 'Friends', subtitle: 'Add & challenge', icon: '👥', screen: 'Friends', color: '#ec4899' },
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.welcomeText}>Welcome back</Text>
                    <Text style={styles.addressText}>
                        {account?.slice(0, 6)}...{account?.slice(-4)}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.disconnectButton}
                    onPress={disconnect}
                >
                    <Text style={styles.disconnectText}>Disconnect</Text>
                </TouchableOpacity>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
                <StatCard title="Level" value="15" color="#8b5cf6" />
                <StatCard title="NFTs" value="23" color="#3b82f6" />
                <StatCard title="Wins" value="42" color="#10b981" />
            </View>

            {/* Menu Grid */}
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.menuGrid}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.menuItem, { borderColor: item.color }]}
                            onPress={() => navigation.navigate(item.screen as never)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.menuIcon}>{item.icon}</Text>
                            <Text style={styles.menuTitle}>{item.title}</Text>
                            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const StatCard = ({ title, value, color }: { title: string; value: string; color: string }) => (
    <View style={[styles.statCard, { borderColor: color }]}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
    },
    welcomeText: {
        fontSize: 14,
        color: '#9ca3af',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    disconnectButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ef4444',
    },
    disconnectText: {
        color: '#ef4444',
        fontSize: 14,
        fontWeight: '600',
    },
    statsContainer: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    statTitle: {
        fontSize: 12,
        color: '#9ca3af',
    },
    scrollView: {
        flex: 1,
    },
    menuGrid: {
        padding: 20,
        paddingTop: 0,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    menuItem: {
        width: (width - 56) / 2,
        backgroundColor: '#1a1a1a',
        padding: 20,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
    },
    menuIcon: {
        fontSize: 40,
        marginBottom: 12,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    menuSubtitle: {
        fontSize: 12,
        color: '#9ca3af',
        textAlign: 'center',
    },
});
