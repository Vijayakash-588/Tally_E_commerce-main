import api from './axios';

export const getProducts = async () => {
    const response = await api.get('/products');
    return response.data?.data || [];
};

export const getProduct = async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data?.data || response.data;
};

export const getProductsByGroup = async (group) => {
    const response = await api.get(`/products/group/${group}`);
    return response.data?.data || [];
};

export const getProductsByCategory = async (category) => {
    const response = await api.get(`/products/category/${category}`);
    return response.data?.data || [];
};

export const createProduct = async (data) => {
    const response = await api.post('/products', data);
    return response.data?.data || response.data;
};

export const updateProduct = async (id, data) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data?.data || response.data;
};

export const deleteProduct = async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
};

export const toggleProductStatus = async (id) => {
    const response = await api.patch(`/products/${id}/toggle`);
    return response.data;
};
