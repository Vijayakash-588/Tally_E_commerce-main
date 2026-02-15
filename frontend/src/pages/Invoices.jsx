import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Search, Filter, Calendar, DollarSign, User, ArrowLeft, Eye, Download, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import clsx from 'clsx';

const Invoices = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const { data: invoices = [], isLoading } = useQuery({
        queryKey: ['invoices'],
        queryFn: async () => {
            const res = await api.get('/invoices');
            return Array.isArray(res.data) ? res.data : (res.data?.data || []);
        }
    });

    const getStatusColor = (status) => {
        const colors = {
            draft: 'bg-slate-100 text-slate-700',
            sent: 'bg-blue-100 text-blue-700',
            paid: 'bg-green-100 text-green-700',
            partial: 'bg-yellow-100 text-yellow-700',
            overdue: 'bg-red-100 text-red-700',
            cancelled: 'bg-gray-100 text-gray-600'
        };
        return colors[status] || colors.draft;
    };

    const filtered = invoices.filter(inv => {
        const matchesSearch =
            inv.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Calculate statistics
    const stats = {
        total: invoices.length,
        paid: invoices.filter(i => i.status === 'paid').length,
        pending: invoices.filter(i => i.status === 'sent' || i.status === 'partial').length,
        overdue: invoices.filter(i => i.status === 'overdue').length,
        totalAmount: invoices.reduce((sum, i) => sum + (i.total_amount || 0), 0),
        paidAmount: invoices.reduce((sum, i) => sum + (i.paid_amount || 0), 0)
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/')}
                    className="p-3 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-2xl transition-all"
                    title="Back to Dashboard"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] block">Invoice Management</span>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">All Invoices</h1>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Total Invoices</p>
                            <p className="text-3xl font-black text-slate-900 mt-2 tracking-tight">{stats.total}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-blue-50 group-hover:scale-110 transition-transform duration-500">
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Paid</p>
                            <p className="text-3xl font-black text-green-600 mt-2 tracking-tight">{stats.paid}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-green-50 group-hover:scale-110 transition-transform duration-500">
                            <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Pending</p>
                            <p className="text-3xl font-black text-yellow-600 mt-2 tracking-tight">{stats.pending}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-yellow-50 group-hover:scale-110 transition-transform duration-500">
                            <Calendar className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Overdue</p>
                            <p className="text-3xl font-black text-red-600 mt-2 tracking-tight">{stats.overdue}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-red-50 group-hover:scale-110 transition-transform duration-500">
                            <FileText className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by invoice number or customer..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-bold text-slate-900"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-bold text-slate-900 appearance-none"
                        >
                            <option value="all">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="sent">Sent</option>
                            <option value="paid">Paid</option>
                            <option value="partial">Partial</option>
                            <option value="overdue">Overdue</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                {/* Invoice Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Invoice #</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Issue Date</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Due Date</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" className="px-8 py-12 text-center text-slate-400 font-bold">Loading invoices...</td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-8 py-12 text-center text-slate-400 font-bold">No invoices found</td>
                                </tr>
                            ) : (
                                filtered.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="text-sm font-black text-slate-900">
                                                {invoice.invoice_number || `INV-${invoice.id}`}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <User className="w-4 h-4 mr-2 text-slate-400" />
                                                <div className="text-sm font-bold text-slate-700">
                                                    {invoice.customer?.name || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-slate-600">
                                            {invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString('en-IN') : '-'}
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-slate-600">
                                            {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-IN') : '-'}
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-black text-slate-900">
                                            ₹{(invoice.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-center">
                                            <span className={clsx(
                                                "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider",
                                                getStatusColor(invoice.status)
                                            )}>
                                                {invoice.status ? invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1) : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => setSelectedInvoice(invoice)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className="p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                                                    title="Download"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Invoice Detail Modal */}
            {selectedInvoice && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
                    <div className="bg-white rounded-[2.5rem] max-w-2xl w-full p-10 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">Invoice Details</span>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                                    {selectedInvoice.invoice_number || `INV-${selectedInvoice.id}`}
                                </h2>
                            </div>
                            <button
                                onClick={() => setSelectedInvoice(null)}
                                className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</p>
                                    <p className="text-lg font-black text-slate-900">
                                        {selectedInvoice.customer?.name || 'N/A'}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                                    <span className={clsx(
                                        "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider",
                                        getStatusColor(selectedInvoice.status)
                                    )}>
                                        {selectedInvoice.status ? selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1) : 'Draft'}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Issue Date</p>
                                    <p className="text-base font-bold text-slate-700">
                                        {selectedInvoice.issue_date ? new Date(selectedInvoice.issue_date).toLocaleDateString('en-IN') : '-'}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</p>
                                    <p className="text-base font-bold text-slate-700">
                                        {selectedInvoice.due_date ? new Date(selectedInvoice.due_date).toLocaleDateString('en-IN') : '-'}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</p>
                                    <p className="text-2xl font-black text-slate-900">
                                        ₹{(selectedInvoice.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount Paid</p>
                                    <p className="text-2xl font-black text-green-600">
                                        ₹{(selectedInvoice.paid_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                            {selectedInvoice.notes && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</p>
                                    <p className="text-sm font-bold text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        {selectedInvoice.notes}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4 pt-8">
                            <button
                                onClick={() => setSelectedInvoice(null)}
                                className="flex-1 px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 font-black text-slate-600 uppercase tracking-widest text-xs transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Invoices;
