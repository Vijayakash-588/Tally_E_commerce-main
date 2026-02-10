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
                    <button className="flex items-center px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-sm font-black text-slate-600 hover:bg-slate-50 transition-all">
                        <History className="w-4 h-4 mr-2" />
                        Voucher History
                    </button>
                    <button className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/30 text-sm font-black hover:bg-blue-700 transition-all">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Voucher
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard
                    title="Gross Sales"
                    amount={`₹${(stats.totalSales / 1000).toFixed(1)}K`}
                    change={`${((stats.monthlySales / stats.totalSales || 0) * 100).toFixed(1)}% GROWTH`}
                    changeType="positive"
                    icon={Wallet}
                    colorClass="bg-blue-600 text-blue-600"
                    sparkColor="#2563EB"
                />
                <StatCard
                    title="Total Liability"
                    amount={`₹${(stats.totalPurchases / 1000).toFixed(1)}K`}
                    change={`${((stats.monthlyPurchases / stats.totalPurchases || 0) * 100).toFixed(1)}% OUTSTANDING`}
                    changeType={stats.monthlyPurchases > 0 ? "negative" : "positive"}
                    icon={Landmark}
                    colorClass="bg-red-600 text-red-600"
                    sparkColor="#DC2626"
                />
                <StatCard
                    title="Live Products"
                    amount={stats.totalProducts}
                    change={`${stats.activeProducts} OPERATIONAL`}
                    changeType="positive"
                    icon={Zap}
                    colorClass="bg-amber-600 text-amber-600"
                    sparkColor="#D97706"
                />
                <StatCard
                    title="Period Revenue"
                    amount={`₹${(stats.monthlySales / 1000).toFixed(1)}K`}
                    change="+12.4% VS LAST MONTH"
                    changeType="positive"
                    icon={FileText}
                    colorClass="bg-emerald-600 text-emerald-600"
                    sparkColor="#059669"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">

                {/* Gateway Menu (Vertical Style) */}
                <div className="xl:col-span-4 flex flex-col">
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 h-full">
                        <div className="flex items-center justify-between mb-8 px-2">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Gateway Menu</h3>
                            <div className="p-2 bg-slate-50 rounded-xl">
                                <Filter className="w-4 h-4 text-slate-400" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <GatewayItem
                                title="Sales Voucher"
                                subtitle="Record outbound invoices"
                                icon={ShoppingCart}
                                color="bg-gradient-to-br from-blue-500 to-indigo-600"
                                to="/sales"
                                shortcut="F8"
                            />
                            <GatewayItem
                                title="Purchase Voucher"
                                subtitle="Inbound stock entry"
                                icon={ShoppingBag}
                                color="bg-gradient-to-br from-indigo-500 to-purple-600"
                                to="/purchases"
                                shortcut="F9"
                            />
                            <GatewayItem
                                title="Banking & Cash"
                                subtitle="Manage ledgers & payments"
                                icon={Landmark}
                                color="bg-gradient-to-br from-cyan-500 to-blue-600"
                                to="/banking"
                                shortcut="F5"
                            />
                            <GatewayItem
                                title="Stock Summary"
                                subtitle="Current inventory levels"
                                icon={Package}
                                color="bg-gradient-to-br from-amber-500 to-orange-600"
                                to="/inventory"
                                shortcut="F10"
                            />
                        </div>

                        <div className="mt-10 pt-8 border-t border-slate-50 px-4">
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 group cursor-pointer">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pro Tip</p>
                                <p className="text-xs font-bold text-slate-600 leading-relaxed group-hover:text-slate-900 transition-colors">
                                    Use the <span className="text-blue-600">Quick Search</span> (Alt+G) in the header to jump to any report or voucher instantly.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activities Table */}
                <div className="xl:col-span-8">
                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden h-full flex flex-col">
                        <div className="p-8 pb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Activity</h3>
                                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tighter">Latest 8 entries across all vouchers</p>
                            </div>
                            <button className="px-5 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-black uppercase hover:bg-slate-100 transition-all border border-slate-100">
                                View Export
                            </button>
                        </div>

                        <div className="overflow-x-auto flex-1">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-y border-slate-50 bg-slate-50/30">
                                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction Date</th>
                                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Voucher Type</th>
                                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reference No.</th>
                                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Counter Party</th>
                                        <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Voucher Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
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
                                            <td colSpan="5" className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-200">
                                                        <FileText className="w-8 h-8" />
                                                    </div>
                                                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No entries found for this period</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-6 border-t border-slate-50 bg-slate-50/20 text-center">
                            <button className="text-blue-600 text-xs font-black uppercase tracking-widest hover:underline">
                                View All Ledgers & Vouchers
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;

