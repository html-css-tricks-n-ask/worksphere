 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  CalendarDays, CheckCircle2, XCircle, Plus, FileText,
  Briefcase, Heart, Baby, Home, AlertCircle, Filter,
} from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';

// ─── Types ─────────────────────────────────────────────────────────────────






























// ─── Leave type meta ────────────────────────────────────────────────────────
const leaveTypes = [
  'Casual Leave', 'Sick Leave', 'Paid Leave', 'Earned Leave',
  'Maternity Leave', 'Paternity Leave', 'Work From Home',
];

const leaveTypeIcon = {
  'Casual Leave': React.createElement(Briefcase, { size: 16,} ),
  'Sick Leave': React.createElement(Heart, { size: 16,} ),
  'Paid Leave': React.createElement(CheckCircle2, { size: 16,} ),
  'Earned Leave': React.createElement(CheckCircle2, { size: 16,} ),
  'Maternity Leave': React.createElement(Baby, { size: 16,} ),
  'Paternity Leave': React.createElement(Baby, { size: 16,} ),
  'Work From Home': React.createElement(Home, { size: 16,} ),
};

const statusColor = {
  Pending: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
  Approved: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
  Rejected: 'bg-rose-500/15 text-rose-600 border-rose-500/30',
  Cancelled: 'bg-slate-500/15 text-slate-500 border-slate-500/30',
};

