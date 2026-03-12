import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useSearch } from '../context/SearchContext';
import { useQuery } from '@tanstack/react-query';
import {
    Package, Search, ArrowLeft, TrendingUp, TrendingDown,
    AlertCircle, RefreshCcw, Filter, Download, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import api from '../api/axios';

const StockLevels = () => {
    const navigate = useNavigate();
    const { searchTerm, setSearchTerm } = useSearch();
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;
    const [groupFilter, setGroupFilter] = useState('all');

    const { data: response = {}, isLoading, isFetching, refetch } = useQuery({
        queryKey: ['stock-levels', currentPage, searchTerm, groupFilter],
        queryFn: async () => {
            const res = await api.get('/inventory/levels', {
                params: {
                    page: currentPage,
                    limit: rowsPerPage,
                    search: searchTerm
                }
            });
            return res.data;
        },
        keepPreviousData: true
    });

    const stockLevels = Array.isArray(response) ? response : (response.data || []);

    const filteredLevels = stockLevels.filter(item => {
        const name = (item?.name || item?.product_name || "").toLowerCase();
        const sku = (item?.sku || "").toLowerCase();
        const search = searchTerm.toLowerCase();
        const matchesSearch = name.includes(search) || sku.includes(search);
        
        const itemGroup = (item?.group || "General").toLowerCase();
        const matchesGroup = groupFilter === 'all' || itemGroup === groupFilter.toLowerCase();

        return matchesSearch && matchesGroup;
    });

    const totalPages = response.totalPages || Math.ceil(filteredLevels.length / rowsPerPage) || 1;
    const totalRecords = response.total || filteredLevels.length;
    const paginatedData = filteredLevels;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, groupFilter]);

    const downloadPDF = () => {
        const doc = new jsPDF('landscape');
        doc.setFontSize(22);
        doc.setTextColor(30, 41, 59);
        doc.text('Stock Levels Report', 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        const dateStr = new Date().toLocaleString('en-IN');
        doc.text(`Generated on: ${dateStr}`, 14, 28);
        doc.text(`Group Filter: ${groupFilter.toUpperCase()}`, 14, 33);

        const tableColumn = ["Product", "SKU", "Opening", "Inwards", "Outwards", "Closing"];
        const tableRows = filteredLevels.map(item => [
            item.name || item.product_name || 'N/A',
            item.sku || 'N/A',
            Number(item.opening_qty || 0),
            `+${Number(item.inwards || 0)}`,
            `-${Number(item.outwards || 0)}`,
            Number(item.closing_qty || (Number(item.opening_qty || 0) + Number(item.inwards || 0) - Number(item.outwards || 0)))
        ]);

        autoTable(doc, {
            startY: 40,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontSize: 10, fontStyle: 'bold' },
            styles: { fontSize: 9, cellPadding: 3 },
            columnStyles: { 2: { halign: 'center' }, 3: { halign: 'center' }, 4: { halign: 'center' }, 5: { halign: 'center' } }
        });

        doc.save(`Stock_Levels_Report_${new Date().getTime()}.pdf`);
    };

    const groups = ['all', ...new Set(stockLevels.map(item => item.group).filter(Boolean))];

    const stats = {
        totalItems: totalRecords,
        lowStock: stockLevels.filter(item => Number(item.closing_qty) < 10).length,
        outOfStock: stockLevels.filter(item => Number(item.closing_qty) <= 0).length,
        totalValue: stockLevels.reduce((sum, item) => sum + (Number(item.closing_qty || 0) * (item.unit_price || 0)), 0)
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/')} className="p-3 bg-white text-slate-600 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-all shadow-sm">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] block mb-1">Inventory Control</span>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Stock Levels</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => refetch()} className="p-4 bg-white text-slate-600 hover:text-blue-600 rounded-2xl border border-slate-100 transition-all shadow-sm group">
                        <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                    </button>
                    <button onClick={downloadPDF} className="flex items-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-600/30 hover:bg-blue-700 font-black uppercase tracking-widest text-xs transition-all">
                        <Download className="w-4 h-4" /> Export Report
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard label="Total Items" value={stats.totalItems} icon={Package} color="blue" />
                <StatCard label="Low Stock" value={stats.lowStock} icon={AlertCircle} color="amber" />
                <StatCard label="Out of Stock" value={stats.outOfStock} icon={TrendingDown} color="rose" />
                <StatCard label="Stock Movement" value="Active" icon={TrendingUp} color="emerald" />
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative group flex-1 w-full">
                            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                <Search className="w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name or SKU..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-16 pr-6 py-5 bg-white border-2 border-slate-100 rounded-[2rem] focus:ring-8 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all font-black text-slate-900 shadow-sm"
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-6 flex items-center text-slate-300 hover:text-slate-600">
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 w-full md:w-auto">
                            <Filter className="w-4 h-4 text-slate-400" />
                            <select
                                value={groupFilter}
                                onChange={(e) => setGroupFilter(e.target.value)}
                                className="bg-transparent border-none outline-none font-black text-[10px] uppercase tracking-widest text-slate-600 cursor-pointer"
                            >
                                {groups.map(g => (
                                    <option key={g} value={g}>{g === 'all' ? 'All Groups' : g}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Info</th>
                                <th className="px-8 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Opening</th>
                                <th className="px-8 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest text-emerald-600">Inwards</th>
                                <th className="px-8 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest text-rose-600">Outwards</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Closing Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading || isFetching ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-12 text-center">
                                        <RefreshCcw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                                        <p className="text-xs font-black text-slate-400 uppercase">Syncing Inventory...</p>
                                    </td>
                                </tr>
                            ) : paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-bold">No items found</td>
                                </tr>
                            ) : (
                                paginatedData.map((item) => {
                                    const opening = Number(item.opening_qty || 0);
                                    const inQty = Number(item.inwards || 0);
                                    const outQty = Number(item.outwards || 0);
                                    const closing = item.closing_qty ?? (opening + inQty - outQty);

                                    return (
                                        <tr key={item.product_id || item.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 group-hover:bg-white">
                                                        <Package className="w-6 h-6 text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 tracking-tight">{item.name || item.product_name || 'Unnamed'}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.sku || 'N/A'}</span>
                                                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{item.group || 'General'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center font-bold text-slate-600">{opening}</td>
                                            <td className="px-8 py-6 text-center font-black text-emerald-600">+{inQty}</td>
                                            <td className="px-8 py-6 text-center font-black text-rose-600">-{outQty}</td>
                                            <td className="px-8 py-6 text-right">
                                                <span className={clsx(
                                                    "inline-block px-4 py-2 rounded-xl font-black text-lg tracking-tight",
                                                    closing <= 0 ? "bg-rose-50 text-rose-600" :
                                                    closing < 10 ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-900"
                                                )}>
                                                    {closing}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>

                    <div className="flex items-center justify-between p-8 border-t border-slate-50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Showing {paginatedData.length} of {totalRecords} records
                        </p>
                        <div className="flex items-center gap-2">
                            <button 
                                disabled={currentPage === 1} 
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white disabled:opacity-30 border border-slate-100"
                            >Previous</button>
                            <span className="text-[10px] font-black text-slate-400 px-2 uppercase">Page {currentPage} of {totalPages}</span>
                            <button 
                                disabled={currentPage >= totalPages} 
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white disabled:opacity-30 border border-slate-100"
                            >Next</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, color }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        amber: 'bg-amber-50 text-amber-600',
        rose: 'bg-rose-50 text-rose-600',
        emerald: 'bg-emerald-50 text-emerald-600'
    };
    return (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{label}</p>
                    <p className="text-3xl font-black mt-2 tracking-tight text-slate-900">{value}</p>
                </div>
                <div className={clsx('p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500', colors[color])}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
};

export default StockLevels;