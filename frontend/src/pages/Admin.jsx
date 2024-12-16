import { Home, LogOut } from 'lucide-react';
import Table from '../components/table/Table';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Admin = () => {
    const navigate = useNavigate();

    // Check if admin is log in 
    useEffect(() => {
        const walletAddress = localStorage.getItem('walletAddress');
        if (!walletAddress) {
            navigate('/');
        }
    }, [navigate]);

    const handleLogout = async () => {
        try {
            localStorage.removeItem('walletAddress');

            if (window.ethereum) {
                console.log('Cleared wallet connection state');
            }

            navigate('/');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-64 shadow-md bg-[--background]">
                <div className="p-4 text-xl font-bold text-white">Tuklas Administrator</div>
                <nav className="mt-4">
                    <a className="flex items-center px-4 py-2 text-[--orange] hover:bg-gray-800 transition-colors duration-200 cursor-pointer">
                        <Home className="w-5 h-5 mr-3" />
                        Dashboard
                    </a>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-red-300 transition-colors duration-200 cursor-pointer hover:bg-gray-800"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                    </button>
                </nav>
            </aside>

            <main className="flex-1 overflow-x-hidden overflow-y-auto">
                <header className="bg-white shadow-sm">
                    <div className="flex items-center justify-between px-6 py-4">
                        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
                        <div className="text-sm font-semibold text-black">
                            Connected: {localStorage.getItem('walletAddress')?.slice(0, 6)}...{localStorage.getItem('walletAddress')?.slice(-4)}
                        </div>
                    </div>
                </header>

                <div className="p-6">
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h2 className="mb-4 text-xl font-semibold text-gray-800">Welcome Tuklas Admin Dashboard</h2>
                        <p className="text-gray-400">This is the Tuklas Admin Dashboard. Artworks are being accepted here.</p>
                    </div>
                    <div className='mt-10'>
                        <Table />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Admin;