 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import {
  Clock, CheckCircle2, XCircle, Users, TrendingUp,
  MapPin, Smartphone, Monitor, QrCode, Pencil,
  LogIn, LogOut, Calendar, BarChart2, AlertCircle,
} from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

// ─── Types ─────────────────────────────────────────────────────────────────





















// ─── Status Color Map ───────────────────────────────────────────────────────
const statusColor = {
  Present: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
  Absent: 'bg-rose-500/15 text-rose-600 border-rose-500/30',
  Leave: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
  Holiday: 'bg-violet-500/15 text-violet-600 border-violet-500/30',
  Weekend: 'bg-slate-500/15 text-slate-500 border-slate-500/30',
  'Half Day': 'bg-blue-500/15 text-blue-600 border-blue-500/30',
};

const typeIcon = {
  Web: React.createElement(Monitor, { size: 14,} ),
  Mobile: React.createElement(Smartphone, { size: 14,} ),
  QR: React.createElement(QrCode, { size: 14,} ),
  GPS: React.createElement(MapPin, { size: 14,} ),
  Manual: React.createElement(Pencil, { size: 14,} ),
};

// ─── Main Component ─────────────────────────────────────────────────────────
const Attendance = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('dashboard');

  const now = new Date();
  const [month] = useState(format(now, 'yyyy-MM'));
  const startDate = format(startOfMonth(now), "yyyy-MM-dd'T'00:00:00.000'Z'");
  const endDate = format(endOfMonth(now), "yyyy-MM-dd'T'23:59:59.999'Z'");

  // Stats query
  const { data: statsData } = useQuery({
    queryKey: ['attendance-stats'],
    queryFn: () => axiosInstance.get('/attendance/stats').then(r => r.data),
    refetchInterval: 60000,
  });

  // My attendance (for today's card)
  const { data: myData } = useQuery({
    queryKey: ['my-attendance', month],
    queryFn: () => axiosInstance.get(`/attendance/me?startDate=${startDate}&endDate=${endDate}&limit=31`).then(r => r.data),
  });

  // Admin logs query
  const { data: logsData } = useQuery({
    queryKey: ['attendance-logs'],
    queryFn: () => axiosInstance.get('/attendance?limit=50').then(r => r.data),
    enabled: activeTab === 'logs',
  });

  const todayLog = _optionalChain([myData, 'optionalAccess', _2 => _2.data, 'optionalAccess', _3 => _3.todayLog]);

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: () => axiosInstance.post('/attendance/check-in', {
      attendanceType: 'Web',
      location: 'Office',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-stats'] });
    },
  });

  // Check-out mutation
  const checkOutMutation = useMutation({
    mutationFn: () => axiosInstance.post('/attendance/check-out'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-stats'] });
    },
  });

  const stats = _optionalChain([statsData, 'optionalAccess', _4 => _4.data]);
  const myLogs = _optionalChain([myData, 'optionalAccess', _5 => _5.data, 'optionalAccess', _6 => _6.logs]) || [];

  return (
    React.createElement('div', { className: "space-y-6 p-1" ,}
      /* Header */
      , React.createElement('div', { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4"     ,}
        , React.createElement('div', null
          , React.createElement('h1', { className: "text-2xl font-bold tracking-tight flex items-center gap-2"     ,}
            , React.createElement(Clock, { className: "text-indigo-500", size: 24,} ), "Attendance Console"

          )
          , React.createElement('p', { className: "text-sm text-muted-foreground mt-1"  ,}
            , format(now, 'EEEE, do MMMM yyyy'), " · Track daily presence and overtime"
          )
        )
        , React.createElement(Badge, { className: "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 text-sm px-3 py-1.5"      ,}
          , React.createElement('span', { className: "inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"      ,} ), "Live Tracking"

        )
      )

      /* Tab Navigation */
      , React.createElement('div', { className: "flex gap-1 bg-muted/40 p-1 rounded-xl w-fit border border-border/50"       ,}
        , (['dashboard', 'logs', 'calendar'] ).map(tab => (
          React.createElement('button', {
            key: tab,
            onClick: () => setActiveTab(tab),
            className: `px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200 ${
              activeTab === tab
                ? 'bg-white dark:bg-card shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`,}

            , tab === 'dashboard' ? '📊 Dashboard' : tab === 'logs' ? '📋 All Logs' : '📅 Calendar'
          )
        ))
      )

      /* ── DASHBOARD TAB ── */
      , activeTab === 'dashboard' && (
        React.createElement('div', { className: "space-y-6",}
          /* Today's Check-in Card */
          , React.createElement(Card, { className: "overflow-hidden border-2 border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-violet-500/5"     ,}
            , React.createElement(CardContent, { className: "p-6",}
              , React.createElement('div', { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"      ,}
                , React.createElement('div', null
                  , React.createElement('p', { className: "text-sm text-muted-foreground font-medium"  ,}, "Today's Status" )
                  , todayLog ? (
                    React.createElement('div', { className: "mt-2 space-y-1" ,}
                      , React.createElement('div', { className: "flex items-center gap-3"  ,}
                        , React.createElement('span', { className: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColor[todayLog.status] || ''}`,}
                          , todayLog.status
                        )
                        , todayLog.checkIn && (
                          React.createElement('span', { className: "text-sm text-muted-foreground" ,}, "In: "
                             , React.createElement('span', { className: "font-semibold text-foreground" ,}, format(new Date(todayLog.checkIn), 'hh:mm a'))
                          )
                        )
                        , todayLog.checkOut && (
                          React.createElement('span', { className: "text-sm text-muted-foreground" ,}, "Out: "
                             , React.createElement('span', { className: "font-semibold text-foreground" ,}, format(new Date(todayLog.checkOut), 'hh:mm a'))
                          )
                        )
                      )
                      , React.createElement('p', { className: "text-2xl font-bold mt-2"  ,}
                        , todayLog.totalHours.toFixed(1), React.createElement('span', { className: "text-base font-medium text-muted-foreground ml-1"   ,}, "hrs worked" )
                        , todayLog.overtimeHours > 0 && (
                          React.createElement('span', { className: "ml-3 text-sm text-amber-600 font-medium"   ,}, "+"
                            , todayLog.overtimeHours.toFixed(1), " OT"
                          )
                        )
                      )
                    )
                  ) : (
                    React.createElement('p', { className: "text-lg font-semibold text-muted-foreground mt-1"   ,}, "Not checked in yet"   )
                  )
                )
                , React.createElement('div', { className: "flex gap-3" ,}
                  , !_optionalChain([todayLog, 'optionalAccess', _7 => _7.checkIn]) ? (
                    React.createElement(Button, {
                      onClick: () => checkInMutation.mutate(),
                      disabled: checkInMutation.isPending,
                      className: "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20 gap-2"        ,}

                      , React.createElement(LogIn, { size: 16,} )
                      , checkInMutation.isPending ? 'Checking In…' : 'Check In'
                    )
                  ) : !todayLog.checkOut ? (
                    React.createElement(Button, {
                      onClick: () => checkOutMutation.mutate(),
                      disabled: checkOutMutation.isPending,
                      variant: "destructive",
                      className: "gap-2 shadow-lg" ,}

                      , React.createElement(LogOut, { size: 16,} )
                      , checkOutMutation.isPending ? 'Checking Out…' : 'Check Out'
                    )
                  ) : (
                    React.createElement('div', { className: "flex items-center gap-2 text-emerald-600 font-medium"    ,}
                      , React.createElement(CheckCircle2, { size: 18,} ), "Day Complete"

                    )
                  )
                )
              )
              , (checkInMutation.isError || checkOutMutation.isError) && (
                React.createElement('div', { className: "mt-3 flex items-center gap-2 text-rose-600 text-sm bg-rose-500/10 px-3 py-2 rounded-lg"         ,}
                  , React.createElement(AlertCircle, { size: 14,} )
                  , _optionalChain([((checkInMutation.error || checkOutMutation.error) ), 'optionalAccess', _8 => _8.response, 'optionalAccess', _9 => _9.data, 'optionalAccess', _10 => _10.message]) || 'An error occurred. Please try again.'
                )
              )
            )
          )

          /* Stats Grid */
          , React.createElement('div', { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"    ,}
            , [
              { label: 'Present', value: _nullishCoalesce(_optionalChain([stats, 'optionalAccess', _11 => _11.today, 'access', _12 => _12.present]), () => ( 0)), icon: React.createElement(CheckCircle2, { size: 20,} ), color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
              { label: 'Absent', value: _nullishCoalesce(_optionalChain([stats, 'optionalAccess', _13 => _13.today, 'access', _14 => _14.absent]), () => ( 0)), icon: React.createElement(XCircle, { size: 20,} ), color: 'text-rose-600', bg: 'bg-rose-500/10' },
              { label: 'Late', value: _nullishCoalesce(_optionalChain([stats, 'optionalAccess', _15 => _15.today, 'access', _16 => _16.late]), () => ( 0)), icon: React.createElement(Clock, { size: 20,} ), color: 'text-amber-600', bg: 'bg-amber-500/10' },
              { label: 'On Leave', value: _nullishCoalesce(_optionalChain([stats, 'optionalAccess', _17 => _17.today, 'access', _18 => _18.onLeave]), () => ( 0)), icon: React.createElement(Calendar, { size: 20,} ), color: 'text-violet-600', bg: 'bg-violet-500/10' },
              { label: 'Holidays', value: _nullishCoalesce(_optionalChain([stats, 'optionalAccess', _19 => _19.today, 'access', _20 => _20.holidays]), () => ( 0)), icon: React.createElement(TrendingUp, { size: 20,} ), color: 'text-blue-600', bg: 'bg-blue-500/10' },
            ].map(stat => (
              React.createElement(Card, { key: stat.label, className: "hover:shadow-md transition-shadow" ,}
                , React.createElement(CardContent, { className: "p-4",}
                  , React.createElement('div', { className: `inline-flex p-2 rounded-xl ${stat.bg} mb-3`,}
                    , React.createElement('span', { className: stat.color,}, stat.icon)
                  )
                  , React.createElement('p', { className: "text-2xl font-bold" ,}, stat.value)
                  , React.createElement('p', { className: "text-xs text-muted-foreground mt-0.5"  ,}, stat.label, " Today" )
                )
              )
            ))
          )

          /* Weekly Trend */
          , _optionalChain([stats, 'optionalAccess', _21 => _21.trends, 'access', _22 => _22.weekly]) && (
            React.createElement(Card, null
              , React.createElement(CardHeader, null
                , React.createElement(CardTitle, { className: "text-base flex items-center gap-2"   ,}
                  , React.createElement(BarChart2, { size: 18, className: "text-indigo-500",} ), "Weekly Presence Rate"

                )
                , React.createElement(CardDescription, null, "Present employees by day of the week"      )
              )
              , React.createElement(CardContent, null
                , React.createElement('div', { className: "flex items-end gap-3 h-28"   ,}
                  , stats.trends.weekly.map(d => (
                    React.createElement('div', { key: d.day, className: "flex-1 flex flex-col items-center gap-1"    ,}
                      , React.createElement('span', { className: "text-xs font-medium text-muted-foreground"  ,}, d.present, "%")
                      , React.createElement('div', {
                        className: "w-full rounded-t-md bg-gradient-to-t from-indigo-500 to-violet-500 transition-all duration-700"      ,
                        style: { height: `${(d.present / 100) * 80}px` },}
                      )
                      , React.createElement('span', { className: "text-xs text-muted-foreground" ,}, d.day)
                    )
                  ))
                )
              )
            )
          )

          /* My Recent Attendance */
          , myLogs.length > 0 && (
            React.createElement(Card, null
              , React.createElement(CardHeader, null
                , React.createElement(CardTitle, { className: "text-base flex items-center gap-2"   ,}
                  , React.createElement(Users, { size: 18, className: "text-indigo-500",} ), "My Attendance — "
                     , format(now, 'MMMM yyyy')
                )
              )
              , React.createElement(CardContent, { className: "p-0",}
                , React.createElement('div', { className: "overflow-x-auto",}
                  , React.createElement('table', { className: "w-full text-sm" ,}
                    , React.createElement('thead', null
                      , React.createElement('tr', { className: "border-b border-border/50 bg-muted/30"  ,}
                        , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Date")
                        , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Check In" )
                        , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Check Out" )
                        , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Hours")
                        , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Status")
                        , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Type")
                      )
                    )
                    , React.createElement('tbody', null
                      , myLogs.slice(0, 10).map((log) => (
                        React.createElement('tr', { key: log._id, className: "border-b border-border/30 hover:bg-muted/20 transition-colors"   ,}
                          , React.createElement('td', { className: "py-3 px-4 font-medium"  ,}
                            , log.checkIn ? format(new Date(log.checkIn), 'dd MMM') : '—'
                          )
                          , React.createElement('td', { className: "py-3 px-4" ,}
                            , log.checkIn ? format(new Date(log.checkIn), 'hh:mm a') : '—'
                          )
                          , React.createElement('td', { className: "py-3 px-4" ,}
                            , log.checkOut ? format(new Date(log.checkOut), 'hh:mm a') : '—'
                          )
                          , React.createElement('td', { className: "py-3 px-4 font-semibold"  ,}
                            , log.totalHours > 0 ? `${log.totalHours.toFixed(1)}h` : '—'
                          )
                          , React.createElement('td', { className: "py-3 px-4" ,}
                            , React.createElement('span', { className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColor[log.status] || ''}`,}
                              , log.status
                            )
                          )
                          , React.createElement('td', { className: "py-3 px-4" ,}
                            , React.createElement('span', { className: "inline-flex items-center gap-1 text-muted-foreground text-xs"    ,}
                              , typeIcon[log.attendanceType]
                              , log.attendanceType
                            )
                          )
                        )
                      ))
                    )
                  )
                )
              )
            )
          )
        )
      )

      /* ── LOGS TAB ── */
      , activeTab === 'logs' && (
        React.createElement(Card, null
          , React.createElement(CardHeader, null
            , React.createElement(CardTitle, { className: "text-base",}, "All Attendance Logs"  )
            , React.createElement(CardDescription, null, "Company-wide attendance records"  )
          )
          , React.createElement(CardContent, { className: "p-0",}
            , React.createElement('div', { className: "overflow-x-auto",}
              , React.createElement('table', { className: "w-full text-sm" ,}
                , React.createElement('thead', null
                  , React.createElement('tr', { className: "border-b border-border/50 bg-muted/30"  ,}
                    , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Employee")
                    , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Date")
                    , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "In / Out"  )
                    , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Hours")
                    , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "OT")
                    , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Status")
                  )
                )
                , React.createElement('tbody', null
                  , (_optionalChain([logsData, 'optionalAccess', _23 => _23.data, 'optionalAccess', _24 => _24.logs]) || []).map((log) => (
                    React.createElement('tr', { key: log._id, className: "border-b border-border/30 hover:bg-muted/20 transition-colors"   ,}
                      , React.createElement('td', { className: "py-3 px-4" ,}
                        , React.createElement('p', { className: "font-medium",}, _optionalChain([log, 'access', _25 => _25.employeeId, 'optionalAccess', _26 => _26.firstName]), " " , _optionalChain([log, 'access', _27 => _27.employeeId, 'optionalAccess', _28 => _28.lastName]))
                        , React.createElement('p', { className: "text-xs text-muted-foreground" ,}, _optionalChain([log, 'access', _29 => _29.employeeId, 'optionalAccess', _30 => _30.employeeId]))
                      )
                      , React.createElement('td', { className: "py-3 px-4" ,}
                        , log.checkIn ? format(new Date(log.checkIn), 'dd MMM yyyy') : '—'
                      )
                      , React.createElement('td', { className: "py-3 px-4 text-xs"  ,}
                        , React.createElement('span', { className: "text-emerald-600",}, log.checkIn ? format(new Date(log.checkIn), 'hh:mm a') : '—')
                        , React.createElement('span', { className: "mx-1 text-muted-foreground" ,}, "→")
                        , React.createElement('span', { className: "text-rose-600",}, log.checkOut ? format(new Date(log.checkOut), 'hh:mm a') : '—')
                      )
                      , React.createElement('td', { className: "py-3 px-4 font-semibold"  ,}
                        , log.totalHours > 0 ? `${log.totalHours.toFixed(1)}h` : '—'
                      )
                      , React.createElement('td', { className: "py-3 px-4" ,}
                        , log.overtimeHours > 0 ? (
                          React.createElement('span', { className: "text-amber-600 font-medium" ,}, "+", log.overtimeHours.toFixed(1), "h")
                        ) : '—'
                      )
                      , React.createElement('td', { className: "py-3 px-4" ,}
                        , React.createElement('span', { className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColor[log.status] || ''}`,}
                          , log.status
                        )
                      )
                    )
                  ))
                  , !_optionalChain([logsData, 'optionalAccess', _31 => _31.data, 'optionalAccess', _32 => _32.logs, 'optionalAccess', _33 => _33.length]) && (
                    React.createElement('tr', null
                      , React.createElement('td', { colSpan: 6, className: "py-12 text-center text-muted-foreground"  ,}, "No attendance records found."   )
                    )
                  )
                )
              )
            )
          )
        )
      )

      /* ── CALENDAR TAB ── */
      , activeTab === 'calendar' && (
        React.createElement(Card, null
          , React.createElement(CardHeader, null
            , React.createElement(CardTitle, { className: "text-base",}, "Attendance Calendar — "   , format(now, 'MMMM yyyy'))
            , React.createElement(CardDescription, null, "Visual overview of your monthly attendance"     )
          )
          , React.createElement(CardContent, null
            , React.createElement('div', { className: "grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-2"       ,}
              , ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                React.createElement('div', { key: d, className: "py-2",}, d)
              ))
            )
            , React.createElement('div', { className: "grid grid-cols-7 gap-1"  ,}
              /* Offset blank cells for the month start */
              , Array.from({ length: startOfMonth(now).getDay() }).map((_, i) => (
                React.createElement('div', { key: `blank-${i}`,} )
              ))
              /* Day cells */
              , Array.from({ length: now.getDate() }, (_, i) => {
                const day = i + 1;
                const dayDate = new Date(now.getFullYear(), now.getMonth(), day);
                const log = myLogs.find(l => l.checkIn && new Date(l.checkIn).getDate() === day);
                const isToday = day === now.getDate();
                const isWeekend = [0, 6].includes(dayDate.getDay());

                let cellClass = 'rounded-lg p-2 text-xs font-medium transition-all cursor-default border ';
                if (isToday) cellClass += 'border-indigo-500 bg-indigo-500/10 text-indigo-600 ring-1 ring-indigo-500/30 ';
                else if (_optionalChain([log, 'optionalAccess', _34 => _34.status]) === 'Present') cellClass += 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 ';
                else if (_optionalChain([log, 'optionalAccess', _35 => _35.status]) === 'Absent') cellClass += 'border-rose-500/30 bg-rose-500/10 text-rose-600 ';
                else if (_optionalChain([log, 'optionalAccess', _36 => _36.status]) === 'Leave') cellClass += 'border-amber-500/30 bg-amber-500/10 text-amber-700 ';
                else if (isWeekend) cellClass += 'border-transparent bg-muted/30 text-muted-foreground ';
                else cellClass += 'border-border/30 bg-muted/10 text-muted-foreground ';

                return (
                  React.createElement('div', { key: day, className: cellClass,}
                    , React.createElement('span', { className: "block",}, day)
                    , log && (
                      React.createElement('span', { className: "text-[9px] leading-tight block mt-0.5 opacity-80"    ,}
                        , log.status === 'Present' ? '✓' : log.status === 'Leave' ? 'L' : log.status === 'Absent' ? '✗' : ''
                      )
                    )
                  )
                );
              })
            )
            /* Legend */
            , React.createElement('div', { className: "flex flex-wrap gap-4 mt-4 text-xs text-muted-foreground pt-4 border-t"       ,}
              , [
                { color: 'bg-emerald-500', label: 'Present' },
                { color: 'bg-rose-500', label: 'Absent' },
                { color: 'bg-amber-500', label: 'Leave' },
                { color: 'bg-indigo-500', label: 'Today' },
                { color: 'bg-muted', label: 'Weekend' },
              ].map(l => (
                React.createElement('div', { key: l.label, className: "flex items-center gap-1.5"  ,}
                  , React.createElement('span', { className: `w-3 h-3 rounded-sm ${l.color}`,} )
                  , l.label
                )
              ))
            )
          )
        )
      )
    )
  );
};

export default Attendance;
