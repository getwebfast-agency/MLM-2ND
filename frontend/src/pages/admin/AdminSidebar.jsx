import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingBag, GitMerge, BarChart2, Tag, X } from 'lucide-react';

const AdminSidebar = ({ isOpen, setIsOpen }) => {
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
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className={`
                fixed inset-y-0 left-0 z-40 w-64 bg-indigo-700 h-full p-4 overflow-auto transition-transform transform duration-300 ease-in-out
                md:relative md:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex justify-between items-center text-white text-xl font-bold mb-8 px-4">
                    <span>Admin Panel</span>
                    <button className="md:hidden text-indigo-200 hover:text-white" onClick={() => setIsOpen(false)}>
                        <X size={24} />
                    </button>
                </div>
                <nav className="space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)}`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </div>
        </>
    );
};

export default AdminSidebar;
