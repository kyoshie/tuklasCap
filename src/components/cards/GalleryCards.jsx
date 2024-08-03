import React, {useState} from 'react';
import {dataGallery} from '../../data/DataGallery';



const GalleryCards = () => {
    const [galleryCards, setCards] = useState(dataGallery);

  return (
    <div  className="h-[90dvh] w-screen lg:items-center md:items-center lg:flex lg:flex-wrap lg:justify-center md:flex md:flex-wrap md:justify-center grid grid-cols-2 overflow-y-auto lg:overflow-y-scroll gap-2">
        {galleryCards.map((item, index) => (
          <div key={index} className='md:w-[19rem] h-min m-1 transition-transform duration-300 bg-transparent border border-gray-500 rounded-lg shadow-lg hover:-translate-y-2 '>
            <img src={item.image} alt={item.name} className='w-full h-[150px] object-cover rounded-t-lg md:h-[200px] lg:h-[200px]'></img>
            <div>
              <p className='font-bold text-center text-white font-oxygen'>{item.name}</p>
              <p className='text-center text-white lg:text-center'> {item.description}</p>
            </div>
          </div>
        ))}
      </div>
  )
}

export default GalleryCards;