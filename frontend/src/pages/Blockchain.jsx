import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CheckCircle2, Clock3, RefreshCcw, ShieldAlert, ShieldCheck } from 'lucide-react';
import {
    createAnchor,
    getAnchors,
    getBlockchainHealth,
    retryFailedAnchors,
    verifyAnchor,
    verifyEntity
} from '../api/blockchain';
import { useAuth } from '../context/AuthContext';

const fmtDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleString();
};

const statusBadge = (status) => {
    const value = (status || '').toUpperCase();
    if (value === 'CONFIRMED') return 'bg-emerald-100 text-emerald-700';
    if (value === 'FAILED') return 'bg-rose-100 text-rose-700';
    if (value === 'SKIPPED') return 'bg-slate-100 text-slate-600';
    return 'bg-amber-100 text-amber-700';
};

const Blockchain = () => {
    const { hasRole } = useAuth();
    const [filters, setFilters] = useState({ entityType: '', entityId: '', status: '', page: 1, pageSize: 30 });
    const [isRetrying, setIsRetrying] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isVerifyingEntity, setIsVerifyingEntity] = useState(false);
    const [verifyEntityResult, setVerifyEntityResult] = useState(null);
    const [createForm, setCreateForm] = useState({
        entityType: '',
        entityId: '',
        payloadText: '{\n  "source": "manual"\n}'
    });
    const [verifyForm, setVerifyForm] = useState({ entityType: '', entityId: '' });
    const statusOptions = useMemo(() => ['', 'PENDING', 'CONFIRMED', 'FAILED', 'SKIPPED'], []);

    const canManage = hasRole(['admin', 'manager']);

    const healthQuery = useQuery({
        queryKey: ['blockchain-health'],
        queryFn: getBlockchainHealth,
        enabled: canManage
    });

    const anchorsQuery = useQuery({
        queryKey: ['blockchain-anchors', filters],
        queryFn: () => getAnchors(filters),
        enabled: canManage
    });

    const onVerify = async (id) => {
        try {
            const result = await verifyAnchor(id);
            toast.success(result.valid ? 'Anchor verified on-chain' : `Not valid: ${result.reason}`);
            anchorsQuery.refetch();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Verification failed');
        }
    };

    const onRetryFailed = async () => {
        setIsRetrying(true);
        try {
            const result = await retryFailedAnchors(25);
            toast.success(`Retried ${result.retried}, success ${result.succeeded}, failed ${result.failed}`);
            await Promise.all([anchorsQuery.refetch(), healthQuery.refetch()]);
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Retry failed');
        } finally {
            setIsRetrying(false);
        }
    };

    const onCreateAnchor = async () => {
        if (!createForm.entityType || !createForm.entityId) {
            toast.error('Entity type and entity id are required');
            return;
        }

        let payload;
        try {
            payload = createForm.payloadText?.trim() ? JSON.parse(createForm.payloadText) : {};
        } catch {
            toast.error('Payload must be valid JSON');
            return;
        }

        setIsCreating(true);
        try {
            const result = await createAnchor({
                entityType: createForm.entityType.trim(),
                entityId: createForm.entityId.trim(),
                payload
            });

            if (result?.success === false) {
                toast.error(result?.error || 'Anchor failed');
            } else {
                toast.success('Anchor request processed');
                setCreateForm({
                    entityType: createForm.entityType,
                    entityId: createForm.entityId,
                    payloadText: '{\n  "source": "manual"\n}'
                });
            }

            await Promise.all([anchorsQuery.refetch(), healthQuery.refetch()]);
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Unable to create anchor');
        } finally {
            setIsCreating(false);
        }
    };

    const onVerifyEntity = async () => {
        if (!verifyForm.entityType || !verifyForm.entityId) {
            toast.error('Entity type and entity id are required');
            return;
        }

        setIsVerifyingEntity(true);
        try {
            const result = await verifyEntity(verifyForm.entityType.trim(), verifyForm.entityId.trim());
            setVerifyEntityResult(result);
            toast.success(result.valid ? 'Entity verification passed' : `Verification failed: ${result.reason}`);
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Entity verification failed');
        } finally {
            setIsVerifyingEntity(false);
        }
    };

    if (!canManage) {
        return (
            <div className="bg-white border border-slate-200 rounded-2xl p-8">
                <h1 className="text-2xl font-black text-slate-900">Blockchain Console</h1>
                <p className="mt-2 text-slate-500 font-semibold">You do not have access to blockchain management.</p>
            </div>
        );
    }

    const totals = healthQuery.data?.totals || {};
    const metrics = healthQuery.data?.metrics || {};
    const anchors = anchorsQuery.data?.items || [];
    const pagination = anchorsQuery.data?.pagination || {
        page: 1,
        pageSize: filters.pageSize,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
    };
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-xs uppercase tracking-widest font-black text-indigo-600">Trust Layer</p>
                    <h1 className="text-3xl font-black text-slate-900">Ethereum Anchors</h1>
                </div>
                <button
                    onClick={() => {
                        healthQuery.refetch();
                        anchorsQuery.refetch();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold"
                >
                    <RefreshCcw className={`w-4 h-4 ${(healthQuery.isFetching || anchorsQuery.isFetching) ? 'animate-spin' : ''}`} /> Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">Confirmed</p>
                    <p className="text-2xl font-black text-emerald-600 mt-1">{totals.CONFIRMED || 0}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">Pending</p>
                    <p className="text-2xl font-black text-amber-600 mt-1">{totals.PENDING || 0}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">Failed</p>
                    <p className="text-2xl font-black text-rose-600 mt-1">{totals.FAILED || 0}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Flags</p>
                        <p className="text-sm font-bold text-slate-700 mt-1">Blockchain: {String(healthQuery.data?.feature?.blockchainEnabled || false)}</p>
                        <p className="text-sm font-bold text-slate-700">Ethereum: {String(healthQuery.data?.feature?.ethereumEnabled || false)}</p>
                    </div>
                    {(healthQuery.data?.feature?.blockchainEnabled && healthQuery.data?.feature?.ethereumEnabled)
                        ? <ShieldCheck className="w-7 h-7 text-emerald-500" />
                        : <ShieldAlert className="w-7 h-7 text-amber-500" />}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">Total Anchors</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{metrics.totalAnchors || 0}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">Success Rate</p>
                    <p className="text-2xl font-black text-indigo-600 mt-1">{metrics.successRate || 0}%</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">Failed in 24h</p>
                    <p className="text-2xl font-black text-rose-600 mt-1">{metrics.failedLast24h || 0}</p>
                    <p className="text-xs text-slate-500 mt-2">Last anchor: {fmtDate(metrics.lastAnchorAt)}</p>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-end gap-3">
                <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Entity Type</label>
                    <input
                        value={filters.entityType}
                        onChange={(e) => setFilters((p) => ({ ...p, entityType: e.target.value, page: 1 }))}
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                        placeholder="invoice"
                    />
                </div>
                <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Entity Id</label>
                    <input
                        value={filters.entityId}
                        onChange={(e) => setFilters((p) => ({ ...p, entityId: e.target.value, page: 1 }))}
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                        placeholder="uuid"
                    />
                </div>
                <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Status</label>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value, page: 1 }))}
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                    >
                        {statusOptions.map((option) => (
                            <option key={option || 'ALL'} value={option}>
                                {option || 'ALL'}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Limit</label>
                    <input
                        type="number"
                        min="1"
                        max="100"
                        value={filters.pageSize}
                        onChange={(e) => setFilters((p) => ({ ...p, pageSize: Number(e.target.value || 30), page: 1 }))}
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold w-24"
                    />
                </div>
                <button
                    onClick={() => setFilters((p) => ({ ...p, page: 1 }))}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-black"
                >
                    Apply Filters
                </button>
                <button
                    onClick={onRetryFailed}
                    disabled={isRetrying}
                    className="px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-black disabled:opacity-50"
                >
                    {isRetrying ? 'Retrying...' : 'Retry Failed Queue'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-4">
                    <h2 className="text-lg font-black text-slate-900">Create Anchor</h2>
                    <p className="text-xs text-slate-500 mt-1">Create a hash anchor for any entity payload.</p>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Entity Type</label>
                            <input
                                value={createForm.entityType}
                                onChange={(e) => setCreateForm((p) => ({ ...p, entityType: e.target.value }))}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                                placeholder="invoice"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Entity Id</label>
                            <input
                                value={createForm.entityId}
                                onChange={(e) => setCreateForm((p) => ({ ...p, entityId: e.target.value }))}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                                placeholder="INV-1042"
                            />
                        </div>
                    </div>

                    <div className="mt-3">
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Payload (JSON)</label>
                        <textarea
                            rows={7}
                            value={createForm.payloadText}
                            onChange={(e) => setCreateForm((p) => ({ ...p, payloadText: e.target.value }))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono text-slate-700"
                        />
                    </div>

                    <button
                        onClick={onCreateAnchor}
                        disabled={isCreating}
                        className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-black disabled:opacity-50"
                    >
                        {isCreating ? 'Anchoring...' : 'Create Anchor'}
                    </button>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4">
                    <h2 className="text-lg font-black text-slate-900">Verify Entity</h2>
                    <p className="text-xs text-slate-500 mt-1">Verify the latest on-chain anchor for an entity.</p>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Entity Type</label>
                            <input
                                value={verifyForm.entityType}
                                onChange={(e) => setVerifyForm((p) => ({ ...p, entityType: e.target.value }))}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                                placeholder="invoice"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Entity Id</label>
                            <input
                                value={verifyForm.entityId}
                                onChange={(e) => setVerifyForm((p) => ({ ...p, entityId: e.target.value }))}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                                placeholder="INV-1042"
                            />
                        </div>
                    </div>

                    <button
                        onClick={onVerifyEntity}
                        disabled={isVerifyingEntity}
                        className="mt-3 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-black disabled:opacity-50"
                    >
                        {isVerifyingEntity ? 'Verifying...' : 'Verify Entity'}
                    </button>

                    {verifyEntityResult && (
                        <div className={`mt-4 rounded-xl border p-3 ${verifyEntityResult.valid ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
                            <p className="text-sm font-black text-slate-800">Result: {verifyEntityResult.valid ? 'Valid' : 'Not valid'}</p>
                            <p className="text-sm text-slate-600 mt-1">{verifyEntityResult.reason}</p>
                            {verifyEntityResult.anchor?.tx_hash && (
                                <p className="text-xs text-slate-500 mt-2 font-mono">Tx: {verifyEntityResult.anchor.tx_hash}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 text-left">Entity</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Tx Hash</th>
                            <th className="px-4 py-3 text-left">Created</th>
                            <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {anchorsQuery.isLoading ? (
                            <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-500">Loading anchors...</td></tr>
                        ) : anchors.length === 0 ? (
                            <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-500">No anchors found.</td></tr>
                        ) : (
                            anchors.map((row) => (
                                <tr key={row.id} className="border-t border-slate-100">
                                    <td className="px-4 py-3">
                                        <div className="font-bold text-slate-900">{row.entity_type}</div>
                                        <div className="text-xs text-slate-500">{row.entity_id}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-black ${statusBadge(row.status)}`}>
                                            {row.status === 'CONFIRMED' ? <CheckCircle2 className="w-3 h-3" /> : <Clock3 className="w-3 h-3" />}
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs font-mono text-slate-600">{row.tx_hash || '-'}</td>
                                    <td className="px-4 py-3 text-slate-600">{fmtDate(row.created_at)}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => onVerify(row.id)}
                                            className="px-3 py-1.5 text-xs font-black rounded-lg bg-slate-900 text-white"
                                        >
                                            Verify
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                <div className="border-t border-slate-200 px-4 py-3 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-slate-500">
                        Page {pagination.page} of {pagination.totalPages} | Total {pagination.total}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setFilters((p) => ({ ...p, page: Math.max(p.page - 1, 1) }))}
                            disabled={!pagination.hasPreviousPage || anchorsQuery.isFetching}
                            className="px-3 py-1.5 text-xs font-black rounded-lg border border-slate-300 text-slate-700 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
                            disabled={!pagination.hasNextPage || anchorsQuery.isFetching}
                            className="px-3 py-1.5 text-xs font-black rounded-lg bg-slate-900 text-white disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Blockchain;
