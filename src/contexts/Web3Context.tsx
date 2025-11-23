import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

interface Web3ContextType {
  account: string | null;
  balance: string | null;
  chainId: string | null;
  connectWallet: () => Promise<void>;
  isConnecting: boolean;
  error: string | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

const POLYGON_AMOY_CHAIN_ID = '0x13882'; // 80002 in hex
const POLYGON_AMOY_RPC = 'https://rpc-amoy.polygon.technology/';

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const address = accounts[0].address;
          setAccount(address);
          const bal = await provider.getBalance(address);
          setBalance(ethers.formatEther(bal));
          const network = await provider.getNetwork();
          setChainId('0x' + network.chainId.toString(16));
        }
      } catch (err) {
        console.error("Error checking connection:", err);
      }
    }
  };

  useEffect(() => {
    checkConnection();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', checkConnection);
      window.ethereum.on('chainChanged', checkConnection);
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', checkConnection);
        window.ethereum.removeListener('chainChanged', checkConnection);
      }
    };
  }, []);

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        
        const network = await provider.getNetwork();
        const currentChainId = '0x' + network.chainId.toString(16);
        setChainId(currentChainId);

        if (currentChainId !== POLYGON_AMOY_CHAIN_ID) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: POLYGON_AMOY_CHAIN_ID }],
            });
          } catch (switchError: any) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [
                    {
                      chainId: POLYGON_AMOY_CHAIN_ID,
                      chainName: 'Polygon Amoy Testnet',
                      rpcUrls: [POLYGON_AMOY_RPC],
                      nativeCurrency: {
                        name: 'MATIC',
                        symbol: 'MATIC',
                        decimals: 18,
                      },
                      blockExplorerUrls: ['https://amoy.polygonscan.com/'],
                    },
                  ],
                });
              } catch (addError) {
                setError("Failed to add Polygon Amoy network.");
              }
            } else {
              setError("Failed to switch to Polygon Amoy network.");
            }
          }
        }

        const bal = await provider.getBalance(address);
        setBalance(ethers.formatEther(bal));

      } catch (err: any) {
        setError(err.message || "Failed to connect wallet.");
      } finally {
        setIsConnecting(false);
      }
    } else {
      setError("MetaMask is not installed. Please install it to use this feature.");
      setIsConnecting(false);
    }
  };

  return (
    <Web3Context.Provider value={{ account, balance, chainId, connectWallet, isConnecting, error }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
