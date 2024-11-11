import React, { useState, useEffect } from 'react';
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import Profile from '../pages/Profile';
import axios from 'axios';
import { BACKEND } from '../constant';

const Homenav = () => {
    const navigate = useNavigate();
    const [walletAddress, setWalletAddress] = useState(null);
    const [profilePicUrl, setProfilePicUrl] = useState(null);

    useEffect(() => {
        const address = localStorage.getItem('walletAddress');
        setWalletAddress(address);
        if (address) {
            fetchUserData(address);
        }
    }, []);

    const fetchUserData = async (address) => {
        try {
            const response = await axios.get(`${BACKEND}/api/getProfile/${address}`);
            const { profilePic } = response.data;
            if (profilePic) {
                setProfilePicUrl(`data:image/jpeg;base64,${profilePic}`);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('walletAddress');
        console.log('User logged out and MetaMask disconnected');
        navigate('/');
    };

    const [nav, setNav] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const handleNav = () => {
        setNav(!nav);
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const openProfile = () => {
        setProfileOpen(true);
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
                    <img className="object-cover w-10 h-10 rounded-full md:rounded-full" src={profilePicUrl} alt="User" />
                </button>

                {isOpen && (
                    <div className="absolute right-0 w-48 mt-2 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                            <button onClick={openProfile}
                                className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                            >
                                Profile
                            </button>
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

            {/* Profile modal rendered here when profileOpen is true */}
            {profileOpen && walletAddress && (
                <Profile walletAddress={walletAddress} closeModal={() => setProfileOpen(false)} />
            )}
        </div>
    );
};

export default Homenav;