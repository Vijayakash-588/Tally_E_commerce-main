import api from './axios';

export const getApprovalRequests = async (params = {}) => {
    const response = await api.get('/approvals', { params });
    return response.data;
};

export const createApprovalRequest = async (payload) => {
    const response = await api.post('/approvals/request', payload);
    return response.data;
};

export const approveRequest = async (id, notes = '') => {
    const response = await api.patch(`/approvals/${id}/approve`, { notes });
    return response.data;
};

export const rejectRequest = async (id, notes = '') => {
    const response = await api.patch(`/approvals/${id}/reject`, { notes });
    return response.data;
};
