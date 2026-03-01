import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Users, ShoppingBag, GitMerge,
    BarChart2, Tag, X, CreditCard
} from 'lucide-react';
import axios from 'axios';
import API_URL from '../../config';

const POLL_INTERVAL = 30_000; // refresh badges every 30 seconds

const AdminSidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    const token = localStorage.getItem('token');
    const cfg = { headers: { Authorization: `Bearer ${token}` } };

    const [badges, setBadges] = useState({
        pendingOrders: 0,
        cancellationRequests: 0,
        withdrawalRequests: 0,
    });

    const fetchBadges = useCallback(async () => {
        try {
            const [ordersRes, cancelRes, withdrawRes] = await Promise.allSettled([
                axios.get(`${API_URL}/shop/all-orders?status=pending`, cfg),
                axios.get(`${API_URL}/admin/cancellation-requests`, cfg),
                axios.get(`${API_URL}/admin/withdrawals?status=pending`, cfg),
            ]);

            setBadges({
                pendingOrders: ordersRes.status === 'fulfilled' ? ordersRes.value.data.length : 0,
                cancellationRequests: cancelRes.status === 'fulfilled' ? cancelRes.value.data.length : 0,
                withdrawalRequests: withdrawRes.status === 'fulfilled'
                    ? (Array.isArray(withdrawRes.value.data)
                        ? withdrawRes.value.data.filter(w => w.status === 'pending').length
                        : 0)
                    : 0,
            });
        } catch {
            // silently ignore — badges are non-critical
        }
    }, [token]);

    useEffect(() => {
        fetchBadges();
        const interval = setInterval(fetchBadges, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchBadges]);

    const isActive = (path) =>
        location.pathname === path
            ? 'bg-indigo-800 text-white'
            : 'text-indigo-100 hover:bg-indigo-600';

    const Badge = ({ count }) => {
        if (!count) return null;
        return (
            <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full text-[11px] font-bold bg-red-500 text-white leading-none">
                {count > 99 ? '99+' : count}
            </span>
        );
    };

    const navItems = [
        {
            path: '/admin',
            icon: <LayoutDashboard size={20} />,
            label: 'Overview',
        },
        {
            path: '/admin/orders',
            icon: <ShoppingBag size={20} />,
            label: 'Order Confirmation',
            badge: badges.pendingOrders + badges.cancellationRequests,
        },
        {
            path: '/admin/withdrawals',
            icon: <CreditCard size={20} />,
            label: 'Withdrawal Requests',
            badge: badges.withdrawalRequests,
        },
        {
            path: '/admin/members',
            icon: <Users size={20} />,
            label: 'Members',
        },
        {
            path: '/admin/earnings',
            icon: <BarChart2 size={20} />,
            label: 'Member Earnings',
        },
        {
            path: '/admin/network',
            icon: <GitMerge size={20} />,
            label: 'Network Tree',
        },
        {
            path: '/admin/products',
            icon: <Tag size={20} />,
            label: 'Products',
        },
        {
            path: '/admin/sales',
            icon: <ShoppingBag size={20} />,
            label: 'Sales',
        },
        {
            path: '/admin/analytics',
            icon: <BarChart2 size={20} />,
            label: 'Analytics',
        },
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
                <nav className="space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)}`}
                        >
                            {item.icon}
                            <span className="flex-1">{item.label}</span>
                            <Badge count={item.badge} />
                        </Link>
                    ))}
                </nav>
            </div>
        </>
    );
};

export default AdminSidebar;
