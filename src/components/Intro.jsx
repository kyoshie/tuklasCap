import React from 'react';
import { ReactTyped } from "react-typed";



const Intro = () => {
    const connectWallet = async () => {
        if (window.ethereum) {
            try {
    
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                console.log("Connected to MetaMask!");  
                 window.location.href = '/home';
             } catch (error) {
                console.error(error);
             }
    }       else {
            console.log('Use MetamaskWallet');
  }
}

    return (
        <div className='text-white'>
            <div className='max-w-[800px] my-[-120px] w-full  mx-auto text-center flex flex-col justify-center mt-[170px] lg:my-10 xl:my-32'>
                <p className='text-[--orange] font-bold p-2 xl:text-xl' >DISCOVERING THE BEAUTY OF ARTS</p>
                <h1 className='text-4xl font-bold md:text-7xl sm:text-6xl md:py-6 '>Tuklas Art Gallery</h1>

                <div className='flex items-center justify-center'>
                    <p className='py-4 text-xl font-bold md:text-3xl sm:text-4xl'>Explore the World of Art and</p>
                    <ReactTyped className='pl-2 text-lg text-[--orange] md:text-3xl sm:text-4xl font-bold'
                     strings={['Discover', 'Create', 'Own']} typeSpeed ={90} backSpeed={100} loop/>
                </div>
                <p className='text-lg font-bold text-gray-400 md:text-xl'>Grab the Opportunity to Discover, Create, and Own Arts through NFT.</p>
                <button className ='text-xl hover:bg-[--blue-hover] transition ease-in w-[200px] bg-[--blue] font-medium my-6
                mx-auto rounded-md py-2' onClick={connectWallet}>Connect Wallet</button>
            </div>
           
        </div>
    )
}


export default Intro
