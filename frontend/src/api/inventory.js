import api from './axios';

export const getStockItems = async () => {
    const response = await api.get('/stock_items');
    return response.data?.data || [];
};

export const getStockItemById = async (id) => {
    const response = await api.get(`/stock_items/${id}`);
    return response.data?.data || response.data;
};

export const getStockByProduct = async (productId) => {
    const response = await api.get(`/stock_items/product/${productId}`);
    return response.data?.data || [];
};

export const getStockSummary = async (startDate, endDate) => {
    const response = await api.get('/stock_items/summary', {
        params: { startDate, endDate }
    });
    return response.data?.data || [];
};

export const getInwardMovements = async () => {
    const response = await api.get('/stock_items/movements/inward');
    return response.data?.data || [];
};

export const getOutwardMovements = async () => {
    const response = await api.get('/stock_items/movements/outward');
    return response.data?.data || [];
};

export const createStockMovement = async (data) => {
    const response = await api.post('/stock_items', data);
    return response.data?.data || response.data;
};

export const updateStockMovement = async (id, data) => {
    const response = await api.put(`/stock_items/${id}`, data);
    return response.data?.data || response.data;
};

export const deleteStockMovement = async (id) => {
    const response = await api.delete(`/stock_items/${id}`);
    return response.data;
};

export const getStockLevels = async () => {
    const response = await api.get('/inventory/levels');
    return response.data?.data || [];
};
