import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Lock, Download, Mail, CheckCircle2,
  Loader2, Play
} from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card.js';
import { Button } from '../components/ui/button.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1';

interface Employee {
  firstName: string;
  lastName: string;
  employeeId: string;
  email: string;
}

interface PayrollRecord {
  _id: string;
  employeeId: Employee;
  month: string;
  basicSalary: number;
  totalEarnings: number;
  totalDeductions: number;
  netSalary: number;
  paidDays: number;
  status: 'Draft' | 'Processing' | 'Completed' | 'Locked';
}

const PayrollList: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [statusFilter, setStatusFilter] = useState('');

  const { data } = useQuery<{ data: { payrolls: PayrollRecord[] } }>({
    queryKey: ['payroll-list', selectedMonth, statusFilter],
    queryFn: () =>
      axiosInstance
        .get(`/payroll?month=${selectedMonth}${statusFilter ? `&status=${statusFilter}` : ''}&limit=100`)
        .then(r => r.data),
  });

  // Process / generate mutation
  const processMutation = useMutation({
    mutationFn: () => axiosInstance.post('/payroll/process', { month: selectedMonth }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-list'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-dashboard-stats'] });
    },
  });

  // Lock status update mutation
  const lockMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      axiosInstance.put(`/payroll/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payroll-list'] }),
  });

  // Email payslip dispatch
  const emailMutation = useMutation({
    mutationFn: (id: string) => axiosInstance.post(`/payroll/${id}/email`),
  });

  const list = data?.data?.payrolls || [];

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payroll Processing</h1>
          <p className="text-sm text-muted-foreground mt-1">Review, compute, lock, and dispatch monthly salary slips</p>
        </div>
        <div className="flex gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
          />
          <Button
            onClick={() => processMutation.mutate()}
            disabled={processMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg gap-2"
          >
            {processMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play size={16} />
            )}
            {processMutation.isPending ? 'Processing…' : 'Compute Monthly Run'}
          </Button>
        </div>
      </div>

      {processMutation.isSuccess && (
        <div className="flex items-center gap-2 text-emerald-600 text-sm bg-emerald-500/10 px-4 py-3 rounded-xl border border-emerald-500/20">
          <CheckCircle2 size={16} />
          Computed {processMutation.data?.data?.length || 0} employee payroll drafts successfully!
        </div>
      )}

      {/* Grid records */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-base">Monthly Salary Records – {selectedMonth}</CardTitle>
              <CardDescription>Verify payout statements before locking</CardDescription>
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-border bg-background text-sm"
            >
              <option value="">All Statuses</option>
              <option>Draft</option>
              <option>Completed</option>
              <option>Locked</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Employee</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Days</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Gross Earnings</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Deductions</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Net Payout</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map(r => (
                  <tr key={r._id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold">{r.employeeId?.firstName} {r.employeeId?.lastName}</p>
                      <p className="text-xs text-muted-foreground">{r.employeeId?.employeeId}</p>
                    </td>
                    <td className="py-3 px-4 font-semibold">{r.paidDays} d</td>
                    <td className="py-3 px-4 text-emerald-600 font-semibold">+${r.totalEarnings.toLocaleString()}</td>
                    <td className="py-3 px-4 text-rose-600 font-semibold">-${r.totalDeductions.toLocaleString()}</td>
                    <td className="py-3 px-4 font-bold text-indigo-600">${r.netSalary.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${
                        r.status === 'Locked'
                          ? 'bg-rose-500/15 text-rose-600 border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-600 border-amber-500/30'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {r.status !== 'Locked' ? (
                          <button
                            onClick={() => lockMutation.mutate({ id: r._id, status: 'Locked' })}
                            className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded transition-colors"
                            title="Lock Payout"
                          >
                            <Lock size={14} />
                          </button>
                        ) : (
                          <span className="p-1.5 text-emerald-600 bg-emerald-500/10 rounded"><CheckCircle2 size={14} /></span>
                        )}
                        <a
                          href={`${API_BASE}/payroll/${r._id}/payslip`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-500/10 rounded transition-colors block"
                          title="Preview Payslip"
                        >
                          <Download size={14} />
                        </a>
                        <button
                          onClick={() => emailMutation.mutate(r._id)}
                          disabled={emailMutation.isPending}
                          className="p-1.5 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-500/10 rounded transition-colors"
                          title="Email Payslip"
                        >
                          <Mail size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">No payroll sheets created yet for this month.</td>
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

export default PayrollList;
