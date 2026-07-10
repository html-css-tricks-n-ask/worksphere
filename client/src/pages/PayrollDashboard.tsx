import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CreditCard, DollarSign, Wallet, TrendingUp,
  Layers, ShieldAlert, FileText
} from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card.js';

interface PayrollStats {
  processedCount: number;
  pendingCount: number;
  totalPaidSalary: number;
  totalDeductions: number;
  totalBonuses: number;
}

interface TrendItem {
  month: string;
  cost: number;
}

const PayrollDashboard: React.FC = () => {
  const { data } = useQuery<{ data: { stats: PayrollStats; trends: TrendItem[] } }>({
    queryKey: ['payroll-dashboard-stats'],
    queryFn: () => axiosInstance.get('/payroll/widgets').then(r => r.data),
  });

  const stats = data?.data?.stats;
  const trends = data?.data?.trends || [];

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CreditCard className="text-indigo-500" size={24} />
            Payroll & Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor organizational salaries costs, allowances, and revisions trends
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Salary Paid', value: `$${(stats?.totalPaidSalary || 0).toLocaleString()}`, desc: 'Across completed cycles', icon: <DollarSign size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
          { label: 'Bonuses Paid', value: `$${(stats?.totalBonuses || 0).toLocaleString()}`, desc: 'Incentives & rewards', icon: <SparklesIcon />, color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
          { label: 'Total Deductions', value: `$${(stats?.totalDeductions || 0).toLocaleString()}`, desc: 'Taxes, PF, ESI, leaves', icon: <ShieldAlert size={20} />, color: 'text-rose-600', bg: 'bg-rose-500/10' },
          { label: 'Processed Runs', value: stats?.processedCount || 0, desc: 'Completed and locked', icon: <Wallet size={20} />, color: 'text-blue-600', bg: 'bg-blue-500/10' },
          { label: 'Pending Runs', value: stats?.pendingCount || 0, desc: 'Drafts in progress', icon: <FileText size={20} />, color: 'text-amber-600', bg: 'bg-amber-500/10' },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className={`inline-flex p-2 rounded-xl ${stat.bg} mb-3`}>
                <span className={stat.color}>{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              <p className="text-[10px] text-muted-foreground/80 mt-1">{stat.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cost Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp size={18} className="text-indigo-500" />
              Monthly Salary Trend
            </CardTitle>
            <CardDescription>Organizational gross payouts history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4 h-48 pt-4">
              {trends.map(t => {
                const maxVal = Math.max(...trends.map(item => item.cost)) || 1;
                const percentHeight = Math.round((t.cost / maxVal) * 100);
                return (
                  <div key={t.month} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">${t.cost.toLocaleString()}</span>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-indigo-500 to-violet-500 transition-all duration-500"
                      style={{ height: `${(percentHeight / 100) * 120}px` }}
                    />
                    <span className="text-xs text-muted-foreground">{t.month}</span>
                  </div>
                );
              })}
              {trends.length === 0 && (
                <p className="w-full text-center text-sm text-muted-foreground py-16">No monthly cycles recorded yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cost breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Layers size={18} className="text-indigo-500" />
              Payroll Distribution
            </CardTitle>
            <CardDescription>Visual cost splits overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {[
              { label: 'Basic Salary Component', pct: 60, color: 'bg-indigo-500' },
              { label: 'House Rent Allowance (HRA)', pct: 18, color: 'bg-violet-500' },
              { label: 'Special & Travel Allowances', pct: 12, color: 'bg-emerald-500' },
              { label: 'Taxes & PF Deductions', pct: 10, color: 'bg-rose-500' },
            ].map(item => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span>{item.label}</span>
                  <span className="text-muted-foreground">{item.pct}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Simple inline sparkles svg wrapper
const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/><path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5Z"/><path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z"/></svg>
);

export default PayrollDashboard;
