import api from './axios';

export const getBlockchainHealth = async () => {
    const response = await api.get('/blockchain/health');
    return response.data?.data || response.data;
};

export const getAnchors = async (params = {}) => {
    const response = await api.get('/blockchain/anchors', { params });
    const payload = response.data || {};
    return {
        items: payload.data || [],
        pagination: payload.pagination || {
            page: 1,
            pageSize: Number(params.pageSize || 30),
            total: 0,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false
        }
    };
};

export const getAnchorById = async (id) => {
    const response = await api.get(`/blockchain/anchors/${id}`);
    return response.data?.data || response.data;
};

export const createAnchor = async (payload) => {
    const response = await api.post('/blockchain/anchors', payload);
    return response.data?.data || response.data;
};

export const verifyAnchor = async (id) => {
    const response = await api.get(`/blockchain/anchors/${id}/verify`);
    return response.data?.data || response.data;
};

export const verifyEntity = async (entityType, entityId) => {
    const response = await api.get(`/blockchain/verify/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}`);
    return response.data?.data || response.data;
};

export const retryFailedAnchors = async (limit = 25) => {
    const response = await api.post('/blockchain/anchors/retry-failed', { limit });
    return response.data?.data || response.data;
};
