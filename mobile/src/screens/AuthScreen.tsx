import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useWeb3 } from '../contexts/Web3Context';

const { width } = Dimensions.get('window');

export default function AuthScreen() {
    const navigation = useNavigation();
    const { connect } = useWeb3();

    const handleConnect = async () => {
        try {
            await connect();
            navigation.navigate('Home' as never);
        } catch (error) {
            console.error('Connection failed:', error);
        }
    };

    return (
        <View style={styles.container}>
            {/* Logo */}
            <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                    <Text style={styles.logoText}>⚡</Text>
                </View>
                <Text style={styles.title}>Aura Quest</Text>
                <Text style={styles.subtitle}>Discover NFTs in the Real World</Text>
            </View>

            {/* Features */}
            <View style={styles.features}>
                <FeatureItem
                    icon="📍"
                    title="AR Crystal Hunt"
                    description="Find crystals in real-world locations"
                />
                <FeatureItem
                    icon="⚔️"
                    title="PvP Duels"
                    description="Challenge players to earn rewards"
                />
                <FeatureItem
                    icon="🏆"
                    title="Own & Trade"
                    description="Collect, stake, and trade NFTs"
                />
            </View>

            {/* Connect Button */}
            <TouchableOpacity
                style={styles.connectButton}
                onPress={handleConnect}
                activeOpacity={0.8}
            >
                <Text style={styles.connectButtonText}>Connect Wallet</Text>
            </TouchableOpacity>

            <Text style={styles.footer}>Powered by Polygon</Text>
        </View>
    );
}

const FeatureItem = ({ icon, title, description }: { icon: string; title: string; description: string }) => (
    <View style={styles.featureItem}>
        <Text style={styles.featureIcon}>{icon}</Text>
        <View style={styles.featureText}>
            <Text style={styles.featureTitle}>{title}</Text>
            <Text style={styles.featureDescription}>{description}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
        padding: 24,
        justifyContent: 'space-between',
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 80,
    },
    logoCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#8b5cf6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    logoText: {
        fontSize: 64,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#9ca3af',
        textAlign: 'center',
    },
    features: {
        marginVertical: 40,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        backgroundColor: '#1a1a1a',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    featureIcon: {
        fontSize: 32,
        marginRight: 16,
    },
    featureText: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 14,
        color: '#9ca3af',
    },
    connectButton: {
        backgroundColor: '#8b5cf6',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16,
    },
    connectButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        textAlign: 'center',
        color: '#6b7280',
        fontSize: 14,
        marginBottom: 20,
    },
});
