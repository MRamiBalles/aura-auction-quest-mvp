import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Dimensions,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import { useWeb3 } from '../contexts/Web3Context';

const { width, height } = Dimensions.get('window');

interface Crystal {
    id: number;
    x: number;
    y: number;
    dist: number;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export default function ARHuntScreen() {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [crystals, setCrystals] = useState<Crystal[]>([]);
    const { account, signer } = useWeb3();

    useEffect(() => {
        (async () => {
            // Request camera permission
            const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(cameraStatus === 'granted');

            // Request location permission
            const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
            if (locationStatus === 'granted') {
                const loc = await Location.getCurrentPositionAsync({});
                setLocation(loc);
            }
        })();
    }, []);

    useEffect(() => {
        if (location) {
            spawnCrystal();
        }
    }, [location]);

    const spawnCrystal = () => {
        const newCrystal: Crystal = {
            id: Date.now(),
            x: Math.random() * (width - 100) + 50,
            y: Math.random() * (height - 200) + 100,
            dist: Math.floor(Math.random() * 100) + 10,
            rarity: ['common', 'rare', 'epic', 'legendary'][Math.floor(Math.random() * 4)] as Crystal['rarity'],
        };
        setCrystals([...crystals, newCrystal]);
    };

    const handleCapture = async (crystal: Crystal) => {
        if (!location || !signer) {
            Alert.alert('Error', 'Waiting for GPS signal or wallet...');
            return;
        }

        try {
            // Sign message
            const message = `Claim reward at ${Date.now()}`;
            const signature = await signer.signMessage(message);

            // TODO: Call backend API
            // const result = await api.game.claimReward({ ... });

            Alert.alert('Success', `Captured ${crystal.rarity} crystal!`);
            setCrystals(crystals.filter(c => c.id !== crystal.id));
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to capture crystal');
        }
    };

    if (hasPermission === null) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>Requesting permissions...</Text>
            </View>
        );
    }

    if (hasPermission === false) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>Camera permission denied</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Camera View */}
            <Camera style={styles.camera} type={Camera.Constants.Type.back}>
                {/* GPS Indicator */}
                {location && (
                    <View style={styles.gpsIndicator}>
                        <Text style={styles.gpsText}>
                            📍 {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
                        </Text>
                    </View>
                )}

                {/* Crystals */}
                {crystals.map((crystal) => (
                    <TouchableOpacity
                        key={crystal.id}
                        style={[
                            styles.crystal,
                            {
                                left: crystal.x,
                                top: crystal.y,
                                borderColor: getRarityColor(crystal.rarity),
                            }
                        ]}
                        onPress={() => handleCapture(crystal)}
                    >
                        <Text style={styles.crystalIcon}>💎</Text>
                        <Text style={styles.crystalDist}>{crystal.dist}m</Text>
                    </TouchableOpacity>
                ))}

                {/* Controls */}
                <View style={styles.controls}>
                    <TouchableOpacity
                        style={styles.spawnButton}
                        onPress={spawnCrystal}
                    >
                        <Text style={styles.spawnButtonText}>Spawn Crystal</Text>
                    </TouchableOpacity>
                </View>
            </Camera>
        </View>
    );
}

const getRarityColor = (rarity: string) => {
    switch (rarity) {
        case 'legendary': return '#fbbf24';
        case 'epic': return '#a855f7';
        case 'rare': return '#3b82f6';
        default: return '#6b7280';
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    camera: {
        flex: 1,
    },
    message: {
        color: '#ffffff',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 100,
    },
    gpsIndicator: {
        position: 'absolute',
        top: 20,
        left: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    gpsText: {
        color: '#10b981',
        fontSize: 12,
        fontFamily: 'monospace',
    },
    crystal: {
        position: 'absolute',
        width: 80,
        height: 80,
        backgroundColor: 'rgba(139, 92, 246, 0.3)',
        borderRadius: 40,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    crystalIcon: {
        fontSize: 32,
    },
    crystalDist: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 4,
    },
    controls: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    spawnButton: {
        backgroundColor: '#8b5cf6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    spawnButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
