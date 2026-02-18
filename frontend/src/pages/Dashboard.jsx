import React, { useState, useEffect } from 'react';
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
    Zap
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import clsx from 'clsx';

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

const GatewayItem = ({ title, subtitle, icon: Icon, color, to, shortcut }) => (
    <NavLink
        to={to || '#'}
        className="group flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-300"
    >
        <div className="flex items-center space-x-4">
            <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110", color)}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
                <h3 className="text-sm font-black text-slate-900">{title}</h3>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-tighter">{subtitle}</p>
            </div>
        </div>
        <div className="flex items-center space-x-3">
            <span className="hidden group-hover:block text-[10px] font-black text-slate-300 bg-white border border-slate-100 px-2 py-1 rounded-lg">
                {shortcut}
            </span>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
        </div>
    </NavLink>
);

const TransactionRow = ({ date, type, reference, party, amount, typeColors }) => (
    <tr className="group hover:bg-slate-50 transition-all cursor-default">
        <td className="px-8 py-5 whitespace-nowrap">
            <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-slate-200 mr-4" />
                <span className="text-sm font-bold text-slate-500">{date}</span>
            </div>
        </td>
        <td className="px-8 py-5 whitespace-nowrap">
            <span className={clsx(
                "px-3 py-1.5 text-[10px] font-black rounded-lg uppercase tracking-widest",
                typeColors[type]
            )}>
                {type}
            </span>
        </td>
        <td className="px-8 py-5 whitespace-nowrap text-sm font-black text-slate-400 tracking-tighter group-hover:text-slate-900 transition-colors">{reference}</td>
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
            type === 'payment' || type === 'purchase' ? 'text-red-500' : 'text-slate-900'
        )}>
            {amount}
        </td>
    </tr>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalSales: 0,
        totalPurchases: 0,
        totalProducts: 0,
        activeProducts: 0,
        monthlySales: 0,
        monthlyPurchases: 0
    });
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [salesRes, purchasesRes, productsRes] = await Promise.all([
                    api.get('/sales'),
                    api.get('/purchases'),
                    api.get('/products')
                ]);

                const salesData = Array.isArray(salesRes.data) ? salesRes.data : (salesRes.data?.data || []);
                const purchasesData = Array.isArray(purchasesRes.data) ? purchasesRes.data : (purchasesRes.data?.data || []);
                const productsData = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data?.data || []);

                const now = new Date();
                const currentMonth = salesData.filter(s => new Date(s.sale_date).getMonth() === now.getMonth());
                const currentMonthPurchases = purchasesData.filter(p => new Date(p.purchase_date).getMonth() === now.getMonth());

                const totalSales = salesData.reduce((sum, sale) => sum + (parseFloat(sale.total) || 0), 0);
                const totalPurchases = purchasesData.reduce((sum, purchase) => sum + (parseFloat(purchase.total) || 0), 0);
                const monthlySales = currentMonth.reduce((sum, sale) => sum + (parseFloat(sale.total) || 0), 0);
                const monthlyPurchases = currentMonthPurchases.reduce((sum, purchase) => sum + (parseFloat(purchase.total) || 0), 0);
                const activeProducts = productsData.filter(p => p.is_active).length;

                setStats({
                    totalSales: totalSales,
                    totalPurchases: totalPurchases,
                    totalProducts: productsData.length,
                    activeProducts: activeProducts,
                    monthlySales: monthlySales,
                    monthlyPurchases: monthlyPurchases
                });

                const transactions = [
                    ...salesData.slice(0, 5).map(s => ({
                        date: new Date(s.sale_date).toLocaleDateString(),
                        type: 'Sales',
                        reference: `SALE-${s.id.substring(0, 8)}`,
                        party: s.customers?.name || 'Customer',
                        amount: `₹${parseFloat(s.total).toFixed(2)}`
                    })),
                    ...purchasesData.slice(0, 5).map(p => ({
                        date: new Date(p.purchase_date).toLocaleDateString(),
                        type: 'Purchase',
                        reference: `PUR-${p.id.substring(0, 8)}`,
                        party: p.suppliers?.name || 'Supplier',
                        amount: `₹${parseFloat(p.total).toFixed(2)}`
                    }))
                ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

                setRecentTransactions(transactions);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const typeColors = {
        'Sales': 'bg-emerald-50 text-emerald-600',
        'Purchase': 'bg-rose-50 text-rose-600',
        'Payment': 'bg-blue-50 text-blue-600',
        'Receipt': 'bg-amber-50 text-amber-600'
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading Gateway...</p>
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
                        onClick={() => window.location.href = '/banking'}
                        className="flex items-center px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-sm font-black text-slate-600 hover:bg-slate-50 transition-all">
                        <History className="w-4 h-4 mr-2" />
                        Voucher History
                    </button>
                    <button
                        onClick={() => window.location.href = '/sales-invoices'}
                        className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/30 text-sm font-black hover:bg-blue-700 transition-all">
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
                {/* Recent Activities Table - Now Full Width */}
                <div className="w-full">
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden h-full flex flex-col hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500">
                        <div className="p-10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Recent Activity</h3>
                                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tighter">Real-time ledger entries and voucher history</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button className="px-6 py-3 bg-slate-50 text-slate-600 rounded-[1.25rem] text-xs font-black uppercase hover:bg-slate-100 transition-all border border-slate-100 flex items-center">
                                    <Download className="w-4 h-4 mr-2" />
                                    Export Data
                                </button>
                                <button className="px-6 py-3 bg-blue-50 text-blue-600 rounded-[1.25rem] text-xs font-black uppercase hover:bg-blue-100 transition-all border border-blue-100">
                                    View Analytics
                                </button>
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
                                        <th className="px-10 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Voucher Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 text-slate-800">
                                    {recentTransactions.length > 0 ? (
                                        recentTransactions.map((txn, idx) => (
                                            <TransactionRow
                                                key={idx}
                                                date={txn.date}
                                                type={txn.type.toLowerCase()}
                                                reference={txn.reference}
                                                party={txn.party}
                                                amount={txn.amount}
                                                typeColors={typeColors}
                                            />
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-10 py-32 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 text-slate-200">
                                                        <FileText className="w-10 h-10" />
                                                    </div>
                                                    <p className="text-lg font-black text-slate-400 uppercase tracking-widest">No recent transactions</p>
                                                    <p className="text-sm font-bold text-slate-300 mt-2">Any new vouchers will appear here automatically</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-8 border-t border-slate-50 bg-slate-50/20 text-center">
                            <button className="text-blue-600 text-sm font-black uppercase tracking-widest hover:underline flex items-center justify-center mx-auto">
                                View Detailed Ledger Reports
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

