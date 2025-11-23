import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Modal,
    TextInput,
} from 'react-native';

interface Auction {
    id: number;
    tokenId: number;
    name: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    currentBid: string;
    currentBidder: string;
    endTime: number;
    seller: string;
    bidCount: number;
}

export default function AuctionScreen() {
    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
    const [bidAmount, setBidAmount] = useState('');

    useEffect(() => {
        const mockAuctions: Auction[] = [
            {
                id: 1,
                tokenId: 201,
                name: 'Cosmic Crystal',
                rarity: 'legendary',
                currentBid: '500',
                currentBidder: '0x1234...5678',
                endTime: Date.now() + 3600000,
                seller: '0xabcd...efgh',
                bidCount: 12,
            },
            {
                id: 2,
                tokenId: 202,
                name: 'Aura Shard',
                rarity: 'epic',
                currentBid: '150',
                currentBidder: '0x2345...6789',
                endTime: Date.now() + 7200000,
                seller: '0xbcde...fghi',
                bidCount: 7,
            },
        ];
        setAuctions(mockAuctions);

        const interval = setInterval(() => {
            setAuctions((prev) => [...prev]);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const getTimeRemaining = (endTime: number) => {
        const diff = endTime - Date.now();
        if (diff <= 0) return 'Ended';

        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        return `${hours}h ${minutes}m ${seconds}s`;
    };

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'legendary': return '#fbbf24';
            case 'epic': return '#a855f7';
            case 'rare': return '#3b82f6';
            default: return '#6b7280';
        }
    };

    const handlePlaceBid = async () => {
        if (!bidAmount || !selectedAuction) return;
        // TODO: Call AuctionHouse.placeBid(auctionId) with bidAmount
        console.log('Bid placed:', bidAmount);
        setSelectedAuction(null);
        setBidAmount('');
    };

    const renderItem = ({ item }: { item: Auction }) => (
        <TouchableOpacity
            style={[styles.auctionCard, { borderColor: getRarityColor(item.rarity) }]}
            onPress={() => setSelectedAuction(item)}
        >
            <View style={[styles.auctionHeader, { backgroundColor: getRarityColor(item.rarity) }]}>
                <Text style={styles.auctionIcon}>🔨</Text>
                <View style={styles.auctionBadge}>
                    <Text style={styles.auctionBadgeText}>{item.bidCount} bids</Text>
                </View>
            </View>

            <View style={styles.auctionBody}>
                <Text style={styles.auctionName}>{item.name}</Text>
                <Text style={[styles.auctionRarity, { color: getRarityColor(item.rarity) }]}>
                    {item.rarit y.toUpperCase()}
                </Text>

                <View style={styles.bidSection}>
                    <Text style={styles.bidLabel}>Current Bid</Text>
                    <Text style={styles.bidAmount}>{item.currentBid} MATIC</Text>
                    <Text style={styles.bidder}>by {item.currentBidder}</Text>
                </View>

                <View style={styles.timerSection}>
                    <Text style={styles.timerIcon}>⏰</Text>
                    <Text style={styles.timerText}>{getTimeRemaining(item.endTime)}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Live Auctions</Text>
                <View style={styles.headerBadge}>
                    <Text style={styles.headerBadgeText}>⚠️ Anti-Sniping</Text>
                </View>
            </View>

            <FlatList
                data={auctions}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
            />

            {/* Bid Modal */}
            <Modal
                visible={!!selectedAuction}
                transparent
                animationType="slide"
                onRequestClose={() => setSelectedAuction(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Place Bid</Text>

                        {selectedAuction && (
                            <>
                                <Text style={styles.modalItem}>{selectedAuction.name}</Text>
                                <Text style={styles.modalCurrentBid}>
                                    Current: {selectedAuction.currentBid} MATIC
                                </Text>

                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="Enter bid amount"
                                    placeholderTextColor="#6b7280"
                                    value={bidAmount}
                                    onChangeText={setBidAmount}
                                    keyboardType="numeric"
                                />

                                <View style={styles.modalButtons}>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.modalButtonCancel]}
                                        onPress={() => setSelectedAuction(null)}
                                    >
                                        <Text style={styles.modalButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.modalButtonConfirm]}
                                        onPress={handlePlaceBid}
                                    >
                                        <Text style={styles.modalButtonText}>Confirm Bid</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

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
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    headerBadge: {
        backgroundColor: '#fbbf24',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    headerBadgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#0a0a0a',
    },
    listContent: {
        padding: 16,
    },
    auctionCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 2,
        overflow: 'hidden',
    },
    auctionHeader: {
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    auctionIcon: {
        fontSize: 48,
    },
    auctionBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    auctionBadgeText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    auctionBody: {
        padding: 16,
    },
    auctionName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    auctionRarity: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 16,
    },
    bidSection: {
        marginBottom: 12,
    },
    bidLabel: {
        fontSize: 12,
        color: '#9ca3af',
        marginBottom: 4,
    },
    bidAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fbbf24',
        marginBottom: 4,
    },
    bidder: {
        fontSize: 11,
        color: '#6b7280',
    },
    timerSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0a0a0a',
        padding: 12,
        borderRadius: 8,
    },
    timerIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    timerText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ffffff',
        fontFamily: 'monospace',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 16,
    },
    modalItem: {
        fontSize: 16,
        color: '#ffffff',
        marginBottom: 8,
    },
    modalCurrentBid: {
        fontSize: 14,
        color: '#fbbf24',
        marginBottom: 16,
    },
    modalInput: {
        backgroundColor: '#0a0a0a',
        borderWidth: 1,
        borderColor: '#2a2a2a',
        borderRadius: 8,
        padding: 12,
        color: '#ffffff',
        fontSize: 16,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalButtonCancel: {
        backgroundColor: '#2a2a2a',
    },
    modalButtonConfirm: {
        backgroundColor: '#8b5cf6',
    },
    modalButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
