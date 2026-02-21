import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, CheckCircle } from 'lucide-react';
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

            // Create pending order
            const res = await axios.post(`${API_URL}/shop/orders`, {
                items: [{ productId: product.id, quantity: 1 }]
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
                        <div className="w-full aspect-w-1 aspect-h-1 rounded-lg overflow-hidden bg-gray-100">
                            <img
                                src={product.image_url || 'https://via.placeholder.com/600'}
                                alt={product.name}
                                className="w-full h-full object-center object-cover"
                            />
                        </div>
                    </div>

                    {/* Product info */}
                    <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{product.name}</h1>

                        <div className="mt-3">
                            <h2 className="sr-only">Product information</h2>
                            <p className="text-3xl text-indigo-600 font-bold">₹{product.price}</p>
                        </div>

                        <div className="mt-3 flex items-center">
                            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800 mr-4">
                                {product.category || 'General'}
                            </span>
                            <div className="flex items-center text-green-600">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                <span className="text-sm font-medium">In Stock</span>
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

                        <div className="mt-8 flex gap-4">
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                className="flex-1 bg-white border border-indigo-600 rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                <ShoppingCart className="w-5 h-5 mr-2" />
                                Add to Cart
                            </button>
                            <button
                                type="button"
                                onClick={handleBuyNow}
                                disabled={processing}
                                className={`flex-1 bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${processing ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {processing ? 'Processing...' : 'Buy Now'}
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
