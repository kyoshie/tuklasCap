import React from 'react';
import { ReactTyped } from "react-typed";


const Hero = () => {
    return (
        <div className='text-white'>
            <div className='max-w-[800px] my-[-120px] w-full h-screen mx-auto text-center flex flex-col justify-center'>
                <p className='text-[--orange] font-bold p-2' >DISCOVERING THE BEAUTY OF ARTS</p>
                <h1 className='text-4xl font-bold md:text-7xl sm:text-6xl md:py-6 '>Tuklas Art Gallery.</h1>

                <div className='flex items-center justify-center'>
                    <p className='py-4 text-xl font-bold md:text-3xl sm:text-4xl'>Explore the World of Art and</p>
                    <ReactTyped className='pl-2 text-lg text-[--orange] md:text-3xl sm:text-4xl font-bold'
                     strings={['Discover', 'Create', 'Own']} typeSpeed ={100} backSpeed={110} loop/>
                </div>
                <p className='text-lg font-bold text-gray-300 md:text-xl'>Grab the Opportunity to Discover, Create, and Own Arts through NFT.</p>
                <button className='bg-[--blue] w-[150px] rounded-md font-medium my-6 mx-auto py-3 hover:bg-[--blue-hover] transition ease-in md:w-[200px] 
                font-sans inline-block'>Connect Wallet</button>
            </div>
        </div>
    )
}


export default Hero
