import React from 'react';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import API_URL, { WHATSAPP_NUMBER } from '../config';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
    const [suggestedProducts, setSuggestedProducts] = React.useState([]);
    const [referralCode, setReferralCode] = React.useState('');
    const [referralDiscount, setReferralDiscount] = React.useState(0);
    const [referralMessage, setReferralMessage] = React.useState({ type: '', text: '' });
    const [isApplied, setIsApplied] = React.useState(false);

    const handleApplyReferral = async () => {
        if (!referralCode) return;
        setReferralMessage({ type: '', text: '' });

        try {
            await axios.get(`${API_URL}/auth/validate-referral/${referralCode}`);
            // If valid (200 OK)
            const discount = cartTotal * 0.10; // 10% discount
            setReferralDiscount(discount);
            setReferralMessage({ type: 'success', text: 'Referral applied! 10% discount.' });
            setIsApplied(true);
        } catch (error) {
            setReferralDiscount(0);
            setReferralMessage({ type: 'error', text: 'Invalid referral code.' });
            setIsApplied(false);
        }
    };

    const taxEstimate = (cartTotal - referralDiscount) * 0.18;
    const finalTotal = (cartTotal - referralDiscount) + taxEstimate;

    React.useEffect(() => {
        // Fetch random products for suggestion
        const fetchSuggestions = async () => {
            try {
                const res = await axios.get(`${API_URL}/products`);
                // Shuffle and pick 4
                const shuffled = res.data.sort(() => 0.5 - Math.random());
                setSuggestedProducts(shuffled.slice(0, 4));
            } catch (err) {
                console.error("Failed to load suggestions", err);
            }
        };
        fetchSuggestions();
    }, []);

    // Calculate estimated delivery (3-5 days from now)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 4);
    const dateString = deliveryDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
                <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
                <Link to="/products" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Continue Shopping
                </Link>

                {suggestedProducts.length > 0 && (
                    <div className="mt-16 w-full max-w-7xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Trending Now</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {suggestedProducts.map(product => (
                                <Link key={product.id} to={`/products/${product.id}`} className="group bg-white border rounded-lg p-4 hover:shadow-md transition">
                                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 h-40">
                                        <img src={product.image_url} alt={product.name} className="h-full w-full object-cover object-center" />
                                    </div>
                                    <h3 className="mt-4 text-sm text-gray-700">{product.name}</h3>
                                    <p className="mt-1 text-lg font-medium text-gray-900">₹{product.price}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-10">Shopping Cart</h1>

                <div className="mt-12 lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start xl:gap-x-16">
                    <section aria-labelledby="cart-heading" className="lg:col-span-7">
                        <ul role="list" className="border-t border-b border-gray-200 divide-y divide-gray-200">
                            {cart.map((product) => (
                                <li key={product.id} className="flex py-6 sm:py-10">
                                    <div className="flex-shrink-0">
                                        <img
                                            src={product.image_url || 'https://via.placeholder.com/150'}
                                            alt={product.name}
                                            className="w-24 h-24 rounded-md object-center object-cover sm:w-32 sm:h-32"
                                        />
                                    </div>

                                    <div className="ml-4 flex-1 flex flex-col justify-between sm:ml-6">
                                        <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                                            <div>
                                                <div className="flex justify-between">
                                                    <h3 className="text-sm">
                                                        <Link to={`/products/${product.id}`} className="font-medium text-gray-700 hover:text-gray-800">
                                                            {product.name}
                                                        </Link>
                                                    </h3>
                                                </div>
                                                <div className="mt-1 flex text-sm">
                                                    <p className="text-gray-500">{product.category}</p>
                                                </div>
                                                <p className="mt-1 text-sm font-medium text-gray-900">₹{product.price}</p>

                                                <div className="mt-2 flex items-center text-sm text-green-600">
                                                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    In stock
                                                </div>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Delivery by <span className="font-medium text-gray-900">{dateString}</span>
                                                </p>
                                            </div>

                                            <div className="mt-4 sm:mt-0 sm:pr-9">
                                                <div className="flex items-center border rounded-md w-max">
                                                    <button
                                                        onClick={() => updateQuantity(product.id, -1)}
                                                        className="p-1 hover:bg-gray-100 text-gray-600"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="px-3 text-sm font-medium">{product.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(product.id, 1)}
                                                        className="p-1 hover:bg-gray-100 text-gray-600"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="absolute top-0 right-0">
                                                    <button
                                                        onClick={() => removeFromCart(product.id)}
                                                        type="button"
                                                        className="-m-2 p-2 inline-flex text-gray-400 hover:text-gray-500"
                                                    >
                                                        <span className="sr-only">Remove</span>
                                                        <Trash2 className="h-5 w-5" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Order summary */}
                    <section
                        aria-labelledby="summary-heading"
                        className="mt-16 bg-gray-50 rounded-lg px-4 py-6 sm:p-6 lg:p-8 lg:mt-0 lg:col-span-5"
                    >
                        <h2 id="summary-heading" className="text-lg font-medium text-gray-900">
                            Order summary
                        </h2>

                        <div className="mt-6 space-y-4">
                            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                <dt className="text-base font-medium text-gray-900">Subtotal</dt>
                                <dd className="text-base font-medium text-gray-900">₹{cartTotal.toFixed(2)}</dd>
                            </div>

                            {/* Promo Code */}
                            <div className="border-t border-gray-200 pt-4 pb-4">
                                <label htmlFor="referral-code" className="block text-sm font-medium text-gray-700">Referral Code</label>
                                <div className="mt-1 flex space-x-2">
                                    <input
                                        type="text"
                                        id="referral-code"
                                        value={referralCode}
                                        onChange={(e) => setReferralCode(e.target.value)}
                                        disabled={isApplied}
                                        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isApplied ? 'bg-gray-100 text-gray-500' : 'border-gray-300'}`}
                                        placeholder="Enter code"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleApplyReferral}
                                        disabled={isApplied || !referralCode}
                                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${isApplied ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'} focus:outline-none`}
                                    >
                                        {isApplied ? 'Applied' : 'Apply'}
                                    </button>
                                </div>
                                {referralMessage.text && (
                                    <p className={`mt-2 text-sm ${referralMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                        {referralMessage.text}
                                    </p>
                                )}
                            </div>

                            {isApplied && (
                                <div className="flex items-center justify-between border-t border-gray-200 pt-4 text-green-600">
                                    <dt className="text-sm font-medium">Referral Discount (10%)</dt>
                                    <dd className="text-sm font-medium">-₹{referralDiscount.toFixed(2)}</dd>
                                </div>
                            )}

                            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                <dt className="text-sm font-medium text-gray-900">Shipping Estimate</dt>
                                <dd className="text-sm font-medium text-gray-700">₹0.00</dd>
                            </div>
                            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                <dt className="text-sm font-medium text-gray-900">Tax Estimate (18%)</dt>
                                <dd className="text-sm font-medium text-gray-700">₹{taxEstimate.toFixed(2)}</dd>
                            </div>

                            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                <dt className="text-lg font-bold text-gray-900">Order Total</dt>
                                <dd className="text-lg font-bold text-indigo-600">₹{finalTotal.toFixed(2)}</dd>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        const token = localStorage.getItem('token');
                                        if (!token) {
                                            // Handle not logged in (redirect to login)
                                            window.location.href = '/login';
                                            return;
                                        }

                                        const config = { headers: { Authorization: `Bearer ${token}` } };

                                        // Prepare items for API
                                        const items = cart.map(item => ({
                                            productId: item.id,
                                            quantity: item.quantity
                                        }));

                                        // Create pending order
                                        const res = await axios.post(`${API_URL}/shop/orders`, {
                                            items,
                                            referralCode: isApplied ? referralCode : null
                                        }, config);

                                        const orderId = res.data.orderId;

                                        // WhatsApp Message
                                        const itemsList = cart.map(item => `- ${item.name} (x${item.quantity})`).join('\n');
                                        let message = `Hello, I want to confirm my order #${orderId}.\n\nItems:\n${itemsList}\n\n*Total: ₹${finalTotal.toFixed(2)}*`;

                                        if (isApplied && referralCode) {
                                            message += `\n\nReferral Code: ${referralCode}`;
                                        }

                                        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
                                        window.open(whatsappUrl, '_blank');

                                        clearCart(); // Clear cart after successful order initiation
                                    } catch (error) {
                                        console.error('Order failed:', error);
                                        alert('Failed to create order. Please try again.');
                                    }
                                }}
                                className="w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-bold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500 flex justify-center items-center"
                            >
                                <span className="mr-2">Buy on WhatsApp</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" /></svg>
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="mt-6 border-t border-gray-200 pt-6">
                            <div className="flex justify-center space-x-4 opacity-70 grayscale hover:grayscale-0 transition-all">
                                <div className="flex flex-col items-center">
                                    <div className="h-8 w-12 bg-gray-200 rounded mb-1"></div>
                                    <span className="text-[10px] text-gray-500">VISA</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="h-8 w-12 bg-gray-200 rounded mb-1"></div>
                                    <span className="text-[10px] text-gray-500">UPI</span>
                                </div>
                            </div>
                            <p className="text-xs text-center text-gray-400 mt-2">100% Secure Transaction</p>
                        </div>
                        <div className="mt-6 text-center text-sm">
                            <p>
                                or{' '}
                                <Link to="/products" className="text-indigo-600 font-medium hover:text-indigo-500">
                                    Continue Shopping<span aria-hidden="true"> &rarr;</span>
                                </Link>
                            </p>
                        </div>
                    </section>
                </div>
                {/* Suggested Products */}
                {
                    suggestedProducts.length > 0 && (
                        <div className="mt-24 w-full">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">You might also like</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {suggestedProducts.map(product => (
                                    <Link key={product.id} to={`/products/${product.id}`} className="group bg-white border rounded-lg p-4 hover:shadow-lg transition">
                                        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 h-48">
                                            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover object-center" />
                                        </div>
                                        <h3 className="mt-4 text-sm font-medium text-gray-900">{product.name}</h3>
                                        <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                                        <p className="mt-1 text-lg font-bold text-indigo-600">₹{product.price}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )
                }
            </div >
        </div >
    );
};

export default Cart;
