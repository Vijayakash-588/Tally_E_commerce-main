import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    TrendingUp,
    ArrowLeft,
    Download,
    Printer,
    Calendar,
    PieChart,
    Search,
    Bell,
    PlusCircle,
    ChevronDown,
    Filter
} from 'lucide-react';
import api from '../api/axios';

const ProfitLoss = () => {
    const navigate = useNavigate();

    const { data: sales = [] } = useQuery({
        queryKey: ['sales'],
        queryFn: async () => {
            const res = await api.get('/sales');
            return Array.isArray(res.data) ? res.data : (res.data?.data || []);
        }
    });

    const { data: purchases = [] } = useQuery({
        queryKey: ['purchases'],
        queryFn: async () => {
            const res = await api.get('/purchases');
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

    const { data: stockItems = [] } = useQuery({
        queryKey: ['stock_items'],
        queryFn: async () => {
            const res = await api.get('/stock_items');
            return Array.isArray(res.data) ? res.data : (res.data?.data || []);
        }
    });

    const financials = useMemo(() => {
        // Calculate Totals
        const totalSales = sales.reduce((sum, s) => sum + (parseFloat(s.total) || 0), 0);
        const totalPurchases = purchases.reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0);

        // Calculate Stock Values
        let openingStockValue = 0;
        let closingStockValue = 0;

        products.forEach(product => {
            const price = parseFloat(product.unit_price) || 0;
            const openingQty = parseInt(product.opening_qty) || 0;

            // Opening Value
            openingStockValue += openingQty * price;

            // Current (Closing) Qty Calculation
            const productMovements = stockItems.filter(item => item.product_id === product.id);
            const inbound = productMovements.filter(m => m.type === 'IN').reduce((sum, m) => sum + m.quantity, 0);
            const outbound = productMovements.filter(m => m.type === 'OUT').reduce((sum, m) => sum + m.quantity, 0);

            const closingQty = openingQty + inbound - outbound;
            closingStockValue += closingQty * price;
        });

        // Profit Calculations
        const directExpenses = 0; // Placeholder for now
        const directIncomes = 0; // Placeholder for now
        const indirectExpenses = 0; // Placeholder
        const indirectIncomes = 0; // Placeholder

        const totalExpensesSide = openingStockValue + totalPurchases + directExpenses;
        const totalIncomesSide = totalSales + directIncomes + closingStockValue;

        const grossProfit = totalIncomesSide - totalExpensesSide;
        const netProfit = grossProfit + indirectIncomes - indirectExpenses;

        return {
            period: 'Current Direct Period',
            openingStock: openingStockValue,
            purchases: totalPurchases,
            sales: totalSales,
            closingStock: closingStockValue,
            grossProfit,
            netProfit,
            total: totalIncomesSide > totalExpensesSide ? totalIncomesSide : totalExpensesSide
        };
    }, [sales, purchases, products, stockItems]);

    const grossProfitPercent = financials.sales ? ((financials.grossProfit / financials.sales) * 100).toFixed(1) : '0.0';
    const netProfitPercent = financials.sales ? ((financials.netProfit / financials.sales) * 100).toFixed(1) : '0.0';

    return (
        <div className="flex h-screen bg-[#F8FAFC]">
            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center gap-4 flex-1 max-w-xl">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
                            title="Back to Dashboard"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-bold text-slate-800">Reports</h1>
                    </div>

                    <div className="flex items-center space-x-5">
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
                                <span>{financials.period}</span>
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

                    {/* T-Shape P&L Container */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden flex divide-x divide-slate-100 min-h-[600px]">
                        {/* EXPENSES SIDE */}
                        <div className="flex-1 flex flex-col">
                            <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                <span>Expenses</span>
                                <span>Amount (₹)</span>
                            </div>
                            <div className="flex-1 p-4 space-y-1">
                                <TableRow icon={<PlusCircle className="w-4 h-4 text-slate-400" />} label="Opening Stock" value={financials.openingStock.toLocaleString('en-IN', { minimumFractionDigits: 2 })} />
                                <TableRow label="Purchases Accounts" value={financials.purchases.toLocaleString('en-IN', { minimumFractionDigits: 2 })} />
                                <TableRow label="Direct Expenses" value="0.00" />

                                <div className="pt-2 pb-1">
                                    <TableRow label="Gross Profit c/o" value={financials.grossProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })} blue />
                                </div>

                                <div className="h-px bg-slate-50 my-2 mx-4" />

                                <TableRow icon={<PlusCircle className="w-4 h-4 text-slate-400" />} label="Indirect Expenses" value="0.00" />
                            </div>
                            <div className="px-8 py-8 border-t border-slate-100">
                                <div className="flex justify-between items-end border-t-2 border-[#2563EB] pt-4">
                                    <span className="text-xl font-black text-slate-900 tracking-tight">Net Profit</span>
                                    <span className="text-2xl font-black text-slate-900 tracking-tight">{financials.netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>

                        {/* INCOMES SIDE */}
                        <div className="flex-1 flex flex-col">
                            <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                <span>Incomes</span>
                                <span>Amount (₹)</span>
                            </div>
                            <div className="flex-1 p-4 space-y-1">
                                <TableRow label="Sales Accounts" value={financials.sales.toLocaleString('en-IN', { minimumFractionDigits: 2 })} />
                                <TableRow label="Direct Incomes" value="0.00" />
                                <TableRow icon={<PlusCircle className="w-4 h-4 text-slate-400" />} label="Closing Stock" value={financials.closingStock.toLocaleString('en-IN', { minimumFractionDigits: 2 })} />

                                <div className="h-px bg-slate-50 my-4 mx-4" />

                                <TableRow label="Gross Profit b/f" value={financials.grossProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })} isBold />

                                <div className="pt-2">
                                    <TableRow icon={<PlusCircle className="w-4 h-4 text-slate-400" />} label="Indirect Incomes" value="0.00" />
                                </div>
                            </div>
                            <div className="px-8 py-8 bg-slate-50/30 border-t border-slate-100">
                                <div className="flex justify-between items-end pt-4 border-t-2 border-slate-100">
                                    <span className="text-xl font-black text-slate-900 tracking-tight">Total:</span>
                                    <span className="text-2xl font-black text-slate-900 tracking-tight underline decoration-[#2563EB] decoration-4 underline-offset-8">
                                        {(financials.grossProfit + financials.openingStock + financials.purchases).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Analysis Section */}
                    <div className="mt-12 flex items-center justify-between">
                        <div className="grid grid-cols-3 gap-8 flex-1 mr-12">
                            <SummaryCard label="Gross Profit %" value={`${grossProfitPercent}%`} />
                            <SummaryCard label="Net Profit %" value={`${netProfitPercent}%`} />
                            <SummaryCard label="Operating Ratio" value="-" />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

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
        <span className={`text-[13px] tracking-tight ${blue ? 'text-[#2563EB] font-black underline decoration-2 underline-offset-4' : isBold ? 'font-black text-slate-900' : 'font-black text-slate-800'}`}>₹{value}</span>
    </div>
);

const SummaryCard = ({ label, value }) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
    </div>
);

export default ProfitLoss;
