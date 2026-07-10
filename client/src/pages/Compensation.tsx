import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Plus, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance.js';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.js';
import { Button } from '../components/ui/button.js';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
}

interface CompensationRecord {
  _id: string;
  employeeId: Employee;
  type: string;
  amount: number;
  previousSalary: number;
  newSalary: number;
  effectiveDate: string;
  remarks?: string;
}

const AddRevisionModal: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    employeeId: '',
    type: 'Salary Revision' as const,
    amount: '',
    remarks: '',
  });
  const [error, setError] = useState('');

  const { data: empData } = useQuery<{ data: { employees: Employee[] } }>({
    queryKey: ['employees-options'],
    queryFn: () => axiosInstance.get('/employees?limit=200').then(r => r.data),
  });

  const mutation = useMutation({
    mutationFn: (data: any) =>
      axiosInstance.post('/compensation', {
        ...data,
        amount: parseFloat(data.amount) || 0,
      }),
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to submit revision.'),
  });

  const employees = empData?.data?.employees || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border/60 rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-border/40">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-500" />
            Create Salary Revision Log
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold block mb-1.5">Select Employee</label>
            <select
              value={form.employeeId}
              onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
            >
              <option value="">Choose employee...</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeId})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold block mb-1.5">Type</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
              >
                <option>Salary Revision</option>
                <option>Promotion Increment</option>
                <option>Bonus</option>
                <option>Incentive</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1.5">Increment Amount ($)</label>
              <input
                type="number"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="0.00"
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1.5">Remarks</label>
            <textarea
              rows={3}
              value={form.remarks}
              onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
              placeholder="e.g. Annual merit promotion increment..."
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
            disabled={mutation.isPending || !form.employeeId || !form.amount}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {mutation.isPending ? 'Logging…' : 'Log Revision'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const Compensation: React.FC = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const { data } = useQuery<{ data: { history: CompensationRecord[] } }>({
    queryKey: ['compensations-history'],
    queryFn: () => axiosInstance.get('/compensation?limit=100').then(r => r.data),
  });

  const list = data?.data?.history || [];

  return (
    <div className="space-y-6 p-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Compensation Timeline</h1>
          <p className="text-sm text-muted-foreground mt-1">Track career promotion increments and base salary adjustments</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
          <Plus size={16} /> Log Revision
        </Button>
      </div>

      {showModal && (
        <AddRevisionModal
          onClose={() => setShowModal(false)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['compensations-history'] })}
        />
      )}

      {/* Timeline view */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock size={18} className="text-indigo-500" />
            Revision Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="relative border-l border-border/60 ml-4 space-y-8 pb-4">
            {list.map(item => (
              <div key={item._id} className="relative pl-6">
                <div className="absolute -left-[6px] top-1.5 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-border/40 p-4 rounded-xl hover:bg-muted/10 transition-colors">
                  <div>
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                      {item.employeeId?.firstName} {item.employeeId?.lastName}
                      <span className="text-xs font-normal text-muted-foreground">({item.employeeId?.employeeId})</span>
                    </h3>
                    <p className="text-xs font-semibold text-indigo-600 mt-1">{item.type}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.remarks || '—'}</p>
                  </div>
                  <div className="text-right sm:border-l sm:pl-6 sm:border-border/40">
                    <p className="text-sm font-semibold text-emerald-600">+${item.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {format(new Date(item.effectiveDate), 'dd MMM yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {list.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-12 pl-0 border-0">No salary revisions recorded yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Compensation;
