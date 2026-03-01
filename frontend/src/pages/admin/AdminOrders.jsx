import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import API_URL from '../../config';
import { CheckCircle, XCircle, Loader, Filter, Truck, AlertCircle, AlertTriangle } from 'lucide-react';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [cancellationRequests, setCancellationRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [crLoading, setCrLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('pending');

    // Reject modal state
    const [rejectModal, setRejectModal] = useState(null); // orderId
    const [rejectionReason, setRejectionReason] = useState('');
    const [rejectError, setRejectError] = useState('');
    const [processingId, setProcessingId] = useState(null);

    const { user } = useAuth();
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await axios.get(
                `${API_URL}/shop/all-orders${filterStatus !== 'all' ? `?status=${filterStatus}` : ''}`,
                config
            );
            setOrders(res.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCancellationRequests = async () => {
        setCrLoading(true);
        try {
            const res = await axios.get(`${API_URL}/admin/cancellation-requests`, config);
            setCancellationRequests(res.data);
        } catch (error) {
            console.error('Error fetching cancellation requests:', error);
        } finally {
            setCrLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, [filterStatus]);
    useEffect(() => { fetchCancellationRequests(); }, []);

    const handleConfirmOrder = async (orderId) => {
        if (!window.confirm('Confirm this order? It will move to "Delivery Pending" and the member will be notified.')) return;
        try {
            await axios.put(`${API_URL}/shop/orders/${orderId}/confirm`, {}, config);
            fetchOrders();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to confirm order.');
        }
    };

    const handleDismissOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to dismiss this order?')) return;
        try {
            await axios.put(`${API_URL}/shop/orders/${orderId}/cancel`, { reason: 'Dismissed by admin.' }, config);
            fetchOrders();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to dismiss order.');
        }
    };

    const handleApproveCancellation = async (orderId) => {
        if (!window.confirm('Approve this cancellation request? The order will be permanently cancelled.')) return;
        setProcessingId(orderId);
        try {
            await axios.put(`${API_URL}/admin/orders/${orderId}/approve-cancellation`, {}, config);
            fetchCancellationRequests();
            fetchOrders();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to approve cancellation.');
        } finally {
            setProcessingId(null);
        }
    };

    const openRejectModal = (orderId) => {
        setRejectModal(orderId);
        setRejectionReason('');
        setRejectError('');
    };

    const closeRejectModal = () => {
        setRejectModal(null);
        setRejectionReason('');
        setRejectError('');
    };

    const handleRejectCancellation = async () => {
        if (!rejectionReason.trim()) {
            setRejectError('Please provide a reason for rejecting this cancellation request.');
            return;
        }
        setProcessingId(rejectModal);
        try {
            await axios.put(
                `${API_URL}/admin/orders/${rejectModal}/reject-cancellation`,
                { rejectionReason: rejectionReason.trim() },
                config
            );
            closeRejectModal();
            fetchCancellationRequests();
            fetchOrders();
        } catch (error) {
            setRejectError(error.response?.data?.message || 'Failed to reject cancellation request.');
        } finally {
            setProcessingId(null);
        }
    };

    const statusBadge = (status) => {
        const map = {
            completed: 'bg-green-100 text-green-800',
            delivery_pending: 'bg-blue-100 text-blue-800',
            cancelled: 'bg-red-100 text-red-800',
            cancellation_requested: 'bg-orange-100 text-orange-800',
            pending: 'bg-yellow-100 text-yellow-800',
        };
        const labels = {
            completed: 'Completed',
            delivery_pending: 'Delivery Pending',
            cancelled: 'Cancelled',
            cancellation_requested: 'Cancellation Pending',
            pending: 'Pending',
        };
        return (
            <span className={`ml-2 px-2.5 py-0.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${map[status] || 'bg-gray-100 text-gray-700'}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <div className="space-y-10">

            {/* ── Reject Cancellation Modal ── */}
            {rejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-start gap-3 mb-4">
                            <span className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </span>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Reject Cancellation Request</h3>
                                <p className="text-sm text-gray-500 mt-0.5">Provide a reason — the customer will be notified.</p>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Rejection Reason <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                rows={4}
                                placeholder="e.g. Order is already dispatched and cannot be recalled. Please accept the delivery."
                                value={rejectionReason}
                                onChange={(e) => { setRejectionReason(e.target.value); setRejectError(''); }}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                            />
                            {rejectError && <p className="text-red-500 text-xs mt-1 font-medium">{rejectError}</p>}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={closeRejectModal}
                                disabled={processingId === rejectModal}
                                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectCancellation}
                                disabled={processingId === rejectModal || !rejectionReason.trim()}
                                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold hover:from-red-600 hover:to-rose-700 transition disabled:opacity-50"
                            >
                                {processingId === rejectModal ? 'Submitting...' : 'Reject Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════
                SECTION 1 — Cancellation Requests
            ══════════════════════════════════════════════════════ */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100">
                        <AlertCircle className="w-4 h-4 text-orange-600" />
                    </span>
                    <h2 className="text-xl font-bold text-gray-900">Cancellation Requests</h2>
                    {cancellationRequests.length > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-600 text-white">
                            {cancellationRequests.length}
                        </span>
                    )}
                </div>

                {crLoading ? (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 flex justify-center">
                        <Loader className="w-6 h-6 animate-spin text-orange-500" />
                    </div>
                ) : cancellationRequests.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
                        <CheckCircle className="mx-auto w-10 h-10 text-green-400 mb-2" />
                        <p className="text-sm text-gray-500">No pending cancellation requests at this time.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-orange-100 shadow-sm overflow-hidden">
                        <ul className="divide-y divide-gray-100">
                            {cancellationRequests.map((order) => (
                                <li key={order.id} className="px-5 py-4 hover:bg-orange-50/40 transition">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-semibold text-indigo-600">
                                                    Order #{order.id.slice(0, 8)}...
                                                </span>
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                                                    <AlertCircle className="w-3 h-3" /> Cancellation Requested
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-700 font-medium">
                                                {order.User?.name || 'Unknown'}
                                                <span className="text-gray-400 font-normal"> — {order.User?.email || 'N/A'}</span>
                                            </p>
                                            <p className="mt-1 text-xs text-gray-400">
                                                Requested on: {new Date(order.updatedAt).toLocaleString()}
                                            </p>
                                            {/* Customer's cancel reason */}
                                            <div className="mt-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-sm text-orange-800">
                                                <span className="font-semibold">Customer's Reason: </span>
                                                {order.cancel_reason || 'No reason provided.'}
                                            </div>
                                            {/* Items */}
                                            <ul className="mt-2 space-y-0.5">
                                                {order.OrderItems?.map(item => (
                                                    <li key={item.id} className="text-xs text-gray-500">
                                                        • {item.Product?.name || 'Unknown'} × {item.quantity} — ₹{item.price}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                                            <p className="text-base font-bold text-gray-900">₹{order.total_amount}</p>
                                            <button
                                                onClick={() => handleApproveCancellation(order.id)}
                                                disabled={processingId === order.id}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg text-white bg-green-600 hover:bg-green-700 transition disabled:opacity-50"
                                            >
                                                <CheckCircle className="w-3.5 h-3.5" />
                                                Approve Cancellation
                                            </button>
                                            <button
                                                onClick={() => openRejectModal(order.id)}
                                                disabled={processingId === order.id}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg text-white bg-red-600 hover:bg-red-700 transition disabled:opacity-50"
                                            >
                                                <XCircle className="w-3.5 h-3.5" />
                                                Reject Request
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* ══════════════════════════════════════════════════════
                SECTION 2 — Order Confirmation
            ══════════════════════════════════════════════════════ */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Order Confirmation</h2>
                    <div className="flex items-center space-x-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="pending">Pending</option>
                            <option value="delivery_pending">Delivery Pending</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
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
                                                    {statusBadge(order.status)}
                                                </div>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    By: {order.User ? order.User.name : 'Unknown'} ({order.User ? order.User.email : 'N/A'})
                                                </p>
                                                <p className="mt-1 text-xs text-gray-400">
                                                    {new Date(order.createdAt).toLocaleString()}
                                                </p>
                                                {order.status === 'cancelled' && order.cancel_reason && (
                                                    <p className="mt-1 text-xs text-red-500">
                                                        <span className="font-semibold">Cancellation Reason: </span>{order.cancel_reason}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <p className="text-sm font-bold text-gray-900">₹{order.total_amount}</p>
                                                {order.status === 'pending' && (
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleDismissOrder(order.id)}
                                                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                                                        >
                                                            <XCircle className="w-3 h-3 mr-1" />
                                                            Dismiss
                                                        </button>
                                                        <button
                                                            onClick={() => handleConfirmOrder(order.id)}
                                                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                                                        >
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                            Confirm
                                                        </button>
                                                    </div>
                                                )}
                                                {order.status === 'delivery_pending' && (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                                                        <Truck className="w-3 h-3" />
                                                        Awaiting Member Confirmation
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-500">
                                            <details className="cursor-pointer">
                                                <summary>View Items ({order.OrderItems?.length})</summary>
                                                <ul className="mt-2 pl-4 list-disc">
                                                    {order.OrderItems?.map(item => (
                                                        <li key={item.id}>
                                                            {item.Product?.name || 'Unknown Product'} — x{item.quantity} (₹{item.price})
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
        </div>
    );
};

export default AdminOrders;
