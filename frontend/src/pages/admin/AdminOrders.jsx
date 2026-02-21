import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import API_URL from '../../config';
import { CheckCircle, XCircle, Loader, Filter } from 'lucide-react';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('pending'); // 'pending', 'completed', 'all'
    const { user } = useAuth();
    const token = localStorage.getItem('token');

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // Fetch all orders, potentially filtering by status on backend or frontend
            // Using the new /all-orders endpoint
            const res = await axios.get(`${API_URL}/shop/all-orders${filterStatus !== 'all' ? `?status=${filterStatus}` : ''}`, config);
            setOrders(res.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            alert('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [filterStatus]);

    const handleConfirmOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to confirm this order? Commissions will be distributed.')) return;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API_URL}/shop/orders/${orderId}/confirm`, {}, config);
            alert('Order confirmed successfully!');
            fetchOrders(); // Refresh list
        } catch (error) {
            console.error('Error confirming order:', error);
            alert(error.response?.data?.message || 'Failed to confirm order');
        }
    };

    const handleDismissOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to dismiss (cancel) this order?')) return;

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API_URL}/shop/orders/${orderId}/cancel`, {}, config);
            alert('Order dismissed successfully!');
            fetchOrders(); // Refresh list
        } catch (error) {
            console.error('Error dismissing order:', error);
            alert(error.response?.data?.message || 'Failed to dismiss order');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">Order Confirmation</h1>
                <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="all">All Orders</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <ul role="list" className="divide-y divide-gray-200">
                        {orders.length === 0 ? (
                            <li className="px-4 py-8 text-center text-gray-500">No orders found.</li>
                        ) : (
                            orders.map((order) => (
                                <li key={order.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <div className="flex items-center">
                                                <p className="text-sm font-medium text-indigo-600 truncate">
                                                    Order #{order.id.slice(0, 8)}...
                                                </p>
                                                <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-500">
                                                By: {order.User ? order.User.name : 'Unknown'} ({order.User ? order.User.email : 'N/A'})
                                            </p>
                                            <p className="mt-1 text-xs text-gray-400">
                                                {new Date(order.createdAt).toLocaleString()}
                                            </p>
                                            {order.referral_code && (
                                                <p className="mt-1 text-xs text-blue-500">
                                                    Referral Code: {order.referral_code}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <p className="text-sm font-bold text-gray-900 mb-2">₹{order.total_amount}</p>

                                            {order.status === 'pending' && (
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleDismissOrder(order.id)}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                                                    >
                                                        <XCircle className="w-3 h-3 mr-1" />
                                                        Dismiss
                                                    </button>
                                                    <button
                                                        onClick={() => handleConfirmOrder(order.id)}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                                                    >
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Confirm
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-2 text-sm text-gray-500">
                                        <details className="cursor-pointer">
                                            <summary>View Items ({order.OrderItems?.length})</summary>
                                            <ul className="mt-2 pl-4 list-disc">
                                                {order.OrderItems?.map(item => (
                                                    <li key={item.id}>
                                                        {item.Product?.name || 'Unknown Product'} - x{item.quantity} (₹{item.price})
                                                    </li>
                                                ))}
                                            </ul>
                                        </details>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
