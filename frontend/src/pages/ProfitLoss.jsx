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
        // Revenue & Cost
        const totalSales = sales.reduce((sum, s) => sum + (parseFloat(s.total) || 0), 0);
        const totalPurchases = purchases.reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0);

        // Stock Values
        let openingStockValue = 0;
        let closingStockValue = 0;

        products.forEach(product => {
            const price = parseFloat(product.unit_price) || 0;
            const openingQty = parseInt(product.opening_qty) || 0;
            openingStockValue += openingQty * price;

            const productMovements = stockItems.filter(item => item.product_id === product.id);
            const inbound = productMovements.filter(m => m.type === 'IN').reduce((sum, m) => sum + (m.quantity || 0), 0);
            const outbound = productMovements.filter(m => m.type === 'OUT').reduce((sum, m) => sum + (m.quantity || 0), 0);
            const closingQty = openingQty + inbound - outbound;
            closingStockValue += closingQty * price;
        });

        // Placeholders (extend later with real data)
        const directExpenses = 0;
        const directIncomes = 0;
        const indirectExpenses = 0;
        const indirectIncomes = 0;

        // Trading Account (Gross Profit)
        // Income side: Sales + Direct Incomes + Closing Stock
        // Expense side: Opening Stock + Purchases + Direct Expenses
        const tradingIncome = totalSales + directIncomes + closingStockValue;
        const tradingExpense = openingStockValue + totalPurchases + directExpenses;
        const grossProfit = tradingIncome - tradingExpense;
        // If negative → Gross Loss (shown on income side as balancing)

        // P&L Account (Net Profit)
        // Income side: Gross Profit (b/f) + Indirect Incomes
        // Expense side: Indirect Expenses
        const netProfit = grossProfit + indirectIncomes - indirectExpenses;

        // Grand totals — both sides of T must be equal
        // Expense side total: tradingExpense + |grossProfit if positive| + indirectExpenses
        // Income side total: tradingIncome + indirectIncomes
        // Both should equal max(tradingIncome, tradingExpense) for trading + P&L combined
        const grandTotal = Math.max(
            tradingExpense + (grossProfit > 0 ? grossProfit : 0) + indirectExpenses + (netProfit < 0 ? Math.abs(netProfit) : 0),
            tradingIncome + indirectIncomes + (netProfit > 0 ? netProfit : 0)
        );

        return {
            period: 'Current Period',
            openingStock: openingStockValue,
            purchases: totalPurchases,
            directExpenses,
            directIncomes,
            indirectExpenses,
            indirectIncomes,
            sales: totalSales,
            closingStock: closingStockValue,
            grossProfit,
            netProfit,
            grandTotal,
        };
    }, [sales, purchases, products, stockItems]);

    const fmt = (n) => Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
    const grossProfitPercent = financials.sales
        ? ((financials.grossProfit / financials.sales) * 100).toFixed(1)
        : '0.0';
    const netProfitPercent = financials.sales
        ? ((financials.netProfit / financials.sales) * 100).toFixed(1)
        : '0.0';
    const operatingRatio = financials.sales
        ? (((financials.openingStock + financials.purchases + financials.directExpenses + financials.indirectExpenses) / financials.sales) * 100).toFixed(1)
        : '0.0';

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

                        {/* EXPENSES SIDE (Debit) */}
                        <div className="flex-1 flex flex-col">
                            <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                <span>Expenses (Dr)</span>
                                <span>Amount (₹)</span>
                            </div>
                            <div className="flex-1 p-4">
                                {/* Trading section */}
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 px-4 pt-2 pb-1">Trading Account</p>
                                <TableRow icon={<PlusCircle className="w-4 h-4 text-slate-400" />} label="Opening Stock" value={fmt(financials.openingStock)} />
                                <TableRow label="Purchases" value={fmt(financials.purchases)} />
                                <TableRow label="Direct Expenses" value={fmt(financials.directExpenses)} />

                                {/* Gross Profit on expenses side only when income > expense */}
                                {financials.grossProfit > 0 && (
                                    <div className="pt-2 pb-1">
                                        <TableRow label="Gross Profit c/o" value={fmt(financials.grossProfit)} blue />
                                    </div>
                                )}
                                {financials.grossProfit < 0 && (
                                    <div className="pt-2 pb-1">
                                        <TableRow label="Gross Loss c/o" value={fmt(financials.grossProfit)} red />
                                    </div>
                                )}

                                <div className="h-px bg-slate-100 my-3 mx-4" />

                                {/* P&L section */}
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 px-4 pb-1">P&L Account</p>
                                <TableRow icon={<PlusCircle className="w-4 h-4 text-slate-400" />} label="Indirect Expenses" value={fmt(financials.indirectExpenses)} />

                                {/* Net Profit on expenses side (when profit) */}
                                {financials.netProfit > 0 && (
                                    <div className="pt-2">
                                        <TableRow label="Net Profit c/o" value={fmt(financials.netProfit)} blue />
                                    </div>
                                )}
                            </div>
                            <div className="px-8 py-5 border-t-2 border-slate-200 bg-slate-50/40">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Grand Total</span>
                                    <span className="text-2xl font-black text-slate-900 tracking-tight">
                                        ₹{fmt(financials.grandTotal)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* INCOMES SIDE (Credit) */}
                        <div className="flex-1 flex flex-col">
                            <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                <span>Incomes (Cr)</span>
                                <span>Amount (₹)</span>
                            </div>
                            <div className="flex-1 p-4">
                                {/* Trading section */}
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 px-4 pt-2 pb-1">Trading Account</p>
                                <TableRow label="Sales" value={fmt(financials.sales)} />
                                <TableRow label="Direct Incomes" value={fmt(financials.directIncomes)} />
                                <TableRow icon={<PlusCircle className="w-4 h-4 text-slate-400" />} label="Closing Stock" value={fmt(financials.closingStock)} />

                                {/* Gross Loss on income side (when expense > income) */}
                                {financials.grossProfit < 0 && (
                                    <div className="pt-2 pb-1">
                                        <TableRow label="Gross Loss b/f" value={fmt(financials.grossProfit)} red />
                                    </div>
                                )}

                                <div className="h-px bg-slate-100 my-3 mx-4" />

                                {/* P&L section */}
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 px-4 pb-1">P&L Account</p>
                                {/* Gross Profit brought forward on income side */}
                                {financials.grossProfit > 0 && (
                                    <TableRow label="Gross Profit b/f" value={fmt(financials.grossProfit)} isBold />
                                )}
                                <TableRow icon={<PlusCircle className="w-4 h-4 text-slate-400" />} label="Indirect Incomes" value={fmt(financials.indirectIncomes)} />

                                {/* Net Loss on income side */}
                                {financials.netProfit < 0 && (
                                    <div className="pt-2">
                                        <TableRow label="Net Loss b/f" value={fmt(financials.netProfit)} red />
                                    </div>
                                )}
                            </div>
                            <div className="px-8 py-5 border-t-2 border-slate-200 bg-slate-50/40">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Grand Total</span>
                                    <span className="text-2xl font-black text-slate-900 tracking-tight">
                                        ₹{fmt(financials.grandTotal)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Analysis Section */}
                    <div className="mt-10 grid grid-cols-3 gap-6">
                        <SummaryCard
                            label="Gross Profit"
                            subLabel="% of Sales"
                            value={`₹${fmt(financials.grossProfit)}`}
                            badge={`${grossProfitPercent}%`}
                            positive={financials.grossProfit >= 0}
                        />
                        <SummaryCard
                            label="Net Profit"
                            subLabel="% of Sales"
                            value={`₹${fmt(financials.netProfit)}`}
                            badge={`${netProfitPercent}%`}
                            positive={financials.netProfit >= 0}
                        />
                        <SummaryCard
                            label="Operating Ratio"
                            subLabel="Expenses / Sales"
                            value={financials.sales > 0 ? `${operatingRatio}%` : '—'}
                            positive={financials.sales > 0 && parseFloat(operatingRatio) < 100}
                        />
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

