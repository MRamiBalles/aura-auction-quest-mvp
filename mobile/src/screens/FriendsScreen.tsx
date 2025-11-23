import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    TextInput,
} from 'react-native';

interface Friend {
    address: string;
    username: string;
    status: 'pending' | 'accepted';
    level: number;
    online: boolean;
}

export default function FriendsScreen() {
    const [friends] = useState<Friend[]>([
        { address: '0x1234...5678', username: 'CryptoKing', status: 'accepted', level: 42, online: true },
        { address: '0x2345...6789', username: 'AuraHunter', status: 'accepted', level: 35, online: false },
        { address: '0x3456...7890', username: 'NFTCollector', status: 'accepted', level: 28, online: true },
    ]);
    const [pendingRequests] = useState<Friend[]>([
        { address: '0x4567...8901', username: 'NewPlayer', status: 'pending', level: 12, online: false },
    ]);
    const [searchAddress, setSearchAddress] = useState('');

    const handleAddFriend = () => {
        // TODO: Call POST /social/friends/add
        console.log('Adding friend:', searchAddress);
        setSearchAddress('');
    };

    const handleAcceptFriend = (address: string) => {
        // TODO: Call POST /social/friends/accept/:id
        console.log('Accepting friend:', address);
    };

    const handleChallengeToDuel = (address: string, username: string) => {
        // TODO: Navigate to PvPDuel with specific opponent
        console.log('Challenging:', username);
    };

    const renderFriend = ({ item }: { item: Friend }) => (
        <View style={styles.friendCard}>
            <View style={styles.friendAvatar}>
                <Text style={styles.friendAvatarText}>
                    {item.username.slice(0, 2).toUpperCase()}
                </Text>
                {item.online && <View style={styles.onlineIndicator} />}
            </View>

            <View style={styles.friendInfo}>
                <View style={styles.friendHeader}>
                    <Text style={styles.friendUsername}>{item.username}</Text>
                    {item.online && <Text style={styles.onlineText}>Online</Text>}
                </View>
                <Text style={styles.friendAddress}>{item.address}</Text>
                <Text style={styles.friendLevel}>Level {item.level}</Text>
            </View>

            <TouchableOpacity
                style={[styles.challengeButton, !item.online && styles.challengeButtonDisabled]}
                onPress={() => handleChallengeToDuel(item.address, item.username)}
                disabled={!item.online}
            >
                <Text style={styles.challengeButtonText}>⚔️ Challenge</Text>
            </TouchableOpacity>
        </View>
    );

    const renderPending = ({ item }: { item: Friend }) => (
        <View style={[styles.friendCard, styles.pendingCard]}>
            <View style={styles.friendAvatar}>
                <Text style={styles.friendAvatarText}>
                    {item.username.slice(0, 2).toUpperCase()}
                </Text>
            </View>

            <View style={styles.friendInfo}>
                <Text style={styles.friendUsername}>{item.username}</Text>
                <Text style={styles.friendAddress}>{item.address}</Text>
                <Text style={styles.friendLevel}>Level {item.level}</Text>
            </View>

            <View style={styles.pendingActions}>
                <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => console.log('Rejected')}
                >
                    <Text style={styles.rejectButtonText}>✕</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => handleAcceptFriend(item.address)}
                >
                    <Text style={styles.acceptButtonText}>✓</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Friends</Text>
                <View style={styles.onlineBadge}>
                    <View style={styles.onlineDot} />
                    <Text style={styles.onlineCount}>
                        {friends.filter(f => f.online).length} online
                    </Text>
                </View>
            </View>

            {/* Add Friend */}
            <View style={styles.addFriendSection}>
                <Text style={styles.sectionTitle}>👤 Add Friend</Text>
                <View style={styles.searchBar}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Enter wallet address or ENS name"
                        placeholderTextColor="#6b7280"
                        value={searchAddress}
                        onChangeText={setSearchAddress}
                    />
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={handleAddFriend}
                    >
                        <Text style={styles.addButtonText}>Send Request</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        📨 Pending Requests ({pendingRequests.length})
                    </Text>
                    <FlatList
                        data={pendingRequests}
                        renderItem={renderPending}
                        keyExtractor={(item) => item.address}
                        scrollEnabled={false}
                    />
                </View>
            )}

            {/* Friends List */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    👥 My Friends ({friends.length})
                </Text>
                <FlatList
                    data={friends}
                    renderItem={renderFriend}
                    keyExtractor={(item) => item.address}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>👥</Text>
                            <Text style={styles.emptyText}>No friends yet</Text>
                            <Text style={styles.emptySubtext}>Add friends to challenge them!</Text>
                        </View>
                    }
                />
            </View>
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
    onlineBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    onlineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10b981',
        marginRight: 6,
    },
    onlineCount: {
        fontSize: 12,
        color: '#9ca3af',
    },
    addFriendSection: {
        padding: 16,
        backgroundColor: '#1a1a1a',
        margin: 16,
        borderRadius: 12,
    },
    section: {
        padding: 16,
        paddingTop: 0,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 12,
    },
    searchBar: {
        flexDirection: 'row',
        gap: 8,
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#0a0a0a',
        borderWidth: 1,
        borderColor: '#2a2a2a',
        borderRadius: 8,
        padding: 12,
        color: '#ffffff',
        fontSize: 14,
    },
    addButton: {
        backgroundColor: '#8b5cf6',
        paddingHorizontal: 16,
        justifyContent: 'center',
        borderRadius: 8,
    },
    addButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    listContent: {
        paddingBottom: 20,
    },
    friendCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    pendingCard: {
        borderColor: '#fbbf24',
    },
    friendAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#8b5cf6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        position: 'relative',
    },
    friendAvatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#10b981',
        borderWidth: 2,
        borderColor: '#1a1a1a',
    },
    friendInfo: {
        flex: 1,
    },
    friendHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    friendUsername: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
        marginRight: 8,
    },
    onlineText: {
        fontSize: 11,
        color: '#10b981',
        fontWeight: '600',
    },
    friendAddress: {
        fontSize: 11,
        color: '#6b7280',
        marginBottom: 4,
        fontFamily: 'monospace',
    },
    friendLevel: {
        fontSize: 12,
        color: '#9ca3af',
    },
    challengeButton: {
        backgroundColor: '#8b5cf6',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#8b5cf6',
    },
    challengeButtonDisabled: {
        backgroundColor: '#2a2a2a',
        borderColor: '#2a2a2a',
    },
    challengeButtonText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: 'bold',
    },
    pendingActions: {
        flexDirection: 'row',
        gap: 8,
    },
    rejectButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2a2a2a',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ef4444',
    },
    rejectButtonText: {
        color: '#ef4444',
        fontSize: 18,
        fontWeight: 'bold',
    },
    acceptButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#10b981',
        justifyContent: 'center',
        alignItems: 'center',
    },
    acceptButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
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
