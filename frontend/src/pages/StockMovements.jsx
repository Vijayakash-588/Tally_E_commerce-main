import React, { useState } from 'react';
import { useSearch } from '../context/SearchContext';
import { useQuery } from '@tanstack/react-query';
import { ArrowUp, ArrowDown, Search, ArrowLeft, TrendingUp, TrendingDown, Activity, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import clsx from 'clsx';

const StockMovements = () => {
    const navigate = useNavigate();
    const { searchTerm, setSearchTerm } = useSearch();
    const [filterType, setFilterType] = useState('all');

    const { data: stockItems = [], isLoading } = useQuery({
        queryKey: ['stock_items'],
        queryFn: async () => {
            const res = await api.get('/inventory');
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
        date: item.txn_date || item.created_at,
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
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/')}
                    className="p-3 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-2xl transition-all"
                    title="Back to Dashboard"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] block">Inventory Tracking</span>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Stock Movements</h1>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Stock In</p>
                            <p className="text-3xl font-black text-green-600 mt-2 tracking-tight">{stats.inbound}</p>
                            <p className="text-xs font-bold text-slate-400 mt-1">Units Received</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-green-50 group-hover:scale-110 transition-transform duration-500">
                            <TrendingDown className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Stock Out</p>
                            <p className="text-3xl font-black text-red-600 mt-2 tracking-tight">{stats.outbound}</p>
                            <p className="text-xs font-bold text-slate-400 mt-1">Units Dispatched</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-red-50 group-hover:scale-110 transition-transform duration-500">
                            <TrendingUp className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Total Movements</p>
                            <p className="text-3xl font-black text-blue-600 mt-2 tracking-tight">{stats.total}</p>
                            <p className="text-xs font-bold text-slate-400 mt-1">All Transactions</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-blue-50 group-hover:scale-110 transition-transform duration-500">
                            <Activity className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                <Search className="w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by product or reference..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-16 pr-6 py-5 bg-white border-2 border-slate-100 rounded-[2rem] focus:ring-8 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all font-black text-slate-900 shadow-sm placeholder:text-slate-400"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute inset-y-0 right-6 flex items-center text-slate-300 hover:text-slate-600 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-bold text-slate-900 appearance-none"
                        >
                            <option value="all">All Movements</option>
                            <option value="IN">Stock In Only</option>
                            <option value="OUT">Stock Out Only</option>
                        </select>
                    </div>
                </div>

                {/* Movements Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Product</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Type</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Quantity</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reference</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-12 text-center text-slate-400 font-bold">Loading movements...</td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-12 text-center text-slate-400 font-bold">No movements found</td>
                                </tr>
                            ) : (
                                filtered.map((movement) => (
                                    <tr key={movement.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="text-sm font-black text-slate-900">{movement.product_name}</div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-center">
                                            <span className={clsx(
                                                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider",
                                                movement.type === 'IN'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                            )}>
                                                {movement.type === 'IN' ? (
                                                    <>
                                                        <ArrowDown className="w-3 h-3" />
                                                        In
                                                    </>
                                                ) : (
                                                    <>
                                                        <ArrowUp className="w-3 h-3" />
                                                        Out
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-black text-slate-900">
                                            {movement.quantity}
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-slate-600">
                                            {movement.reference || '-'}
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-slate-600">
                                            {movement.date ? new Date(movement.date).toLocaleDateString('en-IN') : '-'}
                                        </td>
                                        <td className="px-8 py-5 text-sm font-bold text-slate-600">
                                            {movement.notes || '-'}
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
