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

const AdminDashboard = () => {
    return (
        <div className="flex h-screen bg-gray-100">
            <AdminSidebar />
            <div className="flex-1 overflow-auto">
                <div className="p-8">
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
