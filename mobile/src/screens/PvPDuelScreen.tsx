import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
} from 'react-native';
import { useWeb3 } from '../contexts/Web3Context';

type Phase = 'matchmaking' | 'duel' | 'resolving' | 'result';
type Winner = 'player' | 'opponent' | null;

export default function PvPDuelScreen({ route, navigation }: any) {
    const [phase, setPhase] = useState<Phase>('matchmaking');
    const [myProgress, setMyProgress] = useState(0);
    const [opponentProgress, setOpponentProgress] = useState(0);
    const [winner, setWinner] = useState<Winner>(null);
    const [reward, setReward] = useState<any>(null);
    const { account, signer } = useWeb3();

    useEffect(() => {
        if (phase === 'matchmaking') {
            setTimeout(() => setPhase('duel'), 2000);
        }
    }, [phase]);

    useEffect(() => {
        if (phase === 'duel') {
            const interval = setInterval(() => {
                setMyProgress((prev) => {
                    const next = Math.min(prev + Math.random() * 3, 100);
                    if (next >= 100) {
                        clearInterval(interval);
                        handleDuelEnd('player');
                        return 100;
                    }
                    return next;
                });

                setOpponentProgress((prev) => {
                    const next = Math.min(prev + Math.random() * 2.5, 100);
                    if (next >= 100) {
                        clearInterval(interval);
                        handleDuelEnd('opponent');
                        return 100;
                    }
                    return next;
                });
            }, 100);

            return () => clearInterval(interval);
        }
    }, [phase]);

    const handleDuelEnd = async (determinedWinner: 'player' | 'opponent') => {
        setPhase('resolving');

        if (determinedWinner === 'opponent') {
            setWinner('opponent');
            setPhase('result');
            return;
        }

        try {
            if (!signer) throw new Error('No wallet found');

            const message = `Resolve PvP Duel at ${Date.now()}`;
            const signature = await signer.signMessage(message);

            // TODO: Call backend POST /game/pvp/resolve
            // const result = await api.game.resolvePvP({ address: account, signature, message });

            // Mock result
            const mockResult = {
                success: true,
                winner: 'player' as Winner,
                reward: { value: 500, xp: 50 },
            };

            setWinner(mockResult.winner);
            setReward(mockResult.reward);
        } catch (error) {
            console.error('PvP Error:', error);
            setWinner('opponent');
        } finally {
            setPhase('result');
        }
    };

    const ProgressBar = ({ progress, color }: { progress: number; color: string }) => (
        <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: color }]} />
        </View>
    );

    return (
        <View style={styles.container}>
            {phase === 'matchmaking' && (
                <View style={styles.centerContent}>
                    <Text style={styles.phaseTitle}>🔍 Finding opponent...</Text>
                    <Text style={styles.phaseSubtitle}>Searching for worthy challenger</Text>
                </View>
            )}

            {phase === 'duel' && (
                <View style={styles.duelContainer}>
                    <Text style={styles.duelTitle}>⚔️ DUEL IN PROGRESS</Text>

                    {/* Player */}
                    <View style={styles.playerSection}>
                        <Text style={styles.playerName}>You</Text>
                        <ProgressBar progress={myProgress} color="#8b5cf6" />
                        <Text style={styles.progressText}>{Math.floor(myProgress)}%</Text>
                    </View>

                    {/* VS */}
                    <Text style={styles.vsText}>VS</Text>

                    {/* Opponent */}
                    <View style={styles.playerSection}>
                        <Text style={styles.playerName}>Opponent</Text>
                        <ProgressBar progress={opponentProgress} color="#ef4444" />
                        <Text style={styles.progressText}>{Math.floor(opponentProgress)}%</Text>
                    </View>
                </View>
            )}

            {phase === 'resolving' && (
                <View style={styles.centerContent}>
                    <Text style={styles.phaseTitle}>🔐 Verifying result...</Text>
                    <Text style={styles.phaseSubtitle}>Blockchain validation in progress</Text>
                </View>
            )}

            {phase === 'result' && (
                <View style={styles.resultContainer}>
                    {winner === 'player' ? (
                        <>
                            <Text style={styles.victoryText}>🏆 VICTORY!</Text>
                            <Text style={styles.resultSubtitle}>You defeated your opponent</Text>
                            {reward && (
                                <View style={styles.rewardCard}>
                                    <Text style={styles.rewardTitle}>Rewards</Text>
                                    <Text style={styles.rewardItem}>+{reward.value} AURA</Text>
                                    <Text style={styles.rewardItem}>+{reward.xp} XP</Text>
                                </View>
                            )}
                        </>
                    ) : (
                        <>
                            <Text style={styles.defeatText}>💔 DEFEAT</Text>
                            <Text style={styles.resultSubtitle}>Better luck next time</Text>
                            <View style={styles.rewardCard}>
                                <Text style={styles.rewardTitle}>Consolation</Text>
                                <Text style={styles.rewardItem}>+10 XP</Text>
                            </View>
                        </>
                    )}

                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>Return to Home</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    phaseTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 12,
        textAlign: 'center',
    },
    phaseSubtitle: {
        fontSize: 16,
        color: '#9ca3af',
        textAlign: 'center',
    },
    duelContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    duelTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 40,
    },
    playerSection: {
        marginVertical: 20,
    },
    playerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 12,
    },
    progressBarContainer: {
        height: 40,
        backgroundColor: '#1a1a1a',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#2a2a2a',
    },
    progressBar: {
        height: '100%',
        borderRadius: 20,
    },
    progressText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'right',
        marginTop: 8,
    },
    vsText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#8b5cf6',
        textAlign: 'center',
        marginVertical: 20,
    },
    resultContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    victoryText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#10b981',
        marginBottom: 12,
    },
    defeatText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#ef4444',
        marginBottom: 12,
    },
    resultSubtitle: {
        fontSize: 18,
        color: '#9ca3af',
        marginBottom: 32,
    },
    rewardCard: {
        backgroundColor: '#1a1a1a',
        padding: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#8b5cf6',
        marginBottom: 32,
        minWidth: 200,
    },
    rewardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 16,
        textAlign: 'center',
    },
    rewardItem: {
        fontSize: 18,
        color: '#8b5cf6',
        marginBottom: 8,
        textAlign: 'center',
    },
    backButton: {
        backgroundColor: '#8b5cf6',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
