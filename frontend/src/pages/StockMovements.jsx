import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUp, ArrowDown, Search, ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const StockMovements = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    const { data: stockItems = [], isLoading } = useQuery({
        queryKey: ['stock_items'],
        queryFn: async () => {
            const res = await api.get('/stock_items');
            return Array.isArray(res.data) ? res.data : (res.data?.data || []);
        }
    });

    const { data: products = [] } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await api.get('/products');
            return Array.isArray(res.data) ? res.data : (res.data?.data || []);
        }
    });

    const getProductName = (productId) => {
        return products.find(p => p.id === productId)?.name || `Product #${productId}`;
    };

    const movements = stockItems.map(item => ({
        id: item.id,
        product_id: item.product_id,
        product_name: getProductName(item.product_id),
        quantity: item.quantity,
        type: item.type,
        reference: item.reference,
        date: item.created_at,
        notes: item.notes
    }));

    const filtered = movements.filter(m => {
        const matchesSearch = m.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (m.reference && m.reference.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = filterType === 'all' || m.type === filterType;
        return matchesSearch && matchesType;
    });

    // Calculate statistics
    const stats = {
        inbound: movements.filter(m => m.type === 'IN').reduce((sum, m) => sum + m.quantity, 0),
        outbound: movements.filter(m => m.type === 'OUT').reduce((sum, m) => sum + m.quantity, 0),
        total: movements.length
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stock Movements</h1>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Stock In</p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.inbound}</p>
                        </div>
                        <ArrowDown className="w-10 h-10 text-green-600 dark:text-green-400 opacity-20" />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Stock Out</p>
                            <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{stats.outbound}</p>
                        </div>
                        <ArrowUp className="w-10 h-10 text-red-600 dark:text-red-400 opacity-20" />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Movements</p>
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{stats.total}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Movements Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by product or reference..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="all">All Types</option>
                            <option value="IN">Stock In</option>
                            <option value="OUT">Stock Out</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reference</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">Loading...</td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No movements found</td>
                                </tr>
                            ) : (
                                filtered.map((movement) => (
                                    <tr key={movement.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                            {movement.date ? new Date(movement.date).toLocaleDateString('en-IN') : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{movement.product_name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                movement.type === 'IN' 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                                {movement.type === 'IN' ? (
                                                    <>
                                                        <ArrowDown className="w-3 h-3 mr-1" />
                                                        Stock In
                                                    </>
                                                ) : (
                                                    <>
                                                        <ArrowUp className="w-3 h-3 mr-1" />
                                                        Stock Out
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className={`text-sm font-semibold ${
                                                movement.type === 'IN' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                            }`}>
                                                {movement.type === 'IN' ? '+' : '-'}{movement.quantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {movement.reference || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                                            {movement.notes || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Movement Summary by Product */}
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Movement Summary by Product</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock In</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock Out</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Net Change</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">Loading...</td>
                                </tr>
                            ) : movements.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No movements found</td>
                                </tr>
                            ) : (
                                Object.entries(
                                    movements.reduce((acc, m) => {
                                        if (!acc[m.product_id]) {
                                            acc[m.product_id] = { 
                                                name: m.product_name, 
                                                in: 0, 
                                                out: 0 
                                            };
                                        }
                                        if (m.type === 'IN') acc[m.product_id].in += m.quantity;
                                        if (m.type === 'OUT') acc[m.product_id].out += m.quantity;
                                        return acc;
                                    }, {})
                                ).map(([productId, data]) => (
                                    <tr key={productId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">{data.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-green-600 dark:text-green-400 font-semibold">+{data.in}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-red-600 dark:text-red-400 font-semibold">-{data.out}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-900 dark:text-white">
                                            {data.in - data.out}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StockMovements;
