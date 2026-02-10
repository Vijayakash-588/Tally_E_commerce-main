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
    Package
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const StatCard = ({ title, amount, change, changeType, icon: Icon, colorClass }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-40">
        <div className="flex justify-between items-start">
            <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
            <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
                <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
            </div>
        </div>
        <div>
            <h2 className="text-2xl font-bold text-gray-900">{amount}</h2>
            <div className={`flex items-center mt-2 text-sm font-medium ${changeType === 'positive' ? 'text-green-600' : 'text-red-500'}`}>
                {changeType === 'positive' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {change}
            </div>
        </div>
    </div>
);

const QuickActionCard = ({ title, subtitle, icon: Icon, color, to }) => (
    <NavLink to={to || '#'} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center text-center group cursor-pointer">
        <div className={`w-12 h-12 rounded-full ${color} bg-opacity-10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
    </NavLink>
);

const TransactionRow = ({ date, type, reference, party, amount, typeColors }) => (
    <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{date}</td>
        <td className="px-6 py-4 whitespace-nowrap">
            <span className={`px-2 py-1 text-xs font-bold rounded-md uppercase ${typeColors[type]}`}>
                {type}
            </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reference}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{party}</td>
        <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${type === 'payment' || type === 'purchase' ? 'text-red-600' : 'text-gray-900'}`}>
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

                // Calculate monthly totals
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

                // Combine and sort recent transactions
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
                ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

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
        'Sales': 'bg-green-100 text-green-800',
        'Purchase': 'bg-red-100 text-red-800',
        'Payment': 'bg-blue-100 text-blue-800',
        'Receipt': 'bg-teal-100 text-teal-800'
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-8">

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Sales"
                    amount={`₹${stats.totalSales.toFixed(2)}`}
                    change={`+${((stats.monthlySales / stats.totalSales) * 100).toFixed(1)}% this month`}
                    changeType="positive"
                    icon={Wallet}
                    colorClass="bg-blue-500 text-blue-500"
                />
                <StatCard
                    title="Total Purchases"
                    amount={`₹${stats.totalPurchases.toFixed(2)}`}
                    change={`+${((stats.monthlyPurchases / stats.totalPurchases) * 100).toFixed(1)}% this month`}
                    changeType={stats.monthlyPurchases > 0 ? "positive" : "negative"}
                    icon={Landmark}
                    colorClass="bg-indigo-500 text-indigo-500"
                />
                <StatCard
                    title="Total Products"
                    amount={stats.totalProducts}
                    change={`${stats.activeProducts} active`}
                    changeType="positive"
                    icon={ShoppingCart}
                    colorClass="bg-green-500 text-green-500"
                />
                <StatCard
                    title="Monthly Sales"
                    amount={`₹${stats.monthlySales.toFixed(2)}`}
                    change="+5.2%"
                    changeType="positive"
                    icon={ShoppingBag}
                    colorClass="bg-orange-500 text-orange-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Quick Actions */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <QuickActionCard
                            title="Sales Voucher"
                            subtitle="F8 - Record Sales"
                            icon={ShoppingCart}
                            color="bg-blue-500"
                            to="/sales"
                        />
                        <QuickActionCard
                            title="Purchase Voucher"
                            subtitle="F9 - Record Purchases"
                            icon={ShoppingBag}
                            color="bg-indigo-500"
                            to="/purchases"
                        />
                        <QuickActionCard
                            title="Payment"
                            subtitle="F5 - Supplier Payment"
                            icon={Download}
                            color="bg-blue-400"
                            to="/banking"
                        />
                        <QuickActionCard
                            title="Receipt"
                            subtitle="F6 - Customer Receipt"
                            icon={Download}
                            color="bg-green-500" // Should rotate icon for receipt visually if desired, but Download is fine placeholder
                            to="/banking"
                        />
                        <QuickActionCard
                            title="Stock Summary"
                            subtitle="F10 - Inventory Status"
                            icon={Package}
                            color="bg-orange-500"
                            to="/active-stock"
                        />
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
                        <button className="text-sm text-blue-600 font-medium hover:text-blue-700">View All</button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Reference</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Party Name</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
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
                                            <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No transactions found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
