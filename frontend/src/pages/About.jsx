import React from 'react';
import { Users, TrendingUp, ShieldCheck, Globe } from 'lucide-react';

const About = () => {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className="relative bg-indigo-900 text-white py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        className="w-full h-full object-cover opacity-20"
                        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2850&q=80"
                        alt="People working together"
                    />
                    <div className="absolute inset-0 bg-indigo-900 mix-blend-multiply" />
                </div>
                <div className="relative max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">About Maratha Mall</h1>
                    <p className="mt-6 text-xl max-w-3xl mx-auto text-indigo-100">
                        Empowering individuals to achieve financial freedom through a robust network and premium products.
                    </p>
                </div>
            </div>

            {/* Our Mission */}
            <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Our Mission</h2>
                    <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        Transforming Lives, One Connection at a Time
                    </p>
                    <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                        At Maratha Mall, we believe in the power of community. Our mission is to provide a platform where anyone can build a sustainable business, access high-quality products, and grow personally and professionally.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="p-6 bg-gray-50 rounded-lg">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-4">
                            <Users size={24} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Community First</h3>
                        <p className="mt-2 text-base text-gray-500">We foster a supportive environment where members help each other succeed.</p>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-lg">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-4">
                            <TrendingUp size={24} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Sustainable Growth</h3>
                        <p className="mt-2 text-base text-gray-500">Our business model is designed for long-term stability and consistent rewards.</p>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-lg">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-4">
                            <ShieldCheck size={24} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Integrity & Trust</h3>
                        <p className="mt-2 text-base text-gray-500">We operate with transparency and uphold the highest ethical standards.</p>
                    </div>
                </div>
            </div>

            {/* Our Story / Statistics */}
            <div className="bg-indigo-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
                        <div>
                            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                                Built for the Future
                            </h2>
                            <p className="mt-3 max-w-3xl text-lg text-gray-500">
                                Maratha Mall started with a simple vision: to bridge the gap between quality manufacturers and ambitious entrepreneurs. Today, we are a thriving ecosystem connecting thousands of members across the region.
                            </p>
                            <div className="mt-8 grid grid-cols-2 gap-0.5 md:grid-cols-3 lg:mt-0 lg:grid-cols-2">
                                <div className="col-span-1 flex justify-center py-8 px-8 bg-gray-50">
                                    <div className="text-center">
                                        <span className="block text-2xl font-bold text-indigo-600">5k+</span>
                                        <span className="block text-gray-500">Active Members</span>
                                    </div>
                                </div>
                                <div className="col-span-1 flex justify-center py-8 px-8 bg-gray-50">
                                    <div className="text-center">
                                        <span className="block text-2xl font-bold text-indigo-600">100+</span>
                                        <span className="block text-gray-500">Premium Products</span>
                                    </div>
                                </div>
                                <div className="col-span-1 flex justify-center py-8 px-8 bg-gray-50">
                                    <div className="text-center">
                                        <span className="block text-2xl font-bold text-indigo-600">24/7</span>
                                        <span className="block text-gray-500">Member Support</span>
                                    </div>
                                </div>
                                <div className="col-span-1 flex justify-center py-8 px-8 bg-gray-50">
                                    <div className="text-center">
                                        <span className="block text-2xl font-bold text-indigo-600">Global</span>
                                        <span className="block text-gray-500">Reach</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-10 lg:mt-0 relative">
                            <img
                                className="rounded-lg shadow-xl ring-1 ring-black ring-opacity-5"
                                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1632&q=80"
                                alt="Team meeting"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-indigo-700">
                <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                        <span className="block">Ready to simplify your journey?</span>
                        <span className="block">Join Maratha Mall today.</span>
                    </h2>
                    <p className="mt-4 text-lg leading-6 text-indigo-200">
                        Start your path to success with a proven system and a team that cares about your growth.
                    </p>
                    <a
                        href="/register"
                        className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 sm:w-auto"
                    >
                        Get started for free
                    </a>
                </div>
            </div>
        </div>
    );
};

export default About;
