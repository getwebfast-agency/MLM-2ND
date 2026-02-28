import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import API_URL from '../config';

const Register = () => {
    const [searchParams] = useSearchParams();
    const refCode = searchParams.get('ref') || 'JOINSM';

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        referral_code: refCode
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();

    // Auto-fill referral code: URL param takes priority, otherwise default to JOINSM
    useEffect(() => {
        setFormData(prev => ({ ...prev, referral_code: refCode }));
    }, [refCode]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await axios.post(`${API_URL}/auth/register`, formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Join the network today
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                    {error && <div className="text-red-500 text-center text-sm bg-red-50 p-2 rounded">{error}</div>}
                    {successMsg && <div className="text-indigo-600 text-center text-sm font-medium bg-indigo-50 p-2 rounded">{successMsg}</div>}

                    <div className="rounded-md shadow-sm -space-y-px">
                        {/* Full Name */}
                        <div>
                            <input
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Full Name"
                                onChange={handleChange}
                            />
                        </div>
                        {/* Email */}
                        <div>
                            <input
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Email Address"
                                onChange={handleChange}
                            />
                        </div>
                        {/* Referral Code */}
                        <div>
                            <input
                                name="referral_code"
                                type="text"
                                required
                                value={formData.referral_code}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Referral Code (Required)"
                                onChange={handleChange}
                            />
                        </div>
                        {/* Password with show/hide */}
                        <div className="relative">
                            <input
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={formData.password}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center z-20 text-gray-400 hover:text-gray-600"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Register
                        </button>
                    </div>
                    <div className="text-center mt-4">
                        <span className="text-sm text-gray-600">Already have an account? </span>
                        <Link to="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                            Log in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
