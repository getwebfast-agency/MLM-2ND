import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Package, Clock, CheckCircle, Truck, AlertTriangle, XCircle, AlertCircle } from 'lucide-react';
import API_URL from '../config';

const statusConfig = {
    pending: {
        label: 'Awaiting Confirmation',
        cls: 'bg-yellow-100 text-yellow-800',
        icon: <Clock className="w-3.5 h-3.5 mr-1" />,
    },
    delivery_pending: {
        label: 'Delivery Pending',
        cls: 'bg-blue-100 text-blue-800',
        icon: <Truck className="w-3.5 h-3.5 mr-1" />,
    },
    cancellation_requested: {
        label: 'Cancellation Pending',
        cls: 'bg-orange-100 text-orange-800',
        icon: <AlertCircle className="w-3.5 h-3.5 mr-1" />,
    },
    completed: {
        label: 'Completed',
        cls: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="w-3.5 h-3.5 mr-1" />,
    },
    cancelled: {
        label: 'Cancelled',
        cls: 'bg-red-100 text-red-800',
        icon: <XCircle className="w-3.5 h-3.5 mr-1" />,
    },
};

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [acceptingId, setAcceptingId] = useState(null);
    const [confirmModal, setConfirmModal] = useState(null);

    // Cancel modal state
    const [cancelModal, setCancelModal] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancellingId, setCancellingId] = useState(null);
    const [cancelError, setCancelError] = useState('');

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`${API_URL}/shop/orders`, config);
            setOrders(res.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleAcceptDelivery = async (orderId) => {
        setAcceptingId(orderId);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`${API_URL}/shop/orders/${orderId}/accept-delivery`, {}, config);
            setConfirmModal(null);
            fetchOrders();
        } catch (error) {
            console.error('Accept delivery error:', error);
            alert(error.response?.data?.message || 'Failed to confirm delivery acceptance.');
        } finally {
            setAcceptingId(null);
        }
    };

    const openCancelModal = (orderId) => {
        setCancelModal(orderId);
        setCancelReason('');
        setCancelError('');
    };

    const closeCancelModal = () => {
        setCancelModal(null);
        setCancelReason('');
        setCancelError('');
    };

    const handleCancelOrder = async () => {
        if (!cancelReason.trim()) {
            setCancelError('Please provide a reason for cancellation.');
            return;
        }
        setCancellingId(cancelModal);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(
                `${API_URL}/shop/orders/${cancelModal}/cancel`,
                { reason: cancelReason.trim() },
                config
            );
            closeCancelModal();
            fetchOrders();
        } catch (error) {
            console.error('Cancel order error:', error);
            setCancelError(error.response?.data?.message || 'Failed to submit cancellation request. Please try again.');
        } finally {
            setCancellingId(null);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading Orders...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

            {/* ✅ Accept Delivery Confirmation Modal */}
            {confirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
                        <div className="flex items-start gap-3 mb-4">
                            <span className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </span>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Confirm Product Receipt</h3>
                                <p className="text-sm text-gray-500 mt-0.5">Please review carefully before proceeding.</p>
                            </div>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 text-sm text-red-800 leading-relaxed">
                            <p className="font-semibold mb-1">🔴 Important Notice</p>
                            <p>
                                Before confirming, please carefully inspect the product. If it is <strong>damaged, broken, or different</strong> from what you ordered, do <strong>NOT</strong> accept it.
                            </p>
                            <p className="mt-2 font-semibold">Once accepted, the product cannot be returned or replaced.</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmModal(null)} className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition">
                                Go Back
                            </button>
                            <button
                                onClick={() => handleAcceptDelivery(confirmModal)}
                                disabled={acceptingId === confirmModal}
                                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:from-green-600 hover:to-emerald-700 active:scale-95 transition disabled:opacity-60"
                            >
                                {acceptingId === confirmModal ? 'Processing...' : '✓ Confirm Receipt'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ❌ Request Cancellation Modal */}
            {cancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
                        <div className="flex items-start gap-3 mb-4">
                            <span className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                <XCircle className="w-5 h-5 text-orange-600" />
                            </span>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Request Order Cancellation</h3>
                                <p className="text-sm text-gray-500 mt-0.5">Your request will be reviewed by the admin.</p>
                            </div>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm text-amber-800">
                            ⚠️ This will submit a <strong>cancellation request</strong> to the admin. The admin may approve or reject your request.
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Reason for Cancellation <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                rows={4}
                                placeholder="Please describe why you wish to cancel this order (e.g. wrong item ordered, delivery delay, changed decision, etc.)"
                                value={cancelReason}
                                onChange={(e) => { setCancelReason(e.target.value); setCancelError(''); }}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                            />
                            {cancelError && (
                                <p className="text-red-500 text-xs mt-1 font-medium">{cancelError}</p>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={closeCancelModal}
                                disabled={cancellingId === cancelModal}
                                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-60"
                            >
                                Go Back
                            </button>
                            <button
                                onClick={handleCancelOrder}
                                disabled={cancellingId === cancelModal || !cancelReason.trim()}
                                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold hover:from-orange-600 hover:to-red-600 active:scale-95 transition disabled:opacity-50"
                            >
                                {cancellingId === cancelModal ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {orders.length === 0 ? (
                <div className="bg-white shadow rounded-lg p-6 text-center">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Visit the products page to place your first order.</p>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {orders.map((order) => {
                            const sc = statusConfig[order.status] || statusConfig.pending;
                            return (
                                <li key={order.id}>
                                    <div className="px-4 py-4 sm:px-6">
                                        {/* Header row */}
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-indigo-600 truncate">
                                                Order #{order.id.slice(0, 8)}
                                            </p>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <span className={`px-2.5 py-0.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${sc.cls}`}>
                                                    {sc.icon}{sc.label}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Meta row */}
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500">
                                                    <Package className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                                    {order.OrderItems?.length || 0} Item(s)
                                                </p>
                                                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                                    <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                <span className="font-bold text-gray-900">₹{order.total_amount}</span>
                                            </div>
                                        </div>

                                        {/* ── Cancellation Pending ── */}
                                        {order.status === 'cancellation_requested' && (
                                            <div className="mt-3 flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3">
                                                <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                                                <div className="text-sm text-orange-800">
                                                    <p className="font-semibold">Cancellation Request Pending</p>
                                                    <p className="mt-0.5 text-orange-700">Your cancellation request is currently under review by our team. You will be notified once a decision has been made.</p>
                                                    {order.cancel_reason && (
                                                        <p className="mt-1 text-xs text-orange-600"><span className="font-semibold">Your reason: </span>{order.cancel_reason}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* ── Cancellation Rejected ── */}
                                        {order.status === 'delivery_pending' && order.cancel_rejection_reason && (
                                            <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-300 rounded-lg px-4 py-3">
                                                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                                <div className="text-sm text-red-800">
                                                    <p className="font-semibold">Cancellation Request Rejected</p>
                                                    <p className="mt-1"><span className="font-semibold">Admin's Reason: </span>{order.cancel_rejection_reason}</p>
                                                    <p className="mt-1 text-xs text-red-600">Your order remains active. You may still accept the delivery below.</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* ── Cancelled & Confirmed ── */}
                                        {order.status === 'cancelled' && (
                                            <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                                                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                                <div className="text-sm text-red-700">
                                                    <p className="font-semibold">Order Cancelled — Cancellation Confirmed</p>
                                                    {order.cancel_reason && (
                                                        <p className="mt-0.5 text-xs"><span className="font-semibold">Reason: </span>{order.cancel_reason}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* ── Delivery Pending Actions ── */}
                                        {order.status === 'delivery_pending' && (
                                            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                                                <div className="flex items-start gap-2 mb-3">
                                                    <Truck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                                    <p className="text-sm text-blue-800 font-medium">
                                                        Your order has been confirmed and is on its way. Once you receive and inspect the product, click <strong>"Confirm Receipt"</strong>.
                                                    </p>
                                                </div>
                                                <div className="mb-4 flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                                                    <span className="flex-shrink-0 text-red-600 text-base leading-snug">🔴</span>
                                                    <div className="text-sm text-red-800 leading-relaxed">
                                                        <p className="font-bold mb-1">Important Notice:</p>
                                                        <p>
                                                            Before confirming receipt, please thoroughly inspect the product. If it is <strong>damaged, broken, or differs</strong> from your order, do <strong>not</strong> accept it. Once accepted, it <strong>cannot be returned or replaced.</strong>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-3">
                                                    <button
                                                        onClick={() => setConfirmModal(order.id)}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 active:scale-95 transition shadow-sm"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        Confirm Receipt
                                                    </button>
                                                    <button
                                                        onClick={() => openCancelModal(order.id)}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-600 text-sm font-bold rounded-xl hover:bg-red-50 active:scale-95 transition shadow-sm"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        Request Cancellation
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Order Items */}
                                        {order.OrderItems && order.OrderItems.length > 0 && (
                                            <div className="mt-4 border-t border-gray-100 pt-4">
                                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Items Ordered:</h4>
                                                <ul className="space-y-3">
                                                    {order.OrderItems.map((item) => (
                                                        <li key={item.id} className="flex items-center space-x-4">
                                                            <div className="flex-shrink-0 h-10 w-10">
                                                                {item.Product?.image_url ? (
                                                                    <img className="h-10 w-10 rounded-md object-cover" src={item.Product.image_url} alt={item.Product.name} />
                                                                ) : (
                                                                    <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                                                                        <Package className="h-6 w-6 text-gray-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 truncate">{item.Product?.name || 'Unknown Product'}</p>
                                                                <p className="text-sm text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                                                            </div>
                                                            <div className="inline-flex items-center text-sm font-semibold text-gray-900">
                                                                ₹{(item.quantity * item.price).toFixed(2)}
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Orders;
