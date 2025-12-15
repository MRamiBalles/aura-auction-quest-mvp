/**
 * VisibilityContext - Manages user visibility modes for the Ghost Mode feature.
 * 
 * Provides 4 visibility modes:
 * - PUBLIC: Default, visible to all players
 * - GHOST: Invisible to everyone (premium)
 * - AURA: Shows glow effect but not exact position (premium)
 * - DISGUISE: Appears as different avatar (premium)
 * 
 * @author Manuel Ramírez Ballesteros
 * @version 1.0.0
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type VisibilityMode = 'PUBLIC' | 'GHOST' | 'AURA' | 'DISGUISE';

interface VisibilityState {
    currentMode: VisibilityMode;
    isPremium: boolean;
    premiumExpiry: Date | null;
}

interface VisibilityContextType extends VisibilityState {
    setVisibility: (mode: VisibilityMode) => boolean;
    checkPremiumStatus: () => boolean;
    upgradeToPremium: () => void;
}

const VisibilityContext = createContext<VisibilityContextType | undefined>(undefined);

const STORAGE_KEY = 'aura_visibility_mode';
const PREMIUM_KEY = 'aura_premium_status';

// Modes that require premium subscription
const PREMIUM_MODES: VisibilityMode[] = ['GHOST', 'AURA', 'DISGUISE'];

interface VisibilityProviderProps {
    children: ReactNode;
}

export const VisibilityProvider: React.FC<VisibilityProviderProps> = ({ children }) => {
    const [state, setState] = useState<VisibilityState>({
        currentMode: 'PUBLIC',
        isPremium: false,
        premiumExpiry: null,
    });

    // Load saved state on mount
    useEffect(() => {
        const savedMode = localStorage.getItem(STORAGE_KEY) as VisibilityMode | null;
        const savedPremium = localStorage.getItem(PREMIUM_KEY);

        if (savedMode && ['PUBLIC', 'GHOST', 'AURA', 'DISGUISE'].includes(savedMode)) {
            setState(prev => ({
                ...prev,
                currentMode: savedMode,
                isPremium: savedPremium === 'true',
            }));
        }
    }, []);

    // Persist mode changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, state.currentMode);
        localStorage.setItem(PREMIUM_KEY, state.isPremium.toString());
    }, [state.currentMode, state.isPremium]);

    /**
     * Attempts to set visibility mode.
     * @returns true if successful, false if premium required
     */
    const setVisibility = (mode: VisibilityMode): boolean => {
        // Check if mode requires premium
        if (PREMIUM_MODES.includes(mode) && !state.isPremium) {
            console.warn(`Mode ${mode} requires premium subscription`);
            return false;
        }

        setState(prev => ({ ...prev, currentMode: mode }));
        return true;
    };

    /**
     * Checks if user has active premium subscription.
     */
    const checkPremiumStatus = (): boolean => {
        // In production, this would check blockchain or backend
        // For now, check localStorage and expiry
        if (state.premiumExpiry && new Date() > state.premiumExpiry) {
            setState(prev => ({ ...prev, isPremium: false, premiumExpiry: null }));
            return false;
        }
        return state.isPremium;
    };

    /**
     * Upgrades user to premium (mock - would connect to payment/blockchain).
     */
    const upgradeToPremium = (): void => {
        // Mock: Set premium for 30 days
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 30);

        setState(prev => ({
            ...prev,
            isPremium: true,
            premiumExpiry: expiry,
        }));
    };

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

/**
 * Hook to access visibility context.
 * @throws Error if used outside VisibilityProvider
 */
export const useVisibility = (): VisibilityContextType => {
    const context = useContext(VisibilityContext);
    if (!context) {
        throw new Error('useVisibility must be used within a VisibilityProvider');
    }
    return context;
};

export default VisibilityContext;
