import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
} from 'react-native';

interface NFTItem {
    id: number;
    type: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    value: number;
    timestamp: number;
}

export default function InventoryScreen() {
    const [inventory] = useState<NFTItem[]>([
        { id: 1, type: 'Crystal', rarity: 'legendary', value: 500, timestamp: Date.now() },
        { id: 2, type: 'Shard', rarity: 'epic', value: 150, timestamp: Date.now() },
        { id: 3, type: 'Core', rarity: 'rare', value: 50, timestamp: Date.now() },
        { id: 4, type: 'Fragment', rarity: 'common', value: 10, timestamp: Date.now() },
    ]);

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'legendary': return '#fbbf24';
            case 'epic': return '#a855f7';
            case 'rare': return '#3b82f6';
            default: return '#6b7280';
        }
    };

    const renderItem = ({ item }: { item: NFTItem }) => (
        <TouchableOpacity style={styles.itemCard}>
            <View style={[styles.itemIcon, { backgroundColor: getRarityColor(item.rarity) }]}>
                <Text style={styles.itemEmoji}>💎</Text>
            </View>
            <View style={styles.itemInfo}>
                <Text style={styles.itemType}>{item.type}</Text>
                <Text style={[styles.itemRarity, { color: getRarityColor(item.rarity) }]}>
                    {item.rarity.toUpperCase()}
                </Text>
                <Text style={styles.itemValue}>{item.value} AURA</Text>
            </View>
            <TouchableOpacity style={styles.sellButton}>
                <Text style={styles.sellButtonText}>Sell</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Stats */}
            <View style={styles.statsBar}>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>{inventory.length}</Text>
                    <Text style={styles.statLabel}>Total Items</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>
                        {inventory.reduce((sum, item) => sum + item.value, 0)}
                    </Text>
                    <Text style={styles.statLabel}>Total Value</Text>
                </View>
            </View>

            {/* Inventory List */}
            <FlatList
                data={inventory}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>🎒</Text>
                        <Text style={styles.emptyText}>No items yet</Text>
                        <Text style={styles.emptySubtext}>Go hunt some crystals!</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    statsBar: {
        flexDirection: 'row',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
    },
    stat: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#8b5cf6',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#9ca3af',
    },
    listContent: {
        padding: 20,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    itemIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    itemEmoji: {
        fontSize: 28,
    },
    itemInfo: {
        flex: 1,
    },
    itemType: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    itemRarity: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
    },
    itemValue: {
        fontSize: 14,
        color: '#9ca3af',
    },
    sellButton: {
        backgroundColor: '#8b5cf6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    sellButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#9ca3af',
    },
});
