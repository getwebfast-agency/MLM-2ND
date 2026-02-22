import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, CheckCircle, Share2, Copy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import API_URL, { WHATSAPP_NUMBER } from '../config';

const ProductDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [searchParams] = useSearchParams();
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const ref = searchParams.get('ref');
        if (ref) {
            localStorage.setItem('referral_code', ref);
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`${API_URL}/products/${id}`);
                setProduct(res.data);
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const { addToCart } = useCart();

    const handleAddToCart = () => {
        addToCart(product);
        alert('Added to cart!');
    };

    const handleBuyNow = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (!window.confirm(`Confirm purchase of ${product.name} for ₹${product.price}?`)) return;

        setProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const savedRef = localStorage.getItem('referral_code');

            // Create pending order
            const res = await axios.post(`${API_URL}/shop/orders`, {
                items: [{ productId: product.id, quantity: 1 }],
                referralCode: savedRef || null
            }, config);

            const orderId = res.data.orderId;

            // Redirect to WhatsApp with Order ID
            const message = `Hello, I want to confirm my order #${orderId}.\n\nProduct: ${product.name}\nPrice: ₹${product.price}`;
            const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');

            navigate('/dashboard');
        } catch (error) {
            console.error('Order creation failed:', error);
            alert('Failed to initiate order. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (!product) return <div className="flex justify-center items-center h-screen">Product not found.</div>;

    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <Link to="/products" className="inline-flex items-center text-indigo-600 hover:text-indigo-900 mb-8">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Products
                </Link>

                <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
                    {/* Image gallery */}
                    <div className="flex flex-col-reverse">
                        <div className="w-full aspect-w-1 aspect-h-1 rounded-3xl overflow-hidden bg-white shadow-2xl shadow-gray-200 border border-gray-100 group">
                            <img
                                src={product.image_url || 'https://via.placeholder.com/600'}
                                alt={product.name}
                                className="w-full h-full object-center object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            />
                        </div>
                    </div>

                    {/* Product info */}
                    <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
                        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">{product.name}</h1>

                        <div className="mt-4 flex justify-between items-end">
                            <div>
                                <h2 className="sr-only">Product information</h2>
                                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">₹{product.price}</p>
                            </div>

                            {user && (
                                <button
                                    onClick={() => {
                                        const link = `${window.location.origin}/products/${product.id}?ref=${user.referral_code}`;
                                        navigator.clipboard.writeText(link);
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 2000);
                                    }}
                                    className="flex items-center text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                                >
                                    {copied ? <CheckCircle className="w-4 h-4 mr-1.5" /> : <Share2 className="w-4 h-4 mr-1.5" />}
                                    {copied ? 'Link Copied!' : 'Share with Referral'}
                                </button>
                            )}
                        </div>

                        <div className="mt-4 flex items-center">
                            <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 mr-4 shadow-sm border border-indigo-100">
                                {product.category || 'General'}
                            </span>
                            <div className="flex items-center text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                <CheckCircle className="w-4 h-4 mr-1.5" />
                                <span className="text-xs font-bold uppercase tracking-wider">In Stock</span>
                            </div>
                        </div>

                        {/* Rating Placeholder */}
                        <div className="mt-2 flex items-center">
                            <div className="flex text-yellow-400 text-sm">
                                {'★'.repeat(4)}{'☆'.repeat(1)}
                            </div>
                            <span className="ml-2 text-sm text-gray-500">(24 reviews)</span>
                        </div>

                        <div className="mt-6">
                            <h3 className="sr-only">Description</h3>
                            <div className="text-base text-gray-700 space-y-6" dangerouslySetInnerHTML={{ __html: product.description }} />
                        </div>

                        <div className="mt-6 border-t border-gray-200 pt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="flex items-center text-sm text-gray-500">
                                <span className="w-8 flex justify-center"><i className="text-xl">🚚</i></span>
                                <span className="ml-3">Free Shipping & Returns</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                                <span className="w-8 flex justify-center"><i className="text-xl">🛡️</i></span>
                                <span className="ml-3">Secure Payment</span>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row gap-4">
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                className="flex-1 bg-white border-2 border-indigo-600 rounded-xl py-4 px-8 flex items-center justify-center text-lg font-bold text-indigo-600 hover:bg-indigo-50 hover:shadow-lg active:scale-95 transition-all duration-200"
                            >
                                <ShoppingCart className="w-6 h-6 mr-2" />
                                Add to Cart
                            </button>
                            <button
                                type="button"
                                onClick={handleBuyNow}
                                disabled={processing}
                                className={`flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 border border-transparent rounded-xl py-4 px-8 flex items-center justify-center text-lg font-bold text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg hover:shadow-indigo-200 active:scale-95 transition-all duration-200 ${processing ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {processing ? 'Processing...' : 'Buy Now Securely'}
                            </button>
                        </div>


                        <div className="mt-6 text-sm text-gray-500">
                            <p>Purchases of this product contribute to your network volume.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
