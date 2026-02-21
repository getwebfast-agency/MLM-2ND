import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingBag, GitMerge, BarChart2, Tag } from 'lucide-react';

const AdminSidebar = () => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-600';
    };

    const navItems = [
        { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Overview' },
        { path: '/admin/orders', icon: <ShoppingBag size={20} />, label: 'Order Confirmation' },
        { path: '/admin/members', icon: <Users size={20} />, label: 'Members' },
        { path: '/admin/earnings', icon: <BarChart2 size={20} />, label: 'Member Earnings' },
        { path: '/admin/network', icon: <GitMerge size={20} />, label: 'Network Tree' },
        { path: '/admin/products', icon: <Tag size={20} />, label: 'Products' },
        { path: '/admin/sales', icon: <ShoppingBag size={20} />, label: 'Sales' },
        { path: '/admin/analytics', icon: <BarChart2 size={20} />, label: 'Analytics' },
    ];

    return (
        <div className="bg-indigo-700 w-64 min-h-screen p-4">
            <div className="text-white text-xl font-bold mb-8 px-4">Admin Panel</div>
            <nav className="space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)}`}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default AdminSidebar;
