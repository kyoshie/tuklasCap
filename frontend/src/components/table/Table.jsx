import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../Modal';
import { BACKEND } from '../constant';


const Table = () => {
    const [artworks, setArtworks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImageCID, setSelectedImageCID] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPendingArtworks();
    }, []);
    
    //for fetching artworks to admin
    const fetchPendingArtworks = async () => {
        try {
            const response = await axios.get(`${BACKEND}/api/admin/artworks`);
            console.log('Fetched artworks:', response.data);
            
            if (response.data.success) {
                setArtworks(response.data.artworks);
            } else {
                setError('Failed to fetch artworks');
            }
        } catch (error) {
            console.error('Error fetching artworks:', error);
            setError('Failed to load artworks');
        } finally {
            setLoading(false);
        }
    };

    //for approval
    const handleApproval = async (dbId, isApproved) => {
        try {
            setLoading(true);
            const adminId = 4; //admin id that is in the database
            
            const response = await axios.patch(
                `${BACKEND}/api/admin/approve/${dbId}`,
                {
                    approved: isApproved,
                    adminId: adminId,
                    reason: isApproved ? 'Artwork meets guidelines' : 'Artwork rejected'
                }
            );

            if (response.data.success) {
                // Update local state to remove approved/rejected artwork
                setArtworks(prevArtworks => 
                    prevArtworks.filter(art => art.dbId !== dbId)
                );
                // Show success message
                alert(isApproved ? 'Artwork approved successfully!' : 'Artwork rejected');
            }
        } catch (error) {
            console.error('Error updating approval:', error);
            alert(error.response?.data?.message || 'Failed to update artwork status');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (cid) => {
        setSelectedImageCID(cid);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedImageCID('');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center w-full p-8">
                <div className="text-lg text-gray-600">Loading artworks...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center w-full p-8">
                <div className="text-lg text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="w-full p-4 overflow-x-auto">
            {artworks.length === 0 ? (
                <div className="flex items-center justify-center w-full p-8">
                    <div className="text-lg text-gray-500">No pending artworks to review</div>
                </div>
            ) : (
                <table className="w-full text-center border-collapse table-auto">
                    <thead>
                        <tr className="text-lg font-bold text-black bg-gray-100">
                            <th className="p-3">Database ID</th>
                            <th className="p-3">Contract ID</th>
                            <th className="p-3">Preview</th>
                            <th className="p-3">Title</th>
                            <th className="p-3">Description</th>
                            <th className="p-3">Artist</th>
                            <th className="p-3">Price (ETH)</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {artworks.map((art) => (
                            <tr key={art.dbId} className="border-b hover:bg-gray-50">
                                <td className="p-3">{art.dbId}</td>
                                <td className="p-3">{art.contractId}</td>
                                <td className="p-3">
                                    <button
                                        onClick={() => openModal(art.imageCID)}
                                        className="text-blue-500 underline hover:text-blue-700"
                                    >
                                        View Image
                                    </button>
                                </td>
                                <td className="p-3">{art.title}</td>
                                <td className="p-3">{art.description}</td>
                                <td className="p-3">{art.artist || 'Anonymous'}</td>
                                <td className="p-3 text-[--orange]">{Number(art.price).toFixed(3)}</td>
                                <td className="p-3">
                                    <div className="flex items-center justify-center gap-2">
                                        <button 
                                            className="px-4 py-1 text-white transition-colors bg-green-500 rounded hover:bg-green-600 disabled:opacity-50"
                                            onClick={() => handleApproval(art.dbId, true)}
                                            disabled={loading}
                                        >
                                            Approve
                                        </button>
                                        <button 
                                            className="px-4 py-1 text-white transition-colors bg-red-500 rounded hover:bg-red-600 disabled:opacity-50"
                                            onClick={() => handleApproval(art.dbId, false)}
                                            disabled={loading}
                                        >
                                            Decline
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {isModalOpen && (
                <Modal onClose={closeModal}>
                    <div className="p-4 bg-white rounded-lg shadow-lg">
                        <img 
                            src={`https://gateway.pinata.cloud/ipfs/${selectedImageCID}`}
                            alt="Artwork Preview"
                            className="max-h-[60vh] w-auto object-contain rounded-lg"
                            onError={(e) => {
                                console.error('Error loading image:', selectedImageCID);
                                e.target.src = '/placeholder.png';
                            }}
                        />
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Table;