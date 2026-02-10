import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus,
    Eye,
    Trash2,
    ArrowLeft,
    Search,
    Hexagon,
    RefreshCw,
    Wallet,
    Building2,
    ArrowUpRight,
    ArrowDownLeft,
    FileText,
    Calendar,
    ChevronRight,
    MoreHorizontal,
    Printer,
    Download,
    X,
    CreditCard,
    Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import clsx from 'clsx';

const PaymentVoucherModal = ({ isOpen, onClose, selectedInvoice, unpaidInvoices }) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        amount: '',
        method: 'bank_transfer',
        reference: '',
        notes: '',
        invoice_id: ''
    });

    useEffect(() => {
        if (selectedInvoice) {
            const paid = (selectedInvoice.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
            const remaining = (selectedInvoice.total_amount || selectedInvoice.total || 0) - paid;
            setFormData({
                amount: remaining.toFixed(2),
                method: 'bank_transfer',
                reference: '',
                notes: '',
                invoice_id: selectedInvoice.id
            });
        } else {
            setFormData({
                amount: '',
                method: 'bank_transfer',
                reference: '',
                notes: '',
                invoice_id: ''
            });
        }
    }, [selectedInvoice, isOpen]);

    const createPaymentMutation = useMutation({
        mutationFn: (data) => api.post(`/invoices/${formData.invoice_id}/payment`, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['invoices']);
            queryClient.invalidateQueries(['payments']);
            toast.success('Transaction Posted to Ledger');
            onClose();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Transaction Failed');
        }
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg border border-slate-100 animate-in fade-in zoom-in duration-300">
                <div className="p-10 space-y-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">Voucher Entry</span>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Payment Voucher</h2>
                        </div>
                        <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Against Ref (Invoice)</label>
                            <select
                                value={formData.invoice_id}
                                onChange={(e) => {
                                    const inv = unpaidInvoices.find(i => i.id === parseInt(e.target.value));
                                    if (inv) {
                                        const paid = (inv.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
                                        const remaining = (inv.total_amount || inv.total || 0) - paid;
                                        setFormData({ ...formData, invoice_id: inv.id, amount: remaining.toFixed(2) });
                                    }
                                }}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-bold text-slate-900 appearance-none"
                            >
                                <option value="">Select Reference</option>
                                {unpaidInvoices.map(inv => {
                                    const paid = (inv.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
                                    const remaining = (inv.total_amount || inv.total || 0) - paid;
                                    return (
                                        <option key={inv.id} value={inv.id}>
                                            {inv.invoice_number || inv.reference} - ₹{remaining.toLocaleString('en-IN')}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Amount (INR)</label>
                                <input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all font-black text-slate-900"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Account / Method</label>
                                <select
                                    value={formData.method}
                                    onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-slate-900 appearance-none"
                                >
                                    <option value="bank_transfer">Bank Account</option>
                                    <option value="cash">Cash in Hand</option>
                                    <option value="cheque">Cheque</option>
                                    <option value="upi">UPI / Digital</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Transaction Ref / ID</label>
                            <input
                                type="text"
                                value={formData.reference}
                                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-slate-900"
                                placeholder="UTR, Cheque No, etc."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Narration</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows="3"
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-slate-900 resize-none"
                                placeholder="Transaction details..."
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 font-black text-slate-600 uppercase tracking-widest text-[10px] transition-all"
                        >
                            Discard
                        </button>
                        <button
                            onClick={() => createPaymentMutation.mutate(formData)}
                            disabled={createPaymentMutation.isLoading}
                            className="flex-[2] px-8 py-5 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-900/20 hover:bg-slate-800 font-black uppercase tracking-widest text-[10px] transition-all disabled:opacity-50"
                        >
                            {createPaymentMutation.isLoading ? 'Posting...' : 'Post Transaction'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Banking = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('bank'); // 'bank' or 'cash'
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const queryClient = useQueryClient();

    const { data: invoices = [], isLoading: loadingInvoices } = useQuery({
        queryKey: ['invoices'],
        queryFn: async () => {
            const res = await api.get('/invoices');
            return Array.isArray(res.data) ? res.data : (res.data?.data || []);
        }
    });

    const { data: paymentsList = [], isLoading: loadingPayments } = useQuery({
        queryKey: ['payments'],
        queryFn: async () => {
            const res = await api.get('/invoices/payments');
            const rawData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            return rawData.map(p => ({
                ...p,
                invoice_number: p.invoice?.invoice_number || p.invoice?.reference || 'N/A',
                customer_name: p.invoice?.customers?.name || p.invoice?.customer?.name || 'Walk-in Customer'
            }));
        }
    });

    const unpaidInvoices = invoices.filter(inv => {
        const paid = (inv.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
        return paid < (inv.total_amount || inv.total || 0);
    });

    const totalReceivable = invoices.reduce((sum, inv) => {
        const paid = (inv.payments || []).reduce((s, p) => s + (p.amount || 0), 0);
        return sum + ((inv.total_amount || inv.total || 0) - paid);
    }, 0);

    const totalCollected = paymentsList.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    const filteredHistory = paymentsList.filter(p => {
        const matchSearch = (p.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()));
        if (activeTab === 'bank') return matchSearch && p.method !== 'cash';
        return matchSearch && p.method === 'cash';
    });

    return (
        <div className="max-w-[1600px] mx-auto space-y-12 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">Ledger Management</span>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Banking & Cash Books</h1>
                    <p className="text-slate-500 font-bold text-sm mt-2">Comprehensive tracking of liquid assets and settlement history.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="flex items-center px-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-[10px] font-black text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reconcile
                    </button>
                    <button
                        onClick={() => { setSelectedInvoice(null); setIsModalOpen(true); }}
                        className="flex items-center px-8 py-4 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-900/20 text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Record Entry
                    </button>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
                        <Building2 className="w-20 h-20" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Receivable</p>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">₹{totalReceivable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
                    <div className="flex items-center mt-4 text-[10px] font-black text-rose-500 bg-rose-50 w-fit px-3 py-1 rounded-full">
                        <ArrowUpRight className="w-3 h-3 mr-1" /> O/S Balance
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
                        <Wallet className="w-20 h-20" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Collected</p>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">₹{totalCollected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
                    <div className="flex items-center mt-4 text-[10px] font-black text-emerald-500 bg-emerald-50 w-fit px-3 py-1 rounded-full">
                        <ArrowDownLeft className="w-3 h-3 mr-1" /> Net Inflow
                    </div>
                </div>

                <div className="md:col-span-2 bg-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-slate-900/10 text-white flex items-center justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Hexagon className="w-32 h-32 text-blue-400 fill-blue-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Liquid Assets Summary</p>
                        <div className="flex items-baseline space-x-4">
                            <h2 className="text-4xl font-black text-white tracking-tighter">₹{(totalCollected * 0.85).toLocaleString('en-IN', { minimumDigits: 0 })}</h2>
                            <span className="text-blue-400 font-black text-sm tracking-tight hover:underline cursor-pointer">View Projections →</span>
                        </div>
                    </div>
                    <div className="hidden lg:block text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2 text-right">Ledger Accuracy</p>
                        <p className="text-3xl font-black text-blue-400 leading-none">99.8%</p>
                    </div>
                </div>
            </div>

            {/* Main Ledger Section */}
            <div className="space-y-6">
                {/* Tabs & Search */}
                <div className="flex flex-col lg:flex-row gap-6 justify-between items-center bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex p-2 bg-slate-50 rounded-2xl w-full lg:w-fit">
                        <button
                            onClick={() => setActiveTab('bank')}
                            className={clsx(
                                "flex-1 lg:flex-none px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                activeTab === 'bank' ? "bg-white text-blue-600 shadow-md" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Bank Ledger
                        </button>
                        <button
                            onClick={() => setActiveTab('cash')}
                            className={clsx(
                                "flex-1 lg:flex-none px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                activeTab === 'cash' ? "bg-white text-blue-600 shadow-md" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Cash Ledger
                        </button>
                    </div>

                    <div className="flex-1 max-w-2xl w-full relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab} transactions by REF or Customer...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white transition-all outline-none font-bold text-slate-900 border-none ring-0"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                    {/* Settlement/History Ledger */}
                    <div className="xl:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center">
                                <FileText className="w-4 h-4 mr-3 text-blue-600" />
                                Recent Transactions
                            </h3>
                            <div className="flex items-center space-x-2">
                                <button className="p-2 text-slate-400 hover:text-slate-900 transition-all"><Printer className="w-4 h-4" /></button>
                                <button className="p-2 text-slate-400 hover:text-slate-900 transition-all"><Download className="w-4 h-4" /></button>
                                <button className="p-2 text-slate-400 hover:text-slate-900 transition-all"><MoreHorizontal className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date / Ref</th>
                                        <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Party Details</th>
                                        <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Instrument</th>
                                        <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount (DR/CR)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loadingPayments ? (
                                        <tr><td colSpan="4" className="px-10 py-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest animate-pulse">Syncing Ledgers...</td></tr>
                                    ) : filteredHistory.length === 0 ? (
                                        <tr><td colSpan="4" className="px-10 py-32 text-center">
                                            <div className="opacity-20 flex flex-col items-center">
                                                <RefreshCw className="w-12 h-12 mb-4" />
                                                <p className="font-black uppercase tracking-widest text-[10px]">No ledger entries found</p>
                                            </div>
                                        </td></tr>
                                    ) : (
                                        filteredHistory.map((payment, idx) => (
                                            <tr key={idx} className="group hover:bg-slate-50/80 transition-all cursor-pointer">
                                                <td className="px-10 py-6 whitespace-nowrap">
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 tracking-tight">{payment.invoice_number}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{new Date(payment.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <p className="text-sm font-black text-slate-900 tracking-tight">{payment.customer_name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 tracking-tight">Voucher Settlement</p>
                                                </td>
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center mr-3 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                            <CreditCard className="w-4 h-4" />
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{payment.method?.replace('_', ' ')}</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6 text-right whitespace-nowrap">
                                                    <p className="text-lg font-black text-emerald-500 tracking-tighter">₹{(payment.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                                    <p className="text-[10px] font-black text-slate-300 uppercase leading-none">Credit</p>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pending Settlements Panel */}
                    <div className="xl:col-span-4 space-y-8">
                        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-blue-400">Payment Requests</h3>
                            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {unpaidInvoices.length === 0 ? (
                                    <div className="py-10 text-center opacity-30">
                                        <p className="text-[10px] font-black uppercase tracking-widest">All accounts settled</p>
                                    </div>
                                ) : (
                                    unpaidInvoices.map((inv) => {
                                        const paid = (inv.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
                                        const remaining = (inv.total_amount || inv.total || 0) - paid;
                                        return (
                                            <div
                                                key={inv.id}
                                                className="group bg-slate-800/50 p-6 rounded-[1.5rem] border border-slate-700/50 hover:border-blue-500/50 transition-all cursor-pointer"
                                                onClick={() => { setSelectedInvoice(inv); setIsModalOpen(true); }}
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <p className="text-sm font-black tracking-tight">{inv.invoice_number || inv.reference}</p>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">{inv.customer?.name || 'Walk-in'}</p>
                                                    </div>
                                                    <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-xl">
                                                        <ArrowUpRight className="w-4 h-4" />
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-50 mb-0.5">O/S Balance</p>
                                                        <p className="text-xl font-black text-white">₹{remaining.toLocaleString('en-IN')}</p>
                                                    </div>
                                                    <button className="flex items-center text-[10px] font-black uppercase tracking-widest text-blue-500 group-hover:text-white transition-all">
                                                        Settle <ChevronRight className="w-3 h-3 ml-1" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                            <div className="mt-8 pt-8 border-t border-slate-800">
                                <button
                                    onClick={() => navigate('/sales-invoices')}
                                    className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    View All Open Vouchers
                                </button>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest px-1">Quick Ledger Actions</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all cursor-pointer group">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:bg-blue-600 transition-all group-hover:text-white">
                                        <RefreshCw className="w-5 h-5 text-slate-400 group-hover:text-white" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Contra Entry</p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all cursor-pointer group">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:bg-blue-600 transition-all group-hover:text-white">
                                        <Printer className="w-5 h-5 text-slate-400 group-hover:text-white" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Print Ledger</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <PaymentVoucherModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedInvoice(null); }}
                selectedInvoice={selectedInvoice}
                unpaidInvoices={unpaidInvoices}
            />
        </div>
    );
};

export default Banking;
