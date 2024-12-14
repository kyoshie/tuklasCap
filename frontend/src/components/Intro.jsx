import React, { useState, useEffect } from 'react';
import { ReactTyped } from 'react-typed';
import { ethers } from 'ethers';
import { BACKEND } from '../constant';
import { useNavigate } from 'react-router-dom'; 

const Intro = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate(); 

    // Check if user is already authenticated
    useEffect(() => {
        const token = localStorage.getItem('token');
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
        if (token && window.location.pathname === '/admin' && !isAdmin) {
            window.location.href = '/';
        }

       
    }, []);
    const connectWallet = async () => {
        if (!window.ethereum) {
            setError('Please install MetaMask to connect your wallet.');
            return;
        }
    
        setLoading(true);
        setError('');
    
        try {
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const walletAddress = accounts[0];
            console.log('Connected wallet address:', walletAddress);
            
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            
            // Get nonce from server
            console.log('Requesting nonce for wallet:', walletAddress);
            const nonceResponse = await fetch(`${BACKEND}/api/auth/nonce/${walletAddress}`);
            if (!nonceResponse.ok) {
                throw new Error('Failed to get nonce');
            }
            const nonceData = await nonceResponse.json();
            console.log('Received nonce data:', nonceData);
    
            // Get user to sign the message
            const signature = await signer.signMessage(nonceData.message);
            console.log('Got signature:', signature);
    
            // Log the data we're about to send
            const authData = {
                walletAddress,
                signature,
                message: nonceData.message
            };
            console.log('Sending auth data:', authData);
    
            // Authenticate with the server
            const authResponse = await fetch(`${BACKEND}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(authData)
            });
    
            console.log('Auth response status:', authResponse.status);
            const responseData = await authResponse.json();
            console.log('Auth response data:', responseData);
    
            if (!authResponse.ok) {
                throw new Error(responseData.error || 'Authentication failed');
            }
    
            // Save and verify auth data
            localStorage.setItem('token', responseData.token);
            localStorage.setItem('walletAddress', walletAddress);
            localStorage.setItem('isAdmin', responseData.isAdmin);
    
            // Verify data was saved
            console.log('Saved authentication data:', {
                token: localStorage.getItem('token'),
                walletAddress: localStorage.getItem('walletAddress'),
                isAdmin: localStorage.getItem('isAdmin')
            });
    
            // Add a small delay to ensure storage is complete
            await new Promise(resolve => setTimeout(resolve, 100));
    
            // Redirect based on role
            if (responseData.isAdmin) {
                console.log('Redirecting to admin...');
                navigate('/admin', { replace: true });
            } else {
                console.log('Redirecting to home...');
                navigate('/home', { replace: true });
            }
    
        } catch (error) {
            console.error('Authentication error:', {
                message: error.message,
                stack: error.stack
            });
            setError(error.message || 'Failed to connect wallet');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='text-white'>
            <div className='max-w-[800px] my-[-120px] w-full mx-auto text-center flex flex-col justify-center mt-[170px] lg:my-10 xl:my-32'>
                <p className='text-[--orange] font-bold p-2 xl:text-xl'>
                    DISCOVERING THE BEAUTY OF ARTS
                </p>
                <h1 className='text-4xl font-bold md:text-7xl sm:text-6xl md:py-6'>
                    Tuklas Art Gallery
                </h1>

                <div className='flex items-center justify-center'>
                    <p className='py-4 text-xl font-bold md:text-3xl sm:text-4xl'>
                        Explore the World of Art and
                    </p>
                    <ReactTyped
                        className='pl-2 text-lg text-[--orange] md:text-3xl sm:text-4xl font-bold'
                        strings={['Discover', 'Create', 'Own']}
                        typeSpeed={90}
                        backSpeed={100}
                        loop
                    />
                </div>

                <p className='text-lg font-bold text-gray-400 md:text-xl'>
                    Grab the Opportunity to Discover, Create, and Own Arts through NFT.
                </p>

                {error && (
                    <p className='mt-4 mb-2 text-red-500'>{error}</p>
                )}

                <button
                    className='text-xl hover:bg-[--blue-hover] transition ease-in w-[200px] bg-[--blue] font-medium my-6 mx-auto rounded-md py-2 disabled:opacity-50 disabled:cursor-not-allowed'
                    onClick={connectWallet}
                    disabled={loading}
                >
                    {loading ? 'Connecting...' : 'Connect Wallet'}
                </button>
            </div>
        </div>
    );
};

export default Intro;
