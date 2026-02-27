import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
import { ArrowRight, CheckCircle, TrendingUp, Users, ShieldCheck, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`${API_URL}/products`);
                // Take first 3 products
                setFeaturedProducts(res.data.slice(0, 3));
            } catch (error) {
                console.error('Error fetching products', error);
            }
        };
        fetchProducts();
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <div className="relative bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                        <svg
                            className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
                            fill="currentColor"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                        >
                            <polygon points="50,0 100,0 50,100 0,100" />
                        </svg>

                        <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                            <div className="sm:text-center lg:text-left">
                                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                                    <span className="block xl:inline">Unlock Your Potential with</span>{' '}
                                    <span className="block text-indigo-600 xl:inline">Maratha Mall</span>
                                </h1>
                                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                    Join a community of ambitious individuals. Build your network, earn rewards, and access premium products designed for success.
                                </p>
                                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                                    <div className="rounded-md shadow">
                                        <Link to="/register" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10">
                                            Get Started
                                        </Link>
                                    </div>
                                    <div className="mt-3 sm:mt-0 sm:ml-3">
                                        <Link to="/products" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10">
                                            View Products
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
                <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
                    <img
                        className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
                        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80"
                        alt="Team working together"
                    />
                </div>
            </div>

            {/* How It Works Section */}
            <div className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center mb-10">
                        <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Process</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            How It Works
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 mx-auto mb-4 text-2xl font-bold">1</div>
                            <h3 className="text-lg font-medium text-gray-900">Join the Network</h3>
                            <p className="mt-2 text-base text-gray-500">Sign up with a referral code and become a member of our exclusive community.</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 mx-auto mb-4 text-2xl font-bold">2</div>
                            <h3 className="text-lg font-medium text-gray-900">Promote Products</h3>
                            <p className="mt-2 text-base text-gray-500">Share our premium products with your network and drive sales.</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 mx-auto mb-4 text-2xl font-bold">3</div>
                            <h3 className="text-lg font-medium text-gray-900">Earn Rewards</h3>
                            <p className="mt-2 text-base text-gray-500">Receive commissions on sales and grow your income through our tiered system.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Products Section */}
            <div className="bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Featured Products</h2>
                        <Link to="/products" className="text-indigo-600 hover:text-indigo-500 font-medium flex items-center">
                            View all products <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:gap-x-8">
                        {featuredProducts.map((product) => (
                            <div key={product.id} className="group relative bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                                <Link to={`/products/${product.id}`} className="block flex-grow">
                                    <div className="w-full h-56 sm:h-64 bg-gray-50 rounded-xl overflow-hidden relative">
                                        <img
                                            src={product.image_url || 'https://via.placeholder.com/300?text=No+Image'}
                                            alt={product.name}
                                            className="w-full h-full object-center object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm">
                                            {product.category || 'General'}
                                        </div>
                                    </div>
                                    <div className="mt-5 flex justify-between items-start">
                                        <div className="pr-4">
                                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                {product.name}
                                            </h3>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                                ₹{product.price}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500 line-clamp-2 leading-relaxed">{product.description}</p>
                                </Link>
                                <button
                                    onClick={(e) => { e.preventDefault(); addToCart(product); }}
                                    className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 active:scale-95 transition-all duration-200 font-semibold"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        ))}
                        {featuredProducts.length === 0 && (
                            <p className="text-gray-500 col-span-3 text-center">Loading featured products...</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Features/Why Choose Us */}
            <div className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Why Choose Us</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            A better way to grow
                        </p>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                            Our platform offers everything you need to manage your network and track your success.
                        </p>
                    </div>

                    <div className="mt-10">
                        <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                            <div className="relative">
                                <dt>
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                                        <TrendingUp className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Real-time Analytics</p>
                                </dt>
                                <dd className="mt-2 ml-16 text-base text-gray-500">
                                    Track your downline growth and commission earnings in real-time with our advanced dashboard.
                                </dd>
                            </div>

                            <div className="relative">
                                <dt>
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                                        <Users className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Community Support</p>
                                </dt>
                                <dd className="mt-2 ml-16 text-base text-gray-500">
                                    Access a supportive network of mentors and peers to help you achieve your goals.
                                </dd>
                            </div>

                            <div className="relative">
                                <dt>
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                                        <ShieldCheck className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Secure & Reliable</p>
                                </dt>
                                <dd className="mt-2 ml-16 text-base text-gray-500">
                                    Your data and earnings are protected with enterprise-grade security and encryption.
                                </dd>
                            </div>

                            <div className="relative">
                                <dt>
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                                        <CheckCircle className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Quality Products</p>
                                </dt>
                                <dd className="mt-2 ml-16 text-base text-gray-500">
                                    Exclusive access to high-demand products with excellent margins for our members.
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>

            {/* Testimonials */}
            <div className="bg-indigo-800 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-extrabold text-center text-white mb-12">What Our Members Say</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-indigo-700 p-6 rounded-lg text-white">
                            <div className="flex mb-4 text-yellow-400">
                                <Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} />
                            </div>
                            <p className="mb-4">"Maratha Mall has completely changed my financial trajectory. The support system is incredible!"</p>
                            <p className="font-bold">- Sarah Johnson</p>
                        </div>
                        <div className="bg-indigo-700 p-6 rounded-lg text-white">
                            <div className="flex mb-4 text-yellow-400">
                                <Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} />
                            </div>
                            <p className="mb-4">"The products are high quality and easy to sell. I love being part of this community."</p>
                            <p className="font-bold">- Michael Chen</p>
                        </div>
                        <div className="bg-indigo-700 p-6 rounded-lg text-white">
                            <div className="flex mb-4 text-yellow-400">
                                <Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} />
                            </div>
                            <p className="mb-4">"A transparent and fair system. I recommend it to anyone looking for a side hustle."</p>
                            <p className="font-bold">- Priya Patel</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="bg-indigo-50">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        <span className="block">Ready to dive in?</span>
                        <span className="block text-indigo-600">Start your free trial today.</span>
                    </h2>
                    <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
                        <div className="inline-flex rounded-md shadow">
                            <Link to="/register" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                                Get started
                            </Link>
                        </div>
                        <div className="ml-3 inline-flex rounded-md shadow">
                            <Link to="/about" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50">
                                Learn more
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
