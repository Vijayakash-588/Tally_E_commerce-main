import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AlertTriangle, Package, RefreshCcw, TrendingUp, Download, Zap, BarChart3 } from 'lucide-react';
import {
    autoGenerateForecastPurchaseOrders,
    exportInventoryForecastCsv,
    getInventoryForecast,
    getInventoryForecastAnalytics,
} from '../api/inventory';
import toast from 'react-hot-toast';

const buildForecastAnalytics = (forecastRows = []) => {
    const riskSummary = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    const trendSummary = { UP: 0, DOWN: 0, STABLE: 0 };
    let totalRecommendedQuantity = 0;
    let totalStockCover = 0;

    forecastRows.forEach((row) => {
        riskSummary[row.risk_level] = (riskSummary[row.risk_level] || 0) + 1;
        trendSummary[row.trend] = (trendSummary[row.trend] || 0) + 1;
        totalRecommendedQuantity += Number(row.recommended_order_qty || 0);
        totalStockCover += Number(row.stock_cover_days || 0);
    });

    return {
        totalProducts: forecastRows.length,
        riskSummary,
        trendSummary,
        totalRecommendedQuantity,
        averageStockCoverDays: forecastRows.length ? (totalStockCover / forecastRows.length).toFixed(2) : '0.00',
    };
};

