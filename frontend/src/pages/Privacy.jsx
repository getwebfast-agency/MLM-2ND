import React from 'react';

const Privacy = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Privacy Policy</h1>
                <div className="prose prose-indigo max-w-none text-gray-600">
                    <p className="mb-4">Last Updated: {new Date().toLocaleDateString()}</p>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
                    <p className="mb-4">
                        We collect information you provide directly to us when you create an account, make a purchase, or communicate with us. This log data may include information such as your computer's Internet Protocol address (e.g., IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, and the time spent on those pages.
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Information</h2>
                    <p className="mb-4">
                        We use the information we collect to provide, maintain, and improve our services, communicate with you, monitor usage, and protect the security of our services. We may also use this information to send promotional materials.
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Data Security</h2>
                    <p className="mb-4">
                        The security of your Personal Information is important to us, but remember that no method of transmission over the Internet, or method of electronic storage, is 100% secure. While we strive to use commercially acceptable means to protect your Personal Information, we cannot guarantee its absolute security.
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Sharing of Information</h2>
                    <p className="mb-4">
                        We may share aggregate data about our users with third-party service providers who help us operate our business, or to comply with law and protect rights. This does not include selling, renting, or leasing your personal information to outside parties.
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. Cookies and Tracking tech</h2>
                    <p className="mb-4">
                        We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">6. Contact Us</h2>
                    <p className="mb-4">
                        If you have any questions about this Privacy Policy, please contact us at Marathamall1@gmail.com.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Privacy;
