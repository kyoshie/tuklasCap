import React, { useState } from 'react';
import { ReactTyped } from 'react-typed';
import { BACKEND } from '../constant';


const Intro = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const connectWallet = async () => {
        if (window.ethereum) {
            setLoading(true); 
            setError(''); 
            try {
                // Request account access
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                const walletAddress = accounts[0];
                console.log("Connected to MetaMask with address:", walletAddress);

                // Save wallet address to local storage
                localStorage.setItem('walletAddress', walletAddress);

                // Logging before fetch
                console.log("Attempting to save wallet address:", walletAddress);

                // Fetch request to save the wallet address
                const response = await fetch(`${BACKEND}/api/saveWallet`, {
                    method: 'POST', // Ensure this matches the route definition
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ walletAddress }) // Sending the wallet address in the body
                });

                // Check the response from the server
                if (response.ok) {
                    const result = await response.json();
                    console.log("Wallet address saved successfully!", result);

                    // Check if the user is admin
                    const checkAdminResponse = await fetch(`${BACKEND}/api/checkAdmin`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ walletAddress })
                    });

                    if (checkAdminResponse.ok) {
                        const { isAdmin } = await checkAdminResponse.json();
                        if (isAdmin) {
                            console.log("User is admin, redirecting...");
                            window.location.href = '/admin';
                        } else {
                            window.location.href = '/home';
                        }
                    } else {
                        setError("Failed to check admin status.");
                    }

                } else {
                    const errorData = await response.json();
                    setError("Failed to save wallet address: " + errorData.error);
                    console.error("Failed to save wallet address. Error:", errorData);
                }
            } catch (error) {
                setError("Error connecting to wallet or interacting with the server: " + error.message);
                console.error("Error connecting to wallet or interacting with the server:", error);
            } finally {
                setLoading(false); 
            }
        } else {
            setError('Please install MetaMask.');
        }
    };
    //front end code using css
    return (
        <div className='text-white'>
            <div className='max-w-[800px] my-[-120px] w-full mx-auto text-center flex flex-col justify-center mt-[170px] lg:my-10 xl:my-32'>
                <p className='text-[--orange] font-bold p-2 xl:text-xl'>DISCOVERING THE BEAUTY OF ARTS</p>
                <h1 className='text-4xl font-bold md:text-7xl sm:text-6xl md:py-6 '>Tuklas Art Gallery</h1>

                <div className='flex items-center justify-center'>
                    <p className='py-4 text-xl font-bold md:text-3xl sm:text-4xl'>Explore the World of Art and</p>
                    <ReactTyped className='pl-2 text-lg text-[--orange] md:text-3xl sm:text-4xl font-bold'
                        strings={['Discover', 'Create', 'Own']} typeSpeed={90} backSpeed={100} loop />
                </div>
                <p className='text-lg font-bold text-gray-400 md:text-xl'>Grab the Opportunity to Discover, Create, and Own Arts through NFT.</p>

                {error && <p className='text-red-500'>{error}</p>} 
                <button 
                    className='text-xl hover:bg-[--blue-hover] transition ease-in w-[200px] bg-[--blue] font-medium my-6 mx-auto rounded-md py-2' 
                    onClick={connectWallet}
                    disabled={loading} 
                >
                    {loading ? 'Connecting...' : 'Connect Wallet'}
                </button>
            </div>
        </div>
    );
}

export default Intro;