import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Timer, Plus, Trash2, Pencil, Check, X, AlertCircle } from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card.js';
import { Button } from '../components/ui/button.js';

// ─── Types ─────────────────────────────────────────────────────────────────
interface Shift {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  gracePeriod: number;
  breakTime: number;
  workingHours: number;
}

// ─── Shift Form Modal ───────────────────────────────────────────────────────
const ShiftModal: React.FC<{
  shift?: Shift;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ shift, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: shift?.name || '',
    startTime: shift?.startTime || '09:00',
    endTime: shift?.endTime || '18:00',
    gracePeriod: shift?.gracePeriod ?? 15,
    breakTime: shift?.breakTime ?? 60,
    workingHours: shift?.workingHours ?? 8,
  });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (data: typeof form) =>
      shift
        ? axiosInstance.put(`/shifts/${shift._id}`, data)
        : axiosInstance.post('/shifts', data),
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to save shift.'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border/60 rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-border/40">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Timer size={20} className="text-blue-500" />
            {shift ? 'Edit Shift' : 'Create New Shift'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {shift ? 'Update shift schedule configuration' : 'Define a new work schedule'}
          </p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Shift Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Morning Shift"
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium block mb-1.5">Start Time</label>
              <input
                type="time"
                value={form.startTime}
                onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">End Time</label>
              <input
                type="time"
                value={form.endTime}
                onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium block mb-1.5">Working Hours</label>
              <input
                type="number"
                min={1}
                max={24}
                value={form.workingHours}
                onChange={e => setForm(f => ({ ...f, workingHours: parseFloat(e.target.value) }))}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Grace Period (min)</label>
              <input
                type="number"
                min={0}
                max={60}
                value={form.gracePeriod}
                onChange={e => setForm(f => ({ ...f, gracePeriod: parseInt(e.target.value) }))}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Break Time (min)</label>
              <input
                type="number"
                min={0}
                max={120}
                value={form.breakTime}
                onChange={e => setForm(f => ({ ...f, breakTime: parseInt(e.target.value) }))}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
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
            disabled={mutation.isPending || !form.name}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
          >
            {mutation.isPending ? 'Saving…' : shift ? 'Update Shift' : 'Create Shift'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Shift Card ─────────────────────────────────────────────────────────────
const ShiftCard: React.FC<{
  shift: Shift;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ shift, onEdit, onDelete }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Determine shift period label
  const hour = parseInt(shift.startTime.split(':')[0]);
  const label = hour < 12 ? 'Morning' : hour < 17 ? 'Day' : 'Evening/Night';
  const labelColor = hour < 12 ? 'text-amber-600 bg-amber-500/10'
    : hour < 17 ? 'text-blue-600 bg-blue-500/10'
    : 'text-violet-600 bg-violet-500/10';

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border-2 hover:border-blue-500/20">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
              <Timer size={22} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">{shift.name}</h3>
              <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${labelColor}`}>
                {label} Shift
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg hover:bg-blue-500/10 hover:text-blue-600 text-muted-foreground transition-colors"
            >
              <Pencil size={14} />
            </button>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-1.5 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 text-muted-foreground transition-colors"
              >
                <Trash2 size={14} />
              </button>
            ) : (
              <div className="flex gap-1">
                <button onClick={onDelete} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-colors">
                  <Check size={14} />
                </button>
                <button onClick={() => setConfirmDelete(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Time block */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 bg-muted/40 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-0.5">Start</p>
            <p className="text-lg font-bold tabular-nums">{shift.startTime}</p>
          </div>
          <div className="text-muted-foreground text-xl font-light">→</div>
          <div className="flex-1 bg-muted/40 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-0.5">End</p>
            <p className="text-lg font-bold tabular-nums">{shift.endTime}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-blue-500/5 rounded-lg p-2">
            <p className="text-xs text-muted-foreground">Hours</p>
            <p className="text-sm font-bold text-blue-600">{shift.workingHours}h</p>
          </div>
          <div className="bg-amber-500/5 rounded-lg p-2">
            <p className="text-xs text-muted-foreground">Grace</p>
            <p className="text-sm font-bold text-amber-600">{shift.gracePeriod}m</p>
          </div>
          <div className="bg-violet-500/5 rounded-lg p-2">
            <p className="text-xs text-muted-foreground">Break</p>
            <p className="text-sm font-bold text-violet-600">{shift.breakTime}m</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
const Shifts: React.FC = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editShift, setEditShift] = useState<Shift | null>(null);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery<{ data: { shifts: Shift[] } }>({
    queryKey: ['shifts'],
    queryFn: () => axiosInstance.get('/shifts?limit=50').then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axiosInstance.delete(`/shifts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shifts'] }),
  });

  const shifts = (data?.data?.shifts || []).filter(
    s => !search || s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Timer className="text-blue-500" size={24} />
            Shift Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Configure and manage work schedule templates</p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-500/20 gap-2"
        >
          <Plus size={16} />
          Create Shift
        </Button>
      </div>

      {/* Modals */}
      {showModal && (
        <ShiftModal
          onClose={() => setShowModal(false)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['shifts'] })}
        />
      )}
      {editShift && (
        <ShiftModal
          shift={editShift}
          onClose={() => setEditShift(null)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['shifts'] })}
        />
      )}

      {/* Search */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search shifts…"
          className="h-10 px-4 rounded-xl border border-border bg-background text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />
        <p className="text-sm text-muted-foreground">{shifts.length} shift{shifts.length !== 1 ? 's' : ''} configured</p>
      </div>

      {/* Shifts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-5 h-48" />
            </Card>
          ))}
        </div>
      ) : shifts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-20 text-center">
            <Timer size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-semibold text-lg">No shifts configured</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Create your first shift to assign employees to work schedules</p>
            <Button onClick={() => setShowModal(true)} className="gap-2">
              <Plus size={15} /> Create First Shift
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {shifts.map(shift => (
            <ShiftCard
              key={shift._id}
              shift={shift}
              onEdit={() => setEditShift(shift)}
              onDelete={() => deleteMutation.mutate(shift._id)}
            />
          ))}
        </div>
      )}

      {/* Summary card */}
      {shifts.length > 0 && (
        <Card className="bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-base">Shifts Overview</CardTitle>
            <CardDescription>Summary of all configured work schedules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Timing</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Hours</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Grace</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Break</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.map(s => (
                    <tr key={s._id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="py-2.5 px-3 font-medium">{s.name}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{s.startTime} – {s.endTime}</td>
                      <td className="py-2.5 px-3"><span className="font-semibold text-blue-600">{s.workingHours}h</span></td>
                      <td className="py-2.5 px-3 text-muted-foreground">{s.gracePeriod} min</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{s.breakTime} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Shifts;
