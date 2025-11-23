import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    TextInput,
} from 'react-native';

interface Listing {
    id: number;
    tokenId: number;
    name: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    price: string;
    seller: string;
}

export default function MarketplaceScreen() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        // TODO: Fetch from blockchain Marketplace.sol
        const mockListings: Listing[] = [
            { id: 1, tokenId: 101, name: 'Legendary Crystal', rarity: 'legendary', price: '500', seller: '0x1234...5678' },
            { id: 2, tokenId: 102, name: 'Epic Shard', rarity: 'epic', price: '150', seller: '0x2345...6789' },
            { id: 3, tokenId: 103, name: 'Rare Core', rarity: 'rare', price: '50', seller: '0x3456...7890' },
            { id: 4, tokenId: 104, name: 'Common Fragment', rarity: 'common', price: '10', seller: '0x4567...8901' },
        ];
        setListings(mockListings);
    }, []);

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'legendary': return '#fbbf24';
            case 'epic': return '#a855f7';
            case 'rare': return '#3b82f6';
            default: return '#6b7280';
        }
    };

    const handleBuy = async (listing: Listing) => {
        // TODO: Call Marketplace.buyItem(listingId) with price as msg.value
        console.log('Buying:', listing.name);
    };

    const renderItem = ({ item }: { item: Listing }) => (
        <View style={[styles.listingCard, { borderColor: getRarityColor(item.rarity) }]}>
            <View style={[styles.itemIcon, { backgroundColor: getRarityColor(item.rarity) }]}>
                <Text style={styles.itemEmoji}>💎</Text>
            </View>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={[styles.itemRarity, { color: getRarityColor(item.rarity) }]}>
                    {item.rarity.toUpperCase()}
                </Text>
                <Text style={styles.itemPrice}>{item.price} MATIC</Text>
                <Text style={styles.itemSeller}>by {item.seller}</Text>
            </View>
            <TouchableOpacity
                style={styles.buyButton}
                onPress={() => handleBuy(item)}
            >
                <Text style={styles.buyButtonText}>Buy Now</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Filter */}
            <View style={styles.filterBar}>
                {['all', 'legendary', 'epic', 'rare', 'common'].map((f) => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterButton, filter === f && styles.filterButtonActive]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Listings */}
            <FlatList
                data={listings.filter(l => filter === 'all' || l.rarity === filter)}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
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
    filterBar: {
        flexDirection: 'row',
        padding: 16,
        gap: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
    },
    filterButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    filterButtonActive: {
        backgroundColor: '#8b5cf6',
        borderColor: '#8b5cf6',
    },
    filterText: {
        color: '#9ca3af',
        fontSize: 12,
        fontWeight: '600',
    },
    filterTextActive: {
        color: '#ffffff',
    },
    listContent: {
        padding: 16,
    },
    listingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 2,
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
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    itemRarity: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 14,
        color: '#10b981',
        fontWeight: 'bold',
        marginBottom: 2,
    },
    itemSeller: {
        fontSize: 10,
        color: '#6b7280',
    },
    buyButton: {
        backgroundColor: '#8b5cf6',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 6,
    },
    buyButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
