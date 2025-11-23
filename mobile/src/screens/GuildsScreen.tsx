import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Modal,
    TextInput,
} from 'react-native';

interface Guild {
    id: string;
    name: string;
    description: string;
    founder: string;
    members: string[];
    level: number;
    totalScore: number;
    territory: number;
}

export default function GuildsScreen() {
    const [guilds] = useState<Guild[]>([
        {
            id: '1',
            name: 'Crystal Hunters',
            description: 'Elite AR hunters seeking legendary crystals',
            founder: '0x1234...5678',
            members: ['0x1234...5678', '0x2345...6789', '0x3456...7890'],
            level: 5,
            totalScore: 15420,
            territory: 2,
        },
        {
            id: '2',
            name: 'Aura Warriors',
            description: 'Dominating PvP and territory control',
            founder: '0x4567...8901',
            members: ['0x4567...8901', '0x5678...9012'],
            level: 3,
            totalScore: 8900,
            territory: 1,
        },
    ]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newGuildName, setNewGuildName] = useState('');
    const [newGuildDesc, setNewGuildDesc] = useState('');

    const handleCreateGuild = () => {
        // TODO: Call POST /social/guilds/create
        console.log('Creating guild:', newGuildName);
        setShowCreateModal(false);
    };

    const handleJoinGuild = (guildId: string) => {
        // TODO: Call POST /social/guilds/:id/join
        console.log('Joining guild:', guildId);
    };

    const renderItem = ({ item }: { item: Guild }) => (
        <View style={styles.guildCard}>
            <View style={styles.guildHeader}>
                <View style={styles.guildIcon}>
                    <Text style={styles.guildIconText}>🛡️</Text>
                </View>
                <View style={styles.guildHeaderInfo}>
                    <Text style={styles.guildName}>{item.name}</Text>
                    <Text style={styles.guildLevel}>Level {item.level}</Text>
                </View>
                <View style={styles.guildRank}>
                    <Text style={styles.guildRankNumber}>#{guilds.findIndex(g => g.id === item.id) + 1}</Text>
                </View>
            </View>

            <Text style={styles.guildDescription}>{item.description}</Text>

            <View style={styles.guildStats}>
                <View style={styles.guildStat}>
                    <Text style={styles.guildStatIcon}>👥</Text>
                    <Text style={styles.guildStatValue}>{item.members.length}</Text>
                    <Text style={styles.guildStatLabel}>Members</Text>
                </View>
                <View style={styles.guildStat}>
                    <Text style={styles.guildStatIcon}>📍</Text>
                    <Text style={styles.guildStatValue}>{item.territory}</Text>
                    <Text style={styles.guildStatLabel}>Territory</Text>
                </View>
                <View style={styles.guildStat}>
                    <Text style={styles.guildStatIcon}>⭐</Text>
                    <Text style={styles.guildStatValue}>{item.totalScore.toLocaleString()}</Text>
                    <Text style={styles.guildStatLabel}>Score</Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.joinButton}
                onPress={() => handleJoinGuild(item.id)}
            >
                <Text style={styles.joinButtonText}>Join Guild</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Guilds & Clans</Text>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => setShowCreateModal(true)}
                >
                    <Text style={styles.createButtonText}>+ Create</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={guilds}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
            />

            {/* Create Guild Modal */}
            <Modal
                visible={showCreateModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowCreateModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Create New Guild</Text>

                        <TextInput
                            style={styles.modalInput}
                            placeholder="Guild Name"
                            placeholderTextColor="#6b7280"
                            value={newGuildName}
                            onChangeText={setNewGuildName}
                            maxLength={30}
                        />

                        <TextInput
                            style={[styles.modalInput, styles.modalTextArea]}
                            placeholder="Description"
                            placeholderTextColor="#6b7280"
                            value={newGuildDesc}
                            onChangeText={setNewGuildDesc}
                            maxLength={200}
                            multiline
                            numberOfLines={4}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonCancel]}
                                onPress={() => setShowCreateModal(false)}
                            >
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonConfirm]}
                                onPress={handleCreateGuild}
                            >
                                <Text style={styles.modalButtonText}>Create Guild</Text>
                            </TouchableOpacity>
                        </View>
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
    createButton: {
        backgroundColor: '#8b5cf6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    createButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    listContent: {
        padding: 16,
    },
    guildCard: {
        backgroundColor: '#1a1a1a',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    guildHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    guildIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#8b5cf6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    guildIconText: {
        fontSize: 24,
    },
    guildHeaderInfo: {
        flex: 1,
    },
    guildName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 2,
    },
    guildLevel: {
        fontSize: 12,
        color: '#8b5cf6',
        fontWeight: '600',
    },
    guildRank: {
        backgroundColor: '#0a0a0a',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    guildRankNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fbbf24',
    },
    guildDescription: {
        fontSize: 13,
        color: '#9ca3af',
        marginBottom: 16,
        lineHeight: 18,
    },
    guildStats: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    guildStat: {
        flex: 1,
        alignItems: 'center',
    },
    guildStatIcon: {
        fontSize: 20,
        marginBottom: 4,
    },
    guildStatValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 2,
    },
    guildStatLabel: {
        fontSize: 10,
        color: '#6b7280',
    },
    joinButton: {
        backgroundColor: '#8b5cf6',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    joinButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 24,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 20,
    },
    modalInput: {
        backgroundColor: '#0a0a0a',
        borderWidth: 1,
        borderColor: '#2a2a2a',
        borderRadius: 8,
        padding: 12,
        color: '#ffffff',
        fontSize: 16,
        marginBottom: 16,
    },
    modalTextArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
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
