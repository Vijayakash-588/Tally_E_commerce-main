import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus,
    Edit2,
    Trash2,
    X,
    ArrowLeft,
    Search,
    Download,
    FileText,
    Calendar,
    User,
    CreditCard,
    Receipt,
    Briefcase,
    Zap,
    ChevronDown,
    Printer,
    Send,
    Trash
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import clsx from 'clsx';

const InvoiceModal = ({ isOpen, onClose, invoice }) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        customer_id: '',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: '',
        discount: 0,
        round_off: 0,
        items: []
    });
    const [barcode, setBarcode] = useState('');

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
                round_off: invoice.round_off || 0,
                items: invoice.invoice_items || []
            });
        } else {
            setFormData({
                customer_id: '',
                issue_date: new Date().toISOString().split('T')[0],
                due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                notes: '',
                discount: 0,
                round_off: 0,
                items: []
            });
            setBarcode('');
        }
    }, [invoice]);

    const mutation = useMutation({
        mutationFn: (data) => {
            if (invoice?.id) return api.put(`/invoices/${invoice.id}`, data);
            return api.post('/invoices', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['invoices']);
            toast.success(invoice ? 'Voucher Updated' : 'Sales Voucher Generated');
            onClose();
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Transaction Failed')
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
            const product = products.find(p => p.id === value);
            newItems[index].product_id = value;
            if (product) newItems[index].unit_price = product.price || 0;
        } else {
            newItems[index][field] = field === 'quantity' || field === 'unit_price' ? parseFloat(value) || 0 : value;
        }
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const calculateTotals = () => {
        const subtotal = formData.items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unit_price || 0)), 0);
        const tax = formData.items.reduce((sum, item) => {
            const itemTotal = (item.quantity || 0) * (item.unit_price || 0);
            const taxRate = taxRates.find(t => t.id === item.tax_rate_id);
            return sum + (taxRate ? itemTotal * (taxRate.rate / 100) : 0);
        }, 0);
        const discount = parseFloat(formData.discount) || 0;
        const roundOff = parseFloat(formData.round_off) || 0;
        return { subtotal, tax, discount, roundOff, total: subtotal + tax - discount + roundOff };
    };

    const totals = calculateTotals();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl my-auto border border-slate-100 animate-in fade-in zoom-in duration-300">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-10 border-b border-slate-50">
                    <div>
                        <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">Voucher Entry</span>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                            {invoice ? 'Modify Sales Voucher' : 'New Sales Invoice'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-4 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-10 space-y-10">
                    {/* Document Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100">
                        <div className="space-y-2">
                            <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                <User className="w-3 h-3 mr-2" /> Party A/C Name
                            </label>
                            <select
                                value={formData.customer_id}
                                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                                className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-bold text-slate-900 appearance-none"
                            >
                                <option value="">Select Ledger/Customer</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                <Calendar className="w-3 h-3 mr-2" /> Voucher Date
                            </label>
                            <input
                                type="date"
                                value={formData.issue_date}
                                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                                className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-bold text-slate-900"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                <Calendar className="w-3 h-3 mr-2" /> Payment Due
                            </label>
                            <input
                                type="date"
                                value={formData.due_date}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-bold text-slate-900"
                            />
                        </div>
                    </div>

                    {/* Entry Table */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
                                <FileText className="w-4 h-4 mr-2" /> Items & Descriptions
                            </h3>
                            <button
                                onClick={handleAddItem}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20 text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
                            >
                                <Plus className="w-3 h-3 mr-1.5" /> Append Row
                            </button>
                        </div>

                        <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-100 mb-4">
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                                <Search className="w-4 h-4 text-blue-600" />
                            </div>
                            <input
                                type="text"
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                                onKeyDown={async (e) => {
                                    if (e.key === 'Enter' && barcode) {
                                        try {
                                            const res = await api.get(`/products/barcode/${barcode}`);
                                            if (res.data.success && res.data.data) {
                                                const p = res.data.data;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    items: [...prev.items, {
                                                        product_id: p.id,
                                                        quantity: 1,
                                                        unit_price: p.price || 0,
                                                        tax_rate_id: '',
                                                        description: ''
                                                    }]
                                                }));
                                                setBarcode('');
                                                toast.success(`Added ${p.name}`);
                                            } else {
                                                toast.error('Product not found');
                                            }
                                        } catch (err) {
                                            toast.error('Product not found');
                                        }
                                    }
                                }}
                                placeholder="Scan Barcode & Hit Enter..."
                                className="flex-1 bg-transparent border-none outline-none text-xs font-bold text-slate-900 placeholder:text-slate-400"
                            />
                        </div>

                        <div className="border border-slate-100 rounded-[2rem] overflow-hidden bg-white shadow-sm">
                            <table className="w-full">
                                <thead className="bg-slate-50/50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Item</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-24">Qty</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Rate</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest w-40">Tax (GST)</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest w-36">Total</th>
                                        <th className="px-4 py-4 text-center w-12"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {formData.items.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-10 py-20 text-center">
                                                <div className="flex flex-col items-center opacity-30">
                                                    <Receipt className="w-12 h-12 mb-3 text-slate-400" />
                                                    <p className="text-sm font-bold text-slate-500">No items entered in this voucher</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        formData.items.map((item, idx) => {
                                            const itemAmount = (item.quantity || 0) * (item.unit_price || 0);
                                            const taxRate = taxRates.find(t => t.id === item.tax_rate_id);
                                            const taxAmount = taxRate ? itemAmount * (taxRate.rate / 100) : 0;
                                            return (
                                                <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <select
                                                            value={item.product_id || ''}
                                                            onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)}
                                                            className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none font-bold text-sm text-slate-900 appearance-none transition-all"
                                                        >
                                                            <option value="">Select Stock Item</option>
                                                            {products.map(p => (
                                                                <option key={p.id} value={p.id}>{p.name}</option>
                                                            ))}
                                                        </select>
                                                        <input
                                                            type="text"
                                                            value={item.description || ''}
                                                            onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                                                            placeholder="Item Description"
                                                            className="w-full mt-2 p-2 bg-transparent border-b border-slate-200 text-xs font-bold text-slate-500 focus:border-blue-400 outline-none"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="number"
                                                            value={item.quantity || ''}
                                                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                                            className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none font-black text-sm text-center text-slate-900 transition-all"
                                                            placeholder="0"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="number"
                                                            value={item.unit_price || ''}
                                                            onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                                                            className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none font-black text-sm text-right text-slate-900 transition-all"
                                                            placeholder="0.00"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <select
                                                            value={item.tax_rate_id || ''}
                                                            onChange={(e) => handleItemChange(idx, 'tax_rate_id', e.target.value)}
                                                            className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none font-bold text-[10px] uppercase tracking-wider text-slate-900 appearance-none transition-all"
                                                        >
                                                            <option value="">Nil Rated</option>
                                                            {taxRates.map(t => (
                                                                <option key={t.id} value={t.id}>{t.name}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="text-sm font-black text-slate-900 tracking-tight">
                                                            ₹{(itemAmount + taxAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <button
                                                            onClick={() => handleRemoveItem(idx)}
                                                            className="p-2 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
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

                    {/* Footer Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                        <div className="md:col-span-7 space-y-6">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block">Narration / Remarks</label>
                                <textarea
                                    value={formData.notes || ''}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows="4"
                                    className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2rem] focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none font-bold text-slate-900 transition-all"
                                    placeholder="Enter transaction narrative..."
                                />
                            </div>
                            <div className="flex items-center p-6 bg-blue-50/50 border border-blue-100 rounded-[2rem]">
                                <Zap className="w-6 h-6 text-blue-600 mr-4" />
                                <p className="text-xs font-bold text-blue-900 leading-relaxed">
                                    Voucher numbers are auto-generated on submission following the standard accounting sequence.
                                </p>
                            </div>
                        </div>

                        <div className="md:col-span-5 space-y-6">
                            <div className="bg-slate-900 rounded-[2.5rem] p-10 shadow-xl shadow-slate-900/20 text-white space-y-4 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Receipt className="w-32 h-32" />
                                </div>
                                <div className="flex justify-between items-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                    <span>Voucher Total</span>
                                    <span>(INR)</span>
                                </div>
                                <div className="space-y-3 py-6 border-y border-slate-800">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-slate-500">Gross Assessment</span>
                                        <span>₹{totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-slate-500">Tax Liability</span>
                                        <span>₹{totals.tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold">
                                        <div className="flex flex-col gap-1 w-full">
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500">Global Discount</span>
                                                <div className="flex items-center">
                                                    <span className="mr-1 text-slate-600">-</span>
                                                    <input
                                                        type="number"
                                                        value={formData.discount}
                                                        onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                                        className="bg-transparent text-right border-b border-slate-700 outline-none w-20 p-0 text-rose-400 focus:border-blue-500 transition-all font-bold"
                                                        placeholder="0"
                                                        min="0"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500">Round Off</span>
                                                <div className="flex items-center">
                                                    <span className="mr-1 text-slate-600">+/-</span>
                                                    <input
                                                        type="number"
                                                        value={formData.round_off}
                                                        onChange={(e) => setFormData({ ...formData, round_off: e.target.value })}
                                                        className="bg-transparent text-right border-b border-slate-700 outline-none w-20 p-0 text-emerald-400 focus:border-blue-500 transition-all font-bold"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Final Payable</p>
                                    <h2 className="text-4xl font-black tracking-tighter text-blue-400">
                                        ₹{totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </h2>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 font-black text-slate-600 uppercase tracking-widest text-xs transition-all"
                                >
                                    Discard
                                </button>
                                <button
                                    onClick={() => mutation.mutate(formData)}
                                    disabled={mutation.isLoading}
                                    className="flex-[2] px-8 py-5 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-600/30 hover:bg-blue-700 font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50"
                                >
                                    {mutation.isLoading ? 'Processing...' : 'Post Voucher'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

const SalesInvoice = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const queryClient = useQueryClient();

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

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/invoices/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['invoices']);
            toast.success('Voucher Deleted Successfully');
        }
    });

    const filtered = invoices.filter(inv =>
        inv.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customers.find(c => c.id === inv.customer_id)?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Accessing Ledger Records...</p>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-12 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">Sales Management</span>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Sales Register</h1>
                    <p className="text-slate-500 font-bold text-sm mt-2">Comprehensive log of all outgoing tax vouchers and credit notes.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="flex items-center px-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-xs font-black text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest">
                        <Printer className="w-4 h-4 mr-2" />
                        Bulk Print
                    </button>
                    <button
                        onClick={() => { setSelectedInvoice(null); setIsModalOpen(true); }}
                        className="flex items-center px-8 py-4 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-900/20 text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Voucher
                    </button>
                </div>
            </div>

            {/* Register Filters */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1 relative group w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-all" />
                    <input
                        type="text"
                        placeholder="Filter by Voucher No., Customer Name or Narrative..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-bold text-slate-900"
                    />
                </div>
                <div className="flex items-center space-x-4 px-6 border-l border-slate-100 h-10 hidden md:flex">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Vouchers</p>
                        <p className="text-lg font-black text-slate-900 leading-none">{filtered.length}</p>
                    </div>
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                        <Briefcase className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Sales Ledger Grid */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden min-h-[500px] flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Voucher Details</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer / Ledger</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Billing Dates</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Subtotal</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Net Amount</th>
                                <th className="px-10 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-10 py-32 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 text-slate-200">
                                                <Receipt className="w-12 h-12" />
                                            </div>
                                            <h4 className="text-xl font-black text-slate-900 tracking-tight mb-2">No Sales Records Found</h4>
                                            <p className="text-sm font-bold text-slate-400">Initiate your first sale to populate this register.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((invoice) => {
                                    const subtotal = (invoice.total_amount || 0) - (invoice.tax || 0);
                                    const customer = customers.find(c => c.id === invoice.customer_id);
                                    return (
                                        <tr key={invoice.id} className="group hover:bg-slate-50/80 transition-all cursor-pointer">
                                            <td className="px-10 py-6 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-12 h-12 rounded-2xl bg-blue-50/50 flex items-center justify-center mr-5 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all text-blue-600">
                                                        <FileText className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-black text-slate-900 tracking-tight">{invoice.invoice_number || 'TRX-998'}</h3>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Tax Invoice</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3 border border-slate-200 uppercase font-black text-[10px] text-slate-500">
                                                        {customer?.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 tracking-tight">{customer?.name || 'Direct Sale'}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 tracking-tight">{customer?.gst_number || 'Cash Ledger'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <div className="flex items-center text-[10px] font-black text-slate-600 uppercase">
                                                        <Calendar className="w-3 h-3 mr-2 text-slate-300" />
                                                        {invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                                    </div>
                                                    <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase">
                                                        <span className="w-3 h-3 mr-2" />
                                                        Due: {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '-'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right whitespace-nowrap">
                                                <p className="text-xs font-black text-slate-500 underline decoration-slate-100 underline-offset-4 decoration-2">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                            </td>
                                            <td className="px-8 py-6 text-right whitespace-nowrap">
                                                <p className="text-lg font-black text-blue-600 tracking-tight">₹{(invoice.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                                <p className="text-[10px] font-black text-emerald-500 uppercase flex items-center justify-end">
                                                    <CreditCard className="w-3 h-3 mr-1" /> Fully Paid
                                                </p>
                                            </td>
                                            <td className="px-10 py-6 text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <button onClick={() => { setSelectedInvoice(invoice); setIsModalOpen(true); }} className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => { if (window.confirm('Strike out this entry?')) deleteMutation.mutate(invoice.id); }} className="p-3 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm">
                                                        <Trash className="w-4 h-4" />
                                                    </button>
                                                </div>
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
                onClose={() => { setIsModalOpen(false); setSelectedInvoice(null); }}
                invoice={selectedInvoice}
            />
        </div>
    );
};

export default SalesInvoice;