const TableRow = ({ icon, label, value, blue, red, simple, isBold }) => (
    <div className={`flex justify-between items-center px-4 py-3 rounded-lg hover:bg-slate-50/50 transition-colors group ${simple ? 'py-1.5' : ''}`}>
        <div className="flex items-center space-x-3">
            {icon && <span className="shrink-0">{icon}</span>}
            <span className={`text-[13px] ${blue ? 'text-[#2563EB] font-black' :
                    red ? 'text-red-600 font-black' :
                        isBold ? 'font-black text-slate-900' :
                            'font-bold text-slate-600'
                }`}>{label}</span>
        </div>
        <span className={`text-[13px] tracking-tight ${blue ? 'text-[#2563EB] font-black underline decoration-2 underline-offset-4' :
                red ? 'text-red-600 font-black' :
                    isBold ? 'font-black text-slate-900' :
                        'font-black text-slate-800'
            }`}>₹{value}</span>
    </div>
);

const SummaryCard = ({ label, subLabel, value, badge, positive = true }) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-start justify-between mb-3">
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
                {subLabel && <p className="text-[9px] text-slate-300 font-bold mt-0.5">{subLabel}</p>}
            </div>
            {badge && (
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}>{badge}</span>
            )}
        </div>
        <p className={`text-2xl font-black tracking-tight ${positive ? 'text-slate-900' : 'text-red-600'
            }`}>{value}</p>
    </div>
);

export default ProfitLoss;
