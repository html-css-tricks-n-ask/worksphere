 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Users,
  Briefcase,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Sparkles,
  Layers,
  UserCheck,
  UserX,
  Loader2,
} from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

export const Dashboard = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  
  const [widgets, setWidgets] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    departmentCount: 0,
    newEmployeesThisMonth: 0,
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [widgetRes, auditRes] = await Promise.all([
          axiosInstance.get('/employees/widgets'),
          axiosInstance.get('/audit?limit=5')
        ]);
        setWidgets(widgetRes.data.data);

        // Map raw backend logs to expected table structure
        const mappedLogs = (_optionalChain([auditRes, 'access', _ => _.data, 'optionalAccess', _2 => _2.data, 'optionalAccess', _3 => _3.logs]) || []).map((log) => {
          let actionLabel = log.action;
          if (log.action === 'CREATE_EMPLOYEE') actionLabel = 'Registered Employee';
          else if (log.action === 'UPDATE_EMPLOYEE') actionLabel = 'Updated Employee Profile';
          else if (log.action === 'DELETE_EMPLOYEE') actionLabel = 'Terminated Employee';
          else if (log.action === 'APPLY_LEAVE') actionLabel = 'Submitted Leave Request';
          else if (log.action === 'UPDATE_LEAVE_STATUS') actionLabel = 'Processed Leave Status';
          else if (log.action === 'CREATE_DEPARTMENT') actionLabel = 'Created Department';
          else if (log.action === 'ATTENDANCE_CHECKIN') actionLabel = 'Checked In';
          else if (log.action === 'ATTENDANCE_CHECKOUT') actionLabel = 'Checked Out';
          else {
            actionLabel = log.action.split('_').map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
          }

          let badgeVariant = 'success';
          if (log.action.includes('DELETE') || log.action.includes('REJECT')) {
            badgeVariant = 'destructive';
          } else if (log.action.includes('UPDATE') || log.action.includes('EDIT')) {
            badgeVariant = 'secondary';
          }

          let displayTime = 'Recently';
          try {
            const date = new Date(log.timestamp);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);

            if (diffMins < 60) {
              displayTime = diffMins <= 1 ? 'Just now' : `${diffMins}m ago`;
            } else if (diffMins < 1440) {
              displayTime = `${Math.floor(diffMins / 60)}h ago`;
            } else {
              displayTime = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            }
          } catch (e) {}

          return {
            id: log._id,
            name: log.actorId ? `${log.actorId.firstName} ${log.actorId.lastName}` : 'System',
            action: actionLabel,
            time: displayTime,
            status: log.action.includes('DELETE') ? 'Deleted' : log.action.includes('UPDATE') ? 'Updated' : 'Success',
            variant: badgeVariant
          };
        });

        setActivities(mappedLogs);
      } catch (err) {
        // Ignore dashboard stats errors, fallback to empty lists/zeros
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const stats = [
    { label: 'Total Employees', value: widgets.totalEmployees, desc: `${widgets.newEmployeesThisMonth} joined this month`, icon: Users, color: 'text-blue-500' },
    { label: 'Active Employees', value: widgets.activeEmployees, desc: ' SSO Login enabled', icon: UserCheck, color: 'text-emerald-500' },
    { label: 'Inactive Employees', value: widgets.inactiveEmployees, desc: 'SSO Login disabled', icon: UserX, color: 'text-rose-500' },
    { label: 'Total Departments', value: widgets.departmentCount, desc: 'Functional divisions', icon: Layers, color: 'text-violet-500' },
  ];

  return (
    React.createElement('div', { className: "space-y-6",}
      /* Welcome Banner */
      , React.createElement('div', { className: "relative p-6 rounded-xl border bg-card overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"            ,}
        , React.createElement('div', { className: "absolute top-0 right-0 w-64 h-64 vibrant-gradient opacity-10 blur-3xl pointer-events-none rounded-full"         ,} )
        , React.createElement('div', { className: "space-y-2",}
          , React.createElement('div', { className: "flex flex-col sm:flex-row sm:items-center gap-2 items-start"     ,}
            , React.createElement('h1', { className: "text-2xl font-bold tracking-tight"  ,}, "Welcome back, "
                , user ? user.firstName : 'Admin', "!"
            )
            , React.createElement(Badge, { variant: "success", className: "gap-1 animate-pulse self-start sm:self-auto"   ,}
              , React.createElement(Sparkles, { className: "h-3 w-3" ,} ), " System Optimal"
            )
          )
          , React.createElement('p', { className: "text-sm text-muted-foreground" ,}, "Here's a snapshot of your organization workspace settings for today."

          )
        )
        , React.createElement('div', { className: "flex flex-col sm:flex-row gap-3 w-full sm:w-auto"     ,}
          , React.createElement(Button, { variant: "outline", size: "sm", className: "w-full sm:w-auto" , onClick: () => navigate('/company'),}, "Workspace Settings"

          )
          , React.createElement(Button, { size: "sm", className: "w-full sm:w-auto" , onClick: () => navigate('/employees/create'),}, "Register Employee"

          )
        )
      )

      /* Grid Stats */
      , React.createElement('div', { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4"   ,}
        , loading ? (
          React.createElement('div', { className: "col-span-4 flex items-center justify-center p-8 bg-card rounded-xl border"       ,}
            , React.createElement(Loader2, { className: "h-6 w-6 text-primary animate-spin"   ,} )
          )
        ) : (
          stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              React.createElement(Card, { key: i, className: "hover:scale-[1.02] duration-300" ,}
                , React.createElement(CardHeader, { className: "flex flex-row items-center justify-between pb-2 space-y-0"     ,}
                  , React.createElement(CardTitle, { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground"    ,}
                    , stat.label
                  )
                  , React.createElement('div', { className: `p-2 rounded-lg bg-muted/40 ${stat.color}`,}
                    , React.createElement(Icon, { className: "w-4 h-4" ,} )
                  )
                )
                , React.createElement(CardContent, null
                  , React.createElement('div', { className: "text-2xl font-bold" ,}, stat.value)
                  , React.createElement('p', { className: "text-[11px] text-muted-foreground mt-1 flex items-center gap-1"     ,}
                    , React.createElement(TrendingUp, { className: "h-3 w-3 text-emerald-500"  ,} )
                    , stat.desc
                  )
                )
              )
            );
          })
        )
      )

      /* Primary Analytics Grid */
      , React.createElement('div', { className: "grid gap-6 md:grid-cols-7"  ,}
        /* Attendance overview block */
        , React.createElement(Card, { className: "md:col-span-4 overflow-hidden" ,}
          , React.createElement(CardHeader, { className: "flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4"       ,}
            , React.createElement('div', null
              , React.createElement(CardTitle, null, "Recent Actions" )
              , React.createElement(CardDescription, null, "Log of recently processed employees"    )
            )
            , React.createElement(Button, { variant: "ghost", size: "sm", className: "gap-1 text-xs self-start sm:self-auto"   , onClick: () => navigate('/audit'),}, "View Registry "
                , React.createElement(ArrowUpRight, { className: "h-3.5 w-3.5" ,} )
            )
          )
          , React.createElement(CardContent, { className: "pt-6",}
            , React.createElement(Table, null
              , React.createElement(TableHeader, null
                , React.createElement(TableRow, null
                  , React.createElement(TableHead, null, "Employee")
                  , React.createElement(TableHead, null, "Activity")
                  , React.createElement(TableHead, null, "Timestamp")
                  , React.createElement(TableHead, { className: "text-right",}, "Status")
                )
              )
              , React.createElement(TableBody, null
                , activities.map((activity) => (
                  React.createElement(TableRow, { key: activity.id,}
                    , React.createElement(TableCell, { className: "font-medium text-xs" ,}, activity.name)
                    , React.createElement(TableCell, { className: "text-xs text-muted-foreground" ,}, activity.action)
                    , React.createElement(TableCell, { className: "text-xs",}, activity.time)
                    , React.createElement(TableCell, { className: "text-right",}
                      , React.createElement(Badge, {
                        variant: activity.variant,
                        className: "text-[10px]",}

                        , activity.status
                      )
                    )
                  )
                ))
                , activities.length === 0 && (
                  React.createElement(TableRow, null
                    , React.createElement('td', { colSpan: 4, className: "py-8 text-center text-xs text-muted-foreground"   ,}, "No recent activities recorded for this workspace."

                    )
                  )
                )
              )
            )
          )
        )

        /* Company Quick-actions and widgets */
        , React.createElement(Card, { className: "md:col-span-3",}
          , React.createElement(CardHeader, { className: "border-b pb-4" ,}
            , React.createElement(CardTitle, null, "Core Modules" )
            , React.createElement(CardDescription, null, "HR settings administration shortcuts"   )
          )
          , React.createElement(CardContent, { className: "pt-6 space-y-4" ,}
            , React.createElement('div', { className: "p-4 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors flex items-center justify-between cursor-pointer group"          , onClick: () => navigate('/departments'),}
              , React.createElement('div', null
                , React.createElement('p', { className: "text-xs font-semibold" ,}, "Manage Departments" )
                , React.createElement('p', { className: "text-[10px] text-muted-foreground" ,}, "Adjust business units and directors"    )
              )
              , React.createElement(Activity, { className: "h-4 w-4 text-primary group-hover:animate-pulse"   ,} )
            )

            , React.createElement('div', { className: "p-4 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors flex items-center justify-between cursor-pointer group"          , onClick: () => navigate('/designations'),}
              , React.createElement('div', null
                , React.createElement('p', { className: "text-xs font-semibold" ,}, "Designations Matrix" )
                , React.createElement('p', { className: "text-[10px] text-muted-foreground" ,}, "Modify career levels and title grades"     )
              )
              , React.createElement(Briefcase, { className: "h-4 w-4 text-violet-500 group-hover:scale-110 duration-200"    ,} )
            )

            , React.createElement('div', { className: "p-4 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors flex items-center justify-between cursor-pointer group"          , onClick: () => navigate('/employees'),}
              , React.createElement('div', null
                , React.createElement('p', { className: "text-xs font-semibold" ,}, "Employee Registry" )
                , React.createElement('p', { className: "text-[10px] text-muted-foreground" ,}, "Search and access employees file directories"     )
              )
              , React.createElement(Users, { className: "h-4 w-4 text-blue-500"  ,} )
            )
          )
        )
      )
    )
  );
};

export default Dashboard;
