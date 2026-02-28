import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Eye, Search, Filter, ChevronLeft, ChevronRight, RefreshCw, Download } from 'lucide-react';
import API_URL from '../../config';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminMembers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchUsers();
    }, [page, statusFilter]); // Refetch on page or status change

    // Debounce search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setPage(1); // Reset to page 1 on new search
            fetchUsers();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page,
                limit: 10,
                search: searchTerm,
                status: statusFilter
            }).toString();

            const res = await axios.get(`${API_URL}/admin/users?${queryParams}`, config);

            if (res.data && Array.isArray(res.data.users)) {
                setUsers(res.data.users);
                setTotalPages(res.data.totalPages);
                setTotalUsers(res.data.totalUsers);
                setError(null);
            } else if (Array.isArray(res.data)) {
                // Fallback: Old simple array format
                console.warn('AdminMembers: Received legacy array format. Backend might not be updated.');

                let filteredData = res.data;

                // Client-side filtering
                if (statusFilter) {
                    filteredData = filteredData.filter(user => user.status === statusFilter);
                }
                if (searchTerm) {
                    const lowerTerm = searchTerm.toLowerCase();
                    filteredData = filteredData.filter(user =>
                        (user.name && user.name.toLowerCase().includes(lowerTerm)) ||
                        (user.email && user.email.toLowerCase().includes(lowerTerm)) ||
                        (user.phone && user.phone.toLowerCase().includes(lowerTerm)) ||
                        (user.referral_code && user.referral_code.toLowerCase().includes(lowerTerm))
                    );
                }

                setUsers(filteredData);
                setTotalPages(1);
                setTotalUsers(filteredData.length);
                setError(null);
            } else {
                // Fallback for old API format if needed, but we updated backend
                console.error('Unexpected API response format', res.data);
                setError('Invalid data format received.');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Failed to fetch members.');
        } finally {
            setLoading(false);
        }
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
            await axios.put(`${API_URL}/admin/users/${userId}/status`, { status: newStatus }, config);
            fetchUsers(); // Refresh list to show updated status
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text('Members List', 14, 22);

        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

        const tableColumn = ["Name", "Contact Info", "Sponsor", "Ref Code", "Direct", "Team", "Status", "Joined"];
        const tableRows = [];

        users.forEach(member => {
            const memberData = [
                member.name,
                member.email || member.phone || 'N/A',
                member.sponsor?.name || 'Root',
                member.referral_code || '',
                member.directReferrals?.toString() || '0',
                member.totalDownline?.toString() || '0',
                member.status,
                new Date(member.createdAt).toLocaleDateString()
            ];
            tableRows.push(memberData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [79, 70, 229] },
        });

        doc.save('members_export.pdf');
    };

    const handleSearchChange = (e) => setSearchTerm(e.target.value);
    const handleStatusChange = (e) => setStatusFilter(e.target.value);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Member Management</h2>

            {/* Search and Filter Bar */}
            <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-1/3">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Search by Name, Email, or Ref Code"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter className="h-4 w-4 text-gray-400" />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={handleStatusChange}
                            className="block w-full get-pl-10 pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                    <button onClick={fetchUsers} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600">
                        <RefreshCw className="h-5 w-5" />
                    </button>
                    <button
                        onClick={handleExportPDF}
                        disabled={users.length === 0}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    {users.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">
                            No members found matching your criteria.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member Info</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sponsor</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref Code</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Direct / Team</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Password</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((member) => (
                                        <tr key={member.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                        {member.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                                        <div className="text-sm text-gray-500">{member.email || member.phone || 'No contact provided'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{member.sponsor?.name || 'Root'}</div>
                                                <div className="text-xs text-gray-500">{member.sponsor?.referral_code}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded bg-gray-100 text-gray-800 font-mono">
                                                    {member.referral_code}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    <span className="font-bold">{member.directReferrals}</span> Direct
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {member.totalDownline} Team
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 select-all">
                                                    {member.plain_password || <span className="text-gray-400 italic">—</span>}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {member.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(member.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end items-center space-x-3">
                                                    <Link to={`/admin/members/${member.id}`} className="text-indigo-600 hover:text-indigo-900" title="View Details">
                                                        <Eye className="w-5 h-5" />
                                                    </Link>
                                                    {member.role !== 'admin' && (
                                                        <button
                                                            onClick={() => toggleUserStatus(member.id, member.status)}
                                                            className={`${member.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                                                            title={member.status === 'active' ? 'Suspend User' : 'Activate User'}
                                                        >
                                                            {member.status === 'active' ? 'Suspend' : 'Activate'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{users.length}</span> of <span className="font-medium">{totalUsers}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                        disabled={page === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                        Page {page} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={page === totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {resetModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 relative">
                        <button onClick={closeResetModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                                <KeyRound className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Reset Password</h3>
                                <p className="text-sm text-gray-500">{resetModal.userName}</p>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input
                                type="text"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                        </div>
                        {resetMsg.text && (
                            <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${resetMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                {resetMsg.text}
                            </div>
                        )}
                        <div className="flex gap-3">
                            <button onClick={closeResetModal} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                                Close
                            </button>
                            <button
                                onClick={handleResetPassword}
                                disabled={resetLoading || !newPassword}
                                className="flex-1 py-2 bg-amber-500 text-white rounded-lg text-sm font-bold hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {resetLoading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMembers;
