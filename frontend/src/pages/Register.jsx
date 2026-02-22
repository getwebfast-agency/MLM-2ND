import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API_URL from '../config';

const Register = () => {
    const [searchParams] = useSearchParams();
    const refCode = searchParams.get('ref') || '';

    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        password: '',
        referral_code: refCode,
        otp: ''
    });
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [step, setStep] = useState(1); // 1 = details, 2 = OTP
    const navigate = useNavigate();

    // Auto-fill referral code if link changes
    useEffect(() => {
        if (refCode) {
            setFormData(prev => ({ ...prev, referral_code: refCode }));
        }
    }, [refCode]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        try {
            const res = await axios.post(`${API_URL}/auth/send-otp`, { contact: formData.contact });
            setSuccessMsg(res.data.message);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        }
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
                <form className="mt-8 space-y-6" onSubmit={step === 1 ? handleSendOTP : handleRegister}>
                    {error && <div className="text-red-500 text-center text-sm bg-red-50 p-2 rounded">{error}</div>}
                    {successMsg && <div className="text-indigo-600 text-center text-sm font-medium bg-indigo-50 p-2 rounded">{successMsg}</div>}

                    {step === 1 && (
                        <div className="rounded-md shadow-sm -space-y-px">
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
                            <div>
                                <input
                                    name="contact"
                                    type="text"
                                    required
                                    value={formData.contact}
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Email or Phone Number"
                                    onChange={handleChange}
                                />
                            </div>
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
                            <div>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Password"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <input
                                    name="otp"
                                    type="text"
                                    required
                                    value={formData.otp}
                                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Enter OTP (Use 123456 code)"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {step === 1 ? 'Send OTP' : 'Verify & Register'}
                        </button>
                        {step === 2 && (
                            <button
                                type="button"
                                onClick={() => { setStep(1); setError(''); setSuccessMsg(''); setFormData(prev => ({ ...prev, otp: '' })) }}
                                className="mt-3 group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Back to Details
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