const Forecasting = () => {
    const [params, setParams] = useState({
        lookbackDays: 30,
        horizonDays: 30,
        leadTimeDays: 7,
        safetyStockDays: 3
    });

    const [showAnalytics, setShowAnalytics] = useState(false);
    const [analytics, setAnalytics] = useState(null);

    const { data, isLoading, isFetching, refetch } = useQuery({
        queryKey: ['inventory-forecast', params],
        queryFn: () => getInventoryForecast(params)
    });

    const rows = data?.data || [];
    const reportAnalytics = analytics || buildForecastAnalytics(rows);

    const handleExportCSV = async () => {
        try {
            const csvBlob = await exportInventoryForecastCsv(params);
            const url = window.URL.createObjectURL(csvBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'demand-forecast.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success('✅ Forecast exported to CSV');
        } catch (err) {
            toast.error(`Export error: ${err.message}`);
            console.error('Export error:', err);
        }
    };

    const handleAutoGeneratePOs = async () => {
        try {
            const result = await autoGenerateForecastPurchaseOrders({ supplierId: null }, params);
            if (result.success) {
                toast.success(`✅ Created ${result.result.created} purchase orders (${result.result.failed} failed)`);
                refetch();
            } else {
                toast.error(`Error: ${result.message}`);
            }
        } catch (err) {
            toast.error(`PO error: ${err.message}`);
            console.error('PO error:', err);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const result = await getInventoryForecastAnalytics(params);
            setAnalytics(result.analytics);
            setShowAnalytics(true);
        } catch (err) {
            toast.error(`Analytics error: ${err.message}`);
            console.error('Analytics error:', err);
        }
    };

    const exportForecastPdf = () => {
        const doc = new jsPDF('landscape');
        const margin = 14;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('Demand Forecast Report', margin, 18);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 25);
        doc.text(`Lookback: ${params.lookbackDays} days | Horizon: ${params.horizonDays} days | Lead time: ${params.leadTimeDays} days | Safety stock: ${params.safetyStockDays} days`, margin, 31);

        const summaryRows = [
            ['Total products', String(reportAnalytics.totalProducts || 0)],
            ['High risk', String(reportAnalytics.riskSummary?.HIGH || 0)],
            ['Medium risk', String(reportAnalytics.riskSummary?.MEDIUM || 0)],
            ['Low risk', String(reportAnalytics.riskSummary?.LOW || 0)],
            ['Total recommended qty', String(reportAnalytics.totalRecommendedQuantity || 0)],
            ['Avg stock cover (days)', String(reportAnalytics.averageStockCoverDays || '0.00')],
        ];

        autoTable(doc, {
            startY: 38,
            head: [['Metric', 'Value']],
            body: summaryRows,
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 2 },
            headStyles: { fillColor: [124, 58, 237] },
            tableWidth: 90,
        });

        autoTable(doc, {
            startY: 38,
            margin: { left: 108 },
            head: [['Product', 'SKU', 'Current', 'Avg Daily', 'Forecast', 'Reorder', 'Recommended', 'Trend', 'Risk', 'AI x', 'AI Conf']],
            body: rows.map((row) => ([
                row.name,
                row.sku,
                row.current_stock,
                row.avg_daily_demand,
                row.forecast_demand,
                row.reorder_point,
                row.recommended_order_qty,
                row.trend,
                row.risk_level,
                row.ai_demand_multiplier ?? 1,
                row.ai_confidence ?? '',
            ])),
            theme: 'grid',
            styles: { fontSize: 7, cellPadding: 1.5, overflow: 'linebreak', valign: 'top' },
            headStyles: { fillColor: [37, 99, 235] },
            columnStyles: {
                0: { cellWidth: 30 },
                1: { cellWidth: 22 },
                2: { cellWidth: 16 },
                3: { cellWidth: 16 },
                4: { cellWidth: 18 },
                5: { cellWidth: 18 },
                6: { cellWidth: 18 },
                7: { cellWidth: 14 },
                8: { cellWidth: 14 },
                9: { cellWidth: 12 },
                10: { cellWidth: 12 },
            },
        });

        const poCandidates = rows.filter((row) => (row.risk_level === 'HIGH' || row.risk_level === 'MEDIUM') && Number(row.recommended_order_qty || 0) > 0);

        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 8,
            head: [['Auto PO Candidate', 'Risk', 'Recommended Qty', 'Reason']],
            body: (poCandidates.length ? poCandidates : [{ name: 'No auto PO candidates', risk_level: 'LOW', recommended_order_qty: 0, rationale: 'No high/medium risk items with a positive order quantity.' }]).map((row) => ([
                row.name,
                row.risk_level,
                row.recommended_order_qty,
                row.rationale || 'Based on forecast and coverage data',
            ])),
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak', valign: 'top' },
            headStyles: { fillColor: [16, 185, 129] },
        });

        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text('Forecast report generated from ERP demand, stock, and AI adjustment data.', margin, doc.internal.pageSize.getHeight() - 8);

        doc.save(`Demand_Forecast_Report_${new Date().getTime()}.pdf`);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-xs uppercase tracking-widest font-black text-blue-600">Inventory Intelligence</p>
                    <h1 className="text-3xl font-black text-slate-900">Demand Forecast</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => refetch()}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                    >
                        <RefreshCcw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold hover:bg-emerald-100"
                    >
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                    <button
                        onClick={exportForecastPdf}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold hover:bg-indigo-100"
                    >
                        <Download className="w-4 h-4" /> Export PDF
                    </button>
                    <button
                        onClick={handleAutoGeneratePOs}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold hover:bg-blue-100"
                    >
                        <Zap className="w-4 h-4" /> Auto PO
                    </button>
                    <button
                        onClick={fetchAnalytics}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 font-bold hover:bg-purple-100"
                    >
                        <BarChart3 className="w-4 h-4" /> Analytics
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white border border-slate-200 rounded-2xl p-4">
                {[
                    { key: 'lookbackDays', label: 'Lookback (days)' },
                    { key: 'horizonDays', label: 'Forecast horizon' },
                    { key: 'leadTimeDays', label: 'Lead time' },
                    { key: 'safetyStockDays', label: 'Safety stock days' }
                ].map((field) => (
                    <label key={field.key} className="flex flex-col gap-1 text-xs font-bold text-slate-600">
                        {field.label}
                        <input
                            type="number"
                            min="1"
                            value={params[field.key]}
                            onChange={(e) => setParams((prev) => ({ ...prev, [field.key]: Number(e.target.value || 1) }))}
                            className="px-3 py-2 rounded-lg border border-slate-300"
                        />
                    </label>
                ))}
            </div>

            {showAnalytics && analytics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-6">
                    <div className="bg-white rounded-xl p-4 border border-purple-100">
                        <div className="text-xs font-bold uppercase text-purple-600">Total Products</div>
                        <div className="text-2xl font-black text-slate-900">{analytics.totalProducts}</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-rose-100">
                        <div className="text-xs font-bold uppercase text-rose-600">High Risk</div>
                        <div className="text-2xl font-black text-slate-900">{analytics.riskSummary.HIGH}</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-amber-100">
                        <div className="text-xs font-bold uppercase text-amber-600">Total Recommended Qty</div>
                        <div className="text-2xl font-black text-slate-900">{analytics.totalRecommendedQuantity}</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-emerald-100">
                        <div className="text-xs font-bold uppercase text-emerald-600">Avg Stock Cover (Days)</div>
                        <div className="text-2xl font-black text-slate-900">{analytics.averageStockCoverDays}</div>
                    </div>
                </div>
            )}

            <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto">
                <table className="min-w-full text-xs">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-3 py-3 text-left">Product</th>
                            <th className="px-3 py-3 text-right">Current</th>
                            <th className="px-3 py-3 text-right">Avg Daily</th>
                            <th className="px-3 py-3 text-right">Smoothed</th>
                            <th className="px-3 py-3 text-right">Forecast</th>
                            <th className="px-3 py-3 text-right">Reorder</th>
                            <th className="px-3 py-3 text-right">Recommended</th>
                            <th className="px-3 py-3 text-center">Trend</th>
                            <th className="px-3 py-3 text-center">Seasonality</th>
                            <th className="px-3 py-3 text-right">Coverage</th>
                            <th className="px-3 py-3 text-center">Risk</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="11" className="px-4 py-8 text-center text-slate-500">Loading forecast...</td>
                            </tr>
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan="11" className="px-4 py-8 text-center text-slate-500">No forecast data available.</td>
                            </tr>
                        ) : (
                            rows.map((row) => (
                                <tr key={row.product_id} className="border-t border-slate-100 hover:bg-blue-50">
                                    <td className="px-3 py-3">
                                        <div className="font-bold text-slate-900 text-xs">{row.name}</div>
                                        <div className="text-xs text-slate-400">{row.sku}</div>
                                    </td>
                                    <td className="px-3 py-3 text-right text-slate-700">{row.current_stock}</td>
                                    <td className="px-3 py-3 text-right text-slate-700">{row.avg_daily_demand}</td>
                                    <td className="px-3 py-3 text-right text-blue-600 font-bold">{row.smoothed_demand}</td>
                                    <td className="px-3 py-3 text-right text-slate-700">{row.forecast_demand}</td>
                                    <td className="px-3 py-3 text-right text-slate-700">{row.reorder_point}</td>
                                    <td className="px-3 py-3 text-right font-black text-blue-600">{row.recommended_order_qty}</td>
                                    <td className="px-3 py-3 text-center">
                                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                                            row.trend === 'UP' ? 'bg-emerald-100 text-emerald-700' :
                                            row.trend === 'DOWN' ? 'bg-rose-100 text-rose-700' :
                                            'bg-slate-100 text-slate-700'
                                        }`}>
                                            {row.trend}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 text-center text-xs">
                                        <span className="text-slate-600">{row.seasonality_pattern?.replace(/_/g, ' ')}</span>
                                    </td>
                                    <td className="px-3 py-3 text-right text-slate-700">{row.stock_cover_days}d</td>
                                    <td className="px-3 py-3 text-center">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-black ${
                                            row.risk_level === 'HIGH'
                                                ? 'bg-rose-100 text-rose-700'
                                                : row.risk_level === 'MEDIUM'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-emerald-100 text-emerald-700'
                                        }`}>
                                            {row.risk_level === 'HIGH' ? <AlertTriangle className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                                            {row.risk_level}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-900 font-medium flex gap-2 items-start">
                <Package className="w-4 h-4 mt-0.5" />
                Reorder recommendations are derived from recent demand, lead time, and safety stock assumptions. Confirm with supplier constraints before purchasing.
            </div>
        </div>
    );
};

export default Forecasting;
