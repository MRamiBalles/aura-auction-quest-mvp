/**
 * PATENT PENDING: SPATIAL CONSENSUS & ENVIRONMENTAL ORACLE
 * Reference: DRAFT_05_SPATIAL_CONSENSUS & DRAFT_06_ENVIRONMENTAL_NFT
 */

// --- SPATIAL CONSENSUS ---

export interface SpatialAnchor {
    id: string;
    coordinate: {
        lat: number;
        lng: number;
        alt: number;
    };
    confidence: number;
    witnesses: string[]; // List of peer IDs verifying this anchor
}

export interface P2PConsensusMessage {
    type: 'PROPOSE' | 'VOTE' | 'COMMIT';
    anchorId: string;
    senderId: string;
    signature: string;
}

// --- ENVIRONMENTAL ORACLES ---

export interface WeatherData {
    temperature: number;
    precipitation: number; // mm
    cloudCover: number; // %
    moonPhase: number; // 0.0 - 1.0
    uvIndex: number;
}

export interface EnvironmentalModifier {
    targetNftId: string;
    attribute: string;
    modificationFactor: number; // e.g., 1.5x multiplier
    condition: (weather: WeatherData) => boolean;
}

// Stub for NFT Metadata dynamic update logic
export const calculateEnvironmentalBonus = (
    baseStats: any,
    weather: WeatherData
): any => {
    const bonus = { ...baseStats };

    // Patent Claim: Rain increases water element power
    if (weather.precipitation > 5) {
        if (bonus.element === 'WATER') {
            bonus.attack *= 1.2;
        }
    }

    // Patent Claim: Full moon boosts Ghost types
    if (weather.moonPhase > 0.9) {
        if (bonus.type === 'GHOST') {
            bonus.stealth *= 1.5;
        }
    }

    return bonus;
};
