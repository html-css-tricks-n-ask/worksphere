import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  CalendarDays, CheckCircle2, XCircle, Plus, FileText,
  Briefcase, Heart, Baby, Home, AlertCircle, Filter,
} from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card.js';
import { Button } from '../components/ui/button.js';

// ─── Types ─────────────────────────────────────────────────────────────────
interface LeaveBalance {
  casual: { quota: number; used: number; remaining: number };
  sick: { quota: number; used: number; remaining: number };
  paid: { quota: number; used: number; remaining: number };
  wfh: { quota: number; used: number; remaining: number };
}

interface LeaveRequest {
  _id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  createdAt: string;
  approvedBy?: { firstName: string; lastName: string };
  approvedAt?: string;
}

interface AllLeave {
  _id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: string;
  employeeId: { firstName: string; lastName: string; employeeId: string };
}

// ─── Leave type meta ────────────────────────────────────────────────────────
const leaveTypes = [
  'Casual Leave', 'Sick Leave', 'Paid Leave', 'Earned Leave',
  'Maternity Leave', 'Paternity Leave', 'Work From Home',
];

const leaveTypeIcon: Record<string, React.ReactNode> = {
  'Casual Leave': <Briefcase size={16} />,
  'Sick Leave': <Heart size={16} />,
  'Paid Leave': <CheckCircle2 size={16} />,
  'Earned Leave': <CheckCircle2 size={16} />,
  'Maternity Leave': <Baby size={16} />,
  'Paternity Leave': <Baby size={16} />,
  'Work From Home': <Home size={16} />,
};

const statusColor: Record<string, string> = {
  Pending: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
  Approved: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
  Rejected: 'bg-rose-500/15 text-rose-600 border-rose-500/30',
  Cancelled: 'bg-slate-500/15 text-slate-500 border-slate-500/30',
};

