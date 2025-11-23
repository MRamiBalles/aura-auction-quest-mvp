import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Item {
    id: number;
    type: 'crystal' | 'artifact';
    rarity: 'common' | 'rare' | 'legendary';
    value: number;
    timestamp: number;
}

interface InventoryContextType {
    items: Item[];
    addItem: (item: Item) => void;
};

export const useInventory = () => {
    const context = useContext(InventoryContext);
    if (context === undefined) {
        throw new Error('useInventory must be used within a InventoryProvider');
    }
    return context;
};
