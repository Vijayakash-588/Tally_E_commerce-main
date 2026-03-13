import React, { useState, useEffect, useMemo } from 'react';
import { useSearch } from '../context/SearchContext';
import {
    Wallet,
    Landmark,
    ShoppingCart,
    ShoppingBag,
    TrendingUp,
    TrendingDown,
    ArrowRight,
    Download,
    Filter,
    Package,
    ChevronRight,
    Plus,
    History,
    FileText,
    Zap,
    Search,
    X,
    RefreshCcw
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '../api/sales';

const typeColors = {
    'sales': 'bg-emerald-50 text-emerald-600',
    'purchase': 'bg-rose-50 text-rose-600',
    'payment': 'bg-blue-50 text-blue-600',
    'receipt': 'bg-amber-50 text-amber-600'
};

const Sparkline = ({ color }) => (
    <div className="h-8 w-24">
        <svg viewBox="0 0 100 30" className="w-full h-full">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="0,20 15,15 30,25 45,10 60,18 75,5 90,15 100,10"
                className="opacity-40"
            />
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="0,20 15,15 30,25 45,10 60,18 75,5 90,15 100,10"
                strokeDasharray="1000"
                strokeDashoffset="1000"
                className="animate-[dash_2s_ease-in-out_forwards]"
            />
        </svg>
    </div>
);

const StatCard = ({ title, amount, change, changeType, icon: Icon, colorClass, sparkColor }) => (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group">
        <div className="flex justify-between items-start">
            <div className={`p-4 rounded-2xl ${colorClass} bg-opacity-10 group-hover:scale-110 transition-transform duration-500`}>
                <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
            </div>
            <Sparkline color={sparkColor} />
        </div>
        <div className="mt-6">
            <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest">{title}</h3>
            <h2 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">{amount}</h2>
            <div className={clsx(
                "flex items-center mt-3 text-[11px] font-black uppercase tracking-tighter px-2.5 py-1 rounded-full w-fit",
                changeType === 'positive' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
            )}>
                {changeType === 'positive' ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
                {change}
            </div>
        </div>
    </div>
);

const TransactionRow = ({ date, type, reference, party, amount }) => (
    <tr className="group hover:bg-slate-50 transition-all cursor-default">
        <td className="px-8 py-5 whitespace-nowrap">
            <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-slate-200 mr-4" />
                <span className="text-sm font-bold text-slate-500">{new Date(date).toLocaleDateString()}</span>
            </div>
        </td>
        <td className="px-8 py-5 whitespace-nowrap">
            <span className={clsx(
                "px-3 py-1.5 text-[10px] font-black rounded-lg uppercase tracking-widest",
                typeColors[type.toLowerCase()] || 'bg-slate-50 text-slate-600'
            )}>
                {type}
            </span>
        </td>
        <td className="px-8 py-5 whitespace-nowrap text-sm font-black text-slate-400 tracking-tighter group-hover:text-slate-900 transition-colors">
            {reference}
        </td>
        <td className="px-8 py-5 whitespace-nowrap">
            <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mr-3 text-[10px] font-black text-slate-400 uppercase">
                    {party.substring(0, 2)}
                </div>
                <span className="text-sm font-black text-slate-900">{party}</span>
            </div>
        </td>
        <td className={clsx(
            "px-8 py-5 whitespace-nowrap text-sm font-black text-right tracking-tight",
            type.toLowerCase() === 'payment' || type.toLowerCase() === 'purchase' ? 'text-red-500' : 'text-slate-900'
        )}>
            ₹{parseFloat(amount || 0).toFixed(2)}
        </td>
    </tr>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const { searchTerm, setSearchTerm } = useSearch();
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;

    const { data: dashboardData, isLoading, isError, refetch } = useQuery({
        queryKey: ['dashboard-summary'],
        queryFn: getDashboardSummary,
        refetchInterval: 60000,
        keepPreviousData: true
    });

    const stats = dashboardData?.stats || {
        totalSales: 0,
        totalPurchases: 0,
        totalProducts: 0,
        activeProducts: 0,
        monthlySales: 0,
        monthlyPurchases: 0
    };

    const recentTransactions = dashboardData?.recentTransactions || [];

    const filteredTransactions = useMemo(() => {
        if (!searchTerm) return recentTransactions;
        const s = searchTerm.toLowerCase();
        return recentTransactions.filter(txn =>
            txn.party.toLowerCase().includes(s) ||
            txn.reference.toLowerCase().includes(s) ||
            txn.type.toLowerCase().includes(s)
        );
    }, [recentTransactions, searchTerm]);

    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedData = filteredTransactions.slice(startIndex, startIndex + rowsPerPage);
    const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage) || 1;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
                <RefreshCcw className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading Gateway...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
                <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl flex flex-col items-center gap-2">
                    <p className="font-black uppercase tracking-widest text-xs">Sync Failed</p>
                    <button onClick={() => refetch()} className="px-6 py-2 bg-rose-600 text-white rounded-xl font-bold text-sm">Retry Connection</button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-12 pb-20">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">System Overview</span>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Financial Health</h1>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/Banking')}
                        className="flex items-center px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-sm font-black text-slate-600 hover:bg-slate-50 transition-all font-black uppercase tracking-widest text-[10px]">
                        <History className="w-4 h-4 mr-2" />
                        Voucher History
                    </button>
                    <button
                        onClick={() => navigate('/sales')}
                        className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/30 text-sm font-black hover:bg-blue-700 transition-all font-black uppercase tracking-widest text-[10px]">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Voucher
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    amount={`₹${stats.totalSales.toLocaleString('en-IN')}`}
                    change="+12.5%"
                    changeType="positive"
                    icon={Wallet}
                    colorClass="bg-blue-500 text-blue-600"
                    sparkColor="#3b82f6"
                />
                <StatCard
                    title="Total Expenses"
                    amount={`₹${stats.totalPurchases.toLocaleString('en-IN')}`}
                    change="+8.2%"
                    changeType="negative"
                    icon={TrendingDown}
                    colorClass="bg-rose-500 text-rose-600"
                    sparkColor="#f43f5e"
                />
                <StatCard
                    title="Net Profit (Approx)"
                    amount={`₹${(stats.totalSales - stats.totalPurchases).toLocaleString('en-IN')}`}
                    change="+24.5%"
                    changeType="positive"
                    icon={Landmark}
                    colorClass="bg-emerald-500 text-emerald-600"
                    sparkColor="#10b981"
                />
                <StatCard
                    title="Active Products"
                    amount={stats.activeProducts}
                    change="+5"
                    changeType="positive"
                    icon={Package}
                    colorClass="bg-violet-500 text-violet-600"
                    sparkColor="#8b5cf6"
                />
            </div>

            <div className="grid grid-cols-1 gap-10">
                <div className="w-full">
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden h-full flex flex-col hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500">
                        <div className="p-10 pb-6 space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Recent Activity</h3>
                                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tighter">Real-time ledger entries and voucher history</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button className="px-6 py-3 bg-slate-50 text-slate-600 rounded-[1.25rem] text-[10px] font-black uppercase hover:bg-slate-100 transition-all border border-slate-100 flex items-center">
                                        <Download className="w-4 h-4 mr-2" /> Export
                                    </button>
                                    <button className="px-6 py-3 bg-blue-50 text-blue-600 rounded-[1.25rem] text-[10px] font-black uppercase hover:bg-blue-100 transition-all border border-blue-100">
                                        Analytics
                                    </button>
                                </div>
                            </div>

                            <div className="relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search activity by party, reference or voucher type..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-50 transition-all outline-none font-black text-slate-900 shadow-inner placeholder:text-slate-400"
                                />
                                {searchTerm && (
                                    <button onClick={() => setSearchTerm('')} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600">
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="overflow-x-auto flex-1">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-y border-slate-50 bg-slate-50/30">
                                        <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction Date</th>
                                        <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Voucher Type</th>
                                        <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reference No.</th>
                                        <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Counter Party</th>
                                        <th className="px-10 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 text-slate-800">
                                    {paginatedData.length > 0 ? (
                                        paginatedData.map((txn, idx) => (
                                            <TransactionRow
                                                key={`${txn.type}-${txn.id}-${idx}`}
                                                date={txn.date}
                                                type={txn.type}
                                                reference={txn.reference}
                                                party={txn.party}
                                                amount={txn.amount}
                                            />
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-10 py-32 text-center text-slate-400 uppercase font-black tracking-widest text-xs">
                                                No recent transactions found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            <div className="flex items-center justify-between p-8 border-t border-slate-50">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Showing {paginatedData.length} of {filteredTransactions.length} entries
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(p => p - 1)}
                                        className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white disabled:opacity-30 border border-slate-100"
                                    >Prev</button>
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
            </div>
        </div>
    );
};

export default Dashboard;
