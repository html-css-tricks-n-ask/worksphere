import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import {
  Clock, CheckCircle2, XCircle, Users, TrendingUp,
  MapPin, Smartphone, Monitor, QrCode, Pencil,
  LogIn, LogOut, Calendar, BarChart2, AlertCircle,
} from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card.js';
import { Badge } from '../components/ui/badge.js';
import { Button } from '../components/ui/button.js';

// ─── Types ─────────────────────────────────────────────────────────────────
interface AttendanceStats {
  today: { present: number; absent: number; late: number; onLeave: number; holidays: number };
  trends: {
    weekly: { day: string; present: number }[];
    monthly: { month: string; rate: number }[];
  };
}

interface AttendanceLog {
  _id: string;
  checkIn?: string;
  checkOut?: string;
  totalHours: number;
  overtimeHours: number;
  status: string;
  attendanceType: string;
  location?: string;
  remarks?: string;
  employeeId: { firstName: string; lastName: string; employeeId: string; email: string };
}

// ─── Status Color Map ───────────────────────────────────────────────────────
const statusColor: Record<string, string> = {
  Present: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
  Absent: 'bg-rose-500/15 text-rose-600 border-rose-500/30',
  Leave: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
  Holiday: 'bg-violet-500/15 text-violet-600 border-violet-500/30',
  Weekend: 'bg-slate-500/15 text-slate-500 border-slate-500/30',
  'Half Day': 'bg-blue-500/15 text-blue-600 border-blue-500/30',
};

const typeIcon: Record<string, React.ReactNode> = {
  Web: <Monitor size={14} />,
  Mobile: <Smartphone size={14} />,
  QR: <QrCode size={14} />,
  GPS: <MapPin size={14} />,
  Manual: <Pencil size={14} />,
};