// ─── Apply Leave Modal ──────────────────────────────────────────────────────
const ApplyLeaveModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    leaveType: 'Casual Leave',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (data) => axiosInstance.post('/leaves', {
      ...data,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
    }),
    onSuccess: () => {
      onSuccess();
      onClose();
    },
    onError: (err) => {
      setError(_optionalChain([err, 'access', _ => _.response, 'optionalAccess', _2 => _2.data, 'optionalAccess', _3 => _3.message]) || 'Failed to submit leave request.');
    },
  });

  return (
    React.createElement('div', { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"        , onClick: onClose,}
      , React.createElement('div', {
        className: "bg-card border border-border/60 rounded-2xl shadow-2xl w-full max-w-md"      ,
        onClick: e => e.stopPropagation(),}

        , React.createElement('div', { className: "p-6 border-b border-border/40"  ,}
          , React.createElement('h2', { className: "text-lg font-bold flex items-center gap-2"    ,}
            , React.createElement(CalendarDays, { size: 20, className: "text-indigo-500",} ), "Apply for Leave"

          )
          , React.createElement('p', { className: "text-sm text-muted-foreground mt-1"  ,}, "Submit a new leave request for manager review"       )
        )
        , React.createElement('div', { className: "p-6 space-y-4" ,}
          , React.createElement('div', null
            , React.createElement('label', { className: "text-sm font-medium block mb-1.5"   ,}, "Leave Type" )
            , React.createElement('select', {
              value: form.leaveType,
              onChange: e => setForm(f => ({ ...f, leaveType: e.target.value })),
              className: "w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"          ,}

              , leaveTypes.map(t => React.createElement('option', { key: t,}, t))
            )
          )
          , React.createElement('div', { className: "grid grid-cols-2 gap-3"  ,}
            , React.createElement('div', null
              , React.createElement('label', { className: "text-sm font-medium block mb-1.5"   ,}, "Start Date" )
              , React.createElement('input', {
                type: "date",
                value: form.startDate,
                onChange: e => setForm(f => ({ ...f, startDate: e.target.value })),
                className: "w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"          ,}
              )
            )
            , React.createElement('div', null
              , React.createElement('label', { className: "text-sm font-medium block mb-1.5"   ,}, "End Date" )
              , React.createElement('input', {
                type: "date",
                value: form.endDate,
                onChange: e => setForm(f => ({ ...f, endDate: e.target.value })),
                className: "w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"          ,}
              )
            )
          )
          , React.createElement('div', null
            , React.createElement('label', { className: "text-sm font-medium block mb-1.5"   ,}, "Reason")
            , React.createElement('textarea', {
              rows: 3,
              value: form.reason,
              onChange: e => setForm(f => ({ ...f, reason: e.target.value })),
              placeholder: "Briefly describe the reason for your leave..."      ,
              className: "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"           ,}
            )
          )
          , error && (
            React.createElement('div', { className: "flex items-center gap-2 text-rose-600 text-sm bg-rose-500/10 px-3 py-2 rounded-lg"        ,}
              , React.createElement(AlertCircle, { size: 14,} )
              , error
            )
          )
        )
        , React.createElement('div', { className: "p-6 border-t border-border/40 flex justify-end gap-3"     ,}
          , React.createElement(Button, { variant: "outline", onClick: onClose,}, "Cancel")
          , React.createElement(Button, {
            onClick: () => mutation.mutate(form),
            disabled: mutation.isPending || !form.startDate || !form.endDate || !form.reason,
            className: "bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white"     ,}

            , mutation.isPending ? 'Submitting…' : 'Submit Request'
          )
        )
      )
    )
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
const Leave = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('my');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  // My leaves and balances
  const { data: myData } = useQuery({
    queryKey: ['my-leaves'],
    queryFn: () => axiosInstance.get('/leaves/me').then(r => r.data),
  });

  // All leaves (admin/HR)
  const { data: allData } = useQuery({
    queryKey: ['all-leaves', filterStatus],
    queryFn: () => axiosInstance.get(`/leaves?limit=50${filterStatus ? `&status=${filterStatus}` : ''}`).then(r => r.data),
    enabled: activeTab === 'all',
  });

  // Approve / Reject mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) =>
      axiosInstance.put(`/leaves/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-leaves'] });
      queryClient.invalidateQueries({ queryKey: ['my-leaves'] });
    },
  });

  const balances = _optionalChain([myData, 'optionalAccess', _4 => _4.data, 'optionalAccess', _5 => _5.balances]);
  const myLeaves = _optionalChain([myData, 'optionalAccess', _6 => _6.data, 'optionalAccess', _7 => _7.leaves]) || [];

  const balanceCards = [
    { key: 'casual', label: 'Casual Leave', color: 'indigo', icon: React.createElement(Briefcase, { size: 16,} ) },
    { key: 'sick', label: 'Sick Leave', color: 'rose', icon: React.createElement(Heart, { size: 16,} ) },
    { key: 'paid', label: 'Paid Leave', color: 'emerald', icon: React.createElement(CheckCircle2, { size: 16,} ) },
    { key: 'wfh', label: 'Work From Home', color: 'violet', icon: React.createElement(Home, { size: 16,} ) },
  ] ;

  return (
    React.createElement('div', { className: "space-y-6 p-1" ,}
      /* Header */
      , React.createElement('div', { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4"     ,}
        , React.createElement('div', null
          , React.createElement('h1', { className: "text-2xl font-bold tracking-tight flex items-center gap-2"     ,}
            , React.createElement(CalendarDays, { className: "text-violet-500", size: 24,} ), "Leave Management"

          )
          , React.createElement('p', { className: "text-sm text-muted-foreground mt-1"  ,}, "Apply, track, and approve leave requests"     )
        )
        , React.createElement(Button, {
          onClick: () => setShowApplyModal(true),
          className: "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/20 gap-2"        ,}

          , React.createElement(Plus, { size: 16,} ), "Apply for Leave"

        )
      )

      /* Apply Leave Modal */
      , showApplyModal && (
        React.createElement(ApplyLeaveModal, {
          onClose: () => setShowApplyModal(false),
          onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-leaves'] }),}
        )
      )

      /* Tab Navigation */
      , React.createElement('div', { className: "flex gap-1 bg-muted/40 p-1 rounded-xl w-fit border border-border/50"       ,}
        , ([['my', '📋 My Leaves'], ['all', '👥 All Requests']] ).map(([tab, label]) => (
          React.createElement('button', {
            key: tab,
            onClick: () => setActiveTab(tab),
            className: `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab
                ? 'bg-white dark:bg-card shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`,}

            , label
          )
        ))
      )

      /* ── MY LEAVES TAB ── */
      , activeTab === 'my' && (
        React.createElement('div', { className: "space-y-6",}
          /* Balance Cards */
          , React.createElement('div', { className: "grid grid-cols-2 lg:grid-cols-4 gap-4"   ,}
            , balanceCards.map(({ key, label, color, icon }) => {
              const bal = _optionalChain([balances, 'optionalAccess', _8 => _8[key]]);
              const pct = bal ? Math.round((bal.used / bal.quota) * 100) : 0;
              return (
                React.createElement(Card, { key: key, className: "overflow-hidden",}
                  , React.createElement(CardContent, { className: "p-4",}
                    , React.createElement('div', { className: "flex items-center justify-between mb-3"   ,}
                      , React.createElement('span', { className: `text-${color}-500`,}, icon)
                      , React.createElement('span', { className: "text-xs text-muted-foreground" ,}, _nullishCoalesce(_optionalChain([bal, 'optionalAccess', _9 => _9.quota]), () => ( 0)), " days/yr" )
                    )
                    , React.createElement('p', { className: "text-2xl font-bold" ,}, _nullishCoalesce(_optionalChain([bal, 'optionalAccess', _10 => _10.remaining]), () => ( 0)))
                    , React.createElement('p', { className: "text-xs text-muted-foreground mt-0.5"  ,}, label, " remaining" )
                    , React.createElement('div', { className: "mt-3 h-1.5 bg-muted rounded-full overflow-hidden"    ,}
                      , React.createElement('div', {
                        className: `h-full bg-${color}-500 rounded-full transition-all duration-500`,
                        style: { width: `${pct}%` },}
                      )
                    )
                    , React.createElement('p', { className: "text-xs text-muted-foreground mt-1"  ,}, _nullishCoalesce(_optionalChain([bal, 'optionalAccess', _11 => _11.used]), () => ( 0)), " used · "   , pct, "%")
                  )
                )
              );
            })
          )

          /* My Requests List */
          , React.createElement(Card, null
            , React.createElement(CardHeader, null
              , React.createElement(CardTitle, { className: "text-base flex items-center gap-2"   ,}
                , React.createElement(FileText, { size: 18, className: "text-violet-500",} ), "My Leave Requests"

              )
            )
            , React.createElement(CardContent, { className: "p-0",}
              , myLeaves.length === 0 ? (
                React.createElement('div', { className: "py-16 text-center text-muted-foreground"  ,}
                  , React.createElement(CalendarDays, { size: 40, className: "mx-auto mb-3 opacity-30"  ,} )
                  , React.createElement('p', { className: "font-medium",}, "No leave requests yet"   )
                  , React.createElement('p', { className: "text-sm mt-1" ,}, "Apply for a leave to see it here"       )
                )
              ) : (
                React.createElement('div', { className: "divide-y divide-border/40" ,}
                  , myLeaves.map(leave => (
                    React.createElement('div', { key: leave._id, className: "flex items-start justify-between p-4 hover:bg-muted/20 transition-colors"     ,}
                      , React.createElement('div', { className: "flex items-start gap-3"  ,}
                        , React.createElement('div', { className: "p-2 bg-violet-500/10 text-violet-600 rounded-xl mt-0.5"    ,}
                          , leaveTypeIcon[leave.leaveType] || React.createElement(CalendarDays, { size: 16,} )
                        )
                        , React.createElement('div', null
                          , React.createElement('p', { className: "font-semibold text-sm" ,}, leave.leaveType)
                          , React.createElement('p', { className: "text-xs text-muted-foreground mt-0.5"  ,}
                            , format(new Date(leave.startDate), 'dd MMM'), " – "  , format(new Date(leave.endDate), 'dd MMM yyyy')
                            , React.createElement('span', { className: "ml-2 font-medium text-foreground"  ,}, leave.totalDays, " day" , leave.totalDays !== 1 ? 's' : '')
                          )
                          , React.createElement('p', { className: "text-xs text-muted-foreground mt-1 line-clamp-1"   ,}, leave.reason)
                          , leave.approvedBy && (
                            React.createElement('p', { className: "text-xs text-muted-foreground mt-1"  ,}
                              , leave.status === 'Approved' ? '✓ Approved' : '✗ Rejected', " by "  , leave.approvedBy.firstName, " " , leave.approvedBy.lastName
                            )
                          )
                        )
                      )
                      , React.createElement('span', { className: `inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColor[leave.status]}`,}
                        , leave.status
                      )
                    )
                  ))
                )
              )
            )
          )
        )
      )

      /* ── ALL LEAVES TAB ── */
      , activeTab === 'all' && (
        React.createElement(Card, null
          , React.createElement(CardHeader, null
            , React.createElement('div', { className: "flex items-center justify-between flex-wrap gap-3"    ,}
              , React.createElement('div', null
                , React.createElement(CardTitle, { className: "text-base",}, "All Leave Requests"  )
                , React.createElement(CardDescription, null, "Review and act on team leave applications"      )
              )
              , React.createElement('div', { className: "flex items-center gap-2"  ,}
                , React.createElement(Filter, { size: 15, className: "text-muted-foreground",} )
                , React.createElement('select', {
                  value: filterStatus,
                  onChange: e => setFilterStatus(e.target.value),
                  className: "h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"         ,}

                  , React.createElement('option', { value: "",}, "All Statuses" )
                  , React.createElement('option', null, "Pending")
                  , React.createElement('option', null, "Approved")
                  , React.createElement('option', null, "Rejected")
                  , React.createElement('option', null, "Cancelled")
                )
              )
            )
          )
          , React.createElement(CardContent, { className: "p-0",}
            , React.createElement('div', { className: "overflow-x-auto",}
              , React.createElement('table', { className: "w-full text-sm" ,}
                , React.createElement('thead', null
                  , React.createElement('tr', { className: "border-b border-border/50 bg-muted/30"  ,}
                    , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Employee")
                    , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Leave Type" )
                    , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Period")
                    , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Days")
                    , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Status")
                    , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Actions")
                  )
                )
                , React.createElement('tbody', null
                  , (_optionalChain([allData, 'optionalAccess', _12 => _12.data, 'optionalAccess', _13 => _13.leaves]) || []).map(leave => (
                    React.createElement('tr', { key: leave._id, className: "border-b border-border/30 hover:bg-muted/20 transition-colors"   ,}
                      , React.createElement('td', { className: "py-3 px-4" ,}
                        , React.createElement('p', { className: "font-medium",}, _optionalChain([leave, 'access', _14 => _14.employeeId, 'optionalAccess', _15 => _15.firstName]), " " , _optionalChain([leave, 'access', _16 => _16.employeeId, 'optionalAccess', _17 => _17.lastName]))
                        , React.createElement('p', { className: "text-xs text-muted-foreground" ,}, _optionalChain([leave, 'access', _18 => _18.employeeId, 'optionalAccess', _19 => _19.employeeId]))
                      )
                      , React.createElement('td', { className: "py-3 px-4" ,}
                        , React.createElement('div', { className: "flex items-center gap-1.5 text-muted-foreground"   ,}
                          , leaveTypeIcon[leave.leaveType] || React.createElement(CalendarDays, { size: 14,} )
                          , React.createElement('span', { className: "text-foreground",}, leave.leaveType)
                        )
                      )
                      , React.createElement('td', { className: "py-3 px-4 text-muted-foreground text-xs"   ,}
                        , format(new Date(leave.startDate), 'dd MMM'), " – "  , format(new Date(leave.endDate), 'dd MMM yyyy')
                      )
                      , React.createElement('td', { className: "py-3 px-4 font-semibold"  ,}, leave.totalDays)
                      , React.createElement('td', { className: "py-3 px-4" ,}
                        , React.createElement('span', { className: `inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColor[leave.status]}`,}
                          , leave.status
                        )
                      )
                      , React.createElement('td', { className: "py-3 px-4" ,}
                        , leave.status === 'Pending' && (
                          React.createElement('div', { className: "flex gap-2" ,}
                            , React.createElement('button', {
                              onClick: () => statusMutation.mutate({ id: leave._id, status: 'Approved' }),
                              className: "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 text-xs font-medium hover:bg-emerald-500/20 transition-colors border border-emerald-500/30"             ,}

                              , React.createElement(CheckCircle2, { size: 12,} ), " Approve"
                            )
                            , React.createElement('button', {
                              onClick: () => statusMutation.mutate({ id: leave._id, status: 'Rejected' }),
                              className: "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 text-xs font-medium hover:bg-rose-500/20 transition-colors border border-rose-500/30"             ,}

                              , React.createElement(XCircle, { size: 12,} ), " Reject"
                            )
                          )
                        )
                      )
                    )
                  ))
                  , !_optionalChain([allData, 'optionalAccess', _20 => _20.data, 'optionalAccess', _21 => _21.leaves, 'optionalAccess', _22 => _22.length]) && (
                    React.createElement('tr', null
                      , React.createElement('td', { colSpan: 6, className: "py-12 text-center text-muted-foreground"  ,}, "No leave requests found."   )
                    )
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

export default Leave;
