import React, { useState, useEffect } from 'react';
import {
    Package,
    Search,
    Download,
    Plus,
    ChevronDown,
    Filter,
    Loader,
    X,
    ArrowLeft,
    TrendingUp,
    AlertCircle,
    Box,
    Layers,
    Tag,
    ChevronRight,
    SearchX
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import clsx from 'clsx';

// Modal Component for Adding New Product
const ProductModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        group: '',
        category: '',
        unit: 'Pcs',
        opening_qty: 0
    });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'opening_qty' ? parseFloat(value) || 0 : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.sku) {
            toast.error('Product name and SKU are required');
            return;
        }

        try {
            setSubmitting(true);
            await api.post('/products', { ...formData, is_active: true });
            toast.success('Product added successfully!');
            setFormData({
                name: '',
                sku: '',
                group: '',
                category: '',
                category: '',
                unit: 'Pcs',
                opening_qty: 0
            });
            onClose();
            onSuccess();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add product');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-[2.5rem] max-w-2xl w-full p-10 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">Stock Master</span>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create New Product</h2>
                    </div>
                    <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="group">
                                <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                                    <Tag className="w-3 h-3 mr-2" /> Product Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g., iPhone 15 Pro"
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-bold text-slate-900"
                                    required
                                />
                            </div>

                            <div className="group">
                                <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                                    <Layers className="w-3 h-3 mr-2" /> Stock Group
                                </label>
                                <input
                                    type="text"
                                    name="group"
                                    value={formData.group}
                                    onChange={handleChange}
                                    placeholder="e.g., Electronics"
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-bold text-slate-900"
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="group">
                                <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                                    <Tag className="w-3 h-3 mr-2" /> Item SKU
                                </label>
                                <input
                                    type="text"
                                    name="sku"
                                    value={formData.sku}
                                    onChange={handleChange}
                                    placeholder="e.g., AIP-15P-128"
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-bold text-slate-900 uppercase"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="group">
                                    <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                                        Unit
                                    </label>
                                    <select
                                        name="unit"
                                        value={formData.unit}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-bold text-slate-900 appearance-none"
                                    >
                                        <option>Pcs</option>
                                        <option>Kg</option>
                                        <option>Ltr</option>
                                        <option>Box</option>
                                        <option>Set</option>
                                    </select>
                                </div>
                                <div className="group">
                                    <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                                        Opening Qty
                                    </label>
                                    <input
                                        type="number"
                                        name="opening_qty"
                                        value={formData.opening_qty}
                                        onChange={handleChange}
                                        placeholder="0"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-bold text-slate-900"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 font-black text-slate-600 uppercase tracking-widest text-xs transition-all"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-8 py-5 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-600/30 hover:bg-blue-700 font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50"
                        >
                            {submitting ? 'Authenticating...' : 'Register Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const StatCard = ({ title, amount, change, changeType, icon: Icon, colorClass, sparkColor }) => (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group">
        <div className="flex justify-between items-start">
            <div className={clsx("p-4 rounded-2xl bg-opacity-10 group-hover:scale-110 transition-transform duration-500", colorClass)}>
                <Icon className={clsx("w-6 h-6", colorClass.replace('bg-', 'text-'))} />
            </div>
        </div>
        <div className="mt-6">
            <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest">{title}</h3>
            <h2 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">{amount}</h2>
            <div className={clsx(
                "flex items-center mt-3 text-[11px] font-black uppercase tracking-tighter px-2.5 py-1 rounded-full w-fit",
                changeType === 'positive' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
            )}>
                {changeType === 'positive' ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <AlertCircle className="w-3.5 h-3.5 mr-1" />}
                {change}
            </div>
        </div>
    </div>
);

const Inventory = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGroup, setFilterGroup] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const productsRes = await api.get('/products');
            const productsData = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data?.data || []);
            setProducts(productsData);
            setError(null);
        } catch (err) {
            console.error('Error fetching inventory:', err);
            const errorMsg = err.response?.data?.message || 'Failed to load inventory';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGroup = filterGroup === 'All' || product.group === filterGroup;
        return matchesSearch && matchesGroup;
    });

    const groups = ['All', ...new Set(products.filter(p => p.group).map(p => p.group))];

    // Stats Calculations
    const totalItems = products.length;
    const lowStockItems = products.filter(p => (p.opening_qty || 0) < 10).length;
    const outOfStockItems = products.filter(p => (p.opening_qty || 0) === 0).length;
    const activeCategories = groups.length - 1; // Exclude 'All'

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Compiling Stock Summary...</p>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-12 pb-20">

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">Inventory Management</span>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Stock Summary</h1>
                    <div className="flex items-center space-x-3 mt-3">
                        <div className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase border border-emerald-100">Live Status</div>
                        <div className="bg-slate-50 text-slate-500 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase border border-slate-100">
                            Updated: {new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="flex items-center px-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-xs font-black text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest">
                        <Download className="w-4 h-4 mr-2" />
                        Export Sheets
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center px-8 py-4 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-900/20 text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Item
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Items"
                    amount={totalItems}
                    change="Registered"
                    changeType="positive"
                    icon={Package}
                    colorClass="bg-blue-500 text-blue-600"
                />
                <StatCard
                    title="Low Stock Alert"
                    amount={lowStockItems}
                    change="Reorder Soon"
                    changeType="negative"
                    icon={AlertCircle}
                    colorClass="bg-orange-500 text-orange-600"
                />
                <StatCard
                    title="Out of Stock"
                    amount={outOfStockItems}
                    change="Critical"
                    changeType="negative"
                    icon={Box}
                    colorClass="bg-rose-500 text-rose-600"
                />
                <StatCard
                    title="Stock Groups"
                    amount={activeCategories}
                    change="Categories"
                    changeType="positive"
                    icon={Layers}
                    colorClass="bg-violet-500 text-violet-600"
                />
            </div>

            {/* Advanced Filters */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-6 lg:col-span-7 relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-all" />
                    <input
                        type="text"
                        placeholder="Search stock by item name, SKU code or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-bold text-slate-900"
                    />
                </div>

                <div className="md:col-span-3 lg:col-span-3 relative">
                    <Filter className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                        value={filterGroup}
                        onChange={(e) => setFilterGroup(e.target.value)}
                        className="w-full pl-14 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white outline-none font-black text-xs uppercase tracking-widest text-slate-900 appearance-none cursor-pointer hover:bg-slate-100 transition-all"
                    >
                        {groups.map(group => (
                            <option key={group} value={group}>{group}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>

                <div className="md:col-span-3 lg:col-span-2 flex items-center justify-center border-l border-slate-100 h-full">
                    <div className="text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Items Found</p>
                        <p className="text-xl font-black text-blue-600">{filteredProducts.length}</p>
                    </div>
                </div>
            </div>

            {/* Data Sheet Grid */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden min-h-[500px] flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Stock Item Description</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Part SKU</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Groupings</th>
                                <th className="px-8 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Unit</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Closing Balance</th>
                                <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Registry Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map(product => (
                                    <tr key={product.id} className="group hover:bg-slate-50/80 transition-all cursor-pointer">
                                        <td className="px-10 py-6 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mr-5 shadow-sm group-hover:scale-110 transition-transform">
                                                    <Package className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-black text-slate-900 tracking-tight">{product.name}</h3>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{product.category || 'Uncategorized'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{product.sku}</span>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex items-center text-xs font-bold text-slate-600">
                                                <Layers className="w-3.5 h-3.5 mr-2 text-slate-300" />
                                                {product.group || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center whitespace-nowrap">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg uppercase border border-slate-200">
                                                {product.unit || 'Units'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right whitespace-nowrap">
                                            <div>
                                                <p className="text-lg font-black text-slate-900 tracking-tight">{product.opening_qty || 0}</p>
                                                <div className="flex items-center justify-end mt-1 text-[10px] font-bold text-emerald-500">
                                                    <TrendingUp className="w-3 h-3 mr-1" />
                                                    In Stock
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right whitespace-nowrap">
                                            <div className={clsx(
                                                "inline-flex items-center px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border",
                                                product.is_active
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    : 'bg-slate-100 text-slate-400 border-slate-200'
                                            )}>
                                                <div className={clsx("w-1.5 h-1.5 rounded-full mr-2", product.is_active ? 'bg-emerald-500' : 'bg-slate-300')} />
                                                {product.is_active ? 'Active' : 'Archived'}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-10 py-32 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 text-slate-200 animate-bounce">
                                                <SearchX className="w-12 h-12" />
                                            </div>
                                            <h4 className="text-xl font-black text-slate-900 tracking-tight mb-2">No Stock Matches</h4>
                                            <p className="text-sm font-bold text-slate-400">Try adjusting your filters or search terms</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/20">
                    <p className="text-xs font-bold text-slate-400 tracking-tight uppercase">
                        Sheet <span className="text-slate-900">01</span> · Rendering <span className="text-slate-900">{filteredProducts.length}</span> items
                    </p>
                    <div className="flex space-x-2">
                        <button className="px-4 py-2 border border-slate-100 bg-white rounded-xl text-[10px] font-black text-slate-400 uppercase disabled:opacity-50">Prev</button>
                        <button className="px-4 py-2 border border-slate-100 bg-white rounded-xl text-[10px] font-black text-slate-900 uppercase">Next</button>
                    </div>
                </div>
            </div>

            {/* Add Product Modal */}
            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchData}
            />
        </div>
    );
};

export default Inventory;

