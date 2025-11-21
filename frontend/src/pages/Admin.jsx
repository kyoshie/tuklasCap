import AdminLayout from '../pages/AdminLayout';
import Table from '../components/table/Table';

const Admin = () => {
    return (<AdminLayout activePage="admin"> <div className="p-6 bg-white rounded-lg shadow-md"> <h2 className="mb-4 text-xl font-semibold text-gray-800">Welcome Tuklas Admin Dashboard</h2> <p className="text-gray-400">This is the Tuklas Admin Dashboard. Artworks are being accepted here.</p> </div> <div className="mt-10"> <Table /> </div> </AdminLayout>
    );
};

export default Admin;
