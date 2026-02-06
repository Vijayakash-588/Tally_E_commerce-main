import React from 'react';
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

    return (
        <div className="space-y-8">

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Cash-in-hand"
                    amount="$12,450.00"
                    change="+2.4%"
                    changeType="positive"
                    icon={Wallet}
                    colorClass="bg-blue-500 text-blue-500"
                />
                <StatCard
                    title="Bank Balance"
                    amount="$85,200.50"
                    change="-1.2%"
                    changeType="negative"
                    icon={Landmark}
                    colorClass="bg-indigo-500 text-indigo-500"
                />
                <StatCard
                    title="Total Sales (Monthly)"
                    amount="$142,000.00"
                    change="+15.3%"
                    changeType="positive"
                    icon={ShoppingCart}
                    colorClass="bg-green-500 text-green-500"
                />
                <StatCard
                    title="Total Purchases"
                    amount="$98,300.00"
                    change="-5.1%"
                    changeType="negative"
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
                                    <TransactionRow
                                        date="24 Oct 2023" type="sales" reference="INV-2023-089" party="Global Tech Solutions" amount="$4,250.00"
                                        typeColors={{ sales: 'bg-green-100 text-green-700', payment: 'bg-blue-100 text-blue-700', receipt: 'bg-purple-100 text-purple-700', purchase: 'bg-orange-100 text-orange-700' }}
                                    />
                                    <TransactionRow
                                        date="23 Oct 2023" type="payment" reference="PAY-4452" party="Office Supplies Inc" amount="$840.00"
                                        typeColors={{ sales: 'bg-green-100 text-green-700', payment: 'bg-blue-100 text-blue-700', receipt: 'bg-purple-100 text-purple-700', purchase: 'bg-orange-100 text-orange-700' }}
                                    />
                                    <TransactionRow
                                        date="22 Oct 2023" type="receipt" reference="REC-1092" party="Alpha Logistics" amount="$1,100.00"
                                        typeColors={{ sales: 'bg-green-100 text-green-700', payment: 'bg-blue-100 text-blue-700', receipt: 'bg-purple-100 text-purple-700', purchase: 'bg-orange-100 text-orange-700' }}
                                    />
                                    <TransactionRow
                                        date="21 Oct 2023" type="purchase" reference="PUR-8812" party="Metro Wholesale" amount="$2,750.00"
                                        typeColors={{ sales: 'bg-green-100 text-green-700', payment: 'bg-blue-100 text-blue-700', receipt: 'bg-purple-100 text-purple-700', purchase: 'bg-orange-100 text-orange-700' }}
                                    />
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
