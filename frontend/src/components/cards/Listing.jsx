import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MarketplaceCards = () => {
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  const fetchMarketplaceData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/arts/marketplace');

      if (response.data.success) {
        setMarketplaceItems(response.data.listings);
      } else {
        setError(response.data.message || 'Failed to fetch marketplace items');
      }
    } catch (error) {
      console.error('Error details:', error);
      setError(error.response?.data?.message || 'Failed to load marketplace data');
    }
  };

  const handleBuy = async (itemId) => {
    try {
      setProcessingId(itemId);
      const walletAddress = localStorage.getItem('walletAddress');

      if (!walletAddress) {
        throw new Error('Please connect your wallet first');
      }

      const response = await axios.post(`http://localhost:5000/api/arts/marketplace/buy/${itemId}`, {
        walletAddress
      });

      if (response.data.success) {
        alert('NFT purchased successfully!');
        fetchMarketplaceData(); // Refresh the list
      }
    } catch (error) {
      console.error('Error purchasing NFT:', error);
      alert(error.response?.data?.message || 'Failed to purchase NFT');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (price) => {
    return (
      <span className="px-2 py-1 text-xs text-blue-800 bg-blue-200 rounded-full">
        {`${Number(price).toFixed(3)} ETH`}
      </span>
    );
  };

  return (
    <div className="h-[90dvh] w-screen lg:items-center md:items-center lg:flex lg:flex-wrap lg:justify-center md:flex md:flex-wrap md:justify-center grid grid-cols-2 overflow-y-auto lg:overflow-y-scroll gap-2">
      {error && (
        <div className="w-full p-4 text-center text-red-600 bg-red-100 rounded">
          {error}
        </div>
      )}
      
      {marketplaceItems && marketplaceItems.length > 0 ? (
        marketplaceItems.map((item) => (
          <div key={item.id} className='md:w-[19rem] h-min m-1 transition-transform duration-300 bg-transparent border border-gray-500 rounded-lg shadow-lg'>
            <img 
              src={`https://gateway.pinata.cloud/ipfs/${item.artwork.imageCID}`} 
              alt={item.artwork.title} 
              onError={(e) => { 
                e.target.src = '/placeholder.png'; 
              }}
              className='w-full h-[150px] object-cover rounded-t-lg md:h-[200px] lg:h-[200px]' 
            />
            <div className="p-4">
              <h3 className='mb-2 font-bold text-center text-white font-oxygen'>
                {item.artwork.title}
              </h3>
              <p className='mb-2 text-center text-white lg:text-center'>
                {item.artwork.description}
              </p>
              <div className='mb-2 text-center text-white'>
                <p className='text-sm'>Artist: {item.artwork.artist}</p>
                <p className='text-sm'>Token ID: #{item.tokenId}</p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                {getStatusBadge(item.price)}
                <button 
                  className={`bg-[--orange] w-[120px] text-white justify-center rounded-md shadow-md text-center hover:bg-[--orange-hover] transition-all p-2 font-customFont
                    ${processingId === item.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => handleBuy(item.id)}
                  disabled={processingId === item.id}
                >
                  {processingId === item.id ? 'Processing...' : 'Buy Now'}
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="flex items-center justify-center w-full h-full">
          <p className='text-xl text-white'>No NFTs available in the marketplace.</p>
        </div>
      )}
    </div>
  );
};

export default MarketplaceCards;