// ─── Main Component ─────────────────────────────────────────────────────────
const Attendance: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'logs' | 'calendar'>('dashboard');

  const now = new Date();
  const [month] = useState(format(now, 'yyyy-MM'));
  const startDate = format(startOfMonth(now), "yyyy-MM-dd'T'00:00:00.000'Z'");
  const endDate = format(endOfMonth(now), "yyyy-MM-dd'T'23:59:59.999'Z'");

  // Stats query
  const { data: statsData } = useQuery<{ data: AttendanceStats }>({
    queryKey: ['attendance-stats'],
    queryFn: () => axiosInstance.get('/attendance/stats').then(r => r.data),
    refetchInterval: 60000,
  });

  // My attendance (for today's card)
  const { data: myData } = useQuery<{ data: { todayLog: AttendanceLog | null; logs: AttendanceLog[] } }>({
    queryKey: ['my-attendance', month],
    queryFn: () => axiosInstance.get(`/attendance/me?startDate=${startDate}&endDate=${endDate}&limit=31`).then(r => r.data),
  });

  // Admin logs query
  const { data: logsData } = useQuery<{ data: { logs: AttendanceLog[] } }>({
    queryKey: ['attendance-logs'],
    queryFn: () => axiosInstance.get('/attendance?limit=50').then(r => r.data),
    enabled: activeTab === 'logs',
  });

  const todayLog = myData?.data?.todayLog;

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

  const stats = statsData?.data;
  const myLogs = myData?.data?.logs || [];

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Clock className="text-indigo-500" size={24} />
            Attendance Console
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {format(now, 'EEEE, do MMMM yyyy')} · Track daily presence and overtime
          </p>
        </div>
        <Badge className="bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 text-sm px-3 py-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
          Live Tracking
        </Badge>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-muted/40 p-1 rounded-xl w-fit border border-border/50">
        {(['dashboard', 'logs', 'calendar'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200 ${
              activeTab === tab
                ? 'bg-white dark:bg-card shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'dashboard' ? '📊 Dashboard' : tab === 'logs' ? '📋 All Logs' : '📅 Calendar'}
          </button>
        ))}
      </div>

      {/* ── DASHBOARD TAB ── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Today's Check-in Card */}
          <Card className="overflow-hidden border-2 border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-violet-500/5">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Today's Status</p>
                  {todayLog ? (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColor[todayLog.status] || ''}`}>
                          {todayLog.status}
                        </span>
                        {todayLog.checkIn && (
                          <span className="text-sm text-muted-foreground">
                            In: <span className="font-semibold text-foreground">{format(new Date(todayLog.checkIn), 'hh:mm a')}</span>
                          </span>
                        )}
                        {todayLog.checkOut && (
                          <span className="text-sm text-muted-foreground">
                            Out: <span className="font-semibold text-foreground">{format(new Date(todayLog.checkOut), 'hh:mm a')}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-2xl font-bold mt-2">
                        {todayLog.totalHours.toFixed(1)}<span className="text-base font-medium text-muted-foreground ml-1">hrs worked</span>
                        {todayLog.overtimeHours > 0 && (
                          <span className="ml-3 text-sm text-amber-600 font-medium">
                            +{todayLog.overtimeHours.toFixed(1)} OT
                          </span>
                        )}
                      </p>
                    </div>
                  ) : (
                    <p className="text-lg font-semibold text-muted-foreground mt-1">Not checked in yet</p>
                  )}
                </div>
                <div className="flex gap-3">
                  {!todayLog?.checkIn ? (
                    <Button
                      onClick={() => checkInMutation.mutate()}
                      disabled={checkInMutation.isPending}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20 gap-2"
                    >
                      <LogIn size={16} />
                      {checkInMutation.isPending ? 'Checking In…' : 'Check In'}
                    </Button>
                  ) : !todayLog.checkOut ? (
                    <Button
                      onClick={() => checkOutMutation.mutate()}
                      disabled={checkOutMutation.isPending}
                      variant="destructive"
                      className="gap-2 shadow-lg"
                    >
                      <LogOut size={16} />
                      {checkOutMutation.isPending ? 'Checking Out…' : 'Check Out'}
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-600 font-medium">
                      <CheckCircle2 size={18} />
                      Day Complete
                    </div>
                  )}
                </div>
              </div>
              {(checkInMutation.isError || checkOutMutation.isError) && (
                <div className="mt-3 flex items-center gap-2 text-rose-600 text-sm bg-rose-500/10 px-3 py-2 rounded-lg">
                  <AlertCircle size={14} />
                  {((checkInMutation.error || checkOutMutation.error) as any)?.response?.data?.message || 'An error occurred. Please try again.'}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: 'Present', value: stats?.today.present ?? 0, icon: <CheckCircle2 size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
              { label: 'Absent', value: stats?.today.absent ?? 0, icon: <XCircle size={20} />, color: 'text-rose-600', bg: 'bg-rose-500/10' },
              { label: 'Late', value: stats?.today.late ?? 0, icon: <Clock size={20} />, color: 'text-amber-600', bg: 'bg-amber-500/10' },
              { label: 'On Leave', value: stats?.today.onLeave ?? 0, icon: <Calendar size={20} />, color: 'text-violet-600', bg: 'bg-violet-500/10' },
              { label: 'Holidays', value: stats?.today.holidays ?? 0, icon: <TrendingUp size={20} />, color: 'text-blue-600', bg: 'bg-blue-500/10' },
            ].map(stat => (
              <Card key={stat.label} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className={`inline-flex p-2 rounded-xl ${stat.bg} mb-3`}>
                    <span className={stat.color}>{stat.icon}</span>
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label} Today</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Weekly Trend */}
          {stats?.trends.weekly && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart2 size={18} className="text-indigo-500" />
                  Weekly Presence Rate
                </CardTitle>
                <CardDescription>Present employees by day of the week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-3 h-28">
                  {stats.trends.weekly.map(d => (
                    <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-medium text-muted-foreground">{d.present}%</span>
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-indigo-500 to-violet-500 transition-all duration-700"
                        style={{ height: `${(d.present / 100) * 80}px` }}
                      />
                      <span className="text-xs text-muted-foreground">{d.day}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* My Recent Attendance */}
          {myLogs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users size={18} className="text-indigo-500" />
                  My Attendance — {format(now, 'MMMM yyyy')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50 bg-muted/30">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Check In</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Check Out</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Hours</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myLogs.slice(0, 10).map((log) => (
                        <tr key={log._id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-4 font-medium">
                            {log.checkIn ? format(new Date(log.checkIn), 'dd MMM') : '—'}
                          </td>
                          <td className="py-3 px-4">
                            {log.checkIn ? format(new Date(log.checkIn), 'hh:mm a') : '—'}
                          </td>
                          <td className="py-3 px-4">
                            {log.checkOut ? format(new Date(log.checkOut), 'hh:mm a') : '—'}
                          </td>
                          <td className="py-3 px-4 font-semibold">
                            {log.totalHours > 0 ? `${log.totalHours.toFixed(1)}h` : '—'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColor[log.status] || ''}`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                              {typeIcon[log.attendanceType]}
                              {log.attendanceType}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── LOGS TAB ── */}
      {activeTab === 'logs' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Attendance Logs</CardTitle>
            <CardDescription>Company-wide attendance records</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Employee</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">In / Out</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Hours</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">OT</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(logsData?.data?.logs || []).map((log) => (
                    <tr key={log._id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-medium">{log.employeeId?.firstName} {log.employeeId?.lastName}</p>
                        <p className="text-xs text-muted-foreground">{log.employeeId?.employeeId}</p>
                      </td>
                      <td className="py-3 px-4">
                        {log.checkIn ? format(new Date(log.checkIn), 'dd MMM yyyy') : '—'}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <span className="text-emerald-600">{log.checkIn ? format(new Date(log.checkIn), 'hh:mm a') : '—'}</span>
                        <span className="mx-1 text-muted-foreground">→</span>
                        <span className="text-rose-600">{log.checkOut ? format(new Date(log.checkOut), 'hh:mm a') : '—'}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        {log.totalHours > 0 ? `${log.totalHours.toFixed(1)}h` : '—'}
                      </td>
                      <td className="py-3 px-4">
                        {log.overtimeHours > 0 ? (
                          <span className="text-amber-600 font-medium">+{log.overtimeHours.toFixed(1)}h</span>
                        ) : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColor[log.status] || ''}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!logsData?.data?.logs?.length && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-muted-foreground">No attendance records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── CALENDAR TAB ── */}
      {activeTab === 'calendar' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attendance Calendar — {format(now, 'MMMM yyyy')}</CardTitle>
            <CardDescription>Visual overview of your monthly attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {/* Offset blank cells for the month start */}
              {Array.from({ length: startOfMonth(now).getDay() }).map((_, i) => (
                <div key={`blank-${i}`} />
              ))}
              {/* Day cells */}
              {Array.from({ length: now.getDate() }, (_, i) => {
                const day = i + 1;
                const dayDate = new Date(now.getFullYear(), now.getMonth(), day);
                const log = myLogs.find(l => l.checkIn && new Date(l.checkIn).getDate() === day);
                const isToday = day === now.getDate();
                const isWeekend = [0, 6].includes(dayDate.getDay());

                let cellClass = 'rounded-lg p-2 text-xs font-medium transition-all cursor-default border ';
                if (isToday) cellClass += 'border-indigo-500 bg-indigo-500/10 text-indigo-600 ring-1 ring-indigo-500/30 ';
                else if (log?.status === 'Present') cellClass += 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 ';
                else if (log?.status === 'Absent') cellClass += 'border-rose-500/30 bg-rose-500/10 text-rose-600 ';
                else if (log?.status === 'Leave') cellClass += 'border-amber-500/30 bg-amber-500/10 text-amber-700 ';
                else if (isWeekend) cellClass += 'border-transparent bg-muted/30 text-muted-foreground ';
                else cellClass += 'border-border/30 bg-muted/10 text-muted-foreground ';

                return (
                  <div key={day} className={cellClass}>
                    <span className="block">{day}</span>
                    {log && (
                      <span className="text-[9px] leading-tight block mt-0.5 opacity-80">
                        {log.status === 'Present' ? '✓' : log.status === 'Leave' ? 'L' : log.status === 'Absent' ? '✗' : ''}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted-foreground pt-4 border-t">
              {[
                { color: 'bg-emerald-500', label: 'Present' },
                { color: 'bg-rose-500', label: 'Absent' },
                { color: 'bg-amber-500', label: 'Leave' },
                { color: 'bg-indigo-500', label: 'Today' },
                { color: 'bg-muted', label: 'Weekend' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span className={`w-3 h-3 rounded-sm ${l.color}`} />
                  {l.label}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Attendance;
