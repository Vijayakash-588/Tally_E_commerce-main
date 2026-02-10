import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, X, ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

const InvoiceModal = ({ isOpen, onClose, invoice }) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        customer_id: '',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: '',
        discount: 0,
        items: []
    });

    const { data: customers = [] } = useQuery({
        queryKey: ['customers'],
        queryFn: async () => {
            const res = await api.get('/customers');
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

    const { data: taxRates = [] } = useQuery({
        queryKey: ['taxRates'],
        queryFn: async () => {
            const res = await api.get('/invoices/tax-rates');
            return Array.isArray(res.data) ? res.data : (res.data?.data || []);
        }
    });

    React.useEffect(() => {
        if (invoice) {
            setFormData({
                customer_id: invoice.customer_id || '',
                issue_date: invoice.issue_date?.split('T')[0] || new Date().toISOString().split('T')[0],
                due_date: invoice.due_date?.split('T')[0] || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                notes: invoice.notes || '',
                discount: invoice.discount || 0,
                items: invoice.invoice_items || []
            });
        } else {
            setFormData({
                customer_id: '',
                issue_date: new Date().toISOString().split('T')[0],
                due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                notes: '',
                discount: 0,
                items: []
            });
        }
    }, [invoice]);

    const mutation = useMutation({
        mutationFn: (data) => {
            if (invoice?.id) {
                return api.put(`/invoices/${invoice.id}`, data);
            }
            return api.post('/invoices', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['invoices']);
            toast.success(invoice ? 'Invoice updated' : 'Invoice created');
            onClose();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    });

    const handleAddItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, {
                product_id: '',
                quantity: 1,
                unit_price: 0,
                tax_rate_id: '',
                description: ''
            }]
        }));
    };

    const handleRemoveItem = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        if (field === 'product_id') {
            const product = products.find(p => p.id === parseInt(value));
            newItems[index].product_id = parseInt(value);
            if (product) newItems[index].unit_price = product.price || 0;
        } else {
            newItems[index][field] = field === 'quantity' || field === 'unit_price' ? parseFloat(value) || 0 : value;
        }
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const calculateTotals = () => {
        const subtotal = formData.items.reduce((sum, item) => {
            const itemTotal = (item.quantity || 0) * (item.unit_price || 0);
            return sum + itemTotal;
        }, 0);
        const tax = formData.items.reduce((sum, item) => {
            const itemTotal = (item.quantity || 0) * (item.unit_price || 0);
            const taxRate = taxRates.find(t => t.id === parseInt(item.tax_rate_id));
            const taxAmount = taxRate ? itemTotal * (taxRate.rate / 100) : 0;
            return sum + taxAmount;
        }, 0);
        const discount = parseFloat(formData.discount) || 0;
        const total = subtotal + tax - discount;
        return { subtotal, tax, discount, total };
    };

    const totals = calculateTotals();

    const handleSave = () => {
        if (!formData.customer_id) {
            toast.error('Please select a customer');
            return;
        }
        if (formData.items.length === 0) {
            toast.error('Add at least one item');
            return;
        }

        mutation.mutate(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {invoice ? 'Edit Invoice' : 'New Invoice'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer *</label>
                            <select
                                value={formData.customer_id}
                                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Select customer</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issue Date</label>
                            <input
                                type="date"
                                value={formData.issue_date}
                                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                            <input
                                type="date"
                                value={formData.due_date}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Line Items */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Invoice Items *</label>
                            <button
                                onClick={handleAddItem}
                                className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
                            >
                                + Add Item
                            </button>
                        </div>
                        <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300">Product</th>
                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 dark:text-gray-300 w-20">Qty</th>
                                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 dark:text-gray-300 w-24">Unit Price</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 w-32">Tax Rate</th>
                                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 dark:text-gray-300 w-24">Amount</th>
                                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 dark:text-gray-300 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {formData.items.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-3 py-8 text-center text-gray-400 dark:text-gray-500">
                                                Click "Add Item" to add invoice line items
                                            </td>
                                        </tr>
                                    ) : (
                                        formData.items.map((item, idx) => {
                                            const itemAmount = (item.quantity || 0) * (item.unit_price || 0);
                                            const taxRate = taxRates.find(t => t.id === parseInt(item.tax_rate_id));
                                            const taxAmount = taxRate ? itemAmount * (taxRate.rate / 100) : 0;
                                            return (
                                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                    <td className="px-3 py-2">
                                                        <select
                                                            value={item.product_id || ''}
                                                            onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)}
                                                            className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-xs focus:ring-1 focus:ring-indigo-500"
                                                        >
                                                            <option value="">Select product</option>
                                                            {products.map(p => (
                                                                <option key={p.id} value={p.id}>{p.name}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="number"
                                                            value={item.quantity || ''}
                                                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                                            className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-xs text-center focus:ring-1 focus:ring-indigo-500"
                                                            placeholder="0"
                                                            min="1"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="number"
                                                            value={item.unit_price || ''}
                                                            onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                                                            className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-xs text-right focus:ring-1 focus:ring-indigo-500"
                                                            placeholder="0.00"
                                                            step="0.01"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <select
                                                            value={item.tax_rate_id || ''}
                                                            onChange={(e) => handleItemChange(idx, 'tax_rate_id', e.target.value)}
                                                            className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-xs focus:ring-1 focus:ring-indigo-500"
                                                        >
                                                            <option value="">No Tax</option>
                                                            {taxRates.map(t => (
                                                                <option key={t.id} value={t.id}>{t.name} ({t.rate}%)</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-semibold text-gray-900 dark:text-white text-xs">
                                                        ₹{(itemAmount + taxAmount).toFixed(2)}
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <button
                                                            onClick={() => handleRemoveItem(idx)}
                                                            className="text-red-600 hover:text-red-900 dark:text-red-400 p-1"
                                                            title="Remove item"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
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

                    {/* Discount & Notes */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount Amount</label>
                            <input
                                type="number"
                                value={formData.discount || ''}
                                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                placeholder="0.00"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                            <input
                                type="text"
                                value={formData.notes || ''}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                placeholder="Additional notes..."
                            />
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg space-y-2 border border-gray-200 dark:border-gray-600">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Subtotal:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">₹{totals.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Tax:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">₹{totals.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Discount:</span>
                            <span className="font-semibold text-red-600 dark:text-red-400">-₹{totals.discount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold border-t border-gray-300 dark:border-gray-600 pt-2 text-gray-900 dark:text-white">
                            <span>Total:</span>
                            <span className="text-indigo-600 dark:text-indigo-400">₹{totals.total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={mutation.isLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {mutation.isLoading ? 'Saving...' : 'Save Invoice'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SalesInvoice = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { data: invoices = [], isLoading } = useQuery({
        queryKey: ['invoices'],
        queryFn: async () => {
            const res = await api.get('/invoices');
            return Array.isArray(res.data) ? res.data : (res.data?.data || []);
        }
    });

    const { data: customers = [] } = useQuery({
        queryKey: ['customers'],
        queryFn: async () => {
            const res = await api.get('/customers');
            return Array.isArray(res.data) ? res.data : (res.data?.data || []);
        }
    });

    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/invoices/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['invoices']);
            toast.success('Invoice deleted');
        },
        onError: () => toast.error('Failed to delete invoice')
    });

    const handleNewInvoice = () => {
        setSelectedInvoice(null);
        setIsModalOpen(true);
    };

    const handleEdit = (invoice) => {
        setSelectedInvoice(invoice);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this invoice?')) {
            deleteMutation.mutate(id);
        }
    };

    const filtered = invoices.filter(inv =>
        inv.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customers.find(c => c.id === inv.customer_id)?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sales Invoices</h1>
                </div>
                <button
                    onClick={handleNewInvoice}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    New Invoice
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <input
                        type="text"
                        placeholder="Search by invoice number or customer name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Invoice #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Issue Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subtotal</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tax</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">Loading invoices...</td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                                        {invoices.length === 0 ? 'No invoices yet. Create one to get started.' : 'No matching invoices found.'}
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((invoice) => {
                                    const subtotal = (invoice.total_amount || 0) - (invoice.tax || 0);
                                    return (
                                        <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {invoice.invoice_number || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {customers.find(c => c.id === invoice.customer_id)?.name || 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString('en-IN') : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-IN') : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white font-medium">
                                                ₹{subtotal.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white font-medium">
                                                ₹{(invoice.tax || 0).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right text-indigo-600 dark:text-indigo-400">
                                                ₹{(invoice.total_amount || 0).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                                                <button
                                                    onClick={() => handleEdit(invoice)}
                                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 inline-flex items-center"
                                                    title="Edit invoice"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(invoice.id)}
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 inline-flex items-center"
                                                    title="Delete invoice"
                                                >
                                                    <Trash2 className="w-4 h-4" />
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

            <InvoiceModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedInvoice(null);
                }}
                invoice={selectedInvoice}
            />
        </div>
    );
};

export default SalesInvoice;
