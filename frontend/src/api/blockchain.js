import api from './axios';

export const getBlockchainHealth = async () => {
    const response = await api.get('/blockchain/health');
    return response.data?.data || response.data;
};

export const getAnchors = async (params = {}) => {
    const response = await api.get('/blockchain/anchors', { params });
    return response.data?.data || [];
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
