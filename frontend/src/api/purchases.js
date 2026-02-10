import api from './axios';

export const getPurchases = async () => {
    const response = await api.get('/purchases');
    return response.data?.data || [];
};

export const getPurchaseById = async (id) => {
    const response = await api.get(`/purchases/${id}`);
    return response.data?.data || response.data;
};

export const getPurchasesBySupplier = async (supplierId) => {
    const response = await api.get(`/purchases/supplier/${supplierId}`);
    return response.data?.data || [];
};

export const getPurchasesByDateRange = async (startDate, endDate) => {
    const response = await api.get('/purchases/date-range', {
        params: { startDate, endDate }
    });
    return response.data?.data || [];
};

export const createPurchase = async (data) => {
    const response = await api.post('/purchases', data);
    return response.data?.data || response.data;
};

export const updatePurchase = async (id, data) => {
    const response = await api.put(`/purchases/${id}`, data);
    return response.data?.data || response.data;
};

export const deletePurchase = async (id) => {
    const response = await api.delete(`/purchases/${id}`);
    return response.data;
};
