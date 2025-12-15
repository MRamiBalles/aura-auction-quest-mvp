/**
 * LandlordsContext - State management for Aura Landlords virtual real estate.
 * 
 * SECURITY: v2.0 integrates with LandRegistry.sol smart contract.
 * All operations now require actual blockchain transactions.
 * 
 * @author Manuel Ramírez Ballesteros
 * @version 2.0.0 - Blockchain integration
 */
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ethers } from 'ethers';
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
    claimParcel: (latitude: number, longitude: number, signature: string) => Promise<boolean>;
    buildImprovement: (parcelId: number, improvement: ImprovementType) => Promise<boolean>;
    withdrawTaxes: () => Promise<boolean>;
    refreshParcels: () => Promise<void>;
    getParcelAt: (lat: number, lng: number) => Parcel | null;
    getBackendSignature: (latitude: number, longitude: number) => Promise<string | null>;
}

const LandlordsContext = createContext<LandlordsContextType | undefined>(undefined);

// Contract address - UPDATE after deploying LandRegistry.sol
const LAND_CONTRACT_ADDRESS = import.meta.env.VITE_LAND_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

// Backend API URL for GPS signature
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';

// Improvement costs in MATIC (matching LandRegistry.sol)
export const IMPROVEMENT_INFO = {
    AURA_TREE: {
        name: 'Aura Tree',
        emoji: '🌳',
        description: '+25% crystal spawn rate in this parcel',
        cost: 50,
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

// Claim cost in MATIC
const CLAIM_COST = '10';

// Minimal ABI for LandRegistry.sol
const LAND_ABI = [
    'function claimParcel(int64 latitude, int64 longitude, bytes signature) payable',
    'function buildImprovement(uint256 tokenId, uint8 improvement) payable',
    'function withdrawTaxes()',
    'function balanceOf(address owner) view returns (uint256)',
    'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
    'function parcels(uint256 tokenId) view returns (int64 latitude, int64 longitude, uint256 claimedAt, uint256 totalTaxEarned, uint8 improvementLevel, uint8 improvement)',
    'function pendingTaxes(address owner) view returns (uint256)',
    'function getParcelAt(int64 latitude, int64 longitude) view returns (uint256 tokenId, address owner)',
    'event ParcelClaimed(uint256 indexed tokenId, address indexed owner, int64 latitude, int64 longitude)',
];

// Improvement type to contract enum mapping
const IMPROVEMENT_ENUM: Record<ImprovementType, number> = {
    NONE: 0,
    AURA_TREE: 1,
    SHRINE: 2,
    DEFENSE_GRID: 3,
};

interface LandlordsProviderProps {
    children: ReactNode;
}

export const LandlordsProvider: React.FC<LandlordsProviderProps> = ({ children }) => {
    const { account, isConnected } = useWeb3();

    const [state, setState] = useState<LandlordsState>({
        ownedParcels: [],
        pendingTaxes: 0,
        isLoading: false,
        error: null,
    });

    /**
     * Get contract for reading
     */
    const getReadContract = useCallback(async () => {
        if (typeof window.ethereum === 'undefined') return null;
        const provider = new ethers.BrowserProvider(window.ethereum);
        return new ethers.Contract(LAND_CONTRACT_ADDRESS, LAND_ABI, provider);
    }, []);

    /**
     * Get contract for writing
     */
    const getWriteContract = useCallback(async () => {
        if (typeof window.ethereum === 'undefined') return null;
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        return new ethers.Contract(LAND_CONTRACT_ADDRESS, LAND_ABI, signer);
    }, []);

    /**
     * Get auth token from localStorage (set during wallet login)
     */
    const getAuthToken = (): string | null => {
        return localStorage.getItem('aura_auth_token');
    };

    /**
     * Get backend signature proving GPS location.
     * This prevents GPS spoofing attacks.
     * SECURITY: Requires JWT authentication to prevent unauthorized signature requests.
     */
    const getBackendSignature = async (latitude: number, longitude: number): Promise<string | null> => {
        const token = getAuthToken();
        
        if (!token) {
            console.error('No auth token found. User must authenticate first.');
            setState(prev => ({ ...prev, error: 'Authentication required. Please connect your wallet.' }));
            return null;
        }

        try {
            const response = await fetch(`${BACKEND_API_URL}/api/landlords/sign-claim`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    userAddress: account,
                    latitude: Math.round(latitude * 1e6), // Convert to int64
                    longitude: Math.round(longitude * 1e6),
                }),
            });

            if (response.status === 401) {
                // Token expired or invalid - clear and prompt re-auth
                localStorage.removeItem('aura_auth_token');
                setState(prev => ({ ...prev, error: 'Session expired. Please reconnect your wallet.' }));
                return null;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to get signature from backend');
            }

            const data = await response.json();
            return data.signature;
        } catch (error) {
            console.error('Error getting backend signature:', error);
            return null;
        }
    };

    /**
     * Refreshes owned parcels from blockchain
     */
    const refreshParcels = useCallback(async (): Promise<void> => {
        if (!account || !isConnected) {
            setState(prev => ({ ...prev, ownedParcels: [], pendingTaxes: 0 }));
            return;
        }

        // Demo mode if contract not deployed
        if (LAND_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
            console.warn('LandRegistry contract not deployed. Demo mode active.');
            setState(prev => ({
                ...prev,
                ownedParcels: [],
                pendingTaxes: 0,
                isLoading: false,
            }));
            return;
        }

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const contract = await getReadContract();
            if (!contract) return;

            // Get number of parcels owned
            const balance = await contract.balanceOf(account);
            const parcelCount = Number(balance);

            // Fetch each parcel
            const parcels: Parcel[] = [];
            for (let i = 0; i < parcelCount; i++) {
                const tokenId = await contract.tokenOfOwnerByIndex(account, i);
                const parcelData = await contract.parcels(tokenId);

                parcels.push({
                    tokenId: Number(tokenId),
                    latitude: Number(parcelData.latitude) / 1e6,
                    longitude: Number(parcelData.longitude) / 1e6,
                    claimedAt: new Date(Number(parcelData.claimedAt) * 1000),
                    totalTaxEarned: Number(ethers.formatEther(parcelData.totalTaxEarned)),
                    improvement: ['NONE', 'AURA_TREE', 'SHRINE', 'DEFENSE_GRID'][parcelData.improvement] as ImprovementType,
                    improvementLevel: parcelData.improvementLevel,
                });
            }

            // Get pending taxes
            const pendingTaxes = await contract.pendingTaxes(account);

            setState(prev => ({
                ...prev,
                ownedParcels: parcels,
                pendingTaxes: Number(ethers.formatEther(pendingTaxes)),
                isLoading: false,
            }));
        } catch (error) {
            console.error('Error loading parcels:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to load parcels',
            }));
        }
    }, [account, isConnected, getReadContract]);

    // Refresh when account changes
    useEffect(() => {
        if (account) {
            refreshParcels();
        }
    }, [account, refreshParcels]);

    /**
     * Claims a new parcel - requires backend signature and MATIC payment
     */
    const claimParcel = async (latitude: number, longitude: number, signature: string): Promise<boolean> => {
        if (!account || !isConnected) {
            setState(prev => ({ ...prev, error: 'Wallet not connected' }));
            return false;
        }

        if (LAND_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
            console.warn('Contract not deployed');
            return false;
        }

        setState(prev => ({ ...prev, isLoading: true }));

        try {
            const contract = await getWriteContract();
            if (!contract) return false;

            const latInt = Math.round(latitude * 1e6);
            const lngInt = Math.round(longitude * 1e6);
            const value = ethers.parseEther(CLAIM_COST);

            // Send transaction with payment
            const tx = await contract.claimParcel(latInt, lngInt, signature, { value });
            await tx.wait();

            // Refresh parcels
            await refreshParcels();

            return true;
        } catch (error: any) {
            console.error('Error claiming parcel:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error.message || 'Failed to claim parcel',
            }));
            return false;
        }
    };

    /**
     * Builds an improvement - requires MATIC payment
     */
    const buildImprovement = async (parcelId: number, improvement: ImprovementType): Promise<boolean> => {
        if (!account || !isConnected) return false;
        if (LAND_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') return false;

        setState(prev => ({ ...prev, isLoading: true }));

        try {
            const contract = await getWriteContract();
            if (!contract) return false;

            const cost = IMPROVEMENT_INFO[improvement].cost;
            const value = ethers.parseEther(cost.toString());
            const improvementEnum = IMPROVEMENT_ENUM[improvement];

            const tx = await contract.buildImprovement(parcelId, improvementEnum, { value });
            await tx.wait();

            await refreshParcels();
            return true;
        } catch (error: any) {
            console.error('Error building improvement:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error.message || 'Failed to build improvement',
            }));
            return false;
        }
    };

    /**
     * Withdraws accumulated taxes to wallet
     */
    const withdrawTaxes = async (): Promise<boolean> => {
        if (!account || !isConnected) return false;
        if (state.pendingTaxes <= 0) return false;
        if (LAND_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') return false;

        setState(prev => ({ ...prev, isLoading: true }));

        try {
            const contract = await getWriteContract();
            if (!contract) return false;

            const tx = await contract.withdrawTaxes();
            await tx.wait();

            await refreshParcels();
            return true;
        } catch (error: any) {
            console.error('Error withdrawing taxes:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error.message || 'Failed to withdraw taxes',
            }));
            return false;
        }
    };

    /**
     * Find parcel at coordinates
     */
    const getParcelAt = (lat: number, lng: number): Parcel | null => {
        const tolerance = 0.001;
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
                getBackendSignature,
            }}
        >
            {children}
        </LandlordsContext.Provider>
    );
};

export const useLandlords = (): LandlordsContextType => {
    const context = useContext(LandlordsContext);
    if (!context) {
        throw new Error('useLandlords must be used within a LandlordsProvider');
    }
    return context;
};

export default LandlordsContext;
