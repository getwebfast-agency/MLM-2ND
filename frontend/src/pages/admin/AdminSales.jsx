import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../../config';

const AdminSales = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const res = await axios.get(`${API_URL}/admin/sales`, config);
                setSales(res.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching sales:', error);
                setLoading(false);
            }
        };
        fetchSales();
    }, []);

    if (loading) return <div>Loading sales data...</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Sales History</h2>
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                    ₹{sale.total_amount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">
                                    ₹{sale.commissionGenerated ? parseFloat(sale.commissionGenerated).toFixed(2) : '0.00'}
                                </td>
                            </tr>
                        ))}
                        {sales.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                                    No confirmed sales found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminSales;
