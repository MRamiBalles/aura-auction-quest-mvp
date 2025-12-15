/**
 * VisibilityContext - Manages user visibility modes for Ghost Mode.
 * 
 * SECURITY: Now integrates with PremiumSubscription.sol smart contract
 * to verify premium status on-chain. No more localStorage bypass.
 * 
 * @author Manuel Ramírez Ballesteros
 * @version 2.0.0 - Blockchain integration added
 */
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from './Web3Context';

export type VisibilityMode = 'PUBLIC' | 'GHOST' | 'AURA' | 'DISGUISE';

interface VisibilityState {
    currentMode: VisibilityMode;
    isPremium: boolean;
    premiumExpiry: Date | null;
    remainingDays: number;
    isLoading: boolean;
}

interface VisibilityContextType extends VisibilityState {
    setVisibility: (mode: VisibilityMode) => boolean;
    checkPremiumStatus: () => Promise<boolean>;
    upgradeToPremium: (yearly: boolean) => Promise<boolean>;
}

const VisibilityContext = createContext<VisibilityContextType | undefined>(undefined);

// Contract address - UPDATE THIS after deploying PremiumSubscription.sol
const PREMIUM_CONTRACT_ADDRESS = import.meta.env.VITE_PREMIUM_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

// Price in MATIC (matching PremiumSubscription.sol)
const MONTHLY_PRICE = '5'; // 5 MATIC
const YEARLY_PRICE = '50'; // 50 MATIC

// Modes requiring premium
const PREMIUM_MODES: VisibilityMode[] = ['GHOST', 'AURA', 'DISGUISE'];

// Minimal ABI for PremiumSubscription.sol
const PREMIUM_ABI = [
    'function isPremium(address user) view returns (bool)',
    'function getRemainingDays(address user) view returns (uint256)',
    'function getSubscription(address user) view returns (uint256 expiry, bool isYearly, bool active)',
    'function subscribeMonthly() payable',
    'function subscribeYearly() payable',
];

interface VisibilityProviderProps {
    children: ReactNode;
}

export const VisibilityProvider: React.FC<VisibilityProviderProps> = ({ children }) => {
    const { account, isConnected } = useWeb3();

    const [state, setState] = useState<VisibilityState>({
        currentMode: 'PUBLIC',
        isPremium: false,
        premiumExpiry: null,
        remainingDays: 0,
        isLoading: false,
    });

    /**
     * Get contract instance for reading
     */
    const getReadContract = useCallback(async () => {
        if (typeof window.ethereum === 'undefined') return null;

        const provider = new ethers.BrowserProvider(window.ethereum);
        return new ethers.Contract(PREMIUM_CONTRACT_ADDRESS, PREMIUM_ABI, provider);
    }, []);

    /**
     * Get contract instance for writing (with signer)
     */
    const getWriteContract = useCallback(async () => {
        if (typeof window.ethereum === 'undefined') return null;

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        return new ethers.Contract(PREMIUM_CONTRACT_ADDRESS, PREMIUM_ABI, signer);
    }, []);

    /**
     * Check premium status from blockchain
     */
    const checkPremiumStatus = useCallback(async (): Promise<boolean> => {
        if (!account || !isConnected) {
            setState(prev => ({ ...prev, isPremium: false, remainingDays: 0 }));
            return false;
        }

        // Skip if contract not deployed (address is zero)
        if (PREMIUM_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
            console.warn('PremiumSubscription contract not deployed. Using demo mode.');
            return false;
        }

        try {
            setState(prev => ({ ...prev, isLoading: true }));
            const contract = await getReadContract();
            if (!contract) return false;

            const [isPremium, remainingDays] = await Promise.all([
                contract.isPremium(account),
                contract.getRemainingDays(account),
            ]);

            const daysLeft = Number(remainingDays);
            const expiry = daysLeft > 0
                ? new Date(Date.now() + daysLeft * 24 * 60 * 60 * 1000)
                : null;

            setState(prev => ({
                ...prev,
                isPremium,
                remainingDays: daysLeft,
                premiumExpiry: expiry,
                isLoading: false,
                // Reset mode if premium expired
                currentMode: (!isPremium && PREMIUM_MODES.includes(prev.currentMode))
                    ? 'PUBLIC'
                    : prev.currentMode,
            }));

            return isPremium;
        } catch (error) {
            console.error('Error checking premium status:', error);
            setState(prev => ({ ...prev, isLoading: false }));
            return false;
        }
    }, [account, isConnected, getReadContract]);

    // Check premium status when account changes
    useEffect(() => {
        if (account) {
            checkPremiumStatus();
        } else {
            setState(prev => ({
                ...prev,
                isPremium: false,
                remainingDays: 0,
                premiumExpiry: null,
                currentMode: 'PUBLIC',
            }));
        }
    }, [account, checkPremiumStatus]);

    /**
     * Upgrade to premium - sends actual blockchain transaction
     */
    const upgradeToPremium = async (yearly: boolean): Promise<boolean> => {
        if (!account || !isConnected) {
            console.error('Wallet not connected');
            return false;
        }

        // Demo mode warning if contract not deployed
        if (PREMIUM_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
            console.warn('Contract not deployed. Cannot process payment.');
            return false;
        }

        try {
            setState(prev => ({ ...prev, isLoading: true }));
            const contract = await getWriteContract();
            if (!contract) return false;

            const price = yearly ? YEARLY_PRICE : MONTHLY_PRICE;
            const value = ethers.parseEther(price);

            // Call appropriate contract function
            const tx = yearly
                ? await contract.subscribeYearly({ value })
                : await contract.subscribeMonthly({ value });

            // Wait for transaction confirmation
            await tx.wait();

            // Refresh premium status
            await checkPremiumStatus();

            return true;
        } catch (error: any) {
            console.error('Error upgrading to premium:', error);
            setState(prev => ({ ...prev, isLoading: false }));

            // User rejected transaction
            if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
                return false;
            }

            throw error;
        }
    };

    /**
     * Set visibility mode - validates premium status first
     */
    const setVisibility = (mode: VisibilityMode): boolean => {
        // Premium modes require active subscription
        if (PREMIUM_MODES.includes(mode) && !state.isPremium) {
            console.warn(`Mode ${mode} requires premium subscription`);
            return false;
        }

        setState(prev => ({ ...prev, currentMode: mode }));

        // Save mode preference (non-sensitive data)
        localStorage.setItem('aura_visibility_mode', mode);

        return true;
    };

    // Load saved mode preference on mount (only mode, not premium status)
    useEffect(() => {
        const savedMode = localStorage.getItem('aura_visibility_mode') as VisibilityMode | null;
        if (savedMode && savedMode === 'PUBLIC') {
            setState(prev => ({ ...prev, currentMode: savedMode }));
        }
    }, []);

    return (
        <VisibilityContext.Provider
            value={{
                ...state,
                setVisibility,
                checkPremiumStatus,
                upgradeToPremium,
            }}
        >
            {children}
        </VisibilityContext.Provider>
    );
};

export const useVisibility = (): VisibilityContextType => {
    const context = useContext(VisibilityContext);
    if (!context) {
        throw new Error('useVisibility must be used within a VisibilityProvider');
    }
    return context;
};

export default VisibilityContext;
