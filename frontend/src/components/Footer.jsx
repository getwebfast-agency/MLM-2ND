import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white mt-auto pt-10 pb-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-4">Marathamall</h3>
                        <p className="text-gray-400 text-sm">Empowering your future through our premium network and quality products.</p>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link to="/" className="hover:text-white">Home</Link></li>
                            <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                            <li><Link to="/products" className="hover:text-white">Products</Link></li>
                            <li><Link to="/login" className="hover:text-white">Login</Link></li>
                            <li><Link to="/register" className="hover:text-white">Join Us</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Support</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link to="#" className="hover:text-white">Help Center</Link></li>
                            <li><Link to="#" className="hover:text-white">Terms of Service</Link></li>
                            <li><Link to="#" className="hover:text-white">Privacy Policy</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>Email: support@marathamall.com</li>
                            <li>Phone: +91 123 456 7890</li>
                            <li>Address: Mumbai, Maharashtra</li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Marathamall. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link to="/admin" className="text-gray-500 hover:text-white text-sm">Admin Access</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
