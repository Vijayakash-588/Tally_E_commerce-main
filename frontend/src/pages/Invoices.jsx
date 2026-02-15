import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Search, Filter, Calendar, DollarSign, User, ArrowLeft, Eye, Download } from 'lucide-react';
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
            draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
            sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-500'
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
        paidAmount: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total_amount || 0), 0)
    };

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage all your invoices</p>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Invoices</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</p>
                        </div>
                        <FileText className="w-10 h-10 text-blue-600 dark:text-blue-400 opacity-20" />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Paid</p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.paid}</p>
                        </div>
                        <DollarSign className="w-10 h-10 text-green-600 dark:text-green-400 opacity-20" />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Pending</p>
                            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">{stats.pending}</p>
                        </div>
                        <Calendar className="w-10 h-10 text-yellow-600 dark:text-yellow-400 opacity-20" />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Overdue</p>
                            <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{stats.overdue}</p>
                        </div>
                        <FileText className="w-10 h-10 text-red-600 dark:text-red-400 opacity-20" />
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by invoice number or customer..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
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
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Invoice #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Issue Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">Loading...</td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No invoices found</td>
                                </tr>
                            ) : (
                                filtered.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {invoice.invoice_number || `INV-${invoice.id}`}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <User className="w-4 h-4 mr-2 text-gray-400" />
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    {invoice.customer?.name || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                            {invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString('en-IN') : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                            {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-IN') : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900 dark:text-white">
                                            ₹{(invoice.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={clsx(
                                                "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                                                getStatusColor(invoice.status)
                                            )}>
                                                {invoice.status ? invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1) : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => setSelectedInvoice(invoice)}
                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                                                title="Download"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Invoice Details - {selectedInvoice.invoice_number || `INV-${selectedInvoice.id}`}
                            </h2>
                            <button
                                onClick={() => setSelectedInvoice(null)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                            >
                                <FileText className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Customer</p>
                                    <p className="text-base font-medium text-gray-900 dark:text-white">
                                        {selectedInvoice.customer?.name || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                                    <span className={clsx(
                                        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-1",
                                        getStatusColor(selectedInvoice.status)
                                    )}>
                                        {selectedInvoice.status ? selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1) : 'Draft'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Issue Date</p>
                                    <p className="text-base font-medium text-gray-900 dark:text-white">
                                        {selectedInvoice.issue_date ? new Date(selectedInvoice.issue_date).toLocaleDateString('en-IN') : '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Due Date</p>
                                    <p className="text-base font-medium text-gray-900 dark:text-white">
                                        {selectedInvoice.due_date ? new Date(selectedInvoice.due_date).toLocaleDateString('en-IN') : '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        ₹{(selectedInvoice.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Amount Paid</p>
                                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                        ₹{(selectedInvoice.amount_paid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                            {selectedInvoice.notes && (
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                        {selectedInvoice.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                            <button
                                onClick={() => setSelectedInvoice(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
