import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Search, Edit, Trash2, X, Phone, Mail, MapPin, ArrowLeft, Building2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

const SupplierModal = ({ isOpen, onClose, supplier }) => {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        defaultValues: supplier || { name: '', contact: '', phone: '', email: '', address: '' }
    });
    const queryClient = useQueryClient();

    React.useEffect(() => {
        reset(supplier || { name: '', contact: '', phone: '', email: '', address: '' });
    }, [supplier, reset]);

    const mutation = useMutation({
        mutationFn: (data) => {
            if (supplier?.id) {
                return api.put(`/suppliers/${supplier.id}`, data);
            }
            return api.post('/suppliers', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['suppliers']);
            toast.success(supplier ? 'Supplier updated' : 'Supplier created');
            onClose();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-[2.5rem] max-w-2xl w-full p-10 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">Supplier Master</span>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                            {supplier ? 'Edit Supplier' : 'New Supplier'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="group">
                                <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                                    <Building2 className="w-3 h-3 mr-2" /> Company Name
                                </label>
                                <input
                                    {...register('name', { required: 'Name is required' })}
                                    placeholder="e.g., ABC Suppliers Ltd"
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-bold text-slate-900"
                                />
                                {errors.name && <span className="text-red-500 text-xs font-bold">{errors.name.message}</span>}
                            </div>

                            <div className="group">
                                <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                                    <User className="w-3 h-3 mr-2" /> Contact Person
                                </label>
                                <input
                                    {...register('contact')}
                                    placeholder="John Doe"
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-bold text-slate-900"
                                />
                            </div>

                            <div className="group">
                                <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                                    <Phone className="w-3 h-3 mr-2" /> Phone Number
                                </label>
                                <input
                                    {...register('phone')}
                                    placeholder="+91-9876543210"
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-bold text-slate-900"
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="group">
                                <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                                    <Mail className="w-3 h-3 mr-2" /> Email Address
                                </label>
                                <input
                                    type="email"
                                    {...register('email')}
                                    placeholder="supplier@company.com"
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-bold text-slate-900"
                                />
                            </div>

                            <div className="group">
                                <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                                    <MapPin className="w-3 h-3 mr-2" /> Address
                                </label>
                                <textarea
                                    {...register('address')}
                                    rows="5"
                                    placeholder="Street, City, State, ZIP"
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-bold text-slate-900 resize-none"
                                />
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
                            disabled={isSubmitting}
                            className="flex-1 px-8 py-5 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-600/30 hover:bg-blue-700 font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Supplier'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Suppliers = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { data: suppliers, isLoading } = useQuery({
        queryKey: ['suppliers'],
        queryFn: async () => {
            const res = await api.get('/suppliers');
            return Array.isArray(res.data) ? res.data : (res.data?.data || []);
        }
    });

    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/suppliers/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['suppliers']);
            toast.success('Supplier deleted');
        },
        onError: () => toast.error('Failed to delete supplier')
    });

    const handleEdit = (supplier) => {
        setSelectedSupplier(supplier);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            deleteMutation.mutate(id);
        }
    };

    const items = suppliers || [];
    const filtered = items.filter(s =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
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
                        <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] block">Supplier Management</span>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">All Suppliers</h1>
                    </div>
                </div>
                <button
                    onClick={() => { setSelectedSupplier(null); setIsModalOpen(true); }}
                    className="flex items-center px-6 py-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-600/30 hover:bg-blue-700 font-black uppercase tracking-widest text-xs transition-all"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Supplier
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-100">
                    <div className="relative">
                        <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search suppliers by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all font-bold text-slate-900"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Company</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Person</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Phone</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Email</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Address</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-12 text-center text-slate-400 font-bold">Loading suppliers...</td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-12 text-center text-slate-400 font-bold">No suppliers found</td>
                                </tr>
                            ) : (
                                filtered.map((supplier) => (
                                    <tr key={supplier.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="text-sm font-black text-slate-900">{supplier.name}</div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-slate-600">
                                            {supplier.contact || '-'}
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-slate-600">
                                            {supplier.phone || '-'}
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-slate-600">
                                            {supplier.email || '-'}
                                        </td>
                                        <td className="px-8 py-5 text-sm font-bold text-slate-600">
                                            {supplier.address || '-'}
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => handleEdit(supplier)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(supplier.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
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

            <SupplierModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                supplier={selectedSupplier}
            />
        </div>
    );
};

export default Suppliers;
