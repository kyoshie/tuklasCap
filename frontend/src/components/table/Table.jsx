import React, { useState } from 'react';

const Table = () => {
    const initialArtworks = [
        { id: 1, cid: '12asdfr23', title: 'Tuklas', description: 'Art about Gojo', artist: 'Joshua', price: '0.01ETH', approved: null },
        { id: 2, cid: '34sadk342', title: 'Enigma', description: 'Abstract Art', artist: 'Samantha', price: '0.02ETH', approved: null },
    ];

    const [artworks, setArtworks] = useState(initialArtworks);


    const handleApproval = (id, isApproved) => {
        setArtworks(artworks.map(art => 
            art.id === id ? { ...art, approved: isApproved } : art
        ));
    };

    return (
        <div className="overflow-x-auto text-black">
            <table className="table w-full text-center table-s">
                <thead>
                    <tr className='text-lg font-bold text-black'>
                        <th>Art ID</th>
                        <th>Art Cid</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Artist Name</th>
                        <th>Price</th>
                        <th>Actions</th> 
                    </tr>
                </thead>
                <tbody>
                    {artworks.map((art) => (
                        <tr key={art.id}>
                            <th>{art.id}</th>
                            <th>{art.cid}</th>
                            <td>{art.title}</td>
                            <td>{art.description}</td>
                            <td>{art.artist}</td>
                            <td className='text-[--orange]'>{art.price}</td>
                            <td>
                                {art.approved === null ? (
                                    <>
                                        <button 
                                            className="px-4 py-1 mr-2 text-white bg-green-500 rounded" 
                                            onClick={() => handleApproval(art.id, true)}
                                        >
                                            Approve
                                        </button>
                                        <button 
                                            className="px-4 py-1 text-white bg-red-500 rounded" 
                                            onClick={() => handleApproval(art.id, false)}
                                        >
                                            Decline
                                        </button>
                                    </>
                                ) : art.approved ? (
                                    <span className="font-bold text-green-500">Approved</span>
                                ) : (
                                    <span className="font-bold text-red-500">Declined</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Table;
