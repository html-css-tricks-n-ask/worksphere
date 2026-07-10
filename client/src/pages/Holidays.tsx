import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar, Plus, Trash2, Globe, Building2, Star, Upload, AlertCircle } from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card.js';
import { Button } from '../components/ui/button.js';

// ─── Types ─────────────────────────────────────────────────────────────────
interface Holiday {
  _id: string;
  name: string;
  date: string;
  type: 'National' | 'Company' | 'Optional';
}

const typeStyles: Record<string, { color: string; icon: React.ReactNode; bg: string }> = {
  National: { color: 'text-emerald-600', bg: 'bg-emerald-500/10 border-emerald-500/30', icon: <Globe size={14} /> },
  Company: { color: 'text-indigo-600', bg: 'bg-indigo-500/10 border-indigo-500/30', icon: <Building2 size={14} /> },
  Optional: { color: 'text-amber-600', bg: 'bg-amber-500/10 border-amber-500/30', icon: <Star size={14} /> },
};

// ─── Add Holiday Modal ──────────────────────────────────────────────────────
const AddHolidayModal: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({ name: '', date: '', type: 'Company' as const });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (data: typeof form) =>
      axiosInstance.post('/holidays', { ...data, date: new Date(data.date).toISOString() }),
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to create holiday.'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border/60 rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-border/40">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Calendar size={20} className="text-emerald-500" />
            Add Holiday
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Holiday Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Republic Day"
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Type</label>
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option>National</option>
              <option>Company</option>
              <option>Optional</option>
            </select>
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
            disabled={mutation.isPending || !form.name || !form.date}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
          >
            {mutation.isPending ? 'Adding…' : 'Add Holiday'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
const Holidays: React.FC = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filterType, setFilterType] = useState('');
  const [activeView, setActiveView] = useState<'list' | 'calendar'>('calendar');

  const { data, isLoading } = useQuery<{ data: { holidays: Holiday[] } }>({
    queryKey: ['holidays', selectedYear],
    queryFn: () => axiosInstance.get(`/holidays?year=${selectedYear}&limit=100`).then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axiosInstance.delete(`/holidays/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['holidays'] }),
  });

  const holidays = (data?.data?.holidays || []).filter(h => !filterType || h.type === filterType);

  // Build calendar grid — group by month
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const holidaysByMonth: Record<number, Holiday[]> = {};
  holidays.forEach(h => {
    const m = new Date(h.date).getMonth();
    if (!holidaysByMonth[m]) holidaysByMonth[m] = [];
    holidaysByMonth[m].push(h);
  });

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Calendar className="text-emerald-500" size={24} />
            Holiday Calendar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage national and company holidays</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Button variant="outline" className="gap-2 text-sm">
            <Upload size={15} />
            Import CSV
          </Button>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20 gap-2"
          >
            <Plus size={16} />
            Add Holiday
          </Button>
        </div>
      </div>

      {showModal && (
        <AddHolidayModal
          onClose={() => setShowModal(false)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['holidays'] })}
        />
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-muted/40 p-1 rounded-xl border border-border/50">
          {(['calendar', 'list'] as const).map(view => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all duration-200 ${
                activeView === view ? 'bg-white dark:bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {view === 'calendar' ? '🗓 Calendar' : '📋 List'}
            </button>
          ))}
        </div>

        <select
          value={selectedYear}
          onChange={e => setSelectedYear(parseInt(e.target.value))}
          className="h-9 px-3 rounded-lg border border-border bg-background text-sm"
        >
          {[2024, 2025, 2026, 2027].map(y => <option key={y}>{y}</option>)}
        </select>

        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-background text-sm"
        >
          <option value="">All Types</option>
          <option>National</option>
          <option>Company</option>
          <option>Optional</option>
        </select>

        <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
          {Object.entries(typeStyles).map(([type, meta]) => (
            <div key={type} className="flex items-center gap-1.5">
              <span className={meta.color}>{meta.icon}</span>
              {type}
            </div>
          ))}
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'National', color: 'emerald', icon: <Globe size={18} /> },
          { label: 'Company', color: 'indigo', icon: <Building2 size={18} /> },
          { label: 'Optional', color: 'amber', icon: <Star size={18} /> },
        ].map(({ label, color, icon }) => {
          const count = (data?.data?.holidays || []).filter(h => h.type === label).length;
          return (
            <Card key={label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 bg-${color}-500/10 text-${color}-500 rounded-xl`}>{icon}</div>
                <div>
                  <p className="text-xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">{label} Holidays</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Calendar View */}
      {activeView === 'calendar' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {monthNames.map((month, idx) => {
            const mHolidays = holidaysByMonth[idx] || [];
            return (
              <Card key={month} className={`transition-all ${mHolidays.length > 0 ? 'border-indigo-500/20' : ''}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    {month} {selectedYear}
                    {mHolidays.length > 0 && (
                      <span className="text-xs font-medium bg-indigo-500/10 text-indigo-600 px-2 py-0.5 rounded-full">
                        {mHolidays.length}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {mHolidays.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2">No holidays this month</p>
                  ) : (
                    <div className="space-y-2">
                      {mHolidays.map(h => {
                        const meta = typeStyles[h.type];
                        return (
                          <div key={h._id} className="group flex items-center gap-2">
                            <div className={`flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-xs ${meta.bg}`}>
                              <span className={meta.color}>{meta.icon}</span>
                              <span className="font-medium flex-1 line-clamp-1">{h.name}</span>
                              <span className="text-muted-foreground shrink-0">{format(new Date(h.date), 'dd')}</span>
                            </div>
                            <button
                              onClick={() => deleteMutation.mutate(h._id)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-500 text-muted-foreground transition-all rounded"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* List View */}
      {activeView === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Holidays — {selectedYear}</CardTitle>
            <CardDescription>{holidays.length} holidays configured</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-16 text-center text-muted-foreground">Loading holidays…</div>
            ) : holidays.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                <Calendar size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No holidays found</p>
                <p className="text-sm mt-1">Click "Add Holiday" to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Day</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holidays.map(h => {
                      const meta = typeStyles[h.type];
                      return (
                        <tr key={h._id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-4 font-medium">{h.name}</td>
                          <td className="py-3 px-4">{format(new Date(h.date), 'dd MMMM yyyy')}</td>
                          <td className="py-3 px-4 text-muted-foreground">{format(new Date(h.date), 'EEEE')}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.bg} ${meta.color}`}>
                              {meta.icon} {h.type}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => deleteMutation.mutate(h._id)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Holidays;
