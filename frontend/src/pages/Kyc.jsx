import AdminLayout from '../pages/AdminLayout';
import KycTable from '../components/table/Kyc-Table';

const KYC = () => {
    return (<AdminLayout activePage="kyc"> <div className="p-6 bg-white rounded-lg shadow-md"> <h2 className="mb-4 text-xl font-semibold text-gray-800">Welcome Tuklas Admin Dashboard</h2> <p className="text-gray-400">This is the Tuklas Admin Dashboard. Information is verified here.</p> </div> <div className="mt-10"> <KycTable /> </div> </AdminLayout>
    );
};

export default KYC;
