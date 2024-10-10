import React from 'react';
import Transact from '../components/table/Transact';


const Transaction = () => {
    return(
        <div className='bg-[--background] w-full min-h-screen overflow-y-hidden'>
            <h1 className= "py-3 text-xl text-center text-white md:text-3xl">Transaction History</h1>
        
            <Transact/>
        </div>

    );
}

export default Transaction