import React, { useState } from 'react';
import { data } from '../../data/Data';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';

const Cards = () => {
  const [cards, setCards] = useState(data);

  return (
      <div  className="h-[90dvh] w-screen lg:items-center md:items-center lg:flex lg:flex-wrap lg:justify-center md:flex md:flex-wrap md:justify-center grid grid-cols-2 overflow-y-auto lg:overflow-y-scroll gap-2">
        {cards.map((item, index) => (
          <div key={index} className='md:w-[19rem] h-min m-1 transition-transform duration-300 bg-transparent border border-gray-500 rounded-lg shadow-lg '>
            <img src={item.image} alt={item.name} className='w-full h-[150px] object-cover rounded-t-lg md:h-[200px] lg:h-[200px]'></img>
            <div>
              <p className='font-bold text-center text-white font-oxygen'>{item.name}</p>
              <p className='text-white lg:text-center'> {item.description}</p>
              
             <div className='flex py-1 mb-1 lg:justify-center'>
               <p className='mr-5 ml-2 text-[--orange] font-bold mt-[5px]'>{item.price}</p>
               <button className='ml-auto mr-2 bg-[--blue] w-[120px] hover:bg-[--blue-hover] transition-all inline-block justify-center 
                text-white font-customFont rounded-md lg:ml-0 shadow-md border-none cursor-pointer gap-[8px] p-1'>
                 <FontAwesomeIcon icon={faShoppingCart} className='mr-3'/>Buy
                </button>
             </div>
             
            </div>
          </div>
        ))}
      </div>
    
  );
};

export default Cards