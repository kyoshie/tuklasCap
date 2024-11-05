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

        console.log('Fetching data for wallet:', walletAddress);
        
        const response = await axios.get(`http://localhost:5000/api/arts/fetch/${walletAddress}`);

        console.log('API Response:', response.data);

        if (response.data.success) {
          setGalleryData(response.data.artworks);
          console.log('Created artworks:', response.data.artworks.created);
          console.log('Purchased artworks:', response.data.artworks.purchased);
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

  // Debug current state
  useEffect(() => {
    console.log('Current gallery data:', galleryData);
    console.log('Active tab:', activeTab);
    console.log('Current displayed artworks:', activeTab === 'created' ? galleryData.created : galleryData.purchased);
  }, [galleryData, activeTab]);

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
        // Update the local state to change the button
        setGalleryData(prevData => ({
          ...prevData,
          created: prevData.created.map(card =>
            card.dbId === dbId
              ? { 
                  ...card, 
                  pendingApproval: true,
                  approvalStatus: 'pending'
                }
              : card
          )
        }));
        // Show success message
        alert('Artwork submitted for approval successfully!');
      }
    } catch (error) {
      console.error('Error submitting for approval:', error);
      alert(error.response?.data?.message || 'Failed to submit artwork for approval');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (artwork) => {
    if (artwork.isMinted) return (
      <span className="px-2 py-1 text-xs text-green-800 bg-green-200 rounded-full">
        Minted
      </span>
    );
    if (artwork.pendingApproval) return (
      <span className="px-2 py-1 text-xs text-yellow-800 bg-yellow-200 rounded-full">
        Pending Approval
      </span>
    );
    return null;
  };

  const displayArtworks = activeTab === 'created' ? galleryData.created : galleryData.purchased;

  return (
    <div className="flex flex-col h-[90dvh] w-screen">
      {/* Tab buttons */}
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
                  {activeTab === 'created' && (
                    <button 
                      className={`bg-[--blue] w-[120px] text-white justify-center rounded-md shadow-md text-center hover:bg-[--blue-hover] transition-all p-2 font-customFont
                        ${processingId === item.dbId ? 'opacity-50 cursor-not-allowed' : ''}
                        ${(item.pendingApproval || item.isMinted) ? 'opacity-50 cursor-not-allowed bg-gray-500 hover:bg-gray-500' : ''}`}
                      onClick={() => handleSell(item.dbId)}
                      disabled={processingId === item.dbId || item.pendingApproval || item.isMinted}
                    >
                      {processingId === item.dbId ? 'Processing...' : 
                       item.isMinted ? 'Minted' :
                       item.pendingApproval ? 'Pending' : 'Sell'}
                    </button>
                  )}
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