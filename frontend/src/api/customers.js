import api from './axios';

export const getCustomers = async (params = {}) => {
    const response = await api.get('/customers', { params });
    // If backend returns paginated object { data: [], total, page... }, return it fully
    return response.data;
};

export const getCustomerById = async (id) => {
    const response = await api.get(`/customers/${id}`);
    return response.data?.data || response.data;
};

export const createCustomer = async (data) => {
    const response = await api.post('/customers', data);
    return response.data?.data || response.data;
};

export const updateCustomer = async (id, data) => {
    const response = await api.put(`/customers/${id}`, data);
    return response.data?.data || response.data;
};

export const deleteCustomer = async (id) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
};
