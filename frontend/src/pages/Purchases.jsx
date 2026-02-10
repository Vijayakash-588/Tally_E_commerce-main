import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const Purchases = () => {
    const [purchases, setPurchases] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPurchase, setEditingPurchase] = useState(null);
    const [formData, setFormData] = useState({
        supplier_id: '',
        reference: '',
        notes: '',
        items: []
    });
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
            return Array.isArray(res.data) ? res.data : (res.data?.data || []);
        }
    });

    useEffect(() => {
        if (purchasesList) setPurchases(purchasesList);
    }, [purchasesList]);

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
        return { subtotal, tax, total: subtotal + tax };
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
            const product = products.find(p => p.id === parseInt(value));
            newItems[index].product_id = parseInt(value);
            if (product) newItems[index].price = product.price;
        } else if (field === 'tax_rate_id') {
            const taxRate = taxRates.find(t => t.id === parseInt(value));
            newItems[index].tax_rate_id = parseInt(value);
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

    const handleSave = () => {
        if (!formData.supplier_id) {
            toast.error('Please select a supplier');
            return;
        }
        if (items.length === 0) {
            toast.error('Add at least one item');
            return;
        }

        const totals = recalcTotals(items);
        const payload = {
            supplier_id: parseInt(formData.supplier_id),
            reference: formData.reference,
            notes: formData.notes,
            subtotal: totals.subtotal,
            tax_amount: totals.tax,
            total: totals.total,
            items: items.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price,
                tax_rate_id: item.tax_rate_id || null,
                tax_amount: item.tax_amount || 0
            }))
        };

        if (editingPurchase) {
            updateMutation.mutate(payload);
        } else {
            createMutation.mutate(payload);
        }
    };

    const handleEdit = (purchase) => {
        setEditingPurchase(purchase);
        setFormData({
            supplier_id: purchase.supplier_id || '',
            reference: purchase.reference || '',
            notes: purchase.notes || ''
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
        setFormData({ supplier_id: '', reference: '', notes: '', items: [] });
        setItems([]);
        setEditingPurchase(null);
        setIsModalOpen(false);
    };

    const handleNewPurchase = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const totals = recalcTotals(items);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Purchases</h1>
                <button
                    onClick={handleNewPurchase}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    New Purchase
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Reference</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Supplier</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Items</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Subtotal</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tax</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">Loading...</td>
                                </tr>
                            ) : purchases.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No purchases found</td>
                                </tr>
                            ) : (
                                purchases.map((purchase) => (
                                    <tr key={purchase.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{purchase.reference}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {suppliers.find(s => s.id === purchase.supplier_id)?.name || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {purchase.items?.length || 0}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white">
                                            ₹{purchase.subtotal?.toFixed(2) || '0.00'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white">
                                            ₹{purchase.tax_amount?.toFixed(2) || '0.00'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-right text-gray-900 dark:text-white">
                                            ₹{purchase.total?.toFixed(2) || '0.00'}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleEdit(purchase)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(purchase.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold">{editingPurchase ? 'Edit Purchase' : 'New Purchase'}</h2>
                            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Supplier</label>
                                    <select
                                        value={formData.supplier_id}
                                        onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 border"
                                    >
                                        <option value="">Select supplier</option>
                                        {suppliers.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reference</label>
                                    <input
                                        type="text"
                                        value={formData.reference}
                                        onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                        placeholder="PO number"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 border"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Items</label>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full border border-gray-300 dark:border-gray-600">
                                        <thead className="bg-gray-100 dark:bg-gray-700">
                                            <tr>
                                                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-sm">Product</th>
                                                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-sm w-20">Qty</th>
                                                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right text-sm w-24">Price</th>
                                                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-sm w-32">Tax</th>
                                                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right text-sm w-24">Amount</th>
                                                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-sm w-12"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                                        <select
                                                            value={item.product_id}
                                                            onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                                                            className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-sm"
                                                        >
                                                            <option value="">Select product</option>
                                                            {products.map(p => (
                                                                <option key={p.id} value={p.id}>{p.name}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                            className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-sm"
                                                            min="1"
                                                        />
                                                    </td>
                                                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                                        <input
                                                            type="number"
                                                            value={item.price}
                                                            onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                                            className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-sm text-right"
                                                            step="0.01"
                                                        />
                                                    </td>
                                                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                                        <select
                                                            value={item.tax_rate_id}
                                                            onChange={(e) => handleItemChange(index, 'tax_rate_id', e.target.value)}
                                                            className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-sm"
                                                        >
                                                            <option value="">No tax</option>
                                                            {taxRates.map(t => (
                                                                <option key={t.id} value={t.id}>{t.name}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right font-semibold">
                                                        ₹{((item.price * item.quantity) + (item.tax_amount || 0)).toFixed(2)}
                                                    </td>
                                                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                                                        <button onClick={() => handleRemoveItem(index)} className="text-red-600 hover:text-red-900">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <button
                                    onClick={handleAddItem}
                                    className="mt-2 px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                                >
                                    + Add Item
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows="3"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 border"
                                    placeholder="Additional notes..."
                                />
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal:</span>
                                    <span className="font-semibold">₹{totals.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Tax:</span>
                                    <span className="font-semibold">₹{totals.tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-base font-bold border-t border-gray-300 dark:border-gray-600 pt-2">
                                    <span>Total:</span>
                                    <span>₹{totals.total.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    onClick={resetForm}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                                >
                                    Save Purchase
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Purchases;
