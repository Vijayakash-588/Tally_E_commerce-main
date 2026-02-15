import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus,
    Trash2,
    X,
    ArrowLeft,
    Search,
    Wallet,
    Landmark,
    TrendingUp,
    TrendingDown,
    FileText,
    Zap,
    History,
    Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import clsx from 'clsx';

const Sparkline = ({ color }) => (
    <div className="h-8 w-24">
        <svg viewBox="0 0 100 30" className="w-full h-full">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="0,20 15,15 30,25 45,10 60,18 75,5 90,15 100,10"
                className="opacity-40"
            />
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="0,20 15,15 30,25 45,10 60,18 75,5 90,15 100,10"
                strokeDasharray="1000"
                strokeDashoffset="1000"
                className="animate-[dash_2s_ease-in-out_forwards]"
            />
        </svg>
    </div>
);

const StatCard = ({ title, amount, change, changeType, icon: Icon, colorClass, sparkColor }) => (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group">
        <div className="flex justify-between items-start">
            <div className={clsx("p-4 rounded-2xl bg-opacity-10 group-hover:scale-110 transition-transform duration-500", colorClass)}>
                <Icon className={clsx("w-6 h-6", colorClass.replace('bg-', 'text-'))} />
            </div>
            <Sparkline color={sparkColor} />
        </div>
        <div className="mt-6">
            <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest">{title}</h3>
            <h2 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">{amount}</h2>
            <div className={clsx(
                "flex items-center mt-3 text-[11px] font-black uppercase tracking-tighter px-2.5 py-1 rounded-full w-fit",
                changeType === 'positive' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
            )}>
                {changeType === 'positive' ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
                {change}
            </div>
        </div>
    </div>
);

const Purchases = () => {
    const navigate = useNavigate();
    const [purchases, setPurchases] = useState([]);
    const [stats, setStats] = useState({
        totalPurchases: 0,
        monthlyPurchases: 0,
        vendorCount: 0,
        activeOrders: 0
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPurchase, setEditingPurchase] = useState(null);
    const [formData, setFormData] = useState({
        supplier_id: '',
        items: []
    });
    const [barcode, setBarcode] = useState('');
    const [items, setItems] = useState([]);

    const queryClient = useQueryClient();

    const { data: suppliers = [] } = useQuery({
        queryKey: ['suppliers'],
        queryFn: async () => {
            const res = await api.get('/suppliers');
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

    const { data: purchasesList, isLoading, refetch } = useQuery({
        queryKey: ['purchases'],
        queryFn: async () => {
            const res = await api.get('/purchases');
            const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);

            // Calculate stats
            const now = new Date();
            const monthly = data.filter(p => new Date(p.purchase_date).getMonth() === now.getMonth());
            const total = data.reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0);
            const monthlyTotal = monthly.reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0);
            const vendors = new Set(data.map(p => p.supplier_id)).size;

            setStats({
                totalPurchases: total,
                monthlyPurchases: monthlyTotal,
                vendorCount: vendors,
                activeOrders: data.length
            });

            return data;
        }
    });

    useEffect(() => {
        if (purchasesList) setPurchases(purchasesList);
    }, [purchasesList]);

    const calculateTotal = (items, discount = 0, tax = 0, roundOff = 0) => {
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        // Backend now handles tax per item if we send tax_amount, but here we want a simple view.
        // Tally style: Subtotal - Discount + Tax + RoundOff = Total
        // If items have individual tax, we sum it up.

        let totalTax = 0;
        items.forEach(item => {
            const taxRate = taxRates.find(t => t.id === item.tax_rate_id);
            if (taxRate) {
                totalTax += (item.price * item.quantity * taxRate.rate / 100);
            }
        });

        // Override or add to totalTax? 
        // For Tally simplicity, let's treat the 'Tax' field in formData as an "Additional Tax/Charge" or just display the calculated tax.
        // Actually, Tally usually calculates tax from items. Let's stick to that.
        // But we added a 'tax' field to the Purchase model as a summary.

        return subtotal - parseFloat(discount || 0) + totalTax + parseFloat(roundOff || 0);
    };

    const createMutation = useMutation({
        mutationFn: (data) => api.post('/purchases', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['purchases']);
            toast.success('Purchase created successfully');
            resetForm();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create purchase');
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data) => api.put(`/purchases/${editingPurchase.id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['purchases']);
            toast.success('Purchase updated successfully');
            resetForm();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update purchase');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/purchases/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['purchases']);
            toast.success('Purchase deleted');
        },
        onError: () => toast.error('Failed to delete purchase')
    });

    const recalcTotals = (lineItems) => {
        const subtotal = lineItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = lineItems.reduce((sum, item) => sum + (item.tax_amount || 0), 0);
        const discount = parseFloat(formData.discount || 0);
        const roundOff = parseFloat(formData.round_off || 0);
        const total = subtotal - discount + tax + roundOff;
        return { subtotal, tax, discount, roundOff, total };
    };

    const handleAddItem = () => {
        setItems([...items, { product_id: '', quantity: 1, price: 0, tax_rate_id: '', tax_amount: 0 }]);
    };

    const handleRemoveItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        if (field === 'product_id') {
            const product = products.find(p => p.id === value);
            newItems[index].product_id = value;
            if (product) newItems[index].price = product.price;
        } else if (field === 'tax_rate_id') {
            const taxRate = taxRates.find(t => t.id === value);
            newItems[index].tax_rate_id = value;
            const itemSubtotal = (newItems[index].price || 0) * (newItems[index].quantity || 1);
            newItems[index].tax_amount = taxRate ? (itemSubtotal * taxRate.rate / 100) : 0;
        } else {
            newItems[index][field] = field === 'quantity' || field === 'price' ? parseFloat(value) : value;
            if (field === 'quantity' || field === 'price') {
                const taxRate = taxRates.find(t => t.id === newItems[index].tax_rate_id);
                const itemSubtotal = (newItems[index].price || 0) * (newItems[index].quantity || 1);
                newItems[index].tax_amount = taxRate ? (itemSubtotal * taxRate.rate / 100) : 0;
            }
        }
        setItems(newItems);
    };

    const handleSave = async () => {
        if (!formData.supplier_id) {
            toast.error('Please select a supplier');
            return;
        }
        if (items.length === 0) {
            toast.error('Add at least one item');
            return;
        }

        try {
            const promises = items.map(item => {
                const itemTotal = (item.price * item.quantity) + (item.tax_amount || 0);
                const payload = {
                    supplier_id: formData.supplier_id,
                    product_id: item.product_id,
                    quantity: parseFloat(item.quantity),
                    unit_price: parseFloat(item.price), // Backend expects unit_price
                    // Wait, our backend model is per-item for 'Purchases' table? 
                    // NO, 'purchases' table seems to be a single-line transaction based on previous analysis. 
                    // BUT the UI supports multiple items! 
                    // If the UI sends multiple items, it loops and sends multiple API calls (check handleSave).
                    // Yes: `const promises = items.map(...)`
                    // This means we are creating INDIVIDUAL purchase records for each item. 
                    // This is NOT how a real Invoice works (One Invoice -> Many Items).
                    // To support "Invoice Level" Discount/RoundOff in this architecture, we have to distribute it or attach it to the first item?
                    // Distributing it is safest for totals.

                    discount: (parseFloat(formData.discount || 0) / items.length).toFixed(2),
                    tax: (item.tax_amount || 0), // Item specific tax
                    round_off: (parseFloat(formData.round_off || 0) / items.length).toFixed(2),
                    total: itemTotal - (parseFloat(formData.discount || 0) / items.length) + (parseFloat(formData.round_off || 0) / items.length)
                };
                // We use createMutation.mutationFn directly or axios
                return api.post('/purchases', payload);
            });

            await Promise.all(promises);
            queryClient.invalidateQueries(['purchases']);
            toast.success('Purchases recorded successfully');
            resetForm();
        } catch (error) {
            console.error(error);
            toast.error('Failed to record some purchases');
        }
    };

    const handleEdit = (purchase) => {
        setEditingPurchase(purchase);
        setFormData({
            supplier_id: purchase.supplier_id || ''
        });
        setItems(purchase.items || []);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure?')) {
            deleteMutation.mutate(id);
        }
    };

    const resetForm = () => {
        setFormData({ supplier_id: '', items: [] });
        setItems([]);
        setBarcode('');
        setEditingPurchase(null);
        setIsModalOpen(false);
    };

    const handleNewPurchase = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const totals = recalcTotals(items);

    return (
        <div className="max-w-[1600px] mx-auto space-y-12 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">Purchase Management</span>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Purchase Vouchers</h1>
                    <p className="text-slate-500 font-bold text-sm mt-2">Manage stock purchase details.</p>
                </div>
                <div className="flex items-center space-x-4">
                    <button className="flex items-center px-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-[10px] font-black text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest">
                        <History className="w-4 h-4 mr-2" />
                        Voucher History
                    </button>
                    <button
                        onClick={handleNewPurchase}
                        className="flex items-center px-8 py-4 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-900/20 text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Record Purchase
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Purchases"
                    amount={`₹${stats.totalPurchases.toLocaleString('en-IN')}`}
                    change="+12.5%"
                    changeType="positive"
                    icon={Wallet}
                    colorClass="bg-blue-500 text-blue-600"
                    sparkColor="#3b82f6"
                />
                <StatCard
                    title="Monthly Purchases"
                    amount={`₹${stats.monthlyPurchases.toLocaleString('en-IN')}`}
                    change="+8.2%"
                    changeType="positive"
                    icon={TrendingUp}
                    colorClass="bg-emerald-500 text-emerald-600"
                    sparkColor="#10b981"
                />
                <StatCard
                    title="Active Vendors"
                    amount={stats.vendorCount}
                    change="+2"
                    changeType="positive"
                    icon={Landmark}
                    colorClass="bg-violet-500 text-violet-600"
                    sparkColor="#8b5cf6"
                />
                <StatCard
                    title="Open Orders"
                    amount={stats.activeOrders}
                    change="-1"
                    changeType="negative"
                    icon={FileText}
                    colorClass="bg-orange-500 text-orange-600"
                    sparkColor="#f97316"
                />
            </div>

            {/* Transaction Ledger Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-10 py-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center">
                        <FileText className="w-4 h-4 mr-3 text-blue-600" />
                        Purchase History
                    </h3>
                    <div className="flex-1 max-w-md w-full relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by supplier..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all font-bold text-xs"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date / ID</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier Details</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                                <th className="px-8 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty</th>
                                <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</th>
                                <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-10 py-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest animate-pulse">Syncing Ledgers...</td>
                                </tr>
                            ) : purchases.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-10 py-32 text-center">
                                        <div className="opacity-20 flex flex-col items-center">
                                            <Package className="w-12 h-12 mb-4" />
                                            <p className="font-black uppercase tracking-widest text-[10px]">No purchase records found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                purchases.map((purchase) => {
                                    const productName = products.find(p => p.id === purchase.product_id)?.name || 'Unknown Item';
                                    const supplierName = suppliers.find(s => s.id === purchase.supplier_id)?.name || 'Unknown Supplier';
                                    return (
                                        <tr key={purchase.id} className="group hover:bg-slate-50/80 transition-all cursor-default">
                                            <td className="px-10 py-6 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-2 h-2 rounded-full bg-blue-600 mr-4" />
                                                    <div>
                                                        <span className="text-sm font-black text-slate-900 tracking-tight block">
                                                            {new Date(purchase.created_at || Date.now()).toLocaleDateString()}
                                                        </span>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                                            ID: {purchase.id.slice(0, 8)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <p className="text-sm font-black text-slate-900 tracking-tight">{supplierName}</p>
                                                <p className="text-[10px] font-bold text-slate-400 tracking-tight">Direct Purchase</p>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <p className="text-sm font-black text-slate-700 tracking-tight">{productName}</p>
                                            </td>
                                            <td className="px-8 py-6 text-center whitespace-nowrap">
                                                <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                                                    {purchase.quantity} Units
                                                </span>
                                            </td>
                                            <td className="px-10 py-6 text-right whitespace-nowrap">
                                                <p className="text-lg font-black text-slate-900 tracking-tighter">₹{parseFloat(purchase.total || 0).toFixed(2)}</p>
                                            </td>
                                            <td className="px-10 py-6 text-right space-x-3">
                                                <button
                                                    onClick={() => handleDelete(purchase.id)}
                                                    className="p-2 text-slate-300 hover:text-red-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                                                    title="Delete Purchase"
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

            {/* Premium Transaction Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 overflow-y-auto">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl border border-slate-100 animate-in fade-in zoom-in duration-300 max-h-[95vh] flex flex-col overflow-hidden">
                        <div className="p-10 pb-6 flex justify-between items-start border-b border-slate-50">
                            <div>
                                <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">Voucher Entry</span>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{editingPurchase ? 'Edit Purchase Voucher' : 'New Purchase Voucher'}</h2>
                            </div>
                            <button onClick={resetForm} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 pt-6 space-y-10">
                            <div className="grid grid-cols-1 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Supplier Ledger</label>
                                    <select
                                        value={formData.supplier_id}
                                        onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-bold text-slate-900 appearance-none"
                                    >
                                        <option value="">Select Producer / Supplier</option>
                                        {suppliers.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory Line Items</label>
                                    <button
                                        onClick={handleAddItem}
                                        className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                                    >
                                        + Add Voucher Line
                                    </button>
                                </div>

                                <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
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
                                                        // Add item
                                                        setItems([...items, {
                                                            product_id: p.id,
                                                            quantity: 1,
                                                            price: p.price || 0, // Assuming price field exists or defaults to 0
                                                            tax_rate_id: '',
                                                            tax_amount: 0
                                                        }]);
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

                                <div className="bg-slate-50/50 rounded-[2rem] border border-slate-100 overflow-hidden">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="bg-slate-50">
                                                <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Product / Service</th>
                                                <th className="px-4 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest w-24">Qty</th>
                                                <th className="px-4 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest w-32">Unit Price</th>
                                                <th className="px-4 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest w-32">Tax Ledger</th>
                                                <th className="px-6 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest w-32">Net Amount</th>
                                                <th className="px-4 py-4 text-center w-12"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {items.map((item, index) => (
                                                <tr key={index} className="bg-white/50">
                                                    <td className="px-6 py-4">
                                                        <select
                                                            value={item.product_id}
                                                            onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                                                            className="w-full p-2 bg-white border border-slate-100 rounded-xl font-bold text-xs focus:ring-2 focus:ring-blue-100 outline-none appearance-none"
                                                        >
                                                            <option value="">Select stock item</option>
                                                            {products.map(p => (
                                                                <option key={p.id} value={p.id}>{p.name}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                            className="w-full p-2 bg-white border border-slate-100 rounded-xl font-black text-xs text-center focus:ring-2 focus:ring-blue-100 outline-none"
                                                            min="1"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <input
                                                            type="number"
                                                            value={item.price}
                                                            onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                                            className="w-full p-2 bg-white border border-slate-100 rounded-xl font-black text-xs text-right focus:ring-2 focus:ring-blue-100 outline-none"
                                                            step="0.01"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <select
                                                            value={item.tax_rate_id}
                                                            onChange={(e) => handleItemChange(index, 'tax_rate_id', e.target.value)}
                                                            className="w-full p-2 bg-white border border-slate-100 rounded-xl font-bold text-xs focus:ring-2 focus:ring-blue-100 outline-none appearance-none"
                                                        >
                                                            <option value="">Zero Tax</option>
                                                            {taxRates.map(t => (
                                                                <option key={t.id} value={t.id}>{t.name}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="text-xs font-black text-slate-900">
                                                            ₹{((item.price * item.quantity) + (item.tax_amount || 0)).toFixed(2)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <button onClick={() => handleRemoveItem(index)} className="p-2 text-slate-300 hover:text-red-500 transition-all">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                <div className="md:col-span-2 space-y-2 flex items-center justify-center">
                                    <div className="text-center opacity-40">
                                        <FileText className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            Items will be recorded as individual purchase entries
                                        </p>
                                    </div>
                                </div>
                                <div className="md:col-span-1 bg-slate-900 rounded-[2rem] p-8 text-white flex flex-col justify-between shadow-xl shadow-slate-900/10">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-xs opacity-60">
                                            <span>Subtotal</span>
                                            <span className="font-black">₹{totals.subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs opacity-60">
                                            <span>Tax (GST)</span>
                                            <span className="font-black">+ ₹{totals.tax.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs opacity-60">
                                            <span>Discount</span>
                                            <div className="flex items-center">
                                                <span className="mr-1">- ₹</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={formData.discount || ''}
                                                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                                    className="w-16 bg-transparent text-right font-black border-b border-slate-600 focus:border-white outline-none"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-xs opacity-60">
                                            <span>Round Off</span>
                                            <div className="flex items-center">
                                                <span className="mr-1">+/- ₹</span>
                                                <input
                                                    type="number"
                                                    value={formData.round_off || ''}
                                                    onChange={(e) => setFormData({ ...formData, round_off: e.target.value })}
                                                    className="w-16 bg-transparent text-right font-black border-b border-slate-600 focus:border-white outline-none"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border-t border-slate-800 pt-6 mt-6">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">TOTAL PAYABLE</p>
                                                <p className="text-3xl font-black tracking-tighter">₹{totals.total.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-10 border-t border-slate-50 flex gap-4">
                            <button
                                onClick={resetForm}
                                className="flex-1 px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 font-black text-slate-600 uppercase tracking-widest text-[10px] transition-all"
                            >
                                Discard
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={createMutation.isLoading || updateMutation.isLoading}
                                className="flex-[2] px-8 py-5 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-900/20 hover:bg-slate-800 font-black uppercase tracking-widest text-[10px] transition-all disabled:opacity-50"
                            >
                                {createMutation.isLoading || updateMutation.isLoading ? 'Processing...' : (editingPurchase ? 'Update Voucher' : 'Post Voucher')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Purchases;
