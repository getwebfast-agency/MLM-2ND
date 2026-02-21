import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';

import { useCart } from '../context/CartContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = React.useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                Marathamall
                            </span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-4">
                        <Link to="/" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</Link>
                        <Link to="/products" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Products</Link>
                        <Link to="/about" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">About Us</Link>

                        <Link to="/cart" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors relative">
                            Cart
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {user && <Link to="/orders" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">My Orders</Link>}
                        {user && <Link to="/team" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">My Team</Link>}

                        {user ? (
                            <div className="flex items-center space-x-4 ml-4">
                                {user.role === 'admin' ? (
                                    <Link to="/admin" className="flex items-center text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                                        <LayoutDashboard className="w-4 h-4 mr-2" />
                                        Admin
                                    </Link>
                                ) : (
                                    <Link to="/dashboard" className="flex items-center text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                                        <LayoutDashboard className="w-4 h-4 mr-2" />
                                        Dashboard
                                    </Link>
                                )}
                                <div className="border-l pl-4 flex items-center space-x-4">
                                    <span className="text-sm text-gray-500 font-medium">Hi, {user.name}</span>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center text-red-600 hover:text-red-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4 ml-4">
                                <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium px-4 py-2">Login</Link>
                                <Link to="/register" className="bg-indigo-600 text-white px-5 py-2 rounded-full font-medium hover:bg-indigo-700 transition-shadow shadow-md hover:shadow-lg">
                                    Become a Member
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 hover:text-indigo-600 focus:outline-none">
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">Home</Link>
                        <Link to="/products" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">Products</Link>
                        <Link to="/about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">About Us</Link>
                        {user ? (
                            <>
                                <Link to="/orders" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">My Orders</Link>
                                <Link to="/team" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">My Team</Link>
                                {user.role === 'admin' ? (
                                    <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">Admin Board</Link>
                                ) : (
                                    <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">Dashboard</Link>
                                )}
                                <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">Login</Link>
                                <Link to="/register" className="block w-full text-center mt-4 bg-indigo-600 text-white px-5 py-3 rounded-md font-medium">Join Now</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
