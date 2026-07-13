import React, { useEffect, useState } from 'react';
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
import { axiosInstance } from '../services/axiosInstance.js';
import { RootState } from '../redux/store.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.js';
import { Badge } from '../components/ui/badge.js';
import { Button } from '../components/ui/button.js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table.js';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [widgets, setWidgets] = useState<any>({
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    departmentCount: 0,
    newEmployeesThisMonth: 0,
  });
  const [activities, setActivities] = useState<any[]>([]);
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
        const mappedLogs = (auditRes.data?.data?.logs || []).map((log: any) => {
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
            actionLabel = log.action.split('_').map((w: string) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
          }

          let badgeVariant: 'success' | 'warning' | 'secondary' | 'destructive' = 'success';
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
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative p-6 rounded-xl border bg-card overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 vibrant-gradient opacity-10 blur-3xl pointer-events-none rounded-full" />
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 items-start">
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome back, {user ? user.firstName : 'Admin'}!
            </h1>
            <Badge variant="success" className="gap-1 animate-pulse self-start sm:self-auto">
              <Sparkles className="h-3 w-3" /> System Optimal
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Here's a snapshot of your organization workspace settings for today.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => navigate('/company')}>
            Workspace Settings
          </Button>
          <Button size="sm" className="w-full sm:w-auto" onClick={() => navigate('/employees/create')}>
            Register Employee
          </Button>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <div className="col-span-4 flex items-center justify-center p-8 bg-card rounded-xl border">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
        ) : (
          stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className="hover:scale-[1.02] duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <div className={`p-2 rounded-lg bg-muted/40 ${stat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                    {stat.desc}
                  </p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Primary Analytics Grid */}
      <div className="grid gap-6 md:grid-cols-7">
        {/* Attendance overview block */}
        <Card className="md:col-span-4 overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4">
            <div>
              <CardTitle>Recent Actions</CardTitle>
              <CardDescription>Log of recently processed employees</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-xs self-start sm:self-auto" onClick={() => navigate('/audit')}>
              View Registry <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium text-xs">{activity.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{activity.action}</TableCell>
                    <TableCell className="text-xs">{activity.time}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={activity.variant}
                        className="text-[10px]"
                      >
                        {activity.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {activities.length === 0 && (
                  <TableRow>
                    <td colSpan={4} className="py-8 text-center text-xs text-muted-foreground">
                      No recent activities recorded for this workspace.
                    </td>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Company Quick-actions and widgets */}
        <Card className="md:col-span-3">
          <CardHeader className="border-b pb-4">
            <CardTitle>Core Modules</CardTitle>
            <CardDescription>HR settings administration shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="p-4 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors flex items-center justify-between cursor-pointer group" onClick={() => navigate('/departments')}>
              <div>
                <p className="text-xs font-semibold">Manage Departments</p>
                <p className="text-[10px] text-muted-foreground">Adjust business units and directors</p>
              </div>
              <Activity className="h-4 w-4 text-primary group-hover:animate-pulse" />
            </div>

            <div className="p-4 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors flex items-center justify-between cursor-pointer group" onClick={() => navigate('/designations')}>
              <div>
                <p className="text-xs font-semibold">Designations Matrix</p>
                <p className="text-[10px] text-muted-foreground">Modify career levels and title grades</p>
              </div>
              <Briefcase className="h-4 w-4 text-violet-500 group-hover:scale-110 duration-200" />
            </div>

            <div className="p-4 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors flex items-center justify-between cursor-pointer group" onClick={() => navigate('/employees')}>
              <div>
                <p className="text-xs font-semibold">Employee Registry</p>
                <p className="text-[10px] text-muted-foreground">Search and access employees file directories</p>
              </div>
              <Users className="h-4 w-4 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
