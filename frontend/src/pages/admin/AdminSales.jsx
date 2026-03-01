import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../../config';
import { Truck, Package, Clock, CheckCircle, RefreshCw, XCircle, AlertTriangle } from 'lucide-react';

const AdminSales = () => {
    const [sales, setSales] = useState([]);
    const [deliveryPendingOrders, setDeliveryPendingOrders] = useState([]);
    const [cancelledOrders, setCancelledOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dpLoading, setDpLoading] = useState(true);
    const [cancelledLoading, setCancelledLoading] = useState(true);

    // Cancel modal state (admin cancelling a delivery-pending order)
    const [cancelModal, setCancelModal] = useState(null);   // orderId
    const [cancelReason, setCancelReason] = useState('');
    const [cancelError, setCancelError] = useState('');
    const [cancellingId, setCancellingId] = useState(null);

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchSales = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/sales`, config);
            setSales(res.data);
        } catch (error) {
            console.error('Error fetching sales:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDeliveryPending = async () => {
        setDpLoading(true);
        try {
            const res = await axios.get(`${API_URL}/shop/all-orders?status=delivery_pending`, config);
            setDeliveryPendingOrders(res.data);
        } catch (error) {
            console.error('Error fetching delivery pending orders:', error);
        } finally {
            setDpLoading(false);
        }
    };

    const fetchCancelledOrders = async () => {
        setCancelledLoading(true);
        try {
            const res = await axios.get(`${API_URL}/shop/all-orders?status=cancelled`, config);
            setCancelledOrders(res.data);
        } catch (error) {
            console.error('Error fetching cancelled orders:', error);
        } finally {
            setCancelledLoading(false);
        }
    };

    useEffect(() => {
        fetchSales();
        fetchDeliveryPending();
        fetchCancelledOrders();
    }, []);

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

    const handleAdminCancelOrder = async () => {
        if (!cancelReason.trim()) {
            setCancelError('Please provide a reason for cancellation.');
            return;
        }
        setCancellingId(cancelModal);
        try {
            await axios.put(
                `${API_URL}/admin/orders/${cancelModal}/approve-cancellation`,
                {},
                config
            );
            closeCancelModal();
            fetchDeliveryPending();
            fetchCancelledOrders();
            fetchSales();
        } catch (error) {
            setCancelError(error.response?.data?.message || 'Failed to cancel order. Please try again.');
        } finally {
            setCancellingId(null);
        }
    };

    return (
        <div className="space-y-10">

            {/* ── Admin Cancel Order Modal ── */}
            {cancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-start gap-3 mb-4">
                            <span className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </span>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Cancel Order</h3>
                                <p className="text-sm text-gray-500 mt-0.5">The customer will be notified of this cancellation.</p>
                            </div>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm text-amber-800">
                            ⚠️ This will permanently cancel the order. This action <strong>cannot be undone</strong>.
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Reason for Cancellation <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                rows={4}
                                placeholder="e.g. Item out of stock, payment issue, customer request, etc."
                                value={cancelReason}
                                onChange={(e) => { setCancelReason(e.target.value); setCancelError(''); }}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                            />
                            {cancelError && <p className="text-red-500 text-xs mt-1 font-medium">{cancelError}</p>}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={closeCancelModal}
                                disabled={cancellingId === cancelModal}
                                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                            >
                                Go Back
                            </button>
                            <button
                                onClick={handleAdminCancelOrder}
                                disabled={cancellingId === cancelModal || !cancelReason.trim()}
                                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold hover:from-red-600 hover:to-rose-700 transition disabled:opacity-50"
                            >
                                {cancellingId === cancelModal ? 'Cancelling...' : 'Cancel Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delivery Pending Section ── */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                            <Truck className="w-4 h-4 text-blue-600" />
                        </span>
                        <h2 className="text-xl font-bold text-gray-900">Delivery Pending Orders</h2>
                        {deliveryPendingOrders.length > 0 && (
                            <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white">
                                {deliveryPendingOrders.length}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={fetchDeliveryPending}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Refresh
                    </button>
                </div>

                {dpLoading ? (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 flex justify-center">
                        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
                    </div>
                ) : deliveryPendingOrders.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
                        <CheckCircle className="mx-auto w-10 h-10 text-green-400 mb-2" />
                        <p className="text-sm text-gray-500">No orders are currently awaiting delivery acceptance.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">
                        <ul className="divide-y divide-gray-100">
                            {deliveryPendingOrders.map((order) => (
                                <li key={order.id} className="px-5 py-4 hover:bg-blue-50/40 transition">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-semibold text-indigo-600">
                                                    Order #{order.id.slice(0, 8)}...
                                                </span>
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                                    <Truck className="w-3 h-3" /> Delivery Pending
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-700 font-medium">
                                                {order.User?.name || 'Unknown'}
                                                <span className="text-gray-400 font-normal"> — {order.User?.email || 'N/A'}</span>
                                            </p>
                                            <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(order.createdAt).toLocaleString()}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Package className="w-3 h-3" />
                                                    {order.OrderItems?.length || 0} item(s)
                                                </span>
                                            </div>
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
                                            <p className="text-xs text-blue-600 font-medium">Awaiting member acceptance</p>
                                            <button
                                                onClick={() => openCancelModal(order.id)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg text-white bg-red-600 hover:bg-red-700 transition"
                                            >
                                                <XCircle className="w-3.5 h-3.5" />
                                                Cancel Order
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* ── Sales History ── */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Sales History</h2>
                {loading ? (
                    <div className="bg-white rounded-xl border p-8 flex justify-center">
                        <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full" />
                    </div>
                ) : (
                    <div className="bg-white shadow overflow-auto sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date/Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buyer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referral</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sales.map((sale) => (
                                    <tr key={sale.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div>{new Date(sale.createdAt).toLocaleDateString()}</div>
                                            <div className="text-gray-500 text-xs">{new Date(sale.createdAt).toLocaleTimeString()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="font-medium text-gray-900">{sale.User ? sale.User.name : 'Unknown'}</div>
                                            <div className="text-gray-500 text-xs">{sale.User ? sale.User.email : 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {sale.referral_code ? (
                                                <>
                                                    <div className="text-blue-600 font-medium">{sale.referral_code}</div>
                                                    {sale.referrer && (
                                                        <div className="text-gray-500 text-xs">
                                                            {sale.referrer.name} ({sale.referrer.email})
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-gray-400">Direct</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">₹{sale.total_amount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">
                                            ₹{sale.commissionGenerated ? parseFloat(sale.commissionGenerated).toFixed(2) : '0.00'}
                                        </td>
                                    </tr>
                                ))}
                                {sales.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">No confirmed sales found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Cancelled Orders ── */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100">
                            <XCircle className="w-4 h-4 text-red-600" />
                        </span>
                        <h2 className="text-xl font-bold text-gray-900">Cancelled Orders</h2>
                        {cancelledOrders.length > 0 && (
                            <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white">
                                {cancelledOrders.length}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={fetchCancelledOrders}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Refresh
                    </button>
                </div>

                {cancelledLoading ? (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 flex justify-center">
                        <div className="animate-spin w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full" />
                    </div>
                ) : cancelledOrders.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
                        <CheckCircle className="mx-auto w-10 h-10 text-green-400 mb-2" />
                        <p className="text-sm text-gray-500">No cancelled orders at this time.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
                        <ul className="divide-y divide-gray-100">
                            {cancelledOrders.map((order) => (
                                <li key={order.id} className="px-5 py-4 hover:bg-red-50/30 transition">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-semibold text-indigo-600">
                                                    Order #{order.id.slice(0, 8)}...
                                                </span>
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                                    <XCircle className="w-3 h-3" /> Cancelled
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-700 font-medium">
                                                {order.User?.name || 'Unknown'}
                                                <span className="text-gray-400 font-normal"> — {order.User?.email || 'N/A'}</span>
                                            </p>
                                            <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(order.createdAt).toLocaleString()}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Package className="w-3 h-3" />
                                                    {order.OrderItems?.length || 0} item(s)
                                                </span>
                                            </div>
                                            {order.cancel_reason && (
                                                <div className="mt-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">
                                                    <span className="font-semibold">Cancellation Reason: </span>
                                                    {order.cancel_reason}
                                                </div>
                                            )}
                                            <ul className="mt-2 space-y-0.5">
                                                {order.OrderItems?.map(item => (
                                                    <li key={item.id} className="text-xs text-gray-500">
                                                        • {item.Product?.name || 'Unknown'} × {item.quantity} — ₹{item.price}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-base font-bold text-gray-900">₹{order.total_amount}</p>
                                            <p className="mt-1 text-xs text-red-500 font-medium">Order Cancelled</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

        </div>
    );
};

export default AdminSales;
