import React, { useState, useEffect } from 'react';
import { Package, Search, Download, Plus, ChevronDown, Filter, Loader } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [stockItems, setStockItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGroup, setFilterGroup] = useState('All');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [productsRes, stockRes] = await Promise.all([
                    api.get('/products'),
                    api.get('/stock_items')
                ]);
                setProducts(productsRes.data || []);
                setStockItems(stockRes.data || []);
                setError(null);
            } catch (err) {
                console.error('Error fetching inventory:', err);
                setError(err.response?.data?.message || 'Failed to load inventory');
                toast.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Stock Inventory</h1>
                    <p className="text-slate-600">Manage and monitor your product inventory</p>
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
                        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition">
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
            </div>
        </div>
    );
};

export default Inventory;
