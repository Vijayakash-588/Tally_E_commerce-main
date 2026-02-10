import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp,
    ArrowLeft,
    Download,
    Printer,
    Calendar,
    PieChart
} from 'lucide-react';

const ProfitLoss = () => {
    const navigate = useNavigate();

    // Sample P&L data - replace with API call
    const data = {
        period: '1-Apr-2023 to 31-Mar-2024',
        expenses: {
            openingStock: 45000,
            purchases: 1250500,
            directExpenses: 85200,
            grossProfit: 584300,
            indirectExpenses: 112000,
            netProfit: 494300
        },
        incomes: {
            sales: 1890000,
            directIncomes: 12500,
            closingStock: 62500,
            indirectIncomes: 22000,
            total: 1965000
        }
    };

    const grossProfitPercent = ((data.expenses.grossProfit / data.incomes.sales) * 100).toFixed(1);
    const netProfitPercent = ((data.expenses.netProfit / data.incomes.total) * 100).toFixed(1);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/')}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                title="Back to Dashboard"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profit & Loss Statement</h1>
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    <span>{data.period}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300 text-sm font-medium">
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                <Printer className="w-4 h-4" />
                                Print
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* T-Shape P&L Table */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Expenses Side */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-900 dark:text-white">Expenses</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Amount (₹)</span>
                            </div>
                        </div>
                        <div className="p-6 space-y-3">
                            <TableRow label="Opening Stock" value={data.expenses.openingStock} />
                            <TableRow label="Purchases" value={data.expenses.purchases} />
                            <TableRow label="Direct Expenses" value={data.expenses.directExpenses} />
                            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                <TableRow label="Gross Profit c/o" value={data.expenses.grossProfit} highlight />
                            </div>
                            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                <TableRow label="Indirect Expenses" value={data.expenses.indirectExpenses} />
                            </div>
                            <div className="pt-4 border-t-2 border-blue-600">
                                <TableRow label="Net Profit" value={data.expenses.netProfit} bold />
                            </div>
                        </div>
                    </div>

                    {/* Incomes Side */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-900 dark:text-white">Incomes</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Amount (₹)</span>
                            </div>
                        </div>
                        <div className="p-6 space-y-3">
                            <TableRow label="Sales Accounts" value={data.incomes.sales} />
                            <TableRow label="Direct Incomes" value={data.incomes.directIncomes} />
                            <TableRow label="Closing Stock" value={data.incomes.closingStock} />
                            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                <TableRow label="Gross Profit b/f" value={data.expenses.grossProfit} highlight />
                            </div>
                            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                <TableRow label="Indirect Incomes" value={data.incomes.indirectIncomes} />
                            </div>
                            <div className="pt-4 border-t-2 border-blue-600">
                                <TableRow label="Total Incomes" value={data.incomes.total} bold />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analysis Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Gross Profit %</p>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{grossProfitPercent}%</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Net Profit %</p>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{netProfitPercent}%</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Revenue</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">₹{(data.incomes.total / 100000).toFixed(1)}L</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Net Profit</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">₹{(data.expenses.netProfit / 100000).toFixed(2)}L</p>
                    </div>
                </div>

                {/* Additional Insights */}
                <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                        <PieChart className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Financial Summary</h3>
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                Your business shows a net profit of ₹{(data.expenses.netProfit / 100000).toFixed(2)}L with a {netProfitPercent}% profit margin. 
                                Total revenue stands at ₹{(data.incomes.total / 100000).toFixed(1)}L with gross profit at {grossProfitPercent}%.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TableRow = ({ label, value, highlight, bold }) => (
    <div className="flex justify-between items-center">
        <span className={`text-sm ${bold ? 'font-bold text-gray-900 dark:text-white' : highlight ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
            {label}
        </span>
        <span className={`text-sm font-semibold ${bold ? 'text-gray-900 dark:text-white' : highlight ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
            ₹{value.toLocaleString('en-IN')}
        </span>
    </div>
);

export default ProfitLoss;
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
                    <div className="flex-1 max-w-xl">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#2563EB] transition-colors" />
                            <input
                                type="text"
                                placeholder="Search reports or ledgers..."
                                className="w-full bg-slate-50 border-none rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#2563EB]/20 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-5">
                        <button className="p-2 text-slate-400 hover:text-slate-600 relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border border-white rounded-full"></span>
                        </button>

                        <div className="h-8 w-px bg-slate-200" />

                        <div className="w-9 h-9 rounded-full bg-[#DBEAFE] text-[#2563EB] flex items-center justify-center font-bold border border-white shadow-sm cursor-pointer">
                            JD
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-10 bg-[#F9FBFF]">
                    {/* Page Title Section */}
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Profit & Loss Statement</h2>
                            <div className="flex items-center text-sm font-bold text-slate-400 mt-2 space-x-2">
                                <Calendar className="w-4 h-4" />
                                <span>1-Apr-2023 to 31-Mar-2024</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button className="flex items-center space-x-2 bg-white border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all text-slate-600">
                                <Download className="w-4 h-4" />
                                <span>Export</span>
                            </button>
                            <button className="flex items-center space-x-2 bg-[#2563EB] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">
                                <Printer className="w-4 h-4" />
                                <span>Print Report</span>
                            </button>
                        </div>
                    </div>

                    {/* Filters & Controls */}
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center space-x-4">
                            <FilterDropdown label="Period" value="Current FY" />
                            <FilterDropdown label="Unit" value="Main Branch" />
                            <FilterDropdown label="Method" value="Accrual" />
                        </div>
                        <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-xl border border-slate-200/50">
                            <button className="px-5 py-2 text-xs font-black uppercase tracking-widest rounded-lg bg-white shadow-sm text-[#2563EB]">T-Shape</button>
                            <button className="px-5 py-2 text-xs font-black uppercase tracking-widest rounded-lg text-slate-400 hover:text-slate-600">Vertical</button>
                        </div>
                    </div>

                    {/* T-Shape P&L Container */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden flex divide-x divide-slate-100 min-h-[600px]">
                        {/* EXPENSES SIDE */}
                        <div className="flex-1 flex flex-col">
                            <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                <span>Expenses</span>
                                <span>Amount (USD)</span>
                            </div>
                            <div className="flex-1 p-4 space-y-1">
                                <TableRow icon={<PlusCircle className="w-4 h-4 text-slate-400" />} label="Opening Stock" value="45,000.00" />
                                <TableRow label="Purchases Accounts" value="1,250,500.00" />
                                <TableRow label="Direct Expenses" value="85,200.00" />

                                <div className="pt-2 pb-1">
                                    <TableRow label="Gross Profit c/o" value="584,300.00" blue />
                                </div>

                                <div className="h-px bg-slate-50 my-2 mx-4" />

                                <TableRow icon={<PlusCircle className="w-4 h-4 text-slate-400" />} label="Indirect Expenses" value="112,000.00" />
                                <div className="pl-8 space-y-1 opacity-60 italic text-xs font-medium">
                                    <TableRow label="Salaries & Wages" value="65,000.00" simple />
                                    <TableRow label="Rent & Taxes" value="22,000.00" simple />
                                    <TableRow label="Marketing" value="25,000.00" simple />
                                </div>
                            </div>
                            <div className="px-8 py-8 border-t border-slate-100">
                                <div className="flex justify-between items-end border-t-2 border-[#2563EB] pt-4">
                                    <span className="text-xl font-black text-slate-900 tracking-tight">Net Profit</span>
                                    <span className="text-2xl font-black text-slate-900 tracking-tight">494,300.00</span>
                                </div>
                            </div>
                        </div>

                        {/* INCOMES SIDE */}
                        <div className="flex-1 flex flex-col">
                            <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                <span>Incomes</span>
                                <span>Amount (USD)</span>
                            </div>
                            <div className="flex-1 p-4 space-y-1">
                                <TableRow label="Sales Accounts" value="1,890,000.00" />
                                <TableRow label="Direct Incomes" value="12,500.00" />
                                <TableRow icon={<PlusCircle className="w-4 h-4 text-slate-400" />} label="Closing Stock" value="62,500.00" />

                                <div className="h-px bg-slate-50 my-4 mx-4" />

                                <TableRow label="Gross Profit b/f" value="584,300.00" isBold />

                                <div className="pt-2">
                                    <TableRow icon={<PlusCircle className="w-4 h-4 text-slate-400" />} label="Indirect Incomes" value="22,000.00" />
                                    <div className="pl-8 space-y-1 opacity-60 italic text-xs font-medium">
                                        <TableRow label="Interest Received" value="18,500.00" simple />
                                        <TableRow label="Commission" value="3,500.00" simple />
                                    </div>
                                </div>
                            </div>
                            <div className="px-8 py-8 bg-slate-50/30 border-t border-slate-100">
                                <div className="flex justify-between items-end pt-4 border-t-2 border-slate-100">
                                    <span className="text-xl font-black text-slate-900 tracking-tight">Total:</span>
                                    <span className="text-2xl font-black text-slate-900 tracking-tight underline decoration-[#2563EB] decoration-4 underline-offset-8">1,965,000.00</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Analysis Section */}
                    <div className="mt-12 flex items-center justify-between">
                        <div className="grid grid-cols-3 gap-8 flex-1 mr-12">
                            <SummaryCard label="Gross Profit %" value="30.9%" />
                            <SummaryCard label="Net Profit %" value="26.1%" />
                            <SummaryCard label="Operating Ratio" value="0.68" />
                        </div>
                        <button className="bg-[#EBF3FF] text-[#2563EB] px-8 py-4 rounded-2xl font-black text-sm flex items-center space-x-3 hover:bg-blue-100 transition-all border border-blue-100 shadow-sm">
                            <PieChart className="w-5 h-5" />
                            <span>Detailed Analysis View</span>
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
};

const SidebarItem = ({ icon: Icon, label, active }) => (
    <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-[#2563EB]/10 text-[#2563EB]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
        <Icon className={`w-5 h-5 ${active ? 'text-[#2563EB]' : 'text-slate-400'}`} />
        <span className={`text-sm font-bold ${active ? 'text-[#2563EB]' : 'text-slate-500'}`}>{label}</span>
        {active && <div className="ml-auto w-1.5 h-4 bg-[#2563EB] rounded-full shadow-sm"></div>}
    </div>
);

const FilterDropdown = ({ label, value }) => (
    <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3 group cursor-pointer hover:border-[#2563EB]/20 transition-all">
        <div className="text-left">
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">{label}</div>
            <div className="text-xs font-bold text-slate-800">{value}</div>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
    </div>
);

const TableRow = ({ icon, label, value, blue, simple, isBold }) => (
    <div className={`flex justify-between items-center px-4 py-3 rounded-lg hover:bg-slate-50/50 transition-colors group ${simple ? 'py-1.5' : ''}`}>
        <div className="flex items-center space-x-3">
            {icon && <span className="shrink-0">{icon}</span>}
            <span className={`text-[13px] ${blue ? 'text-[#2563EB] font-black' : isBold ? 'font-black text-slate-900' : 'font-bold text-slate-600'}`}>{label}</span>
        </div>
        <span className={`text-[13px] tracking-tight ${blue ? 'text-[#2563EB] font-black underline decoration-2 underline-offset-4' : isBold ? 'font-black text-slate-900' : 'font-black text-slate-800'}`}>{value}</span>
    </div>
);

const SummaryCard = ({ label, value }) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
    </div>
);

export default ProfitLoss;
