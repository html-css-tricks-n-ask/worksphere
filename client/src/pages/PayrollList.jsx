 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Lock, Download, Mail, CheckCircle2,
  Loader2, Play
} from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5002/api/v1';




















const PayrollList = () => {
  const queryClient = useQueryClient();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [statusFilter, setStatusFilter] = useState('');

  const { data } = useQuery({
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
    mutationFn: ({ id, status }) =>
      axiosInstance.put(`/payroll/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payroll-list'] }),
  });

  // Email payslip dispatch
  const emailMutation = useMutation({
    mutationFn: (id) => axiosInstance.post(`/payroll/${id}/email`),
  });

  const list = _optionalChain([data, 'optionalAccess', _ => _.data, 'optionalAccess', _2 => _2.payrolls]) || [];

  return (
    React.createElement('div', { className: "space-y-6 p-1" ,}
      /* Header */
      , React.createElement('div', { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4"     ,}
        , React.createElement('div', null
          , React.createElement('h1', { className: "text-2xl font-bold tracking-tight"  ,}, "Payroll Processing" )
          , React.createElement('p', { className: "text-sm text-muted-foreground mt-1"  ,}, "Review, compute, lock, and dispatch monthly salary slips"       )
        )
        , React.createElement('div', { className: "flex gap-2" ,}
          , React.createElement('input', {
            type: "month",
            value: selectedMonth,
            onChange: e => setSelectedMonth(e.target.value),
            className: "h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"       ,}
          )
          , React.createElement(Button, {
            onClick: () => processMutation.mutate(),
            disabled: processMutation.isPending,
            className: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg gap-2"    ,}

            , processMutation.isPending ? (
              React.createElement(Loader2, { className: "h-4 w-4 animate-spin"  ,} )
            ) : (
              React.createElement(Play, { size: 16,} )
            )
            , processMutation.isPending ? 'Processing…' : 'Compute Monthly Run'
          )
        )
      )

      , processMutation.isSuccess && (
        React.createElement('div', { className: "flex items-center gap-2 text-emerald-600 text-sm bg-emerald-500/10 px-4 py-3 rounded-xl border border-emerald-500/20"          ,}
          , React.createElement(CheckCircle2, { size: 16,} ), "Computed "
           , _optionalChain([processMutation, 'access', _3 => _3.data, 'optionalAccess', _4 => _4.data, 'optionalAccess', _5 => _5.length]) || 0, " employee payroll drafts successfully!"
        )
      )

      /* Grid records */
      , React.createElement(Card, null
        , React.createElement(CardHeader, null
          , React.createElement('div', { className: "flex items-center justify-between flex-wrap gap-3"    ,}
            , React.createElement('div', null
              , React.createElement(CardTitle, { className: "text-base",}, "Monthly Salary Records – "    , selectedMonth)
              , React.createElement(CardDescription, null, "Verify payout statements before locking"    )
            )
            , React.createElement('select', {
              value: statusFilter,
              onChange: e => setStatusFilter(e.target.value),
              className: "h-9 px-3 rounded-lg border border-border bg-background text-sm"      ,}

              , React.createElement('option', { value: "",}, "All Statuses" )
              , React.createElement('option', null, "Draft")
              , React.createElement('option', null, "Completed")
              , React.createElement('option', null, "Locked")
            )
          )
        )
        , React.createElement(CardContent, { className: "p-0",}
          , React.createElement('div', { className: "overflow-x-auto",}
            , React.createElement('table', { className: "w-full text-sm" ,}
              , React.createElement('thead', null
                , React.createElement('tr', { className: "border-b border-border/50 bg-muted/30"  ,}
                  , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Employee")
                  , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Days")
                  , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Gross Earnings" )
                  , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Deductions")
                  , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Net Payout" )
                  , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Status")
                  , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Actions")
                )
              )
              , React.createElement('tbody', null
                , list.map(r => (
                  React.createElement('tr', { key: r._id, className: "border-b border-border/30 hover:bg-muted/20 transition-colors"   ,}
                    , React.createElement('td', { className: "py-3 px-4" ,}
                      , React.createElement('p', { className: "font-semibold",}, _optionalChain([r, 'access', _6 => _6.employeeId, 'optionalAccess', _7 => _7.firstName]), " " , _optionalChain([r, 'access', _8 => _8.employeeId, 'optionalAccess', _9 => _9.lastName]))
                      , React.createElement('p', { className: "text-xs text-muted-foreground" ,}, _optionalChain([r, 'access', _10 => _10.employeeId, 'optionalAccess', _11 => _11.employeeId]))
                    )
                    , React.createElement('td', { className: "py-3 px-4 font-semibold"  ,}, r.paidDays, " d" )
                    , React.createElement('td', { className: "py-3 px-4 text-emerald-600 font-semibold"   ,}, "+$", r.totalEarnings.toLocaleString())
                    , React.createElement('td', { className: "py-3 px-4 text-rose-600 font-semibold"   ,}, "-$", r.totalDeductions.toLocaleString())
                    , React.createElement('td', { className: "py-3 px-4 font-bold text-indigo-600"   ,}, "$", r.netSalary.toLocaleString())
                    , React.createElement('td', { className: "py-3 px-4" ,}
                      , React.createElement('span', { className: `inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${
                        r.status === 'Locked'
                          ? 'bg-rose-500/15 text-rose-600 border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-600 border-amber-500/30'
                      }`,}
                        , r.status
                      )
                    )
                    , React.createElement('td', { className: "py-3 px-4" ,}
                      , React.createElement('div', { className: "flex gap-2" ,}
                        , r.status !== 'Locked' ? (
                          React.createElement('button', {
                            onClick: () => lockMutation.mutate({ id: r._id, status: 'Locked' }),
                            className: "p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded transition-colors"     ,
                            title: "Lock Payout" ,}

                            , React.createElement(Lock, { size: 14,} )
                          )
                        ) : (
                          React.createElement('span', { className: "p-1.5 text-emerald-600 bg-emerald-500/10 rounded"   ,}, React.createElement(CheckCircle2, { size: 14,} ))
                        )
                        , React.createElement('a', {
                          href: `${API_BASE}/payroll/${r._id}/payslip`,
                          target: "_blank",
                          rel: "noreferrer",
                          className: "p-1.5 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-500/10 rounded transition-colors block"      ,
                          title: "Preview Payslip" ,}

                          , React.createElement(Download, { size: 14,} )
                        )
                        , React.createElement('button', {
                          onClick: () => emailMutation.mutate(r._id),
                          disabled: emailMutation.isPending,
                          className: "p-1.5 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-500/10 rounded transition-colors"     ,
                          title: "Email Payslip" ,}

                          , React.createElement(Mail, { size: 14,} )
                        )
                      )
                    )
                  )
                ))
                , list.length === 0 && (
                  React.createElement('tr', null
                    , React.createElement('td', { colSpan: 7, className: "py-12 text-center text-muted-foreground"  ,}, "No payroll sheets created yet for this month."       )
                  )
                )
              )
            )
          )
        )
      )
    )
  );
};

export default PayrollList;
