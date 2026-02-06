import React from 'react';
import {
    BarChart3,
    Package,
    LayoutDashboard,
    FileText,
    Settings,
    Search,
    Bell,
    ChevronDown,
    Download,
    Printer,
    Calendar,
    PlusCircle,
    MinusCircle,
    ArrowUpRight,
    TrendingUp,
    PieChart
} from 'lucide-react';

const ProfitLoss = () => {
    return (
        <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-700">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
                <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
                    <div className="bg-[#2563EB] p-2 rounded-lg shadow-sm">
                        <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-slate-900 leading-none">Acme Corp</h1>
                        <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tight">FY 2023-24</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" />
                    <SidebarItem icon={FileText} label="Vouchers" />
                    <SidebarItem icon={FileText} label="Day Book" />
                    <SidebarItem icon={BarChart3} label="Profit & Loss" active />
                    <SidebarItem icon={FileText} label="Balance Sheet" />
                    <SidebarItem icon={Package} label="Stock Summary" />
                    <SidebarItem icon={Settings} label="Settings" />
                </nav>
            </aside>

            {/* Main Container */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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
