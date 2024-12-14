import React, { useState, useEffect } from 'react';
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai';
import { useNavigate, Link } from 'react-router-dom'; // Add Link
import Profile from '../pages/Profile';
import axios from 'axios';
import { BACKEND } from '../constant';
import { useLocation } from 'react-router-dom';

const Homenav = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [walletAddress, setWalletAddress] = useState(null);
    const [profilePicUrl, setProfilePicUrl] = useState(null);
    const [nav, setNav] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    useEffect(() => {
        const address = localStorage.getItem('walletAddress');
        if (address) {
            setWalletAddress(address);
            fetchUserData(address); // Pass address directly
        } else {
            navigate('/'); // Redirect if no wallet address
        }
    }, [navigate]);

    const fetchUserData = async (address) => {
        try {
            const token = localStorage.getItem('token');
            if (!token || !address) {
                navigate('/');
                return;
            }

            const response = await axios.get(`${BACKEND}/api/getProfile/${address}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data.profilePic) {
                setProfilePicUrl(`data:image/jpeg;base64,${response.data.profilePic}`);
            }
        } catch (error) {
            console.error('Error fetching user data:', {
                message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            headers: error.config?.headers 
            });
            if (error.response?.status === 403) {
                navigate('/');
            }
        }
    };

    const handleLogout = () => {
        localStorage.clear(); // Clear all localStorage items
        navigate('/');
    };

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
                    <Link to='/home' className={location.pathname === '/home' ? 'text-[--orange]':''}>Home</Link>
                </li>
                <li className='p-4 text-xl hover:text-[--orange] transition ease-in'>
                    <Link to='/gallery' className={location.pathname === '/gallery' ? 'text-[--orange]':''}>Gallery</Link>
                </li>
                <li className='p-4 text-xl hover:text-[--orange] transition ease-in'>
                    <Link to='/create' className={location.pathname === '/create' ? 'text-[--orange]':''}>Create</Link>
                </li>
                <li className='p-4 text-xl hover:text-[--orange] transition ease-in'>
                    <Link to='/marketplace' className={location.pathname === '/marketplace' ? 'text-[--orange]':''}>Marketplace</Link>
                </li>
            </ul>

            <div className="relative inline-block text-left">
                <button onClick={toggleDropdown} className="flex items-center w-10 h-10 space-x-2">
                    <img 
                        className="object-cover w-10 h-10 rounded-full md:rounded-full" 
                        src={profilePicUrl || '/default-profile.png'} // Add a default profile image
                        alt="User" 
                    />
                </button>

                {isOpen && (
                    <div className="absolute right-0 w-48 mt-2 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                            <button 
                                onClick={openProfile}
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

            {/* Mobile menu button */}
            <div onClick={handleNav} className='z-10 block md:hidden md:px-1'>
                {nav ? <AiOutlineClose size={30} /> : <AiOutlineMenu size={30} />}
            </div>

            {/* Mobile menu */}
            <div className={nav ? 'fixed top-0 right-0 w-full border-l border-l-gray-900 h-full bg-[#000300] ease-in-out duration-500 z-9' : 'fixed right-[-100%]'}>
                <h1 className='w-full pt-20 text-3xl font-bold text-[--orange] mb-2 font-customFont text-center uppercase'>Tuklas</h1>
                <ul className='p-4 text-center uppercase'>
                    <li className='p-4 text-xl hover:text-[--orange] transition ease-in'>
                        <Link to='/home'>Home</Link>
                    </li>
                    <li className='p-4 text-xl hover:text-[--orange] transition ease-in'>
                        <Link to='/gallery'>Gallery</Link>
                    </li>
                    <li className='p-4 text-xl hover:text-[--orange] transition ease-in'>
                        <Link to='/create'>Create</Link>
                    </li>
                    <li className='p-4 text-xl hover:text-[--orange] transition ease-in'>
                        <Link to='/marketplace'>Marketplace</Link>
                    </li>
                </ul>
            </div>

            {profileOpen && walletAddress && (
                <Profile walletAddress={walletAddress} closeModal={() => setProfileOpen(false)} />
            )}
        </div>
    );
};

export default Homenav;