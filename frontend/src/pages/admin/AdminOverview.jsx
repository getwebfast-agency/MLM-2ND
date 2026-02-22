import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Activity, ShoppingBag } from 'lucide-react';
import API_URL from '../../config';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminOverview = () => {
    const [stats, setStats] = useState({ totalMembers: 0, activeMembers: 0, newRegistrations: 0 });
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    // Charts state
    const [chartDataResponse, setChartDataResponse] = useState({ users: [], orders: [] });
    const [timeFilter, setTimeFilter] = useState('day'); // 'day', 'week', 'month'

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const frontendUrl = window.location.origin;

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`${API_URL}/admin/stats`, config);
                setStats(res.data);

                // Fetch chart data separately
                const chartRes = await axios.get(`${API_URL}/admin/chart-stats`, config);
                if (chartRes.data) {
                    setChartDataResponse(chartRes.data);
                }

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

    const processData = (items, type) => {
        const dataObj = {};

        items.forEach(item => {
            const date = new Date(item.createdAt);
            let dateKey;
            let displayLabel;

            if (timeFilter === 'day') {
                dateKey = date.toISOString().split('T')[0];
                displayLabel = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            } else if (timeFilter === 'week') {
                const day = date.getDay();
                const diff = date.getDate() - day + (day === 0 ? -6 : 1);
                const startOfWeek = new Date(new Date(date).setDate(diff));
                dateKey = startOfWeek.toISOString().split('T')[0];
                displayLabel = `Week of ${startOfWeek.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
            } else if (timeFilter === 'month') {
                dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                displayLabel = date.toLocaleString('default', { month: 'short', year: 'numeric' });
            }

            if (!dataObj[dateKey]) {
                dataObj[dateKey] = { date: dateKey, display: displayLabel, value: 0 };
            }

            if (type === 'sales') {
                dataObj[dateKey].value += parseFloat(item.total_amount || 0);
            } else {
                dataObj[dateKey].value += 1;
            }
        });

        // Convert the object to an array and sort by the raw date key
        const arr = Object.values(dataObj);
        arr.sort((a, b) => a.date.localeCompare(b.date));

        // Take an appropriate slice if there's a lot of data, depending on the filter.
        // For day, last 30 entries. For week, last 12. For month, last 12.
        if (timeFilter === 'day') return arr.slice(-30);
        if (timeFilter === 'week') return arr.slice(-12);
        if (timeFilter === 'month') return arr.slice(-12);

        return arr;
    };

    const salesChartData = processData(chartDataResponse.orders, 'sales');
    const membersChartData = processData(chartDataResponse.users, 'members');

    if (loading) return <div className="p-10 text-center">Loading stats...</div>;

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

            {/* Charts Section */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">System Analytics</h3>
                    <div className="flex gap-2 mt-4 sm:mt-0">
                        {['day', 'week', 'month'].map(f => (
                            <button
                                key={f}
                                onClick={() => setTimeFilter(f)}
                                className={`px-4 py-1 rounded capitalize text-sm font-medium transition-colors ${timeFilter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Sales Chart */}
                    <div className="border border-gray-100 p-4 rounded-xl bg-gray-50/50">
                        <h4 className="text-md font-semibold text-gray-700 mb-4 capitalize">Sales ({timeFilter})</h4>
                        {salesChartData.length > 0 ? (
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={salesChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="display" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip labelStyle={{ color: '#374151' }} itemStyle={{ color: '#4f46e5' }} />
                                        <Legend />
                                        <Line type="monotone" dataKey="value" name="Total Revenue (₹)" stroke="#4f46e5" strokeWidth={3} activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-72 flex items-center justify-center text-gray-400">No Data Available</div>
                        )}
                    </div>

                    {/* Members Join Chart */}
                    <div className="border border-gray-100 p-4 rounded-xl bg-gray-50/50">
                        <h4 className="text-md font-semibold text-gray-700 mb-4 capitalize">Member Joins ({timeFilter})</h4>
                        {membersChartData.length > 0 ? (
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={membersChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="display" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                                        <Tooltip labelStyle={{ color: '#374151' }} itemStyle={{ color: '#10b981' }} />
                                        <Legend />
                                        <Line type="monotone" dataKey="value" name="New Members" stroke="#10b981" strokeWidth={3} activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-72 flex items-center justify-center text-gray-400">No Data Available</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
