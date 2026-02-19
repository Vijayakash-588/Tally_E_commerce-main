import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Trash2, Edit2, Play, CheckCircle, Clock, Save, X, Plus, Search, FileDown, Send, CreditCard, ChevronRight, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { useSearch } from '../context/SearchContext';
import {
    getInvoices, createInvoice, updateInvoiceStatus, sendInvoice,
    recordPayment, getInvoiceLineItems
} from '../api/invoices';
import { getCustomers } from '../api/customers';
import { getProducts } from '../api/products';

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    draft: { label: 'Draft', color: 'bg-slate-100 text-slate-700', icon: Clock },
    sent: { label: 'Sent', color: 'bg-blue-100 text-blue-700', icon: Send },
    paid: { label: 'Paid', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    partial: { label: 'Partial', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
    overdue: { label: 'Overdue', color: 'bg-red-100 text-red-700', icon: AlertCircle },
    cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-600', icon: Ban },
};
const fmt = (n) => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

// ── Create Invoice Modal ──────────────────────────────────────────────────────

const InvoiceFormModal = ({ onClose, customers, products }) => {
    const queryClient = useQueryClient();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            issue_date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            customer_id: '',
            notes: '',
        }
    });

    const [lineItems, setLineItems] = useState([{ product_id: '', quantity: 1, unit_price: '' }]);

    const addRow = () => setLineItems(p => [...p, { product_id: '', quantity: 1, unit_price: '' }]);
    const removeRow = (i) => setLineItems(p => p.filter((_, idx) => idx !== i));
    const updateRow = (i, field, value) => {
        setLineItems(p => p.map((row, idx) => {
            if (idx === i) {
                const updatedRow = { ...row, [field]: value };
                if (field === 'product_id') {
                    const prod = products.find(p => p.id === value);
                    if (prod) updatedRow.unit_price = prod.price || 0;
                }
                return updatedRow;
            }
            return row;
        }));
    };

    const total = lineItems.reduce((sum, row) => {
        const qty = parseFloat(row.quantity) || 0;
        const price = parseFloat(row.unit_price) || 0;
        return sum + qty * price;
    }, 0);

    const mutation = useMutation({
        mutationFn: (formData) => {
            const items = lineItems
                .filter(r => r.product_id && r.quantity)
                .map(r => ({
                    product_id: r.product_id,
                    quantity: parseFloat(r.quantity),
                    unit_price: parseFloat(r.unit_price) || 0,
                }));

            return createInvoice({
                customer_id: formData.customer_id,
                issue_date: new Date(formData.issue_date).toISOString(),
                due_date: new Date(formData.due_date).toISOString(),
                notes: formData.notes,
                items,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['invoices']);
            toast.success('Invoice created successfully');
            onClose();
        },
        onError: (e) => toast.error(e.response?.data?.message || 'Failed to create invoice'),
    });

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-[2.5rem] max-w-2xl w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-300 flex flex-col max-h-[92vh]">
                <div className="p-8 pb-4 flex-shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">New Invoice</span>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create Invoice</h2>
                        </div>
                        <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto flex-1 px-8 pb-2">
                    <form id="invoice-form" onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Customer *</label>
                            <select
                                {...register('customer_id', { required: 'Customer is required' })}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none font-bold text-slate-900 appearance-none"
                            >
                                <option value="">Select customer…</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            {errors.customer_id && <p className="text-red-500 text-xs font-bold mt-1">{errors.customer_id.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Issue Date *</label>
                                <input type="date" {...register('issue_date', { required: 'Required' })}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none font-bold text-slate-900" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Due Date *</label>
                                <input type="date" {...register('due_date', { required: 'Required' })}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none font-bold text-slate-900" />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Line Items *</label>
                                <button type="button" onClick={addRow}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-100 transition-all">
                                    <Plus className="w-3 h-3" /> Add Row
                                </button>
                            </div>
                            <div className="space-y-3">
                                {lineItems.map((row, i) => (
                                    <div key={i} className="grid grid-cols-[1fr_80px_100px_32px] gap-2 items-center">
                                        <select
                                            value={row.product_id}
                                            onChange={e => updateRow(i, 'product_id', e.target.value)}
                                            className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-900 text-sm appearance-none outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                                        >
                                            <option value="">Choose product…</option>
                                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                        <input
                                            type="number" min="1" placeholder="Qty"
                                            value={row.quantity}
                                            onChange={e => updateRow(i, 'quantity', e.target.value)}
                                            className="px-3 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-900 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-center"
                                        />
                                        <input
                                            type="number" min="0" step="0.01" placeholder="Price"
                                            value={row.unit_price}
                                            onChange={e => updateRow(i, 'unit_price', e.target.value)}
                                            className="px-3 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-900 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                                        />
                                        <button type="button" onClick={() => removeRow(i)}
                                            disabled={lineItems.length === 1}
                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-20">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-right">Estimated Total</p>
                                    <span className="text-2xl font-black text-slate-900">₹{fmt(total)}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Notes</label>
                            <textarea {...register('notes')} rows={2} placeholder="Optional notes…"
                                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none font-bold text-slate-900 resize-none" />
                        </div>
                    </form>
                </div>

                <div className="p-8 pt-4 flex-shrink-0 flex gap-4">
                    <button type="button" onClick={onClose}
                        className="flex-1 px-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 font-black text-slate-600 uppercase tracking-widest text-xs transition-all">
                        Cancel
                    </button>
                    <button type="submit" form="invoice-form" disabled={isSubmitting}
                        className="flex-1 px-8 py-4 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50">
                        {isSubmitting ? 'Creating…' : 'Create Invoice'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Record Payment Modal ──────────────────────────────────────────────────────

const RecordPaymentModal = ({ invoice, onClose }) => {
    const queryClient = useQueryClient();
    const remaining = (invoice.total_amount || 0) - (invoice.paid_amount || 0);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: { amount: remaining > 0 ? remaining.toFixed(2) : '', paymentMethod: 'cash' }
    });

    const mutation = useMutation({
        mutationFn: (data) => recordPayment(invoice.id, {
            amount: parseFloat(data.amount),
            paymentMethod: data.paymentMethod,
            notes: data.notes,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['invoices']);
            toast.success('Payment recorded');
            onClose();
        },
        onError: (e) => toast.error(e.response?.data?.message || 'Failed to record payment'),
    });

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
            <div className="bg-white rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <span className="text-green-600 text-[10px] font-black uppercase tracking-[0.3em] mb-1 block">Payment Entry</span>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Record Payment</h2>
                        <p className="text-sm font-bold text-slate-400 mt-1">Balance due: ₹{fmt(remaining)}</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Amount (₹) *</label>
                        <input
                            type="number" step="0.01" min="0.01"
                            {...register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Must be > 0' } })}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-green-100 focus:border-green-400 outline-none font-black text-slate-900 text-lg"
                        />
                        {errors.amount && <p className="text-red-500 text-xs font-bold mt-1">{errors.amount.message}</p>}
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Payment Method *</label>
                        <select
                            {...register('paymentMethod', { required: true })}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-green-100 focus:border-green-400 outline-none font-bold text-slate-900 appearance-none"
                        >
                            <option value="cash">Cash</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="cheque">Cheque</option>
                            <option value="upi">UPI</option>
                            <option value="credit_card">Credit Card</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Notes</label>
                        <input
                            type="text"
                            {...register('notes')}
                            placeholder="e.g., Ref #1234"
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-green-100 focus:border-green-400 outline-none font-bold text-slate-900"
                        />
                    </div>

                    <div className="flex gap-4 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 font-black text-slate-600 uppercase tracking-widest text-xs transition-all">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting}
                            className="flex-1 px-6 py-4 bg-green-600 text-white rounded-2xl shadow-lg shadow-green-600/30 hover:bg-green-700 font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50">
                            {isSubmitting ? 'Saving…' : 'Record Payment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ── Line Items Tab ────────────────────────────────────────────────────────────

const LineItemsTab = ({ invoiceId }) => {
    const { data: items = [], isLoading } = useQuery({
        queryKey: ['invoice-items', invoiceId],
        queryFn: () => getInvoiceLineItems(invoiceId),
        enabled: !!invoiceId,
    });

    if (isLoading) return (
        <div className="py-10 text-center text-slate-400 font-bold text-sm">Loading items…</div>
    );
    if (items.length === 0) return (
        <div className="py-10 text-center text-slate-300 font-bold text-sm">No line items found</div>
    );

    return (
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                        <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty</th>
                        <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Price</th>
                        <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {items.map((item, i) => (
                        <tr key={item.id || i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-3 font-bold text-slate-700">
                                {item.products?.name || item.description || `Item ${i + 1}`}
                            </td>
                            <td className="px-5 py-3 text-right font-bold text-slate-600">{item.quantity}</td>
                            <td className="px-5 py-3 text-right font-bold text-slate-600">₹{fmt(item.unit_price)}</td>
                            <td className="px-5 py-3 text-right font-black text-slate-900">
                                ₹{fmt((item.quantity || 0) * (item.unit_price || 0))}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// ── Invoice Detail Modal ──────────────────────────────────────────────────────

const InvoiceDetailModal = ({ invoice, onClose }) => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('details');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const cfg = STATUS_CONFIG[invoice.status?.toLowerCase()] || STATUS_CONFIG.draft;
    const StatusIcon = cfg.icon;

    const statusMutation = useMutation({
        mutationFn: ({ id, status }) => updateInvoiceStatus(id, status),
        onSuccess: () => { queryClient.invalidateQueries(['invoices']); toast.success('Status updated'); },
        onError: (e) => toast.error(e.response?.data?.message || 'Failed to update status'),
    });

    const sendMutation = useMutation({
        mutationFn: (id) => sendInvoice(id),
        onSuccess: () => { queryClient.invalidateQueries(['invoices']); toast.success('Invoice sent'); },
        onError: (e) => toast.error(e.response?.data?.message || 'Failed to send invoice'),
    });

    const balance = (invoice.total_amount || 0) - (invoice.paid_amount || 0);

    return (
        <>
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
                <div className="bg-white rounded-[2.5rem] max-w-2xl w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
                    <div className="p-8 pb-0">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">Invoice Details</span>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                    {invoice.invoice_number || `INV-${invoice.id?.substring(0, 8)}`}
                                </h2>
                            </div>
                            <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex items-center gap-3 mb-6 flex-wrap">
                            <select
                                value={invoice.status || 'draft'}
                                onChange={(e) => statusMutation.mutate({ id: invoice.id, status: e.target.value })}
                                disabled={statusMutation.isPending}
                                className={clsx(
                                    "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-0 outline-none cursor-pointer transition-all appearance-none pr-8",
                                    cfg.color
                                )}
                            >
                                {Object.entries(STATUS_CONFIG).map(([val, { label }]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </select>

                            {(invoice.status === 'draft' || !invoice.status) && (
                                <button
                                    onClick={() => sendMutation.mutate(invoice.id)}
                                    disabled={sendMutation.isPending}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50 shadow-md shadow-blue-600/20"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    {sendMutation.isPending ? 'Sending…' : 'Send'}
                                </button>
                            )}

                            {balance > 0 && invoice.status !== 'cancelled' && (
                                <button
                                    onClick={() => setShowPaymentModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-md shadow-green-600/20"
                                >
                                    <CreditCard className="w-3.5 h-3.5" />
                                    Record Payment
                                </button>
                            )}
                        </div>

                        <div className="flex border-b border-slate-100">
                            {[
                                { key: 'details', label: 'Details', icon: FileText },
                                { key: 'items', label: 'Line Items', icon: List },
                            ].map(({ key, label, icon: Icon }) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveTab(key)}
                                    className={clsx(
                                        "flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-widest border-b-2 -mb-px transition-all",
                                        activeTab === key
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-slate-400 hover:text-slate-900'
                                    )}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-y-auto flex-1 p-8">
                        {activeTab === 'details' && (
                            <div className="grid grid-cols-2 gap-6">
                                <InfoField label="Customer" value={invoice.customer?.name || 'N/A'} />
                                <InfoField label="Status">
                                    <span className={clsx('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider', cfg.color)}>
                                        <StatusIcon className="w-3 h-3" />
                                        {cfg.label}
                                    </span>
                                </InfoField>
                                <InfoField label="Issue Date"
                                    value={invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString('en-IN') : '-'} />
                                <InfoField label="Due Date"
                                    value={invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-IN') : '-'} />
                                <InfoField label="Total Amount" large>
                                    <span className="text-2xl font-black text-slate-900">₹{fmt(invoice.total_amount)}</span>
                                </InfoField>
                                <InfoField label="Amount Paid" large>
                                    <span className="text-2xl font-black text-green-600">₹{fmt(invoice.paid_amount)}</span>
                                </InfoField>
                                {balance > 0 && (
                                    <div className="col-span-2 bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center justify-between">
                                        <span className="text-xs font-black text-amber-700 uppercase tracking-widest">Balance Due</span>
                                        <span className="text-xl font-black text-amber-700">₹{fmt(balance)}</span>
                                    </div>
                                )}
                                {invoice.notes && (
                                    <div className="col-span-2 space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Notes</p>
                                        <p className="text-sm font-bold text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            {invoice.notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'items' && <LineItemsTab invoiceId={invoice.id} />}
                    </div>

                    <div className="p-8 pt-0">
                        <button onClick={onClose}
                            className="w-full px-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 font-black text-slate-600 uppercase tracking-widest text-xs transition-all">
                            Close
                        </button>
                    </div>
                </div>
            </div>

            {showPaymentModal && (
                <RecordPaymentModal invoice={invoice} onClose={() => setShowPaymentModal(false)} />
            )}
        </>
    );
};

const InfoField = ({ label, value, children, large }) => (
    <div className="space-y-1.5">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{label}</p>
        {children || <p className={clsx('font-bold text-slate-800 px-1', large ? 'text-lg' : 'text-sm')}>{value}</p>}
    </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────

const Invoices = () => {
    const navigate = useNavigate();
    const { searchTerm, setSearchTerm } = useSearch();
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const queryClient = useQueryClient();

    const { data: invoices = [], isLoading } = useQuery({
        queryKey: ['invoices'],
        queryFn: getInvoices,
    });

    const { data: customers = [] } = useQuery({
        queryKey: ['customers'],
        queryFn: getCustomers,
    });

    const { data: products = [] } = useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
    });

    const filtered = invoices.filter(inv => {
        const matchesSearch =
            (inv.invoice_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (inv.customer?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || (inv.status?.toLowerCase() || 'draft') === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: invoices.length,
        paid: invoices.filter(i => i.status?.toLowerCase() === 'paid').length,
        pending: invoices.filter(i => ['sent', 'partial'].includes(i.status?.toLowerCase())).length,
        overdue: invoices.filter(i => i.status?.toLowerCase() === 'overdue').length,
    };

    const statCards = [
        { label: 'Total Invoices', value: stats.total, Icon: FileText, color: 'bg-blue-50', iconColor: 'text-blue-600' },
        { label: 'Paid', value: stats.paid, Icon: CheckCircle, color: 'bg-green-50', iconColor: 'text-green-600' },
        { label: 'Pending', value: stats.pending, Icon: Clock, color: 'bg-yellow-50', iconColor: 'text-yellow-600' },
        { label: 'Overdue', value: stats.overdue, Icon: AlertCircle, color: 'bg-red-50', iconColor: 'text-red-600' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/')}
                        className="p-3 bg-white text-slate-600 hover:bg-slate-100 rounded-2xl border border-slate-100 transition-all shadow-sm">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] block mb-1">Billing Hub</span>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Invoice Ledger</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => queryClient.invalidateQueries(['invoices'])}
                        className="p-4 bg-white text-slate-600 hover:text-blue-600 rounded-2xl border border-slate-100 transition-all shadow-sm group">
                        <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center px-6 py-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-600/30 hover:bg-blue-700 font-black uppercase tracking-widest text-xs transition-all"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Invoice
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {statCards.map(({ label, value, Icon, color, iconColor }) => (
                    <div key={label} className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{label}</p>
                                <p className={clsx('text-3xl font-black mt-2 tracking-tight', iconColor)}>{value}</p>
                            </div>
                            <div className={clsx('p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500', color)}>
                                <Icon className={clsx('w-6 h-6', iconColor)} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                <Search className="w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by invoice number or customer..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-16 pr-6 py-5 bg-white border-2 border-slate-100 rounded-[2rem] focus:ring-8 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all font-black text-slate-900 shadow-sm placeholder:text-slate-400"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute inset-y-0 right-6 flex items-center text-slate-300 hover:text-slate-600 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden min-w-[160px]">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full bg-transparent border-none outline-none font-black text-[10px] uppercase tracking-widest text-slate-600 cursor-pointer"
                                >
                                    <option value="all">Every Status</option>
                                    {Object.entries(STATUS_CONFIG).map(([val, { label }]) => (
                                        <option key={val} value={val}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <button className="p-4 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl border border-slate-100 transition-all">
                                <Download className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Document #</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Dates</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance</th>
                                <th className="px-8 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                <tr><td colSpan={6} className="px-8 py-12 text-center text-slate-400 font-bold">Synchronizing ledger...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-4 border border-slate-100">
                                                <FileText className="w-10 h-10 text-slate-200" />
                                            </div>
                                            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">No records found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((invoice) => {
                                    const sCfg = STATUS_CONFIG[invoice.status?.toLowerCase()] || STATUS_CONFIG.draft;
                                    const StatusIcon = sCfg.icon;
                                    const bal = (invoice.total_amount || 0) - (invoice.paid_amount || 0);
                                    return (
                                        <tr key={invoice.id} className="hover:bg-slate-50/80 transition-all group">
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                                                    {invoice.invoice_number || `INV-${invoice.id?.substring(0, 8)}`}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs uppercase">
                                                        {invoice.customer?.name?.[0] || 'C'}
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700">{invoice.customer?.name || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                                        <Calendar className="w-3 h-3 text-slate-300" />
                                                        {invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString('en-IN') : '-'}
                                                    </div>
                                                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-4">
                                                        Due &middot; {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-IN') : '-'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap text-right">
                                                <div className="space-y-0.5">
                                                    <div className="text-sm font-black text-slate-900">₹{fmt(invoice.total_amount)}</div>
                                                    {bal > 0 && <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest">₹{fmt(bal)} Due</div>}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap text-center">
                                                <span className={clsx('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm', sCfg.color)}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {sCfg.label}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap text-right">
                                                <button
                                                    onClick={() => setSelectedInvoice(invoice)}
                                                    className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
                                                >
                                                    <Eye className="w-5 h-5" />
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

            {selectedInvoice && (
                <InvoiceDetailModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
            )}
            {showCreateModal && (
                <InvoiceFormModal
                    customers={customers}
                    products={products}
                    onClose={() => setShowCreateModal(false)}
                />
            )}
        </div>
    );
};

export default Invoices;
