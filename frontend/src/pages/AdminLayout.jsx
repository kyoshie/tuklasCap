import { Home, LogOut, Library, Pyramid } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const AdminLayout = ({ children, activePage }) => {
    const navigate = useNavigate();
    const [walletAddress, setWalletAddress] = useState(localStorage.getItem('walletAddress') || '');

    useEffect(() => {
        if (!walletAddress) {
            navigate('/');
        }

        if (window.ethereum) {
            const handleAccountsChanged = (accounts) => {
                if (accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                    localStorage.setItem('walletAddress', accounts[0]);
                } else {
                    navigate('/');
                }
            };
            window.ethereum.on('accountsChanged', handleAccountsChanged);

            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            };
        }

    }, [walletAddress, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('walletAddress');
        setWalletAddress('');
        if (window.ethereum) {
            console.log('Cleared wallet connection state');
        }
        navigate('/');
    };

    return (<div className="flex h-screen bg-gray-100">
        {/* Sidebar */} <aside className="w-64 shadow-md bg-[--background]"> <div className="p-4 text-xl font-bold text-white">Tuklas Administrator</div> <nav className="flex flex-col gap-1 mt-4">
            <Link
                to="/admin"
                className={`flex items-center px-4 py-2 text-[--orange] hover:bg-gray-800 transition-colors duration-200 ${activePage === 'admin' ? 'bg-gray-800' : ''}`}
            > <Home className="w-5 h-5 mr-3" />
                Arts Submissions </Link>

            <Link
                to="/kyc"
                className={`flex items-center px-4 py-2 text-[--orange] hover:bg-gray-800 transition-colors duration-200 ${activePage === 'kyc' ? 'bg-gray-800' : ''}`}
            >
                <Pyramid className="w-5 h-5 mr-3" />
                KYC Submissions
            </Link>

            <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 mt-2 text-red-300 transition-colors duration-200 cursor-pointer hover:bg-gray-800"
            >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
            </button>
        </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="flex items-center justify-between px-6 py-4">
                    <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
                    {walletAddress && (
                        <div className="text-sm font-semibold text-black">
                            Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                        </div>
                    )}
                </div>
            </header>

            {/* Page Content */}
            <div className="p-6">{children}</div>
        </main>
    </div>


    );
};

export default AdminLayout;
