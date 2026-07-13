 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CreditCard, DollarSign, Wallet, TrendingUp,
  Layers, ShieldAlert, FileText
} from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';














const PayrollDashboard = () => {
  const { data } = useQuery({
    queryKey: ['payroll-dashboard-stats'],
    queryFn: () => axiosInstance.get('/payroll/widgets').then(r => r.data),
  });

  const stats = _optionalChain([data, 'optionalAccess', _ => _.data, 'optionalAccess', _2 => _2.stats]);
  const trends = _optionalChain([data, 'optionalAccess', _3 => _3.data, 'optionalAccess', _4 => _4.trends]) || [];

  return (
    React.createElement('div', { className: "space-y-6 p-1" ,}
      /* Header */
      , React.createElement('div', { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4"     ,}
        , React.createElement('div', null
          , React.createElement('h1', { className: "text-2xl font-bold tracking-tight flex items-center gap-2"     ,}
            , React.createElement(CreditCard, { className: "text-indigo-500", size: 24,} ), "Payroll & Analytics"

          )
          , React.createElement('p', { className: "text-sm text-muted-foreground mt-1"  ,}, "Monitor organizational salaries costs, allowances, and revisions trends"

          )
        )
      )

      /* Stats Grid */
      , React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"    ,}
        , [
          { label: 'Total Salary Paid', value: `$${(_optionalChain([stats, 'optionalAccess', _5 => _5.totalPaidSalary]) || 0).toLocaleString()}`, desc: 'Across completed cycles', icon: React.createElement(DollarSign, { size: 20,} ), color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
          { label: 'Bonuses Paid', value: `$${(_optionalChain([stats, 'optionalAccess', _6 => _6.totalBonuses]) || 0).toLocaleString()}`, desc: 'Incentives & rewards', icon: React.createElement(SparklesIcon, null ), color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
          { label: 'Total Deductions', value: `$${(_optionalChain([stats, 'optionalAccess', _7 => _7.totalDeductions]) || 0).toLocaleString()}`, desc: 'Taxes, PF, ESI, leaves', icon: React.createElement(ShieldAlert, { size: 20,} ), color: 'text-rose-600', bg: 'bg-rose-500/10' },
          { label: 'Processed Runs', value: _optionalChain([stats, 'optionalAccess', _8 => _8.processedCount]) || 0, desc: 'Completed and locked', icon: React.createElement(Wallet, { size: 20,} ), color: 'text-blue-600', bg: 'bg-blue-500/10' },
          { label: 'Pending Runs', value: _optionalChain([stats, 'optionalAccess', _9 => _9.pendingCount]) || 0, desc: 'Drafts in progress', icon: React.createElement(FileText, { size: 20,} ), color: 'text-amber-600', bg: 'bg-amber-500/10' },
        ].map(stat => (
          React.createElement(Card, { key: stat.label,}
            , React.createElement(CardContent, { className: "p-4",}
              , React.createElement('div', { className: `inline-flex p-2 rounded-xl ${stat.bg} mb-3`,}
                , React.createElement('span', { className: stat.color,}, stat.icon)
              )
              , React.createElement('p', { className: "text-2xl font-bold" ,}, stat.value)
              , React.createElement('p', { className: "text-xs text-muted-foreground mt-0.5"  ,}, stat.label)
              , React.createElement('p', { className: "text-[10px] text-muted-foreground/80 mt-1"  ,}, stat.desc)
            )
          )
        ))
      )

      /* Cost Trend Chart */
      , React.createElement('div', { className: "grid grid-cols-1 lg:grid-cols-3 gap-6"   ,}
        , React.createElement(Card, { className: "lg:col-span-2",}
          , React.createElement(CardHeader, null
            , React.createElement(CardTitle, { className: "text-base flex items-center gap-2"   ,}
              , React.createElement(TrendingUp, { size: 18, className: "text-indigo-500",} ), "Monthly Salary Trend"

            )
            , React.createElement(CardDescription, null, "Organizational gross payouts history"   )
          )
          , React.createElement(CardContent, null
            , React.createElement('div', { className: "flex items-end gap-4 h-48 pt-4"    ,}
              , trends.map(t => {
                const maxVal = Math.max(...trends.map(item => item.cost)) || 1;
                const percentHeight = Math.round((t.cost / maxVal) * 100);
                return (
                  React.createElement('div', { key: t.month, className: "flex-1 flex flex-col items-center gap-2"    ,}
                    , React.createElement('span', { className: "text-xs font-semibold text-foreground"  ,}, "$", t.cost.toLocaleString())
                    , React.createElement('div', {
                      className: "w-full rounded-t-lg bg-gradient-to-t from-indigo-500 to-violet-500 transition-all duration-500"      ,
                      style: { height: `${(percentHeight / 100) * 120}px` },}
                    )
                    , React.createElement('span', { className: "text-xs text-muted-foreground" ,}, t.month)
                  )
                );
              })
              , trends.length === 0 && (
                React.createElement('p', { className: "w-full text-center text-sm text-muted-foreground py-16"    ,}, "No monthly cycles recorded yet."    )
              )
            )
          )
        )

        /* Cost breakdown */
        , React.createElement(Card, null
          , React.createElement(CardHeader, null
            , React.createElement(CardTitle, { className: "text-base flex items-center gap-2"   ,}
              , React.createElement(Layers, { size: 18, className: "text-indigo-500",} ), "Payroll Distribution"

            )
            , React.createElement(CardDescription, null, "Visual cost splits overview"   )
          )
          , React.createElement(CardContent, { className: "space-y-4 pt-2" ,}
            , [
              { label: 'Basic Salary Component', pct: 60, color: 'bg-indigo-500' },
              { label: 'House Rent Allowance (HRA)', pct: 18, color: 'bg-violet-500' },
              { label: 'Special & Travel Allowances', pct: 12, color: 'bg-emerald-500' },
              { label: 'Taxes & PF Deductions', pct: 10, color: 'bg-rose-500' },
            ].map(item => (
              React.createElement('div', { key: item.label, className: "space-y-1.5",}
                , React.createElement('div', { className: "flex items-center justify-between text-xs font-medium"    ,}
                  , React.createElement('span', null, item.label)
                  , React.createElement('span', { className: "text-muted-foreground",}, item.pct, "%")
                )
                , React.createElement('div', { className: "h-2 bg-muted rounded-full overflow-hidden"   ,}
                  , React.createElement('div', { className: `h-full ${item.color} rounded-full`, style: { width: `${item.pct}%` },} )
                )
              )
            ))
          )
        )
      )
    )
  );
};

// Simple inline sparkles svg wrapper
const SparklesIcon = () => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24"   , fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "lucide lucide-sparkles" ,}, React.createElement('path', { d: "m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"                          ,}), React.createElement('path', { d: "m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5Z"              ,}), React.createElement('path', { d: "m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z"       ,}))
);

export default PayrollDashboard;
