import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GalleryCards = () => {
  const [galleryCards, setGalleryCards] = useState([]); // Initialize as an empty array
  const [loading, setLoading] = useState(true); // Add a loading state
  const [error, setError] = useState(null); // Add an error state

  useEffect(() => {
    // Fetch uploaded artwork from the backend
    const fetchGalleryData = async () => {
      try {
        const response = await axios.get('/api/arts/fetch'); // Update the endpoint here
        console.log("API Response:", response.data); // Log the response
        setGalleryCards(response.data.artworks);
      } catch (error) {
        console.error("Error fetching gallery data:", error);
        setError(error.response?.data?.message || "Failed to load gallery data.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchGalleryData();
  }, []);

  // Render a loading or error message if needed
  if (loading) {
    return <p>Loading artworks...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>; // Styled error message
  }

  return (
    <div className="h-[90dvh] w-screen lg:items-center md:items-center lg:flex lg:flex-wrap lg:justify-center md:flex md:flex-wrap md:justify-center grid grid-cols-2 overflow-y-auto lg:overflow-y-scroll gap-2">
      {galleryCards && galleryCards.length > 0 ? (
        galleryCards.map((item) => (
          <div key={item.id} className='md:w-[19rem] h-min m-1 transition-transform duration-300 bg-transparent border border-gray-500 rounded-lg shadow-lg'>
            <img 
              src={`https://gateway.pinata.cloud/ipfs/${item.imageCID}`} 
              alt={item.title} 
              onError={(e) => { e.target.src = 'path/to/placeholder/image.png'; }} // Placeholder image on error
              className='w-full h-[150px] object-cover rounded-t-lg md:h-[200px] lg:h-[200px]' 
            />
            <div>
              <p className='font-bold text-center text-white font-oxygen'>{item.title}</p>
              <p className='text-center text-white lg:text-center'>{item.description}</p>
              <p className='text-center text-white lg:text-center'>{item.price} ETH</p>
            </div>
            <button 
              className='bg-[--blue] w-[120px] text-white justify-center rounded-md shadow-md text-center ml-[55px] my-3 md:ml-[90px] hover:bg-[--blue-hover] transition-all p-1 font-customFont'
              onClick={() => handleSell(item.id)} // Assuming handleSell is defined
            >
              Sell
            </button>
          </div>
        ))
      ) : (
        <p className='text-white'>No artworks available.</p>
      )}
    </div>
  );
};

// Add the handleSell function (define its logic according to your requirements)
const handleSell = (artworkId) => {
  console.log("Sell button clicked for artwork:", artworkId);
  // Add your sell logic here
};

export default GalleryCards;