// ─── Apply Leave Modal ──────────────────────────────────────────────────────
const ApplyLeaveModal: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    leaveType: 'Casual Leave',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (data: typeof form) => axiosInstance.post('/leaves', {
      ...data,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
    }),
    onSuccess: () => {
      onSuccess();
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to submit leave request.');
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card border border-border/60 rounded-2xl shadow-2xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border/40">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <CalendarDays size={20} className="text-indigo-500" />
            Apply for Leave
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Submit a new leave request for manager review</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Leave Type</label>
            <select
              value={form.leaveType}
              onChange={e => setForm(f => ({ ...f, leaveType: e.target.value }))}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              {leaveTypes.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium block mb-1.5">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Reason</label>
            <textarea
              rows={3}
              value={form.reason}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              placeholder="Briefly describe the reason for your leave..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
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
            disabled={mutation.isPending || !form.startDate || !form.endDate || !form.reason}
            className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white"
          >
            {mutation.isPending ? 'Submitting…' : 'Submit Request'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
const Leave: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  // My leaves and balances
  const { data: myData } = useQuery<{ data: { leaves: LeaveRequest[]; balances: LeaveBalance } }>({
    queryKey: ['my-leaves'],
    queryFn: () => axiosInstance.get('/leaves/me').then(r => r.data),
  });

  // All leaves (admin/HR)
  const { data: allData } = useQuery<{ data: { leaves: AllLeave[] } }>({
    queryKey: ['all-leaves', filterStatus],
    queryFn: () => axiosInstance.get(`/leaves?limit=50${filterStatus ? `&status=${filterStatus}` : ''}`).then(r => r.data),
    enabled: activeTab === 'all',
  });

  // Approve / Reject mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      axiosInstance.put(`/leaves/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-leaves'] });
      queryClient.invalidateQueries({ queryKey: ['my-leaves'] });
    },
  });

  const balances = myData?.data?.balances;
  const myLeaves = myData?.data?.leaves || [];

  const balanceCards = [
    { key: 'casual', label: 'Casual Leave', color: 'indigo', icon: <Briefcase size={16} /> },
    { key: 'sick', label: 'Sick Leave', color: 'rose', icon: <Heart size={16} /> },
    { key: 'paid', label: 'Paid Leave', color: 'emerald', icon: <CheckCircle2 size={16} /> },
    { key: 'wfh', label: 'Work From Home', color: 'violet', icon: <Home size={16} /> },
  ] as const;

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarDays className="text-violet-500" size={24} />
            Leave Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Apply, track, and approve leave requests</p>
        </div>
        <Button
          onClick={() => setShowApplyModal(true)}
          className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/20 gap-2"
        >
          <Plus size={16} />
          Apply for Leave
        </Button>
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <ApplyLeaveModal
          onClose={() => setShowApplyModal(false)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['my-leaves'] })}
        />
      )}

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-muted/40 p-1 rounded-xl w-fit border border-border/50">
        {([['my', '📋 My Leaves'], ['all', '👥 All Requests']] as const).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab
                ? 'bg-white dark:bg-card shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── MY LEAVES TAB ── */}
      {activeTab === 'my' && (
        <div className="space-y-6">
          {/* Balance Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {balanceCards.map(({ key, label, color, icon }) => {
              const bal = balances?.[key];
              const pct = bal ? Math.round((bal.used / bal.quota) * 100) : 0;
              return (
                <Card key={key} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-${color}-500`}>{icon}</span>
                      <span className="text-xs text-muted-foreground">{bal?.quota ?? 0} days/yr</span>
                    </div>
                    <p className="text-2xl font-bold">{bal?.remaining ?? 0}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{label} remaining</p>
                    <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-${color}-500 rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{bal?.used ?? 0} used · {pct}%</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* My Requests List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText size={18} className="text-violet-500" />
                My Leave Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {myLeaves.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">
                  <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No leave requests yet</p>
                  <p className="text-sm mt-1">Apply for a leave to see it here</p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {myLeaves.map(leave => (
                    <div key={leave._id} className="flex items-start justify-between p-4 hover:bg-muted/20 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-violet-500/10 text-violet-600 rounded-xl mt-0.5">
                          {leaveTypeIcon[leave.leaveType] || <CalendarDays size={16} />}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{leave.leaveType}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {format(new Date(leave.startDate), 'dd MMM')} – {format(new Date(leave.endDate), 'dd MMM yyyy')}
                            <span className="ml-2 font-medium text-foreground">{leave.totalDays} day{leave.totalDays !== 1 ? 's' : ''}</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{leave.reason}</p>
                          {leave.approvedBy && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {leave.status === 'Approved' ? '✓ Approved' : '✗ Rejected'} by {leave.approvedBy.firstName} {leave.approvedBy.lastName}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColor[leave.status]}`}>
                        {leave.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── ALL LEAVES TAB ── */}
      {activeTab === 'all' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="text-base">All Leave Requests</CardTitle>
                <CardDescription>Review and act on team leave applications</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Filter size={15} className="text-muted-foreground" />
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value="">All Statuses</option>
                  <option>Pending</option>
                  <option>Approved</option>
                  <option>Rejected</option>
                  <option>Cancelled</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Employee</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Leave Type</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Period</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Days</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(allData?.data?.leaves || []).map(leave => (
                    <tr key={leave._id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-medium">{leave.employeeId?.firstName} {leave.employeeId?.lastName}</p>
                        <p className="text-xs text-muted-foreground">{leave.employeeId?.employeeId}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          {leaveTypeIcon[leave.leaveType] || <CalendarDays size={14} />}
                          <span className="text-foreground">{leave.leaveType}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">
                        {format(new Date(leave.startDate), 'dd MMM')} – {format(new Date(leave.endDate), 'dd MMM yyyy')}
                      </td>
                      <td className="py-3 px-4 font-semibold">{leave.totalDays}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColor[leave.status]}`}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {leave.status === 'Pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => statusMutation.mutate({ id: leave._id, status: 'Approved' })}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 text-xs font-medium hover:bg-emerald-500/20 transition-colors border border-emerald-500/30"
                            >
                              <CheckCircle2 size={12} /> Approve
                            </button>
                            <button
                              onClick={() => statusMutation.mutate({ id: leave._id, status: 'Rejected' })}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 text-xs font-medium hover:bg-rose-500/20 transition-colors border border-rose-500/30"
                            >
                              <XCircle size={12} /> Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!allData?.data?.leaves?.length && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-muted-foreground">No leave requests found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Leave;
