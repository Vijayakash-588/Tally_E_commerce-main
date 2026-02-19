import api from './axios';

export const getInvoices = async () => {
    const response = await api.get('/invoices');
    return response.data?.data || [];
};

export const getInvoiceById = async (id) => {
    const response = await api.get(`/invoices/${id}`);
    return response.data?.data || response.data;
};

export const getInvoiceByNumber = async (invoiceNumber) => {
    const response = await api.get(`/invoices/number/${invoiceNumber}`);
    return response.data?.data || response.data;
};

export const getInvoicesByCustomer = async (customerId) => {
    const response = await api.get(`/invoices/customer/${customerId}`);
    return response.data?.data || [];
};

export const getInvoicesByStatus = async (status) => {
    const response = await api.get(`/invoices/status/${status}`);
    return response.data?.data || [];
};

export const createInvoice = async (data) => {
    const response = await api.post('/invoices', data);
    return response.data?.data || response.data;
};

export const updateInvoice = async (id, data) => {
    const response = await api.put(`/invoices/${id}`, data);
    return response.data?.data || response.data;
};

export const deleteInvoice = async (id) => {
    const response = await api.delete(`/invoices/${id}`);
    return response.data;
};

export const updateInvoiceStatus = async (id, status) => {
    const response = await api.patch(`/invoices/${id}/status`, { status });
    return response.data?.data || response.data;
};

export const sendInvoice = async (id) => {
    const response = await api.post(`/invoices/${id}/send`);
    return response.data?.data || response.data;
};

export const recordPayment = async (id, data) => {
    const response = await api.post(`/invoices/${id}/payment`, data);
    return response.data?.data || response.data;
};

export const getInvoiceLineItems = async (id) => {
    const response = await api.get(`/invoices/${id}/items`);
    return response.data?.data || [];
};

export const getTaxRates = async () => {
    const response = await api.get('/invoices/tax-rates');
    return response.data?.data || [];
};
