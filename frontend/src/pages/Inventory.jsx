import React, { useState, useEffect } from 'react';
import { Package, Search, Download, Plus, ChevronDown, Filter, Loader, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

// Modal Component for Adding New Product
const ProductModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        group: '',
        category: '',
        unit: 'Pcs',
        opening_qty: 0,
        description: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'opening_qty' ? parseFloat(value) || 0 : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.sku) {
            toast.error('Product name and SKU are required');
            return;
        }

        try {
            setSubmitting(true);
            await api.post('/products', { ...formData, is_active: true, price: 0 });
            toast.success('Product added successfully!');
            setFormData({
                name: '',
                sku: '',
                group: '',
                category: '',
                unit: 'Pcs',
                opening_qty: 0,
                description: ''
            });
            onClose();
            onSuccess();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add product');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-900">Add New Product</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g., Product Name"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">SKU *</label>
                        <input
                            type="text"
                            name="sku"
                            value={formData.sku}
                            onChange={handleChange}
                            placeholder="e.g., SKU-001"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Group</label>
                            <input
                                type="text"
                                name="group"
                                value={formData.group}
                                onChange={handleChange}
                                placeholder="e.g., Electronics"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                placeholder="e.g., Gadgets"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                            <select
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            >
                                <option>Pcs</option>
                                <option>Kg</option>
                                <option>Ltr</option>
                                <option>Box</option>
                                <option>Ctn</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Opening Qty</label>
                            <input
                                type="number"
                                name="opening_qty"
                                value={formData.opening_qty}
                                onChange={handleChange}
                                placeholder="0"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter product description"
                            rows="2"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:opacity-50"
                        >
                            {submitting ? 'Adding...' : 'Add Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Inventory = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [stockItems, setStockItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGroup, setFilterGroup] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [productsRes, stockRes] = await Promise.all([
                api.get('/products'),
                api.get('/stock_items')
            ]);
            // Handle both direct array and { data: [...] } format
            const productsData = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data?.data || []);
            const stockData = Array.isArray(stockRes.data) ? stockRes.data : (stockRes.data?.data || []);
            setProducts(productsData);
            setStockItems(stockData);
            setError(null);
        } catch (err) {
            console.error('Error fetching inventory:', err);
            const errorMsg = err.response?.data?.message || 'Failed to load inventory';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Combine products with stock data
    const getProductStock = (productId) => {
        return stockItems.filter(item => item.product_id === productId);
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGroup = filterGroup === 'All' || product.group === filterGroup;
        return matchesSearch && matchesGroup;
    });

    const groups = ['All', ...new Set(products.filter(p => p.group).map(p => p.group))];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans text-slate-700 p-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-8 flex items-center gap-3">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Stock Inventory</h1>
                        <p className="text-slate-600">Manage and monitor your product inventory</p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name or SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        />
                    </div>

                    <select
                        value={filterGroup}
                        onChange={(e) => setFilterGroup(e.target.value)}
                        className="px-4 py-2.5 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium cursor-pointer"
                    >
                        {groups.map(group => (
                            <option key={group} value={group}>{group}</option>
                        ))}
                    </select>

                    <div className="flex gap-2">
                        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 font-medium transition">
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Export</span>
                        </button>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition">
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">New Item</span>
                        </button>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        Error: {error}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left px-6 py-3 font-semibold text-slate-700">Product Name</th>
                                    <th className="text-left px-6 py-3 font-semibold text-slate-700">SKU</th>
                                    <th className="text-left px-6 py-3 font-semibold text-slate-700">Group</th>
                                    <th className="text-left px-6 py-3 font-semibold text-slate-700">Category</th>
                                    <th className="text-center px-6 py-3 font-semibold text-slate-700">Unit</th>
                                    <th className="text-right px-6 py-3 font-semibold text-slate-700">Opening Qty</th>
                                    <th className="text-right px-6 py-3 font-semibold text-slate-700">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map(product => (
                                        <tr key={product.id} className="hover:bg-slate-50 transition cursor-pointer">
                                            <td className="px-6 py-4 font-medium text-blue-600">{product.name}</td>
                                            <td className="px-6 py-4 text-slate-600">{product.sku}</td>
                                            <td className="px-6 py-4 text-slate-600">{product.group || '-'}</td>
                                            <td className="px-6 py-4 text-slate-600">{product.category || '-'}</td>
                                            <td className="px-6 py-4 text-center text-slate-600">{product.unit || '-'}</td>
                                            <td className="px-6 py-4 text-right font-semibold text-slate-900">{product.opening_qty || 0}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    product.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {product.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                                            No products found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Summary */}
                {!loading && !error && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
                            <p className="text-slate-600 text-sm font-medium mb-2">Total Products</p>
                            <p className="text-3xl font-bold text-slate-900">{products.length}</p>
                        </div>
                        <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
                            <p className="text-slate-600 text-sm font-medium mb-2">Active Items</p>
                            <p className="text-3xl font-bold text-green-600">{products.filter(p => p.is_active).length}</p>
                        </div>
                        <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
                            <p className="text-slate-600 text-sm font-medium mb-2">Total Stock Movements</p>
                            <p className="text-3xl font-bold text-blue-600">{stockItems.length}</p>
                        </div>
                    </div>
                )}

                {/* Add Product Modal */}
                <ProductModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={fetchData}
                />
            </div>
        </div>
    );
};

export default Inventory;
