import React, { useState, useEffect } from 'react';
import {
    Search,
    Bell,
    Settings,
    ChevronDown,
    Calendar,
    Printer,
    Save,
    CheckCircle2,
    History,
    Info,
    Package,
    FileText,
    LayoutDashboard,
    Search as SearchIcon
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const SalesInvoice = () => {
    const [invoices, setInvoices] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        invoice_number: '',
        customer_id: '',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        total_amount: 0,
        tax: 0,
        discount: 0,
        paid_amount: 0,
        status: 'DRAFT',
        notes: ''
    });

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                setLoading(true);
                const response = await api.get('/invoices');
                const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
                setInvoices(data);
                if (data.length > 0) {
                    setSelectedInvoice(data[0]);
                    setFormData(data[0]);
                }
            } catch (err) {
                console.error('Failed to load invoices:', err);
                toast.error('Failed to load invoices');
            } finally {
                setLoading(false);
            }
        };

        fetchInvoices();
    }, []);

    const handleSaveInvoice = async () => {
        try {
            if (selectedInvoice?.id) {
                await api.put(`/invoices/${selectedInvoice.id}`, formData);
                toast.success('Invoice updated');
            } else {
                const response = await api.post('/invoices', formData);
                setInvoices([...invoices, response.data?.data || response.data]);
                toast.success('Invoice created');
            }
        } catch (err) {
            toast.error('Failed to save invoice');
        }
    };
    return (
        <div className="min-h-screen bg-[#F3F6F9] font-sans text-slate-700 flex flex-col">
            {/* Top Navigation Bar */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
                <div className="flex items-center space-x-10">
                    <div className="flex items-center space-x-2">
                        <div className="bg-[#2563EB] p-1.5 rounded-lg shadow-sm">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-black text-slate-800 tracking-tight">ERP Pro</span>
                    </div>

                    <div className="relative w-80 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#2563EB] transition-colors" />
                        <input
                            type="text"
                            placeholder="Quick Search (Ctrl + K)"
                            className="w-full bg-slate-100 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#2563EB]/20 transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-8">
                    <nav className="flex items-center space-x-8 text-sm font-bold text-slate-500">
                        <a href="#" className="hover:text-slate-900 transition-colors">Dashboard</a>
                        <a href="#" className="text-[#2563EB] relative py-5">
                            Vouchers
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB] rounded-full"></div>
                        </a>
                        <a href="#" className="hover:text-slate-900 transition-colors">Reports</a>
                        <a href="#" className="hover:text-slate-900 transition-colors">Inventory</a>
                    </nav>

                    <div className="w-10 h-10 rounded-full bg-[#FFEDD5] text-[#C2410C] flex items-center justify-center font-bold border-2 border-white shadow-sm overflow-hidden cursor-pointer">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 p-10 max-w-7xl mx-auto w-full space-y-8 overflow-y-auto">
                {/* Header Section */}
                <div className="flex items-end justify-between">
                    <div>
                        <div className="text-xs font-bold text-slate-400 mb-1 flex items-center space-x-1 uppercase tracking-widest">
                            <span>Accounting</span>
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-500">Sales Invoice</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Sales Invoice</h1>
                            <span className="bg-[#DBEAFE] text-[#2563EB] text-[10px] font-black px-2 py-0.5 rounded tracking-tighter">NEW</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all text-slate-600">
                            <History className="w-4 h-4" />
                            <span>History</span>
                        </button>
                        <button className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all text-slate-600">
                            <Settings className="w-4 h-4" />
                            <span>Configure</span>
                        </button>
                    </div>
                </div>

                {/* Form Top Section */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 grid grid-cols-3 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Invoice No.</label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={formData.invoice_number}
                                onChange={(e) => setFormData({...formData, invoice_number: e.target.value})}
                                placeholder="Enter invoice number"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 group-focus-within:border-[#2563EB]/40 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Date</label>
                        <div className="relative group">
                            <input
                                type="date"
                                value={formData.issue_date}
                                onChange={(e) => setFormData({...formData, issue_date: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 group-focus-within:border-[#2563EB]/40 outline-none transition-all pr-12"
                            />
                            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Party Account Name</label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={formData.customer_id}
                                onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                                placeholder="Select customer"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 group-focus-within:border-[#2563EB]/40 outline-none transition-all pr-12"
                            />
                            <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#2563EB]" />
                        </div>
                    </div>
                </div>

                {/* Line Items Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 uppercase tracking-[0.1em]">
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400">Item Description</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 text-right">Quantity</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 text-right">Rate</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 text-center">Per</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 font-bold text-slate-900">
                            <tr className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-8 py-5">Dell Latitude 5420 Laptop</td>
                                <td className="px-6 py-5 text-right font-black">10</td>
                                <td className="px-6 py-5 text-right font-black text-slate-500">55,000.00</td>
                                <td className="px-6 py-5 text-center text-[#2563EB]">Nos</td>
                                <td className="px-8 py-5 text-right text-xl font-black">5,50,000.00</td>
                            </tr>
                            <tr className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-8 py-5">Wireless Keyboard & Mouse Combo</td>
                                <td className="px-6 py-5 text-right font-black">25</td>
                                <td className="px-6 py-5 text-right font-black text-slate-500">2,400.00</td>
                                <td className="px-6 py-5 text-center text-[#2563EB]">Sets</td>
                                <td className="px-8 py-5 text-right text-xl font-black">60,000.00</td>
                            </tr>
                            <tr className="bg-slate-50/30 italic">
                                <td colSpan={5} className="px-8 py-5 text-slate-400 text-sm font-medium">Press Enter to add item...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Bottom Section */}
                <div className="flex gap-8">
                    {/* Narration Area */}
                    <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none ml-2">Narration</label>
                        <textarea
                            placeholder="Enter transaction details..."
                            className="w-full bg-white border border-slate-200 rounded-2xl p-6 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#2563EB]/10 outline-none transition-all h-32 leading-relaxed"
                        />
                    </div>

                    {/* Totals Section */}
                    <div className="w-1/2 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="text-slate-400">Sub Total</span>
                                <span className="text-slate-900">₹{(formData.total_amount - formData.tax).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="text-slate-400">Tax</span>
                                <span className="text-slate-900">₹{formData.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="text-slate-400">Discount</span>
                                <span className="text-slate-900">-₹{formData.discount.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="h-px bg-slate-100" />

                        <div className="text-right space-y-1 py-2">
                            <div className="flex justify-end items-end space-x-4">
                                <span className="text-lg font-black text-slate-900 pb-1.5 uppercase tracking-wide">Total Amount</span>
                                <span className="text-4xl font-black text-[#2563EB] tracking-tight">₹ {formData.total_amount.toFixed(2)}</span>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-10">Status: {formData.status}</p>
                        </div>
                    </div>
                </div>

                {/* Buttons Bar */}
                <div className="flex items-center justify-end space-x-4 pt-10 border-t border-slate-200">
                    <button className="flex items-center space-x-3 bg-white border border-slate-200 px-6 py-4 rounded-xl text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50 transition-all">
                        <Printer className="w-5 h-5" />
                        <span>Print Invoice</span>
                    </button>
                    <button className="flex items-center space-x-3 bg-[#DBEAFE] px-8 py-4 rounded-xl text-sm font-black text-[#2563EB] hover:bg-blue-200 transition-all"
                        onClick={() => handleSaveInvoice()}>
                        <Save className="w-5 h-5" />
                        <span>Save Draft</span>
                    </button>
                    <button className="flex items-center space-x-3 bg-[#2563EB] px-10 py-4 rounded-xl text-sm font-black text-white shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
                        onClick={() => handleSaveInvoice()}>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Post to Ledger (Alt + S)</span>
                    </button>
                </div>
            </main>

            {/* Shortcuts Legend Bar */}
            <footer className="h-10 bg-slate-950 text-white flex items-center justify-between px-8 text-[10px] font-black uppercase tracking-[0.2em] shrink-0">
                <div className="flex items-center space-x-8">
                    <span className="opacity-50 hover:opacity-100 cursor-pointer">F2: Date</span>
                    <span className="opacity-50 hover:opacity-100 cursor-pointer">F4: Ledger</span>
                    <span className="opacity-50 hover:opacity-100 cursor-pointer text-white opacity-100">F5: Sales</span>
                    <span className="opacity-50 hover:opacity-100 cursor-pointer">F8: Item List</span>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-[#2563EB] font-black">Alt+S: Save & Post</span>
                </div>
            </footer>
        </div>
    );
};

export default SalesInvoice;
