import React, { useState } from 'react';
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';

const Homenav = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('walletAddress');
        console.log('User logged out and MetaMask disconnected');
        navigate('/');
    };

    const [nav, setNav] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false); // State for profile modal

    const handleNav = () => {
        setNav(!nav);
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const toggleProfileModal = () => {
        setIsProfileOpen(!isProfileOpen);
    };

    return (
        <div className='sticky top-0 left-0 z-10 bg-[#222831] flex text-white justify-between items-center h-20 w-full mx-auto px-4 font-customFont cursor-pointer lg:px-[10%]'>
            <h1 className='w-full text-3xl font-bold text-[--orange]'>Tuklas Art Gallery</h1>

            <ul className='hidden md:flex'>
                <li className='p-4 text-xl hover:text-[--orange] transition ease-in'>
                    <a href='/home' className={location.pathname === '/home' ? 'text-[--orange]' : ''}>Home</a>
                </li>
                <li className='p-4 text-xl hover:text-[--orange] transition ease-in'>
                    <a href='/gallery' className={location.pathname === '/gallery' ? 'text-[--orange]' : ''}>Gallery</a>
                </li>
                <li className='p-4 text-xl hover:text-[--orange] transition ease-in'>
                    <a href='/create' className={location.pathname === '/create' ? 'text-[--orange]' : ''}>Create</a>
                </li>
                <li className='p-4 text-xl hover:text-[--orange] transition ease-in'>
                    <a href='/marketplace' className={location.pathname === '/marketplace' ? 'text-[--orange]' : ''}>Marketplace</a>
                </li>
            </ul>

            <div className="relative inline-block text-left">
                <button onClick={toggleDropdown} className="flex items-center w-10 h-10 space-x-2">
                    <img className="object-cover w-10 h-10 rounded-full md:rounded-full" src="arts.jpg" alt="User" />
                </button>
                             
                {isOpen && (
                    <div className="absolute right-0 w-48 mt-2 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                            <button
                                onClick={toggleProfileModal}
                                className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                            >
                                Profile
                            </button>
                            <a href="/transaction" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                Transaction History
                            </a>
                            <button
                                onClick={handleLogout}
                                className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Profile Modal */}
            {isProfileOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-11/12 max-w-md p-6 bg-white rounded-lg shadow-lg">
                        <div className="flex justify-end">
                            <button
                                onClick={toggleProfileModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="text-center">
                            <img
                                className="w-24 h-24 mx-auto mb-4 rounded-full"
                                src="arts.jpg" 
                                alt="Profile"
                            />
                            <h2 className="mb-2 text-xl font-bold text-black">Kyoshie.Love.Den</h2>
                            <p className="mb-2 text-gray-600">Wallet Address: 0x123...456</p>
                            <p className="mb-4 text-gray-600">I am Gojo Satoru</p>
                            <button
                                className="px-4 py-2 text-white bg-green-500 rounded"
                                onClick={() => alert("Edit Profile Clicked")}
                            >
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div onClick={handleNav} className='z-10 block md:hidden md:px-1'>
                {nav ? <AiOutlineClose size={30} /> : <AiOutlineMenu size={30} />}
            </div>

            <div className={nav ? 'fixed top-0 right-0 w-full border-l border-l-gray-900 h-full bg-[#000300] ease-in-out duration-500 z-9' : 'fixed right-[-100%]'}>
                <h1 className='w-full pt-20 text-3xl font-bold text-[--orange] mb-2 font-customFont text-center uppercase'>Tuklas</h1>
                <ul className='p-4 text-center uppercase'>
                    <li className='p-4 text-xl hover:text-[--orange] transition ease-in'>
                        <a href='/home' className={location.pathname === '/home' ? 'text-[--orange]' : ''}>Home</a>
                    </li>
                    <li className='p-4 text-xl hover:text-[--orange] transition ease-in'>
                        <a href='/gallery' className={location.pathname === '/gallery' ? 'text-[--orange]' : ''}>Gallery</a>
                    </li>
                    <li className='p-4 text-xl hover:text-[--orange] transition ease-in'>
                        <a href='/create' className={location.pathname === '/create' ? 'text-[--orange]' : ''}>Create</a>
                    </li>
                    <li className='p-4 text-xl hover:text-[--orange] transition ease-in'>
                        <a href='/marketplace' className={location.pathname === '/marketplace' ? 'text-[--orange]' : ''}>Marketplace</a>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Homenav;
