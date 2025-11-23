import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Providers
import { Web3Provider } from './src/contexts/Web3Context';
import { SoundProvider } from './src/contexts/SoundContext';
import { InventoryProvider } from './src/contexts/InventoryContext';

// Screens
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import ARHuntScreen from './src/screens/ARHuntScreen';
import PvPDuelScreen from './src/screens/PvPDuelScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import MarketplaceScreen from './src/screens/MarketplaceScreen';
import AuctionScreen from './src/screens/AuctionScreen';
import StakingScreen from './src/screens/StakingScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import GuildsScreen from './src/screens/GuildsScreen';
import FriendsScreen from './src/screens/FriendsScreen';

const Stack = createStackNavigator();

export default function App() {
    return (
        <SafeAreaProvider>
            <Web3Provider>
                <SoundProvider>
                    <InventoryProvider>
                        <NavigationContainer>
                            <Stack.Navigator
                                initialRouteName="Auth"
                                screenOptions={{
                                    headerStyle: {
                                        backgroundColor: '#0a0a0a',
                                    },
                                    headerTintColor: '#8b5cf6',
                                    headerTitleStyle: {
                                        fontWeight: 'bold',
                                    },
                                    cardStyle: {
                                        backgroundColor: '#0a0a0a',
                                    },
                                }}
                            >
                                <Stack.Screen
                                    name="Auth"
                                    component={AuthScreen}
                                    options={{ headerShown: false }}
                                />
                                <Stack.Screen
                                    name="Home"
                                    component={HomeScreen}
                                    options={{ title: 'Aura Quest' }}
                                />
                                <Stack.Screen
                                    name="ARHunt"
                                    component={ARHuntScreen}
                                    options={{ title: 'AR Hunt' }}
                                />
                                <Stack.Screen
                                    name="PvPDuel"
                                    component={PvPDuelScreen}
                                    options={{ title: 'PvP Duel' }}
                                />
                                <Stack.Screen
                                    name="Inventory"
                                    component={InventoryScreen}
                                    options={{ title: 'Inventory' }}
                                />
                                <Stack.Screen
                                    name="Marketplace"
                                    component={MarketplaceScreen}
                                    options={{ title: 'Marketplace' }}
                                />
                                <Stack.Screen
                                    name="Auction"
                                    component={AuctionScreen}
                                    options={{ title: 'Auctions' }}
                                />
                                <Stack.Screen
                                    name="Staking"
                                    component={StakingScreen}
                                    options={{ title: 'Staking' }}
                                />
                                <Stack.Screen
                                    name="Leaderboard"
                                    component={LeaderboardScreen}
                                    options={{ title: 'Leaderboard' }}
                                />
                                <Stack.Screen
                                    name="Guilds"
                                    component={GuildsScreen}
                                    options={{ title: 'Guilds' }}
                                />
                                <Stack.Screen
                                    name="Friends"
                                    component={FriendsScreen}
                                    options={{ title: 'Friends' }}
                                />
                            </Stack.Navigator>
                        </NavigationContainer>
                        <StatusBar style="light" />
                    </InventoryProvider>
                </SoundProvider>
            </Web3Provider>
        </SafeAreaProvider>
    );
}
