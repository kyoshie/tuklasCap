import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GalleryCards = () => {
  const [galleryData, setGalleryData] = useState({ created: [], purchased: [] });
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [activeTab, setActiveTab] = useState('created');

  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        const walletAddress = localStorage.getItem('walletAddress');
        
        if (!walletAddress) {
          setError('Please connect your wallet');
          return;
        }
        
        const response = await axios.get(`http://localhost:5000/api/arts/fetch/${walletAddress}`);

        if (response.data.success) {
          setGalleryData(response.data.artworks);
        } else {
          setError(response.data.message || 'Failed to fetch artworks');
        }
      } catch (error) {
        console.error('Error details:', error);
        setError(error.response?.data?.message || 'Failed to load gallery data');
      }
    };

    fetchGalleryData();
  }, []);

  const isOwner = (artwork) => {
    const currentWallet = localStorage.getItem('walletAddress');
    return currentWallet?.toLowerCase() === artwork.ownerWallet?.toLowerCase();
  };

  const handleSell = async (dbId) => {
    try {
      setProcessingId(dbId);
      const walletAddress = localStorage.getItem('walletAddress');
  
      if (!walletAddress) {
        throw new Error('Please connect your wallet first');
      }
  
      const response = await axios.put(`http://localhost:5000/api/arts/approval/${dbId}`, {
        walletAddress
      });

      if (response.data.success) {
        setGalleryData(prevData => ({
          ...prevData,
          created: prevData.created.map(card =>
            card.dbId === dbId
              ? { 
                  ...card, 
                  pendingApproval: true,
                  approvalStatus: 'pending',
                }
              : card
          )
        }));
        alert('Artwork submitted for approval successfully!');
      }
    } catch (error) {
      console.error('Error submitting for approval:', error);
      alert(error.response?.data?.message || 'Failed to submit artwork for approval');
    } finally {
      setProcessingId(null);
    }
  };

  const handleBuy = async (artwork) => {
    if (isOwner(artwork)) {
      alert("You cannot purchase your own artwork");
      return;
    }
    // Your existing buy logic here
  };
  
  const getStatusBadge = (artwork) => {
    if (artwork.isSold) return (
      <span className="px-3 py-1.5 text-sm font-medium text-purple-800 bg-purple-200 rounded-full">
        Sold
      </span>
    );
    
    if (artwork.isMinted && !isOwner(artwork)) return (
      <span className="px-3 py-1.5 text-sm font-medium text-green-800 bg-green-200 rounded-full">
        Available
      </span>
    );

    if (artwork.isMinted && isOwner(artwork)) return (
      <span className="px-3 py-1.5 text-sm font-medium text-green-800 bg-green-200 rounded-full">
        Minted
      </span>
    );

    if (artwork.approvalStatus === 'rejected') {
      return (
        <div className="flex flex-col items-center gap-2">
          <span className="px-3 py-1.5 text-sm font-medium text-red-800 bg-red-200 rounded-full inline-flex items-center gap-1.5 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            Rejected
          </span>
          {artwork.reason && (
            <div className="px-4 py-2 mt-1 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg max-w-[250px]">
              {artwork.reason}
            </div>
          )}
        </div>
      );
    }

    if (artwork.pendingApproval) return (
      <span className="px-3 py-1.5 text-sm font-medium text-yellow-800 bg-yellow-200 rounded-full">
        Pending Approval
      </span>
    );

    return null;
  };

  const getSellButton = (item) => {
    if (item.isSold || item.approvalStatus === 'rejected') return null;
    
    if (item.isMinted) return (
      <button 
        className="bg-gray-500 w-[120px] text-white justify-center rounded-md shadow-md text-center p-2 font-customFont opacity-50 cursor-not-allowed"
        disabled
      >
        Minted
      </button>
    );
    
    if (item.pendingApproval) return (
      <button 
        className="bg-gray-500 w-[120px] text-white justify-center rounded-md shadow-md text-center p-2 font-customFont opacity-50 cursor-not-allowed"
        disabled
      >
        Pending
      </button>
    );

    return (
      <button 
        className={`bg-[--blue] w-[120px] text-white justify-center rounded-md shadow-md text-center hover:bg-[--blue-hover] transition-all p-2 font-customFont
          ${processingId === item.dbId ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => handleSell(item.dbId)}
        disabled={processingId === item.dbId}
      >
        {processingId === item.dbId ? 'Processing...' : 'Sell'}
      </button>
    );
  };

  const getBuyButton = (item) => {
    if (item.isSold) return null;

    if (isOwner(item)) {
      return (
        <button 
          className="bg-gray-500 w-[120px] text-white justify-center rounded-md shadow-md text-center p-2 font-customFont opacity-50 cursor-not-allowed"
          disabled
          title="You cannot buy your own artwork"
        >
          Your Artwork
        </button>
      );
    }

    return (
      <button 
        className="bg-[--blue] w-[120px] text-white justify-center rounded-md shadow-md text-center hover:bg-[--blue-hover] transition-all p-2 font-customFont"
        onClick={() => handleBuy(item)}
      >
        Buy Now
      </button>
    );
  };

  const displayArtworks = activeTab === 'created' ? galleryData.created : galleryData.purchased;

  return (
    <div className="flex flex-col h-[90dvh] w-screen">
      <div className="flex justify-center gap-4 mb-4">
        <button
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'created'
              ? 'bg-[--blue] text-white'
              : 'bg-transparent text-white border border-[--blue]'
          }`}
          onClick={() => setActiveTab('created')}
        >
          Created Artworks
        </button>
        <button
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'purchased'
              ? 'bg-[--blue] text-white'
              : 'bg-transparent text-white border border-[--blue]'
          }`}
          onClick={() => setActiveTab('purchased')}
        >
          Purchased Artworks
        </button>
      </div>

      <div className="grid flex-1 grid-cols-2 gap-2 overflow-y-auto lg:items-center md:items-center lg:flex lg:flex-wrap lg:justify-center md:flex md:flex-wrap md:justify-center lg:overflow-y-scroll">
        {error && (
          <div className="w-full p-4 text-center text-red-600 bg-red-100 rounded">
            {error}
          </div>
        )}
        
        {displayArtworks && displayArtworks.length > 0 ? (
          displayArtworks.map((item) => (
            <div key={item.dbId} className='md:w-[19rem] h-min m-1 transition-transform duration-300 bg-transparent border border-gray-500 rounded-lg shadow-lg'>
              <img 
                src={`https://gateway.pinata.cloud/ipfs/${item.imageCID}`} 
                alt={item.title} 
                onError={(e) => { 
                  e.target.src = '/placeholder.png'; 
                }}
                className='w-full h-[150px] object-cover rounded-t-lg md:h-[200px] lg:h-[200px]' 
              />
              <div className="p-4">
                <h3 className='mb-2 font-bold text-center text-white font-oxygen'>{item.title}</h3>
                <p className='mb-2 text-center text-white lg:text-center'>{item.description}</p>
                <p className='mb-4 text-center text-white lg:text-center'>
                  <span className='text-[--orange] text-bold'>{Number(item.price).toFixed(3)} ETH</span>
                </p>
                {activeTab === 'purchased' && (
                  <p className='mb-2 text-sm text-center text-gray-400'>
                    Created by: {item.artist}
                  </p>
                )}
                <div className="flex flex-col items-center space-y-2">
                  {getStatusBadge(item)}
                  {activeTab === 'created' ? getSellButton(item) : getBuyButton(item)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <p className='text-xl text-white'>
              {activeTab === 'created' 
                ? "You haven't created any artworks yet."
                : "You haven't purchased any artworks yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryCards;
