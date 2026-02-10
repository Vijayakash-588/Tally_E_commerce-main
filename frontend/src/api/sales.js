import api from './axios';

export const getSales = async () => {
    const response = await api.get('/sales');
    return response.data?.data || [];
};

export const getSaleById = async (id) => {
    const response = await api.get(`/sales/${id}`);
    return response.data?.data || response.data;
};

export const getSalesByDateRange = async (startDate, endDate) => {
    const response = await api.get('/sales/date-range', {
        params: { startDate, endDate }
    });
    return response.data?.data || [];
};

export const getSalesByCustomer = async (customerId) => {
    const response = await api.get(`/sales/customer/${customerId}`);
    return response.data?.data || [];
};

export const createSale = async (data) => {
    const response = await api.post('/sales', data);
    return response.data?.data || response.data;
};

export const updateSale = async (id, data) => {
    const response = await api.put(`/sales/${id}`, data);
    return response.data?.data || response.data;
};

export const deleteSale = async (id) => {
    const response = await api.delete(`/sales/${id}`);
    return response.data;
};
