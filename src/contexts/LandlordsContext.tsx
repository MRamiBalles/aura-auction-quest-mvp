/**
 * LandlordsContext - State management for Aura Landlords virtual real estate.
 * 
 * Tracks owned parcels, pending taxes, and improvement status.
 * Integrates with LandRegistry smart contract on Polygon.
 * 
 * @author Manuel Ramírez Ballesteros
 * @version 1.0.0
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWeb3 } from './Web3Context';

export type ImprovementType = 'NONE' | 'AURA_TREE' | 'SHRINE' | 'DEFENSE_GRID';

export interface Parcel {
    tokenId: number;
    latitude: number;
    longitude: number;
    claimedAt: Date;
    totalTaxEarned: number;
    improvement: ImprovementType;
    improvementLevel: number;
}

interface LandlordsState {
    ownedParcels: Parcel[];
    pendingTaxes: number;
    isLoading: boolean;
    error: string | null;
}

interface LandlordsContextType extends LandlordsState {
    claimParcel: (latitude: number, longitude: number) => Promise<boolean>;
    buildImprovement: (parcelId: number, improvement: ImprovementType) => Promise<boolean>;
    withdrawTaxes: () => Promise<boolean>;
    refreshParcels: () => Promise<void>;
    getParcelAt: (lat: number, lng: number) => Parcel | null;
}

const LandlordsContext = createContext<LandlordsContextType | undefined>(undefined);

// Improvement info for UI
export const IMPROVEMENT_INFO = {
    AURA_TREE: {
        name: 'Aura Tree',
        emoji: '🌳',
        description: '+25% crystal spawn rate in this parcel',
        cost: 50, // MATIC
    },
    SHRINE: {
        name: 'Shrine',
        emoji: '⛩️',
        description: 'Bonus rewards for guild allies collecting here',
        cost: 100,
    },
    DEFENSE_GRID: {
        name: 'Defense Grid',
        emoji: '🛡️',
        description: '50% tax reduction when others collect in your territory',
        cost: 150,
    },
};

interface LandlordsProviderProps {
    children: ReactNode;
}

export const LandlordsProvider: React.FC<LandlordsProviderProps> = ({ children }) => {
    const { account } = useWeb3();

    const [state, setState] = useState<LandlordsState>({
        ownedParcels: [],
        pendingTaxes: 0,
        isLoading: false,
        error: null,
    });

    // Load parcels when account changes
    useEffect(() => {
        if (account) {
            refreshParcels();
        } else {
            setState(prev => ({ ...prev, ownedParcels: [], pendingTaxes: 0 }));
        }
    }, [account]);

    /**
     * Refreshes owned parcels from blockchain/backend.
     */
    const refreshParcels = async (): Promise<void> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // Mock data - in production would call LandRegistry contract
            const mockParcels: Parcel[] = [
                {
                    tokenId: 1,
                    latitude: 40.416775,
                    longitude: -3.703790,
                    claimedAt: new Date('2024-12-01'),
                    totalTaxEarned: 125.5,
                    improvement: 'AURA_TREE',
                    improvementLevel: 1,
                },
                {
                    tokenId: 2,
                    latitude: 40.453054,
                    longitude: -3.688344,
                    claimedAt: new Date('2024-12-10'),
                    totalTaxEarned: 45.2,
                    improvement: 'NONE',
                    improvementLevel: 0,
                },
            ];

            setState(prev => ({
                ...prev,
                ownedParcels: mockParcels,
                pendingTaxes: 170.7,
                isLoading: false,
            }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to load parcels',
            }));
        }
    };

    /**
     * Claims a new parcel at the given coordinates.
     * Requires backend signature to verify physical presence.
     */
    const claimParcel = async (latitude: number, longitude: number): Promise<boolean> => {
        if (!account) {
            setState(prev => ({ ...prev, error: 'Wallet not connected' }));
            return false;
        }

        setState(prev => ({ ...prev, isLoading: true }));

        try {
            // In production:
            // 1. Get signature from backend (proves GPS location)
            // 2. Call LandRegistry.claimParcel() with signature
            // 3. Wait for transaction confirmation

            // Mock: Add new parcel
            const newParcel: Parcel = {
                tokenId: Date.now(),
                latitude,
                longitude,
                claimedAt: new Date(),
                totalTaxEarned: 0,
                improvement: 'NONE',
                improvementLevel: 0,
            };

            setState(prev => ({
                ...prev,
                ownedParcels: [...prev.ownedParcels, newParcel],
                isLoading: false,
            }));

            return true;
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to claim parcel',
            }));
            return false;
        }
    };

    /**
     * Builds an improvement on an owned parcel.
     */
    const buildImprovement = async (
        parcelId: number,
        improvement: ImprovementType
    ): Promise<boolean> => {
        setState(prev => ({ ...prev, isLoading: true }));

        try {
            // In production: Call LandRegistry.buildImprovement()

            setState(prev => ({
                ...prev,
                ownedParcels: prev.ownedParcels.map(p =>
                    p.tokenId === parcelId
                        ? { ...p, improvement, improvementLevel: 1 }
                        : p
                ),
                isLoading: false,
            }));

            return true;
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to build improvement',
            }));
            return false;
        }
    };

    /**
     * Withdraws accumulated taxes to wallet.
     */
    const withdrawTaxes = async (): Promise<boolean> => {
        if (state.pendingTaxes <= 0) {
            return false;
        }

        setState(prev => ({ ...prev, isLoading: true }));

        try {
            // In production: Call LandRegistry.withdrawTaxes()

            setState(prev => ({
                ...prev,
                pendingTaxes: 0,
                isLoading: false,
            }));

            return true;
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to withdraw taxes',
            }));
            return false;
        }
    };

    /**
     * Finds a parcel at given coordinates.
     */
    const getParcelAt = (lat: number, lng: number): Parcel | null => {
        // In production: Check contract or cache
        // For now, check owned parcels with ~100m tolerance
        const tolerance = 0.001; // ~100m

        return state.ownedParcels.find(p =>
            Math.abs(p.latitude - lat) < tolerance &&
            Math.abs(p.longitude - lng) < tolerance
        ) || null;
    };

    return (
        <LandlordsContext.Provider
            value={{
                ...state,
                claimParcel,
                buildImprovement,
                withdrawTaxes,
                refreshParcels,
                getParcelAt,
            }}
        >
            {children}
        </LandlordsContext.Provider>
    );
};

/**
 * Hook to access landlords context.
 */
export const useLandlords = (): LandlordsContextType => {
    const context = useContext(LandlordsContext);
    if (!context) {
        throw new Error('useLandlords must be used within a LandlordsProvider');
    }
    return context;
};

export default LandlordsContext;
