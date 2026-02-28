import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';
import API_URL from '../../config';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [showProductForm, setShowProductForm] = useState(false);
    const [productForm, setProductForm] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        image_url: '',
        original_price: '',
        tax: 'included',
        customTaxPercent: '',
        shipping_cost: 0,
        shippingOption: 'free',
        referral_discount_percent: 0,
        member_commission_percent: 0
    });

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${API_URL}/products`);
            setProducts(res.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', productForm.name);
            formData.append('description', productForm.description);
            formData.append('price', productForm.price);
            formData.append('category', productForm.category);
            formData.append('original_price', productForm.original_price || 0); // Handle optional
            const taxValue = productForm.tax === 'custom'
                ? `custom:${productForm.customTaxPercent}`
                : productForm.tax;
            formData.append('tax', taxValue);
            formData.append('shipping_cost', productForm.shipping_cost);
            formData.append('referral_discount_percent', productForm.referral_discount_percent);
            formData.append('member_commission_percent', productForm.member_commission_percent);

            if (productForm.image) {
                formData.append('image', productForm.image);
            } else if (productForm.image_url) {
                formData.append('image_url', productForm.image_url);
            }

            // Headers for multipart are set automatically by axios when data is FormData
            // But we need to keep Authorization
            const uploadConfig = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            await axios.post(`${API_URL}/products`, formData, uploadConfig);

            setShowProductForm(false);
            setProductForm({
                name: '',
                description: '',
                price: '',
                category: '',
                image_url: '',
                image: null,
                original_price: '',
                tax: 'included',
                customTaxPercent: '',
                shipping_cost: 0,
                shippingOption: 'free',
                referral_discount_percent: 0,
                member_commission_percent: 0
            });
            fetchProducts();
        } catch (error) {
            console.error('Error creating product:', error);
            alert('Failed to create product');
        }
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`${API_URL}/products/${id}`, config);
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
                <button
                    onClick={() => setShowProductForm(!showProductForm)}
                    className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                </button>
            </div>

            {showProductForm && (
                <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Add New Product</h4>
                    <form onSubmit={handleProductSubmit} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <input
                            type="text"
                            placeholder="Product Name"
                            required
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-white border"
                            value={productForm.name}
                            onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Category"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-white border"
                            value={productForm.category}
                            onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Price"
                            required
                            step="0.01"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-white border"
                            value={productForm.price}
                            onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Original Price (Optional)"
                            step="0.01"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-white border"
                            value={productForm.original_price}
                            onChange={e => setProductForm({ ...productForm, original_price: e.target.value })}
                        />

                        <div>
                            <select
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-white border"
                                value={productForm.tax}
                                onChange={e => setProductForm({ ...productForm, tax: e.target.value, customTaxPercent: '' })}
                            >
                                <option value="included">Tax Included (in price)</option>
                                <option value="18%">Tax 18%</option>
                                <option value="custom">Custom Tax %</option>
                            </select>
                            {productForm.tax === 'custom' && (
                                <input
                                    type="number"
                                    placeholder="Enter custom tax % (e.g. 12)"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    required
                                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-white border"
                                    value={productForm.customTaxPercent}
                                    onChange={e => setProductForm({ ...productForm, customTaxPercent: e.target.value })}
                                />
                            )}
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Shipping</label>
                            <div className="flex items-center space-x-4 mb-2">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        className="form-radio text-indigo-600"
                                        name="shippingOption"
                                        checked={productForm.shippingOption === 'free'}
                                        onChange={() => setProductForm({ ...productForm, shippingOption: 'free', shipping_cost: 0 })}
                                    />
                                    <span className="ml-2">Free Shipping</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        className="form-radio text-indigo-600"
                                        name="shippingOption"
                                        checked={productForm.shippingOption === 'custom'}
                                        onChange={() => setProductForm({ ...productForm, shippingOption: 'custom' })}
                                    />
                                    <span className="ml-2">Custom Shipping Cost</span>
                                </label>
                            </div>
                            {productForm.shippingOption === 'custom' && (
                                <input
                                    type="number"
                                    placeholder="Shipping Cost"
                                    step="0.01"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-white border max-w-xs"
                                    value={productForm.shipping_cost}
                                    onChange={e => setProductForm({ ...productForm, shipping_cost: e.target.value })}
                                />
                            )}
                        </div>

                        {/* Image Upload Handlers */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                onChange={e => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setProductForm({ ...productForm, image: file });
                                    }
                                }}
                            />
                            {/* Or Manual URL fallback */}
                            <input
                                type="text"
                                placeholder="Or enter Image URL"
                                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-white border"
                                value={productForm.image_url}
                                onChange={e => setProductForm({ ...productForm, image_url: e.target.value })}
                            />
                        </div>

                        <textarea
                            placeholder="Description"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-white border sm:col-span-2"
                            rows="3"
                            value={productForm.description}
                            onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                        />

                        <div className="sm:col-span-2 grid grid-cols-1 gap-6 sm:grid-cols-2 mt-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Referral Discount (%)</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 10"
                                    step="0.01"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-white border"
                                    value={productForm.referral_discount_percent}
                                    onChange={e => setProductForm({ ...productForm, referral_discount_percent: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Member Commission (%)</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 5"
                                    step="0.01"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-white border"
                                    value={productForm.member_commission_percent}
                                    onChange={e => setProductForm({ ...productForm, member_commission_percent: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="sm:col-span-2 mt-4 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                            <button
                                type="button"
                                onClick={() => setShowProductForm(false)}
                                className="w-full sm:w-auto inline-flex justify-center py-2 px-6 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="w-full sm:w-auto inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-md transition-shadow"
                            >
                                Save Product
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                    <div key={product.id} className="group relative bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                        <div className="aspect-w-3 aspect-h-2 bg-gray-200">
                            <img src={product.image_url || 'https://via.placeholder.com/300'} alt={product.name} className="object-cover w-full h-48" />
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                                    <p className="text-sm text-gray-500">{product.category}</p>
                                </div>
                                <p className="text-lg font-bold text-indigo-600">₹{product.price}</p>
                            </div>
                            <div className="mt-4 flex justify-end space-x-2">
                                <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-900 p-2">
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminProducts;
