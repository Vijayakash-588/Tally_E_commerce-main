import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Clock3, RefreshCcw, XCircle } from 'lucide-react';
import { approveRequest, getApprovalRequests, rejectRequest } from '../api/approvals';
import { useAuth } from '../context/AuthContext';

const Approvals = () => {
    const { hasRole } = useAuth();
    const [statusFilter, setStatusFilter] = useState('PENDING');

    const { data, isLoading, refetch, isFetching } = useQuery({
        queryKey: ['approvals', statusFilter],
        queryFn: () => getApprovalRequests({ status: statusFilter })
    });

    const rows = data?.data || [];

    const onApprove = async (id) => {
        try {
            await approveRequest(id);
            toast.success('Request approved');
            refetch();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Approve failed');
        }
    };

    const onReject = async (id) => {
        try {
            await rejectRequest(id);
            toast.success('Request rejected');
            refetch();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Reject failed');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-xs uppercase tracking-widest font-black text-blue-600">Governance</p>
                    <h1 className="text-3xl font-black text-slate-900">Approval Inbox</h1>
                </div>
                <button
                    onClick={() => refetch()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold"
                >
                    <RefreshCcw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Status</span>
                <select
                    className="px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    {['PENDING', 'APPROVED', 'REJECTED'].map((status) => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 text-left">Module/Action</th>
                            <th className="px-4 py-3 text-left">Reason</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-right">Created</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-500">Loading approvals...</td></tr>
                        ) : rows.length === 0 ? (
                            <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-500">No approval requests found.</td></tr>
                        ) : (
                            rows.map((row) => (
                                <tr key={row.id} className="border-t border-slate-100">
                                    <td className="px-4 py-3">
                                        <div className="font-bold text-slate-900">{row.module}</div>
                                        <div className="text-xs text-slate-400">{row.action}</div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-700">{row.reason || 'No reason specified'}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-black ${
                                            row.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                                            row.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                            {row.status === 'APPROVED' ? <CheckCircle2 className="w-3 h-3" /> :
                                                row.status === 'REJECTED' ? <XCircle className="w-3 h-3" /> :
                                                    <Clock3 className="w-3 h-3" />}
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-500">{new Date(row.created_at).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right">
                                        {row.status === 'PENDING' && hasRole('admin') ? (
                                            <div className="inline-flex gap-2">
                                                <button onClick={() => onApprove(row.id)} className="px-3 py-1.5 text-xs font-black rounded-lg bg-emerald-600 text-white">Approve</button>
                                                <button onClick={() => onReject(row.id)} className="px-3 py-1.5 text-xs font-black rounded-lg bg-rose-600 text-white">Reject</button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Approvals;
