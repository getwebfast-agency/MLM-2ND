import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Network, IndianRupee, Users, RefreshCw, Copy, ShoppingBag, User as UserIcon, Calendar, Mail } from 'lucide-react';
import API_URL from '../config';

const TreeNode = ({ node }) => {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="ml-6">
            <div className="flex items-center py-2">
                {hasChildren && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="mr-2 text-gray-500 hover:text-indigo-600 focus:outline-none"
                    >
                        {expanded ? '-' : '+'}
                    </button>
                )}
                <div className="flex items-center p-2 bg-white rounded shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold mr-3">
                        {node.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">{node.name}</p>
                        <p className="text-xs text-gray-500">Ref: {node.referral_code}</p>
                        <p className="text-xs text-gray-400">{node.email || node.phone || 'No contact provided'}</p>
                    </div>
                </div>
            </div>
            {expanded && hasChildren && (
                <div className="border-l-2 border-indigo-100 ml-4 pl-2">
                    {node.children.map((child) => (
                        <TreeNode key={child.id} node={child} />
                    ))}
                </div>
            )}
        </div>
    );
};

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalDownline: 0, directReferrals: 0 });
    const [earnings, setEarnings] = useState({ total: 0, history: [] });
    const [orders, setOrders] = useState([]);
    const [tree, setTree] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copySuccess, setCopySuccess] = useState('');

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const statsRes = await axios.get(`${API_URL}/network/stats`, config);
            setStats(statsRes.data);

            const earningsRes = await axios.get(`${API_URL}/shop/commissions`, config);
            setEarnings(earningsRes.data);

            const ordersRes = await axios.get(`${API_URL}/shop/team-orders`, config);
            setOrders(ordersRes.data);

            const treeRes = await axios.get(`${API_URL}/network/tree`, config);
            const buildTree = (flatList, rootId) => {
                const nodeMap = {};
                let rootNode = null;
                flatList.forEach(node => { nodeMap[node.id] = { ...node, children: [] }; });
                flatList.forEach(node => {
                    if (node.id === rootId) rootNode = nodeMap[node.id];
                    else if (nodeMap[node.sponsor_id]) nodeMap[node.sponsor_id].children.push(nodeMap[node.id]);
                });
                return rootNode; // Fallback if rootId match fails could be implemented
            };
            if (treeRes.data && treeRes.data.tree) {
                setTree(buildTree(treeRes.data.tree, treeRes.data.rootId));
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const copyToClipboard = () => {
        const link = `${window.location.origin}/register?ref=${user.referral_code}`;
        navigator.clipboard.writeText(link);
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Member Dashboard</h1>
                <button onClick={fetchData} className="text-indigo-600 hover:text-indigo-800 p-2"><RefreshCw className="h-5 w-5" /></button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Profile Card */}
                <div className="bg-white overflow-hidden shadow rounded-lg col-span-1">
                    <div className="p-5">
                        <div className="flex items-center mb-4">
                            <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">{user.name}</h3>
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {user.status}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center text-sm text-gray-500">
                                <Mail className="mr-2 h-4 w-4" /> {user.email || user.phone || 'No contact provided'}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                                <UserIcon className="mr-2 h-4 w-4" /> Role: {user.role}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                                <Copy className="mr-2 h-4 w-4" /> Ref Code: <span className="ml-1 font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">{user.referral_code}</span>
                            </div>
                            {/* Simplified Date display */}
                            <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="mr-2 h-4 w-4" /> Joined: {new Date().toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white overflow-hidden shadow rounded-lg p-5 flex items-center">
                        <div className="flex-shrink-0 bg-green-500 rounded-md p-3"><IndianRupee className="h-6 w-6 text-white" /></div>
                        <div className="ml-5 w-0 flex-1">
                            <dt className="text-sm font-medium text-gray-500 truncate">Total Earnings</dt>
                            <dd className="text-2xl font-bold text-gray-900">₹{earnings.total.toFixed(2)}</dd>
                            <Link to="/withdrawals" className="mt-2 inline-block text-xs text-indigo-600 hover:text-indigo-900 font-medium">Request Withdrawal</Link>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg p-5 flex items-center">
                        <div className="flex-shrink-0 bg-blue-500 rounded-md p-3"><Users className="h-6 w-6 text-white" /></div>
                        <div className="ml-5 w-0 flex-1">
                            <dt className="text-sm font-medium text-gray-500 truncate">Network Size</dt>
                            <dd className="text-2xl font-bold text-gray-900">{stats.totalDownline}</dd>
                            <p className="text-xs text-gray-500">{stats.directReferrals} direct referrals</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Referral Link Section */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 mb-8 text-white">
                <div className="md:flex md:items-center md:justify-between">
                    <div>
                        <h3 className="text-lg font-bold">Grow Your Network</h3>
                        <p className="mt-1 text-indigo-100">Share your referral link to earn commissions.</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex">
                        <div className="relative rounded-md shadow-sm flex-1">
                            <input
                                type="text"
                                readOnly
                                value={`${window.location.origin}/register?ref=${user.referral_code}`}
                                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-l-md text-gray-900 p-3"
                            />
                        </div>
                        <button
                            onClick={copyToClipboard}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <Copy className="h-4 w-4 mr-2" />
                            {copySuccess || 'Copy Link'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Members Orders */}
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                            <ShoppingBag className="mr-2 h-5 w-5 text-gray-400" />
                            Members Orders
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        {orders.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">No members orders yet.</div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {orders.slice(0, 5).map((order) => (
                                        <tr key={order.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {order.User ? order.User.name : 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">₹{order.total_amount}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Earnings History */}
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                            <IndianRupee className="mr-2 h-5 w-5 text-gray-400" />
                            Recent Earnings
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        {earnings.history.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">No commissions earned yet.</div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {earnings.history.slice(0, 5).map((comm) => (
                                        <tr key={comm.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(comm.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comm.source?.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">+₹{comm.amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Tree Visualization */}
            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Your Network Tree</h3>
                </div>
                <div className="px-4 py-5 sm:p-6 overflow-x-auto">
                    {tree ? <TreeNode node={tree} /> : <p className="text-gray-500">No network data available.</p>}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
