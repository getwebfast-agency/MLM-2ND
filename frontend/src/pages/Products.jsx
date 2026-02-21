import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import API_URL from '../config';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

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
                <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Our Products</h2>
                {products.length === 0 ? (
                    <p className="mt-4 text-gray-500">No products available at the moment.</p>
                ) : (
                    <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                        {products.map((product) => (
                            <div key={product.id} className="group relative border rounded-lg p-4 hover:shadow-lg transition-shadow bg-white flex flex-col h-full">
                                <Link to={`/products/${product.id}`} className="block flex-grow">
                                    <div className="w-full min-h-60 bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75 lg:h-60 lg:aspect-none">
                                        <img
                                            src={product.image_url || 'https://via.placeholder.com/300?text=No+Image'}
                                            alt={product.name}
                                            className="w-full h-full object-center object-cover lg:w-full lg:h-full"
                                        />
                                    </div>
                                    <div className="mt-4 flex justify-between">
                                        <div>
                                            <h3 className="text-sm text-gray-700 font-bold">
                                                {product.name}
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                                        </div>
                                        <p className="text-lg font-medium text-indigo-600">₹{product.price}</p>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">{product.description}</p>
                                </Link>
                                <button
                                    onClick={() => addToCart(product)}
                                    className="mt-4 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition font-medium"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
