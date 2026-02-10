import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Eye, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const Banking = () => {
    const [payments, setPayments] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        method: 'bank_transfer',
        reference: '',
        notes: ''
    });

    const queryClient = useQueryClient();

    const { data: invoices = [], isLoading: loadingInvoices } = useQuery({
        queryKey: ['invoices'],
        queryFn: async () => {
            const res = await api.get('/invoices');
            return Array.isArray(res.data) ? res.data : (res.data?.data || []);
        }
    });

    const { data: paymentsList, isLoading: loadingPayments, refetch } = useQuery({
        queryKey: ['payments'],
        queryFn: async () => {
            const res = await api.get('/invoices');
            const allInvoices = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            const allPayments = [];
            allInvoices.forEach(inv => {
                if (inv.payments && inv.payments.length > 0) {
                    inv.payments.forEach(payment => {
                        allPayments.push({
                            ...payment,
                            invoice_id: inv.id,
                            invoice_reference: inv.reference,
                            customer_name: inv.customer?.name || 'N/A'
                        });
                    });
                }
            });
            return allPayments;
        }
    });

    useEffect(() => {
        if (paymentsList) setPayments(paymentsList);
    }, [paymentsList]);

    const createPaymentMutation = useMutation({
        mutationFn: (data) => api.post(`/invoices/${selectedInvoice.id}/payment`, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['invoices']);
            queryClient.invalidateQueries(['payments']);
            toast.success('Payment recorded successfully');
            resetForm();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to record payment');
        }
    });

    const deletePaymentMutation = useMutation({
        mutationFn: async (paymentId) => {
            // In a real app, you'd have a delete endpoint
            // For now, we'll just show an error
            throw new Error('Payment deletion requires backend endpoint');
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['payments']);
            toast.success('Payment deleted');
        },
        onError: () => toast.error('Failed to delete payment')
    });

    const unpaidInvoices = invoices.filter(inv => {
        const paid = (inv.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
        return paid < (inv.total || 0);
    });

    const handleAddPayment = () => {
        setSelectedInvoice(null);
        setFormData({ amount: '', method: 'bank_transfer', reference: '', notes: '' });
        setIsModalOpen(true);
    };

    const handleSelectInvoice = (invoice) => {
        setSelectedInvoice(invoice);
        const paid = (invoice.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
        const remaining = (invoice.total || 0) - paid;
        setFormData({
            amount: remaining.toFixed(2),
            method: 'bank_transfer',
            reference: '',
            notes: ''
        });
    };

    const handleSavePayment = () => {
        if (!selectedInvoice) {
            toast.error('Please select an invoice');
            return;
        }
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        const paid = (selectedInvoice.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
        const remaining = (selectedInvoice.total || 0) - paid;
        
        if (parseFloat(formData.amount) > remaining) {
            toast.error(`Payment exceeds remaining amount (₹${remaining.toFixed(2)})`);
            return;
        }

        createPaymentMutation.mutate({
            amount: parseFloat(formData.amount),
            method: formData.method,
            reference: formData.reference,
            notes: formData.notes
        });
    };

    const resetForm = () => {
        setSelectedInvoice(null);
        setFormData({ amount: '', method: 'bank_transfer', reference: '', notes: '' });
        setIsModalOpen(false);
    };

    const getPaymentStatus = (invoice) => {
        const paid = (invoice.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
        const total = invoice.total || 0;
        if (paid >= total) return { status: 'Paid', color: 'green' };
        if (paid > 0) return { status: 'Partial', color: 'yellow' };
        return { status: 'Unpaid', color: 'red' };
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Banking & Payments</h1>
                <button
                    onClick={handleAddPayment}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Record Payment
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Receivable</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                                ₹{invoices.reduce((sum, inv) => sum + ((inv.total || 0) - ((inv.payments || []).reduce((s, p) => s + (p.amount || 0), 0))), 0).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Collected</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                                ₹{paymentsList?.reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2) || '0.00'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Unpaid Invoices</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                                {unpaidInvoices.length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Unpaid Invoices */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Unpaid Invoices</h2>
                    </div>
                    <div className="overflow-x-auto max-h-96 overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Invoice</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Total</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Remaining</th>
                                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {loadingInvoices ? (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-3 text-center text-sm text-gray-500">Loading...</td>
                                    </tr>
                                ) : unpaidInvoices.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-3 text-center text-sm text-gray-500">No unpaid invoices</td>
                                    </tr>
                                ) : (
                                    unpaidInvoices.map((invoice) => {
                                        const paid = (invoice.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
                                        const remaining = (invoice.total || 0) - paid;
                                        return (
                                            <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{invoice.reference}</td>
                                                <td className="px-4 py-3 text-sm text-right text-gray-500 dark:text-gray-400">₹{(invoice.total || 0).toFixed(2)}</td>
                                                <td className="px-4 py-3 text-sm text-right font-semibold text-red-600 dark:text-red-400">₹{remaining.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => { handleSelectInvoice(invoice); setIsModalOpen(true); }}
                                                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                                    >
                                                        Pay
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Payment History */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment History</h2>
                    </div>
                    <div className="overflow-x-auto max-h-96 overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Invoice</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Amount</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Method</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {loadingPayments ? (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-3 text-center text-sm text-gray-500">Loading...</td>
                                    </tr>
                                ) : payments.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-3 text-center text-sm text-gray-500">No payments recorded</td>
                                    </tr>
                                ) : (
                                    payments.map((payment, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{payment.invoice_reference}</td>
                                            <td className="px-4 py-3 text-sm text-right font-semibold text-green-600 dark:text-green-400">₹{(payment.amount || 0).toFixed(2)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 capitalize">{payment.method?.replace('_', ' ')}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{new Date(payment.date).toLocaleDateString()}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Record Payment</h2>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Invoice</label>
                                <select
                                    value={selectedInvoice?.id || ''}
                                    onChange={(e) => {
                                        const inv = unpaidInvoices.find(i => i.id === parseInt(e.target.value));
                                        if (inv) handleSelectInvoice(inv);
                                    }}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">Choose invoice...</option>
                                    {unpaidInvoices.map(inv => {
                                        const paid = (inv.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
                                        const remaining = (inv.total || 0) - paid;
                                        return (
                                            <option key={inv.id} value={inv.id}>
                                                {inv.reference} - ₹{remaining.toFixed(2)} remaining
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            {selectedInvoice && (
                                <>
                                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                                            <span className="font-semibold">₹{(selectedInvoice.total || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Remaining:</span>
                                            <span className="font-semibold text-red-600">
                                                ₹{((selectedInvoice.total || 0) - ((selectedInvoice.payments || []).reduce((s, p) => s + (p.amount || 0), 0))).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                                        <input
                                            type="number"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                                            step="0.01"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Method</label>
                                        <select
                                            value={formData.method}
                                            onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                                            className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="bank_transfer">Bank Transfer</option>
                                            <option value="cash">Cash</option>
                                            <option value="cheque">Cheque</option>
                                            <option value="credit_card">Credit Card</option>
                                            <option value="upi">UPI</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reference</label>
                                        <input
                                            type="text"
                                            value={formData.reference}
                                            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                            placeholder="e.g., Cheque #, Transaction ID"
                                            className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            rows="2"
                                            className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-sm"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    onClick={resetForm}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSavePayment}
                                    disabled={createPaymentMutation.isLoading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {createPaymentMutation.isLoading ? 'Saving...' : 'Save Payment'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Banking;
