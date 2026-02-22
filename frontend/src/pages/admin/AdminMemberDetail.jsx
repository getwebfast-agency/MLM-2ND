import { useParams, Link, useNavigate } from 'react-router-dom';
import { User, IndianRupee, ShoppingBag, ArrowLeft, Key, Users, Trash2 } from 'lucide-react';
import API_URL from '../../config';

const AdminMemberDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [memberData, setMemberData] = useState(null);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchMemberDetails();
    }, [id]);

    const fetchMemberDetails = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/users/${id}`, config);
            setMemberData(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching member details:', error);
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        const newPassword = prompt("Enter new password (min 6 chars):");
        if (!newPassword) return;
        try {
            await axios.put(`${API_URL}/admin/users/${id}/password`, { newPassword }, config);
            alert("Password reset successfully.");
        } catch (error) {
            alert(error.response?.data?.message || "Failed to reset password");
        }
    };

    const handleChangeSponsor = async () => {
        const newSponsorId = prompt("Enter New Sponsor ID:");
        if (!newSponsorId) return;
        try {
            await axios.put(`${API_URL}/admin/users/${id}/sponsor`, { newSponsorId }, config);
            alert("Sponsor changed successfully.");
            fetchMemberDetails();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to change sponsor");
        }
    };

    const handleDeleteUser = async () => {
        if (!window.confirm("Are you sure you want to DELETE this user? This action cannot be undone.")) return;
        try {
            await axios.delete(`${API_URL}/admin/users/${id}`, config);
            alert("User deleted successfully.");
            navigate('/admin/members');
        } catch (error) {
            alert(error.response?.data?.message || "Failed to delete user");
        }
    };

    if (loading) return <div>Loading member details...</div>;
    if (!memberData) return <div>Member not found.</div>;

    const { user, stats, recentOrders } = memberData;

    return (
        <div>
            <Link to="/admin/members" className="flex items-center text-gray-500 hover:text-gray-700 mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Members
            </Link>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Member Profile</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and network statistics.</p>
                    </div>
                    <div className="flex space-x-3">
                        <button onClick={handleResetPassword} className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            <Key className="h-4 w-4 mr-2" /> Reset Pass
                        </button>
                        <button onClick={handleChangeSponsor} className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            <Users className="h-4 w-4 mr-2" /> Move
                        </button>
                        {user.role !== 'admin' && (
                            <button onClick={handleDeleteUser} className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </button>
                        )}
                    </div>
                </div>
                <div className="border-t border-gray-200">
                    <dl>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Full name</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.name}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Contact Info</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.email || user.phone || 'No contact provided'}</dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Referral Code</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.referral_code}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Role</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">{user.role}</dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Status</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {user.status}
                                </span>
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white overflow-hidden shadow rounded-lg p-5 flex items-center">
                    <div className="bg-indigo-500 rounded-md p-3 mr-5"><Users className="h-6 w-6 text-white" /></div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Direct Referrals</p>
                        <p className="text-lg font-medium text-gray-900">{stats.directReferrals}</p>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg p-5 flex items-center">
                    <div className="bg-green-500 rounded-md p-3 mr-5"><IndianRupee className="h-6 w-6 text-white" /></div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                        <p className="text-lg font-medium text-gray-900">₹{stats.totalEarnings}</p>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg p-5 flex items-center">
                    <div className="bg-yellow-500 rounded-md p-3 mr-5"><ShoppingBag className="h-6 w-6 text-white" /></div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Orders</p>
                        <p className="text-lg font-medium text-gray-900">{stats.orderCount}</p>
                    </div>
                </div>
            </div>

            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h3>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {recentOrders.map((order) => (
                            <tr key={order.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.id.substring(0, 8)}...</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">₹{order.total_amount}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{order.status}</td>
                            </tr>
                        ))}
                        {recentOrders.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No recent orders.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminMemberDetail;
