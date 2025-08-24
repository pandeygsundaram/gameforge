"use client";
import { gameClient } from '@/service/gameClient';
import { useState, useEffect } from 'react';

// Define the type for the wallet state
type WalletState = {
  isConnected: boolean;
  address?: string;
  balance?: string;
};

const WalletConnectButton = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
  });

  // Function to connect wallet
  const connectWallet = async () => {
    try {
      // Check if Core wallet is available
      if ((window as any).ethereum) {
        // Request account access
        const accounts = await (window as any).ethereum.request({ 
          method: 'eth_requestAccounts' 
        });

        // Get the first account
        const address = accounts[0];

        // Optionally get balance (example with error handling)
        let balance = 'N/A';
        try {
          const balanceWei = await (window as any).ethereum.request({
            method: 'eth_getBalance',
            params: [address, 'latest']
          });
          
          // Convert balance from wei to ETH
          balance = (parseInt(balanceWei, 16) / 1e18).toFixed(4) + ' ETH';
        } catch (balanceError) {
          console.error('Could not fetch balance', balanceError);
        }

        // Update wallet state
        setWalletState({
          isConnected: true,
          address: address,
          balance: balance
        });

        // emit event to backend socket
        gameClient.connectWallet(address);

        console.log('🚀 Wallet Connected:', address);
      } else {
        // Core wallet not detected
        alert('Please install Core Wallet!');
      }
    } catch (error) {
      console.error('Wallet Connection Error:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  // Disconnect wallet function
  const disconnectWallet = () => {
    setWalletState({ isConnected: false });
    console.log('🔌 Wallet Disconnected');
  };

  // Effect to check initial wallet connection
  useEffect(() => {
    const checkWalletConnection = async () => {
      if ((window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({ 
            method: 'eth_accounts' 
          });
          
          if (accounts.length > 0) {
            setWalletState({
              isConnected: true,
              address: accounts[0]
            });
          }
        } catch (error) {
          console.error('Initial wallet check failed', error);
        }
      }
    };

    checkWalletConnection();
  }, []);

  // Render wallet connection button
  return (
    <div className="wallet-connect-container">
      {!walletState.isConnected ? (
        <button 
          onClick={connectWallet}
          className="bg-black text-green-400 px-6 py-2 rounded-lg border-2 border-green-400 hover:bg-green-400 hover:text-black transition-all duration-300"
          style={{
            fontFamily: 'monospace',
            textShadow: '0 0 5px currentColor',
            boxShadow: '0 0 10px rgba(0,255,0,0.5)'
          }}
        >
          🕹️ CONNECT WALLET
        </button>
      ) : (
        <div 
          className="bg-black text-green-400 px-6 py-2 rounded-lg border-2 border-green-400 flex items-center space-x-4"
          style={{
            fontFamily: 'monospace',
            textShadow: '0 0 5px currentColor',
          }}
        >
          <span>🎮 {walletState.address?.substring(0, 6)}...{walletState.address?.substring(38)}</span>
          {walletState.balance && (
            <span className="text-yellow-400">💰 {walletState.balance}</span>
          )}
          <button 
            onClick={disconnectWallet}
            className="ml-4 text-red-400 hover:text-red-600 transition-colors"
          >
            ✖️
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnectButton;