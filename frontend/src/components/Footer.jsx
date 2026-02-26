import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white mt-auto pt-10 pb-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
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
                            <li>
                                <a href="https://t.me/+918669977181" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center transition-colors">
                                    <svg className="w-4 h-4 mr-2 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
                                    </svg>
                                    Help Center (Telegram)
                                </a>
                            </li>
                            <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>Email: Marath******@gmail.com</li>
                            <li>Phone: +91 86****7181</li>
                            <li>Address: Mumbai, Maharashtra</li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-700 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
                    <p className="text-sm text-gray-500 mb-4 md:mb-0">&copy; {new Date().getFullYear()} Marathamall. All rights reserved.</p>
                    <div className="flex space-x-6">
                        <Link to="/admin" className="text-gray-500 hover:text-white text-sm">Admin Access</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
