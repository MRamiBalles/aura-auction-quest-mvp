import React, { createContext, useContext, useState, useEffect } from 'react';
import WalletConnectProvider from '@walletconnect/react-native-dapp';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ethers } from 'ethers';

interface Web3ContextType {
    account: string | null;
    chainId: number | null;
    isConnected: boolean;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    signer: ethers.Signer | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [account, setAccount] = useState<string | null>(null);
    const [chainId, setChainId] = useState<number | null>(null);
    const [signer, setSigner] = useState<ethers.Signer | null>(null);

    const connector = new WalletConnectProvider({
        redirectUrl: 'auraquest://',
        storageOptions: {
            asyncStorage: AsyncStorage,
        },
        qrcodeModal: true,
    });

    useEffect(() => {
        // Check for existing session
        checkConnection();
    }, []);

    const checkConnection = async () => {
        try {
            if (connector.connected) {
                setAccount(connector.accounts[0]);
                setChainId(connector.chainId);

                // Create ethers provider and signer
                const provider = new ethers.BrowserProvider(connector);
                const ethersSigner = await provider.getSigner();
                setSigner(ethersSigner);
            }
        } catch (error) {
            console.error('Connection check failed:', error);
        }
    };

    const connect = async () => {
        try {
            await connector.connect();
            setAccount(connector.accounts[0]);
            setChainId(connector.chainId);

            const provider = new ethers.BrowserProvider(connector);
            const ethersSigner = await provider.getSigner();
            setSigner(ethersSigner);
        } catch (error) {
            console.error('Connection failed:', error);
            throw error;
        }
    };

    const disconnect = async () => {
        try {
            await connector.killSession();
            setAccount(null);
            setChainId(null);
            setSigner(null);
        } catch (error) {
            console.error('Disconnect failed:', error);
        }
    };

    return (
        <Web3Context.Provider
            value={{
                account,
                chainId,
                isConnected: !!account,
                connect,
                disconnect,
                signer,
            }}
        >
            {children}
        </Web3Context.Provider>
    );
};

export const useWeb3 = () => {
    const context = useContext(Web3Context);
    if (!context) {
        throw new Error('useWeb3 must be used within Web3Provider');
    }
    return context;
};
