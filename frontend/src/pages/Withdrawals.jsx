import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { IndianRupee, ArrowUpRight, Clock, AlertCircle } from 'lucide-react';
import API_URL from '../config';

const Withdrawals = () => {
    const [withdrawals, setWithdrawals] = useState([]);
    const [availableBalance, setAvailableBalance] = useState(0);
    const [loading, setLoading] = useState(true);

    // Form state
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [paymentDetails, setPaymentDetails] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchWithdrawals = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`${API_URL}/withdrawals/my-withdrawals`, config);

            setWithdrawals(res.data.withdrawals);
            setAvailableBalance(res.data.availableBalance);
        } catch (error) {
            console.error('Error fetching withdrawals:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        const withdrawAmount = parseFloat(amount);
        if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
            setMessage({ type: 'error', text: 'Please enter a valid amount.' });
            return;
        }

        if (withdrawAmount > availableBalance) {
            setMessage({ type: 'error', text: `You can only withdraw up to ₹${availableBalance.toFixed(2)}.` });
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post(`${API_URL}/withdrawals/request`, {
                amount: withdrawAmount,
                payment_method: paymentMethod,
                payment_details: paymentDetails
            }, config);

            setMessage({ type: 'success', text: 'Withdrawal request submitted successfully!' });
            setAmount('');
            setPaymentDetails('');
            fetchWithdrawals(); // Refresh list and balance
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to submit request.' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <IndianRupee className="mr-2 h-6 w-6 text-indigo-600" />
                Withdrawals
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white col-span-1 md:col-span-1">
                    <h3 className="text-indigo-100 text-sm font-medium mb-1">Available Balance to Withdraw</h3>
                    <div className="text-3xl font-bold">₹{availableBalance.toFixed(2)}</div>
                    <p className="text-xs text-indigo-200 mt-2">No minimum withdrawal limit</p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 col-span-1 md:col-span-2">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Request New Withdrawal</h3>

                    {message.text && (
                        <div className={`p-3 rounded mb-4 text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                                <input
                                    type="number"
                                    min="0.01"
                                    max={availableBalance}
                                    step="0.01"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Amount"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                >
                                    <option value="UPI">UPI ID</option>
                                    <option value="Bank">Bank Details</option>
                                    <option value="QR">QR Code Link / Number</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Details</label>
                            <textarea
                                required
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder={paymentMethod === 'UPI' ? 'Enter your UPI ID (e.g., name@okaxis)' : paymentMethod === 'Bank' ? 'Account No, IFSC, Account Name, Bank Name' : 'Enter payment number or link to QR'}
                                value={paymentDetails}
                                onChange={(e) => setPaymentDetails(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting || availableBalance <= 0 || !amount || parseFloat(amount) <= 0}
                                className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {submitting ? 'Submitting...' : 'Submit Request'}
                                {!submitting && <ArrowUpRight className="ml-2 h-4 w-4" />}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                        <Clock className="mr-2 h-5 w-5 text-gray-400" />
                        Withdrawal History
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    {withdrawals.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">No withdrawal requests found.</div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {withdrawals.map((w) => (
                                    <tr key={w.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(w.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">₹{w.amount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{w.payment_method}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${w.status === 'approved' ? 'bg-green-100 text-green-800' : w.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {w.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {w.admin_remark || '-'}
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

export default Withdrawals;
