import React from 'react';
import Cards from '../components/cards/Cards';


const Marketplace = () => {
  return (
   <div className='bg-[#222831] h-[100vh] w-[100vw] overflow-y-hidden '>
        <div className='h-[90dvh] overflow-y-scroll p-[2em] lg:flex lg:flex-wrap lg:justify-center md:flex md:flex-wrap md:justify-center grid grid-cols-2'>
                  <Cards/>
                  <Cards/>
        </div>
       
    </div>
  )
}

export default Marketplace


