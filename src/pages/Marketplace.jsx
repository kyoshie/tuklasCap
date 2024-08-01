import React from 'react';
import Cards from '../components/cards/Cards';


const Marketplace = () => {
  return (
   <div className='bg-[#222831] h-[100vh] w-[100vw] overflow-y-hidden'>
    <h1 className='text-[--orange] font-bold text-3xl text-center font-oxygen md:text-4xl lg:text-4xl'>Tuklas Art Marketplace</h1>
        <div className='h-[90dvh] overflow-y-scroll p-[2em]'>
                  <Cards/>
                 <Cards/>
                 <Cards/>
                 <Cards/>
        </div>
       
    </div>
  )
}

export default Marketplace


