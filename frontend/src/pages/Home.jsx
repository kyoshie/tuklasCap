import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Navigate } from 'react-router-dom';
import Welcome from '../components/Welcome';

const Home = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true); 

  useEffect(() => {
    const checkMetaMaskConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setIsConnected(true);
          } else {
            setIsConnected(false);
          }
        } catch (error) {
          console.error('Error checking MetaMask connection:', error);
          setIsConnected(false);
        }
      } else {
        console.log('MetaMask is not installed');
        setIsConnected(false);
      }
      setIsChecking(false); 
    };

    checkMetaMaskConnection();
  }, []);

  
  if (isChecking) {
    return <div>Loading...</div>; 
  }

  if (isConnected) {
    return <Welcome />;
  }

  return <Navigate to="/" />;
};

export default Home;
