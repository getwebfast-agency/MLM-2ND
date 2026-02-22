import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { Share2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        const ref = searchParams.get('ref');
        if (ref) {
            localStorage.setItem('referral_code', ref);
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`${API_URL}/products`);
                setProducts(res.data);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-screen">Loading Products...</div>;

    return (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                        Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Collection</span>
                    </h2>
                    <p className="mt-4 text-xl text-gray-500">Discover premium products curated just for you.</p>
                </div>
                {products.length === 0 ? (
                    <p className="mt-4 text-gray-500">No products available at the moment.</p>
                ) : (
                    <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                        {products.map((product) => (
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
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => addToCart(product)}
                                        className="mt-6 flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 active:scale-95 transition-all duration-200 font-semibold"
                                    >
                                        Add to Cart
                                    </button>
                                    {user && (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                const link = `${window.location.origin}/products/${product.id}?ref=${user.referral_code}`;
                                                navigator.clipboard.writeText(link);
                                                setCopiedId(product.id);
                                                setTimeout(() => setCopiedId(null), 2000);
                                            }}
                                            className="mt-6 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 active:scale-95 transition-all duration-200 flex items-center justify-center border border-gray-200"
                                            title="Share your referral link"
                                        >
                                            {copiedId === product.id ? <span className="text-sm font-medium">Copied!</span> : <Share2 className="w-5 h-5 text-indigo-600" />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
