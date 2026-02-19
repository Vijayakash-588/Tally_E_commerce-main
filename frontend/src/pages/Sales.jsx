import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus,
    Edit2,
    Trash2,
    X,
    ArrowLeft,
    Search,
    ShoppingCart,
    DollarSign,
    Package,
    Calendar,
    User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as invoicesApi from '../api/invoices';
import * as customersApi from '../api/customers';
import * as productsApi from '../api/products';
import api from '../api/axios';
import { useSearch } from '../context/SearchContext';

const SaleModal = ({ isOpen, onClose, sale }) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        customer_id: '',
        product_id: '',
        quantity: 1,
        unit_price: 0,
        discount: 0,
        tax: 0,
        round_off: 0,
        sale_date: new Date().toISOString().split('T')[0]
    });

    const { data: customers = [] } = useQuery({
        queryKey: ['customers'],
        queryFn: customersApi.getCustomers
    });

    const { data: products = [] } = useQuery({
        queryKey: ['products'],
        queryFn: productsApi.getProducts
    });

    const { data: taxRates = [] } = useQuery({
        queryKey: ['taxRates'],
        queryFn: async () => {
            const res = await api.get('/invoices/tax-rates');
            return Array.isArray(res.data) ? res.data : (res.data?.data || []);
        }
    });

    // Populate form data when sale (invoice) is selected for editing
    React.useEffect(() => {
        if (sale) {
            // If editing an existing invoice
            const firstItem = sale.line_items?.[0] || {};
            setFormData({
                customer_id: sale.customer_id || '',
                product_id: firstItem.product_id || '',
                quantity: firstItem.quantity || 1,
                unit_price: firstItem.unit_price || 0,
                discount: sale.discount || 0,
                tax_rate_id: firstItem.tax_rate_id || '',
                round_off: sale.round_off || 0,
                sale_date: sale.issue_date?.split('T')[0] || new Date().toISOString().split('T')[0]
            });
        } else {
            // Reset for new sale
            setFormData({
                customer_id: '',
                product_id: '',
                quantity: 1,
                unit_price: 0,
                discount: 0,
                tax_rate_id: '',
                round_off: 0,
                sale_date: new Date().toISOString().split('T')[0]
            });
        }
    }, [sale]);

    const mutation = useMutation({
        mutationFn: (data) => {
            // Calculate tax amount for the payload based on selected rate
            const taxRate = taxRates.find(t => t.id === data.tax_rate_id);
            const subtotal = data.quantity * data.unit_price;
            const calculatedTax = taxRate ? subtotal * (taxRate.rate / 100) : 0;

            // Construct the invoice payload
            const payload = {
                customer_id: data.customer_id,
                issue_date: new Date(data.sale_date).toISOString(),
                due_date: new Date(data.sale_date).toISOString(), // Immediate due for quick sales
                items: [{
                    product_id: data.product_id,
                    quantity: parseInt(data.quantity),
                    unit_price: parseFloat(data.unit_price),
                    tax_rate_id: data.tax_rate_id // Pass tax_rate_id
                }],
                discount: parseFloat(data.discount),
                tax: calculatedTax, // Pass calculated tax for Invoice header
                round_off: parseFloat(data.round_off),
                notes: 'Quick Sale via Sales Register',
                status: 'SENT'
            };

            if (sale?.id) return invoicesApi.updateInvoice(sale.id, { ...payload, status: sale.status });
            return invoicesApi.createInvoice(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['invoices']); // Refetch invoices
            toast.success(sale ? 'Sale Updated' : 'Sale Recorded');
            onClose();
        },
        onError: (error) => toast.error(error.response?.data?.message || 'Transaction Failed')
    });

    const handleProductChange = (productId) => {
        const product = products.find(p => p.id === productId);
        setFormData(prev => ({
            ...prev,
            product_id: productId,
            unit_price: product ? product.price || 0 : 0
        }));
    };

    const calculateTotal = () => {
        const subtotal = formData.quantity * formData.unit_price;
        const discount = parseFloat(formData.discount) || 0;

        const taxRate = taxRates.find(t => t.id === formData.tax_rate_id);
        const tax = taxRate ? subtotal * (taxRate.rate / 100) : 0;

        const roundOff = parseFloat(formData.round_off) || 0;
        return subtotal - discount + tax + roundOff;
    };

    const total = calculateTotal();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl my-auto border border-slate-100 animate-in fade-in zoom-in duration-300">
                <div className="flex items-center justify-between p-10 border-b border-slate-50">
                    <div>
                        <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">Transaction Entry</span>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                            {sale ? 'Modify Sale' : 'New Sale Voucher'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-4 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-10 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                <User className="w-3 h-3 mr-2" /> Customer
                            </label>
                            <select
                                value={formData.customer_id}
                                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-bold text-slate-900 appearance-none"
                            >
                                <option value="">Select Customer</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                <Calendar className="w-3 h-3 mr-2" /> Sale Date
                            </label>
                            <input
                                type="date"
                                value={formData.sale_date}
                                onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-bold text-slate-900"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                <Package className="w-3 h-3 mr-2" /> Product
                            </label>
                            <select
                                value={formData.product_id}
                                onChange={(e) => handleProductChange(e.target.value)}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-bold text-slate-900 appearance-none"
                            >
                                <option value="">Select Product</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} - ₹{p.price}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                <ShoppingCart className="w-3 h-3 mr-2" /> Quantity
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-bold text-slate-900"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                <DollarSign className="w-3 h-3 mr-2" /> Unit Price
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.unit_price}
                                onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-bold text-slate-900"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Discount</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.discount}
                                onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-bold text-slate-900"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tax Rate</label>
                            <select
                                value={formData.tax_rate_id}
                                onChange={(e) => setFormData({ ...formData, tax_rate_id: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-bold text-slate-900 appearance-none"
                            >
                                <option value="">Nil Rated</option>
                                {taxRates.map(t => (
                                    <option key={t.id} value={t.id}>{t.name} ({t.rate}%)</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Round Off</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.round_off}
                                onChange={(e) => setFormData({ ...formData, round_off: parseFloat(e.target.value) || 0 })}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-bold text-slate-900"
                            />
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-6">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-slate-700">Total Amount</span>
                            <span className="text-2xl font-black text-slate-900">₹{total.toLocaleString('en-IN')}</span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => mutation.mutate(formData)}
                            disabled={mutation.isLoading}
                            className="flex-1 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all"
                        >
                            {mutation.isLoading ? 'Recording...' : (sale ? 'Update Sale' : 'Record Sale')}
                        </button>
                        <button
                            onClick={onClose}
                            className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Sales = () => {
    const navigate = useNavigate();
    const { searchTerm, setSearchTerm } = useSearch();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);
    const queryClient = useQueryClient();

    // Fetch Invoices instead of Sales
    const { data: sales = [], isLoading } = useQuery({
        queryKey: ['invoices'],
        queryFn: invoicesApi.getInvoices
    });

    const { data: customers = [] } = useQuery({
        queryKey: ['customers'],
        queryFn: async () => {
            const res = await customersApi.getCustomers();
            return Array.isArray(res.data) ? res.data : (res.data?.data || []);
        }
    });

    const { data: products = [] } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await productsApi.getProducts();
            return Array.isArray(res.data) ? res.data : (res.data?.data || []);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: invoicesApi.deleteInvoice,
        onSuccess: () => {
            queryClient.invalidateQueries(['invoices']);
            toast.success('Sale deleted');
        },
        onError: () => toast.error('Failed to delete sale')
    });

    const getCustomerName = (customerId) => {
        return customers.find(c => c.id === customerId)?.name || `Customer #${customerId}`;
    };

    const getProductName = (productId) => {
        return products.find(p => p.id === productId)?.name || `Product #${productId}`;
    };

    const filtered = sales.filter(sale => {
        const product_id = sale.line_items?.[0]?.product_id;
        const matchesSearch =
            getCustomerName(sale.customer_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product_id && getProductName(product_id).toLowerCase().includes(searchTerm.toLowerCase())) ||
            sale.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const stats = {
        total: sales.length,
        totalAmount: sales.reduce((sum, s) => sum + (parseFloat(s.total_amount) || 0), 0),
        todaySales: sales.filter(s => new Date(s.issue_date).toDateString() === new Date().toDateString()).length
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="p-3 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-2xl transition-all"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] block">Sales Management</span>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sales Vouchers</h1>
                    </div>
                </div>
                <button
                    onClick={() => { setSelectedSale(null); setIsModalOpen(true); }}
                    className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    New Sale
                </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Total Sales</p>
                            <p className="text-3xl font-black text-blue-600 mt-2 tracking-tight">{stats.total}</p>
                            <p className="text-xs font-bold text-slate-400 mt-1">Transactions</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-blue-50 group-hover:scale-110 transition-transform duration-500">
                            <ShoppingCart className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Total Revenue</p>
                            <p className="text-3xl font-black text-green-600 mt-2 tracking-tight">₹{stats.totalAmount.toLocaleString('en-IN')}</p>
                            <p className="text-xs font-bold text-slate-400 mt-1">From Sales</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-green-50 group-hover:scale-110 transition-transform duration-500">
                            <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Today's Sales</p>
                            <p className="text-3xl font-black text-purple-600 mt-2 tracking-tight">{stats.todaySales}</p>
                            <p className="text-xs font-bold text-slate-400 mt-1">Transactions</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-purple-50 group-hover:scale-110 transition-transform duration-500">
                            <Calendar className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search sales by customer, product, or Invoice No..."
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
            </div>

            {/* Sales List */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50">
                    <h3 className="text-xl font-black text-slate-900">Sales Transactions</h3>
                </div>

                {isLoading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-slate-500">Loading sales...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center">
                        <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 mb-4">No sales found</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
                        >
                            Record First Sale
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Date / Ref</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Customer</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Product</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Quantity</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((sale) => {
                                    const firstItem = sale.line_items?.[0] || {};
                                    const itemCount = sale.line_items?.length || 0;
                                    const productName = getProductName(firstItem.product_id);

                                    return (
                                        <tr key={sale.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-all">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">
                                                    {new Date(sale.issue_date).toLocaleDateString('en-IN')}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase">
                                                    {sale.invoice_number}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">
                                                    {getCustomerName(sale.customer_id)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">
                                                    {productName}
                                                </div>
                                                {itemCount > 1 && (
                                                    <div className="text-[10px] text-blue-500 font-bold uppercase">
                                                        + {itemCount - 1} more items
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">
                                                    {firstItem.quantity || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-green-600">
                                                    ₹{parseFloat(sale.total_amount || 0).toLocaleString('en-IN')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedSale(sale);
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-all"
                                                        title="Edit Sale"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm('Delete this sale?')) {
                                                                deleteMutation.mutate(sale.id);
                                                            }
                                                        }}
                                                        className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-all"
                                                        title="Delete Sale"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <SaleModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedSale(null);
                }}
                sale={selectedSale}
            />
        </div>
    );
};

export default Sales;
