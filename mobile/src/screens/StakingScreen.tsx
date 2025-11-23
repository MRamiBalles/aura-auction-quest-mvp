import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    ScrollView,
} from 'react-native';

export default function StakingScreen() {
    const [stakedAmount, setStakedAmount] = useState('500');
    const [availableBalance, setAvailableBalance] = useState('1000');
    const [pendingRewards, setPendingRewards] = useState('12.5');
    const [stakeInput, setStakeInput] = useState('');
    const [unstakeInput, setUnstakeInput] = useState('');
    const [currentAPY, setCurrentAPY] = useState(17);
    const [stakingDuration, setStakingDuration] = useState(45);

    useEffect(() => {
        const interval = setInterval(() => {
            setPendingRewards((prev) => (parseFloat(prev) + 0.01).toFixed(2));
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const calculateProjectedRewards = (amount: string, days: number) => {
        const principal = parseFloat(amount) || 0;
        const apy = currentAPY / 100;
        const dailyRate = apy / 365;
        return (principal * dailyRate * days).toFixed(2);
    };

    const handleStake = () => {
        // TODO: Call Staking.stake(amount)
        console.log('Staking:', stakeInput);
    };

    const handleUnstake = () => {
        // TODO: Call Staking.unstake(amount)
        console.log('Unstaking:', unstakeInput);
    };

    const handleClaimRewards = () => {
        // TODO: Call Staking.claimRewards()
        console.log('Claiming rewards:', pendingRewards);
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>💰 AURA Staking</Text>
                <Text style={styles.headerSubtitle}>Earn passive rewards</Text>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Total Staked</Text>
                    <Text style={styles.statValue}>{stakedAmount}</Text>
                    <Text style={styles.statUnit}>AURA</Text>
                </View>

                <View style={[styles.statCard, { borderColor: '#fbbf24' }]}>
                    <Text style={styles.statLabel}>Current APY</Text>
                    <Text style={[styles.statValue, { color: '#fbbf24' }]}>{currentAPY}%</Text>
                    <Text style={styles.statUnit}>
                        {stakingDuration >= 30 ? '12% + 5% Bonus' : '12% Base'}
                    </Text>
                </View>

                <View style={[styles.statCard, { borderColor: '#10b981' }]}>
                    <Text style={styles.statLabel}>Pending Rewards</Text>
                    <Text style={[styles.statValue, { color: '#10b981' }]}>{pendingRewards}</Text>
                    <Text style={styles.statUnit}>AURA</Text>
                </View>
            </View>

            {/* Duration Info */}
            {stakingDuration > 0 && (
                <View style={styles.durationCard}>
                    <Text style={styles.durationIcon}>📈</Text>
                    <View style={styles.durationInfo}>
                        <Text style={styles.durationTitle}>Staking Duration: {stakingDuration} days</Text>
                        <Text style={styles.durationSubtitle}>
                            {stakingDuration >= 30
                                ? '🎉 Bonus APY Active!'
                                : `${30 - stakingDuration} days until bonus`}
                        </Text>
                    </View>
                </View>
            )}

            {/* Stake Section */}
            <View style={styles.actionCard}>
                <Text style={styles.actionTitle}>💼 Stake AURA</Text>

                <View style={styles.balanceRow}>
                    <Text style={styles.balanceLabel}>Available Balance</Text>
                    <Text style={styles.balanceValue}>{availableBalance} AURA</Text>
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="Amount to stake"
                    placeholderTextColor="#6b7280"
                    value={stakeInput}
                    onChangeText={setStakeInput}
                    keyboardType="numeric"
                />

                <View style={styles.quickButtons}>
                    <TouchableOpacity
                        style={styles.quickButton}
                        onPress={() => setStakeInput((parseFloat(availableBalance) * 0.25).toString())}
                    >
                        <Text style={styles.quickButtonText}>25%</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.quickButton}
                        onPress={() => setStakeInput((parseFloat(availableBalance) * 0.5).toString())}
                    >
                        <Text style={styles.quickButtonText}>50%</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.quickButton}
                        onPress={() => setStakeInput((parseFloat(availableBalance) * 0.75).toString())}
                    >
                        <Text style={styles.quickButtonText}>75%</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.quickButton}
                        onPress={() => setStakeInput(availableBalance)}
                    >
                        <Text style={styles.quickButtonText}>MAX</Text>
                    </TouchableOpacity>
                </View>

                {stakeInput && (
                    <View style={styles.projectionCard}>
                        <Text style={styles.projectionLabel}>Projected earnings (30d):</Text>
                        <Text style={styles.projectionValue}>{calculateProjectedRewards(stakeInput, 30)} AURA</Text>
                        <Text style={styles.projectionLabel}>Projected earnings (365d):</Text>
                        <Text style={styles.projectionValue}>{calculateProjectedRewards(stakeInput, 365)} AURA</Text>
                    </View>
                )}

                <TouchableOpacity style={styles.primaryButton} onPress={handleStake}>
                    <Text style={styles.primaryButtonText}>Stake Tokens</Text>
                </TouchableOpacity>
            </View>

            {/* Unstake Section */}
            <View style={styles.actionCard}>
                <Text style={styles.actionTitle}>🎁 Manage Stake</Text>

                <View style={styles.balanceRow}>
                    <Text style={styles.balanceLabel}>Staked Amount</Text>
                    <Text style={styles.balanceValue}>{stakedAmount} AURA</Text>
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="Amount to unstake"
                    placeholderTextColor="#6b7280"
                    value={unstakeInput}
                    onChangeText={setUnstakeInput}
                    keyboardType="numeric"
                />

                <View style={styles.quickButtons}>
                    <TouchableOpacity
                        style={styles.quickButton}
                        onPress={() => setUnstakeInput((parseFloat(stakedAmount) * 0.25).toString())}
                    >
                        <Text style={styles.quickButtonText}>25%</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.quickButton}
                        onPress={() => setUnstakeInput((parseFloat(stakedAmount) * 0.5).toString())}
                    >
                        <Text style={styles.quickButtonText}>50%</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.quickButton}
                        onPress={() => setUnstakeInput(stakedAmount)}
                    >
                        <Text style={styles.quickButtonText}>MAX</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.secondaryButton} onPress={handleUnstake}>
                    <Text style={styles.secondaryButtonText}>Unstake Tokens</Text>
                </TouchableOpacity>

                {/* Claim Rewards */}
                <View style={styles.divider} />

                <TouchableOpacity style={styles.claimButton} onPress={handleClaimRewards}>
                    <Text style={styles.claimButtonText}>🎁 Claim {pendingRewards} AURA Rewards</Text>
                </TouchableOpacity>
            </View>

            {/* Info */}
            <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>ℹ️ How Staking Works</Text>
                <Text style={styles.infoText}>• Base APY: 12% annual percentage yield</Text>
                <Text style={styles.infoText}>• Long-term Bonus: +5% APY after 30+ days (17% total)</Text>
                <Text style={styles.infoText}>• No Lock-up: Unstake anytime with auto-claimed rewards</Text>
                <Text style={styles.infoText}>• Compound: Re-stake rewards to maximize earnings</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    header: {
        padding: 24,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#9ca3af',
    },
    statsContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 8,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        padding: 12,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#8b5cf6',
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 10,
        color: '#9ca3af',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#8b5cf6',
        marginBottom: 2,
    },
    statUnit: {
        fontSize: 10,
        color: '#6b7280',
    },
    durationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 16,
        marginTop: 0,
        padding: 16,
        backgroundColor: '#1a1a1a',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#8b5cf6',
    },
    durationIcon: {
        fontSize: 32,
        marginRight: 12,
    },
    durationInfo: {
        flex: 1,
    },
    durationTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    durationSubtitle: {
        fontSize: 12,
        color: '#9ca3af',
    },
    actionCard: {
        margin: 16,
        marginTop: 0,
        padding: 16,
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    actionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 16,
    },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    balanceLabel: {
        fontSize: 12,
        color: '#9ca3af',
    },
    balanceValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    input: {
        backgroundColor: '#0a0a0a',
        borderWidth: 1,
        borderColor: '#2a2a2a',
        borderRadius: 8,
        padding: 12,
        color: '#ffffff',
        fontSize: 16,
        marginBottom: 12,
    },
    quickButtons: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    quickButton: {
        flex: 1,
        backgroundColor: '#2a2a2a',
        paddingVertical: 8,
        borderRadius: 6,
        alignItems: 'center',
    },
    quickButtonText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
    },
    projectionCard: {
        backgroundColor: '#8b5cf620',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    projectionLabel: {
        fontSize: 11,
        color: '#9ca3af',
        marginBottom: 4,
    },
    projectionValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#8b5cf6',
        marginBottom: 8,
    },
    primaryButton: {
        backgroundColor: '#8b5cf6',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        backgroundColor: '#2a2a2a',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#8b5cf6',
    },
    secondaryButtonText: {
        color: '#8b5cf6',
        fontSize: 16,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#2a2a2a',
        marginVertical: 16,
    },
    claimButton: {
        backgroundColor: '#10b981',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    claimButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    infoCard: {
        margin: 16,
        marginTop: 0,
        padding: 16,
        backgroundColor: '#1a1a1a',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 12,
    },
    infoText: {
        fontSize: 12,
        color: '#9ca3af',
        marginBottom: 8,
        lineHeight: 18,
    },
});
