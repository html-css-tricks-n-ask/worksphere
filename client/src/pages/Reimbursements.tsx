import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  DollarSign, Plus, AlertCircle, ShoppingBag, Trash2
} from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance.js';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.js';
import { Button } from '../components/ui/button.js';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store.js';

interface Employee {
  firstName: string;
  lastName: string;
  employeeId: string;
}

interface Reimbursement {
  _id: string;
  employeeId: Employee;
  title: string;
  amount: number;
  category: string;
  expenseDate: string;
  description?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Paid';
}

const SubmitClaimModal: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'Travel' as const,
    expenseDate: '',
    description: '',
  });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (data: any) =>
      axiosInstance.post('/reimbursements', {
        ...data,
        amount: parseFloat(data.amount) || 0,
        expenseDate: new Date(data.expenseDate).toISOString(),
      }),
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to submit claim.'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border/60 rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-border/40">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <DollarSign size={20} className="text-emerald-500" />
            Submit Expense Claim
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold block mb-1.5">Expense Title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Client Dinner, Taxi Fare"
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold block mb-1.5">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="0.00"
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as any }))}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
              >
                <option>Travel</option>
                <option>Food</option>
                <option>Internet</option>
                <option>Medical</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1.5">Expense Date</label>
            <input
              type="date"
              value={form.expenseDate}
              onChange={e => setForm(f => ({ ...f, expenseDate: e.target.value }))}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1.5">Description / Remarks</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Brief details about the expense..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-600 text-sm bg-rose-500/10 px-3 py-2 rounded-lg">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border/40 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending || !form.title || !form.amount || !form.expenseDate}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {mutation.isPending ? 'Submitting…' : 'Submit Claim'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const Reimbursements: React.FC = () => {
  const queryClient = useQueryClient();
  const user = useSelector((state: RootState) => state.auth.user);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const { data } = useQuery<{ data: { claims: Reimbursement[] } }>({
    queryKey: ['reimbursements', statusFilter],
    queryFn: () =>
      axiosInstance
        .get(`/reimbursements?status=${statusFilter}&limit=100`)
        .then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axiosInstance.delete(`/reimbursements/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reimbursements'] }),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, status, role }: { id: string; status: string; role: string }) =>
      axiosInstance.put(`/reimbursements/${id}/approve`, { status, role }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reimbursements'] }),
  });

  const list = data?.data?.claims || [];

  return (
    <div className="space-y-6 p-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reimbursements</h1>
          <p className="text-sm text-muted-foreground mt-1">Submit receipts and claim business expenses</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
          <Plus size={16} /> Submit Claim
        </Button>
      </div>

      {showModal && (
        <SubmitClaimModal
          onClose={() => setShowModal(false)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['reimbursements'] })}
        />
      )}

      {/* Filter and Feed */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingBag size={18} className="text-emerald-500" />
              Expense Claims Matrix
            </CardTitle>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-border bg-background text-sm"
            >
              <option value="">All Statuses</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
              <option>Paid</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Employee</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Expense Title</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map(claim => (
                  <tr key={claim._id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold">{claim.employeeId?.firstName} {claim.employeeId?.lastName}</p>
                      <p className="text-xs text-muted-foreground">{claim.employeeId?.employeeId}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-foreground">{claim.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{claim.description || '—'}</p>
                    </td>
                    <td className="py-3 px-4 font-bold text-foreground">${claim.amount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-xs font-semibold text-muted-foreground">{claim.category}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {format(new Date(claim.expenseDate), 'dd MMM yyyy')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        claim.status === 'Approved' || claim.status === 'Paid'
                          ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                          : claim.status === 'Rejected'
                          ? 'bg-rose-500/15 text-rose-600 border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-600 border-amber-500/30'
                      }`}>
                        {claim.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {user?.role !== 'Employee' && claim.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => approveMutation.mutate({ id: claim._id, status: 'Approved', role: user?.role === 'HR' ? 'HR' : 'Manager' })}
                              className="px-2 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 rounded text-xs font-medium"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => approveMutation.mutate({ id: claim._id, status: 'Rejected', role: user?.role === 'HR' ? 'HR' : 'Manager' })}
                              className="px-2 py-1 bg-rose-500/10 text-rose-600 border border-rose-500/30 rounded text-xs font-medium"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {claim.status === 'Pending' && (
                          <button
                            onClick={() => deleteMutation.mutate(claim._id)}
                            className="p-1 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">No expense claims recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reimbursements;
