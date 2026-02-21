import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminSidebar from './admin/AdminSidebar';
import AdminOverview from './admin/AdminOverview';
import AdminMembers from './admin/AdminMembers';
import AdminMemberDetail from './admin/AdminMemberDetail';
import AdminNetwork from './admin/AdminNetwork';
import AdminProducts from './admin/AdminProducts';
import AdminSales from './admin/AdminSales';
import AdminEarnings from './admin/AdminEarnings';
import AdminAnalytics from './admin/AdminAnalytics';
import AdminOrders from './admin/AdminOrders';
import { Menu } from 'lucide-react';

const AdminDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    return (
        <div className="flex bg-gray-100 relative" style={{ height: 'calc(100vh - 4rem)' }}>
            {/* Mobile Header / Toggle */}
            <div className="md:hidden absolute top-0 left-0 w-full bg-indigo-700 text-white p-4 flex justify-between items-center z-20 shadow-md">
                <span className="font-bold text-xl">Admin Panel</span>
                <button onClick={() => setIsSidebarOpen(true)}>
                    <Menu size={24} />
                </button>
            </div>

            <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className="flex-1 overflow-auto w-full pt-16 md:pt-0">
                <div className="p-4 md:p-8">
                    <Routes>
                        <Route path="/" element={<AdminOverview />} />
                        <Route path="members" element={<AdminMembers />} />
                        <Route path="members/:id" element={<AdminMemberDetail />} />
                        <Route path="earnings" element={<AdminEarnings />} />
                        <Route path="network" element={<AdminNetwork />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="sales" element={<AdminSales />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="analytics" element={<AdminAnalytics />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
