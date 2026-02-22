import React from 'react';

const Terms = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Terms of Service</h1>
                <div className="prose prose-indigo max-w-none text-gray-600">
                    <p className="mb-4">Last Updated: {new Date().toLocaleDateString()}</p>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
                    <p className="mb-4">
                        By accessing and using Marathamall ("the Platform"), you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. User Responsibilities</h2>
                    <p className="mb-4">
                        Users must provide accurate, current, and complete information during the registration process. You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Prohibited Activities</h2>
                    <p className="mb-4">
                        You are explicitly prohibited from using the platform for any unlawful purpose, to solicit others to perform unlawful acts, to violate any international, federal, or state regulations, rules, or laws.
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Intellectual Property</h2>
                    <p className="mb-4">
                        The Service and its original content, features, and functionality are and will remain the exclusive property of Marathamall and its licensors. The Service is protected by copyright, trademark, and other laws.
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. Termination</h2>
                    <p className="mb-4">
                        We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">6. Changes to Terms</h2>
                    <p className="mb-4">
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion. We will try to provide at least 30 days' notice prior to any new terms taking effect.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Terms;
