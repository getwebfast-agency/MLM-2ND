import React, { useEffect, useState, Fragment } from 'react';
import axios from 'axios';
import API_URL from '../../config';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';

const AdminEarnings = () => {
    const [earningsData, setEarningsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expandedRows, setExpandedRows] = useState({});
    const [detailsData, setDetailsData] = useState({});

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchEarnings = async () => {
        setLoading(true);
        try {
            const query = search ? `?search=${search}` : '';
            const res = await axios.get(`${API_URL}/admin/earnings${query}`, config);
            setEarningsData(res.data);
        } catch (error) {
            console.error('Error fetching earnings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchEarnings();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    const handleRowClick = async (userId) => {
        const isExpanded = !!expandedRows[userId];
        setExpandedRows({ ...expandedRows, [userId]: !isExpanded });

        if (!isExpanded && !detailsData[userId]) {
            try {
                const res = await axios.get(`${API_URL}/admin/earnings/${userId}`, config);
                setDetailsData(prev => ({ ...prev, [userId]: res.data }));
            } catch (err) {
                console.error('Error fetching details', err);
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Member Earnings</h2>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search members..."
                        className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referral Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Earnings (₹)</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td>
                            </tr>
                        ) : earningsData.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No records found.</td>
                            </tr>
                        ) : (
                            earningsData.map((user) => (
                                <Fragment key={user.id}>
                                    <tr
                                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => handleRowClick(user.id)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {expandedRows[user.id] ? <ChevronDown className="w-5 h-5 text-gray-400 mr-2" /> : <ChevronRight className="w-5 h-5 text-gray-400 mr-2" />}
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                                            {user.referral_code || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                                            ₹{parseFloat(user.totalEarnings).toFixed(2)}
                                        </td>
                                    </tr>
                                    {expandedRows[user.id] && (
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <td colSpan="4" className="px-6 py-4 px-12">
                                                <div className="text-sm text-gray-700 bg-white p-4 rounded-lg shadow-inner border border-gray-100">
                                                    <h4 className="font-semibold mb-4 text-indigo-700 text-lg border-b pb-2">Downline Sales & Product Breakdown</h4>
                                                    {!detailsData[user.id] ? (
                                                        <div className="text-gray-500 animate-pulse">Loading detailed product history...</div>
                                                    ) : detailsData[user.id].length === 0 ? (
                                                        <p className="text-gray-500 italic py-2">No products have been sold through this member's referral yet.</p>
                                                    ) : (
                                                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                                                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                                                <thead className="bg-indigo-50">
                                                                    <tr>
                                                                        <th className="px-4 py-3 font-semibold text-left text-indigo-900">Sale Date</th>
                                                                        <th className="px-4 py-3 font-semibold text-left text-indigo-900">Purchasing Member</th>
                                                                        <th className="px-4 py-3 font-semibold text-left text-indigo-900">Products Sold (Qty)</th>
                                                                        <th className="px-4 py-3 font-semibold text-left text-indigo-900">Order Value</th>
                                                                        <th className="px-4 py-3 font-semibold text-left text-green-700">Commission Earned</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="bg-white divide-y divide-gray-100">
                                                                    {detailsData[user.id].map(comm => (
                                                                        <tr key={comm.id} className="hover:bg-gray-50 transition-colors">
                                                                            <td className="px-4 py-3 whitespace-nowrap text-gray-500">{new Date(comm.createdAt).toLocaleDateString()}</td>
                                                                            <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-800">{comm.source ? comm.source.name : 'Unknown User'}</td>
                                                                            <td className="px-4 py-3">
                                                                                <ul className="list-disc ml-4 space-y-1">
                                                                                    {comm.Order?.OrderItems?.map(item => (
                                                                                        <li key={item.id} className="text-gray-600">
                                                                                            <span className="font-semibold text-gray-800">{item.Product?.name || 'Deleted Product'}</span> - ₹{item.Product?.price || 0} <span className="text-indigo-600 font-medium">(x{item.quantity || 1})</span>
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </td>
                                                                            <td className="px-4 py-3 whitespace-nowrap text-gray-600 font-medium">₹{comm.Order?.total_amount || 0}</td>
                                                                            <td className="px-4 py-3 whitespace-nowrap font-bold text-green-600 bg-green-50/30">₹{parseFloat(comm.amount).toFixed(2)}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminEarnings;
