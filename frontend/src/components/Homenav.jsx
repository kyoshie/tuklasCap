import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Profile from '../pages/Profile';
import axios from 'axios';
import { BACKEND } from '../constant';

const Homenav = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [walletAddress, setWalletAddress] = useState(null);
    const [profilePicUrl, setProfilePicUrl] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const address = localStorage.getItem('walletAddress');
        if (address) {
            setWalletAddress(address);
            fetchUserData(address);
        } else {
            navigate('/');
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
            console.error('Error fetching user data:', error.message);
            if (error.response?.status === 403) {
                navigate('/');
            }
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const openProfile = () => {
        setProfileOpen(true);
        setIsOpen(false);
    };

    const handleNavigation = (path) => {
        navigate(path);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="sticky top-0 left-0 z-10 w-full bg-[#222831] text-white font-customFont shadow">
            <div className="max-w-screen-xl mx-auto flex items-center justify-between px-6 h-[5rem]">
                {/* Logo */}
                <div className="flex items-center">
                    <h1 className="text-2xl md:text-3xl font-bold text-[--orange]">Tuklas Art Gallery</h1>
                </div>

                {/* Desktop Nav Links */}
                <div className="items-center hidden gap-10 md:flex">
                    <Link to="/home" className={`text-xl hover:text-[--orange] transition ${location.pathname === '/home' ? 'text-[--orange]' : ''}`}>Home</Link>
                    <Link to="/gallery" className={`text-xl hover:text-[--orange] transition ${location.pathname === '/gallery' ? 'text-[--orange]' : ''}`}>Gallery</Link>
                    <Link to="/create" className={`text-xl hover:text-[--orange] transition ${location.pathname === '/create' ? 'text-[--orange]' : ''}`}>Create</Link>
                    <Link to="/marketplace" className={`text-xl hover:text-[--orange] transition ${location.pathname === '/marketplace' ? 'text-[--orange]' : ''}`}>Marketplace</Link>
                </div>

                <div className="relative" ref={dropdownRef}>
                    <button onClick={toggleDropdown} className="flex items-center w-10 h-10 focus:outline-none">
                        <img
                            className="object-cover w-10 h-10 rounded-full border-2 border-transparent hover:border-[--orange] transition-colors"
                            src={profilePicUrl || '/default-profile.jpg'}
                            alt="User"
                        />
                    </button>

                    {isOpen && (
                        <div className="absolute right-0 z-20 w-48 mt-2 text-gray-700 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                            {/* Mobile Navigation Links */}
                            <div className="block border-b border-gray-200 md:hidden">
                                <button
                                    onClick={() => handleNavigation('/home')}
                                    className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${location.pathname === '/home' ? 'bg-orange-50 text-[--orange] font-medium' : ''}`}
                                >
                                    Home
                                </button>
                                <button
                                    onClick={() => handleNavigation('/gallery')}
                                    className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${location.pathname === '/gallery' ? 'bg-orange-50 text-[--orange] font-medium' : ''}`}
                                >
                                    Gallery
                                </button>
                                <button
                                    onClick={() => handleNavigation('/create')}
                                    className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${location.pathname === '/create' ? 'bg-orange-50 text-[--orange] font-medium' : ''}`}
                                >
                                    Create
                                </button>
                                <button
                                    onClick={() => handleNavigation('/marketplace')}
                                    className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${location.pathname === '/marketplace' ? 'bg-orange-50 text-[--orange] font-medium' : ''}`}
                                >
                                    Marketplace
                                </button>
                            </div>

                            {/* Profile Options */}
                            <button
                                onClick={openProfile}
                                className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                            >
                                Profile
                            </button>
                            <button
                                onClick={() => handleNavigation('/verify')}
                                className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                            >
                                Verify Account
                            </button>
                            <button
                                onClick={handleLogout}
                                className="block w-full px-4 py-2 text-sm text-left text-red-600 border-t border-gray-200 hover:bg-gray-100"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Profile Modal */}
            {profileOpen && walletAddress && (
                <Profile walletAddress={walletAddress} closeModal={() => setProfileOpen(false)} />
            )}
        </div>
    );
};

export default Homenav;