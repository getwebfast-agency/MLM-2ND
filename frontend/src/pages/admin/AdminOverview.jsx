import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Activity, ShoppingBag } from 'lucide-react';
import API_URL from '../../config';

const AdminOverview = () => {
    const [stats, setStats] = useState({ totalMembers: 0, activeMembers: 0, newRegistrations: 0 });
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const frontendUrl = window.location.origin;

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`${API_URL}/admin/stats`, config);
                setStats(res.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching stats:', error);
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const copyToClipboard = () => {
        if (!stats.adminStats?.referralCode) return;
        const link = `${frontendUrl}/register?ref=${stats.adminStats.referralCode}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return <div>Loading stats...</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white overflow-hidden shadow rounded-lg p-5 flex items-center">
                    <div className="bg-blue-500 rounded-md p-3 mr-4"><Users className="h-6 w-6 text-white" /></div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Members</p>
                        <p className="text-lg font-bold text-gray-900">{stats.totalMembers}</p>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg p-5 flex items-center">
                    <div className="bg-green-500 rounded-md p-3 mr-4"><Activity className="h-6 w-6 text-white" /></div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Active Members</p>
                        <p className="text-lg font-bold text-gray-900">{stats.activeMembers}</p>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg p-5 flex items-center">
                    <div className="bg-purple-500 rounded-md p-3 mr-4"><ShoppingBag className="h-6 w-6 text-white" /></div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">New Today</p>
                        <p className="text-lg font-bold text-gray-900">{stats.newRegistrations}</p>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg p-5 flex items-center">
                    <div className="bg-yellow-500 rounded-md p-3 mr-4"><Activity className="h-6 w-6 text-white" /></div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">My Earnings</p>
                        <p className="text-lg font-bold text-gray-900">₹{stats.adminStats?.totalEarnings ? parseFloat(stats.adminStats.totalEarnings).toFixed(2) : '0.00'}</p>
                    </div>
                </div>
            </div>

            {/* Admin Referral Section */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">My Referral Link</h3>
                    <div className="text-sm text-gray-500 mt-1 sm:mt-0">
                        Referral Code: <span className="font-bold text-gray-700">{stats.adminStats?.referralCode || 'N/A'}</span>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 bg-gray-50 p-3 rounded border border-gray-200 text-gray-700 font-mono text-sm break-all">
                        {frontendUrl}/register?ref={stats.adminStats?.referralCode || '...'}
                    </div>
                    <button
                        onClick={copyToClipboard}
                        className={`px-4 py-3 sm:py-2 flex-shrink-0 rounded text-white font-medium transition-colors ${copied ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                        {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                </div>
            </div>

            {/* Placeholder for charts or recent activity */}
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">System Activity</h3>
                <p className="text-gray-500">Charts and detailed analytics will appear here.</p>
            </div>
        </div>
    );
};

export default AdminOverview;
