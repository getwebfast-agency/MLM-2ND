import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { IndianRupee, CheckCircle, XCircle } from 'lucide-react';
import API_URL from '../../config';

const AdminWithdrawals = () => {
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchWithdrawals = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`${API_URL}/withdrawals/all`, config);
            setWithdrawals(res.data);
        } catch (error) {
            console.error('Error fetching admin withdrawals:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const processRequest = async (id, status) => {
        const remark = prompt(`Enter optional remark for this ${status} request:`);
        if (remark === null) return; // User cancelled prompt

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API_URL}/withdrawals/${id}/process`, {
                status,
                admin_remark: remark
            }, config);

            alert(`Request ${status} successfully.`);
            fetchWithdrawals();
        } catch (error) {
            alert(error.response?.data?.message || `Failed to ${status} request`);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <IndianRupee className="mr-2 h-6 w-6 text-indigo-600" />
                Withdrawal Requests
            </h2>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="overflow-x-auto">
                    {withdrawals.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">
                            No withdrawal requests found.
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Details</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {withdrawals.map((w) => (
                                    <tr key={w.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(w.createdAt).toLocaleDateString()}
                                            <div className="text-xs text-gray-400">{new Date(w.createdAt).toLocaleTimeString()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{w.User?.name}</div>
                                            <div className="text-xs text-gray-500">{w.User?.email || w.User?.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-bold text-gray-900">₹{parseFloat(w.amount).toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{w.payment_method}</div>
                                            <div className="text-xs text-gray-500 whitespace-pre-wrap">{w.payment_details}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${w.status === 'approved' ? 'bg-green-100 text-green-800' : w.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {w.status}
                                            </span>
                                            {w.admin_remark && <div className="text-xs text-gray-400 mt-1 max-w-xs truncate" title={w.admin_remark}>Note: {w.admin_remark}</div>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {w.status === 'pending' ? (
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => processRequest(w.id, 'approved')}
                                                        className="text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded-md flex items-center"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-1" /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => processRequest(w.id, 'rejected')}
                                                        className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md flex items-center"
                                                        title="Reject"
                                                    >
                                                        <XCircle className="w-4 h-4 mr-1" /> Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-xs italic">Processed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminWithdrawals;
