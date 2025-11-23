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
    removeItem: (id: number) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<Item[]>([
        { id: 1, type: 'crystal', rarity: 'common', value: 10, timestamp: Date.now() }
    ]);

    const addItem = (item: Item) => {
        setItems(prev => [item, ...prev]);
    };

    const removeItem = (id: number) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    return (
        <InventoryContext.Provider value={{ items, addItem, removeItem }}>
            {children}
        </InventoryContext.Provider>
    );
};

export const useInventory = () => {
    const context = useContext(InventoryContext);
    if (context === undefined) {
        throw new Error('useInventory must be used within a InventoryProvider');
    }
    return context;
};
