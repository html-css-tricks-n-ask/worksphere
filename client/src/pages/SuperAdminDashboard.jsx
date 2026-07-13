import React, { useEffect, useState } from 'react';
import { Building2, Users, ShieldAlert, Sparkles, Plus, Edit2, Trash2, RefreshCw, Calendar, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { axiosInstance } from '../services/axiosInstance';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog } from '../components/ui/dialog';
import { SearchBar } from '../components/ui/search-bar';
import { ConfirmDialog } from '../components/ui/confirm-dialog';

export const SuperAdminDashboard = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ totalCompanies: 0, totalUsers: 0, totalEmployees: 0 });

  // Dialog States
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const { register, handleSubmit, reset, setValue } = useForm();

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await axiosInstance.get(`/super-admin/companies?search=${search}&page=${page}&limit=10`);
      setCompanies(response.data.data.companies);
      setTotalPages(response.data.data.pagination.pages);
      setStats(response.data.data.stats);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to fetch platform configuration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, page]);

  const handleCreate = async (data) => {
    try {
      // Clear optional empty strings or map correct formats
      if (!data.website) delete data.website;
      if (!data.expiresAt) delete data.expiresAt;
      if (data.maxEmployees) data.maxEmployees = parseInt(data.maxEmployees, 10);

      await axiosInstance.post('/super-admin/companies', data);
      setSuccessMsg('Company workspace provisioned successfully.');
      setCreateOpen(false);
      reset();
      loadData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to provision company.');
    }
  };

  const handleEdit = async (data) => {
    if (!selectedCompany) return;
    try {
      if (!data.website) data.website = '';
      if (!data.expiresAt) data.expiresAt = null;
      if (data.maxEmployees) data.maxEmployees = parseInt(data.maxEmployees, 10);

      await axiosInstance.put(`/super-admin/companies/${selectedCompany._id}`, data);
      setSuccessMsg('Company settings updated successfully.');
      setEditOpen(false);
      setSelectedCompany(null);
      loadData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update company.');
    }
  };

  const handleDelete = async () => {
    if (!selectedCompany) return;
    try {
      await axiosInstance.delete(`/super-admin/companies/${selectedCompany._id}`);
      setSuccessMsg('Company workspace and logins suspended successfully.');
      setDeleteOpen(false);
      setSelectedCompany(null);
      loadData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to suspend company.');
    }
  };

  const openEdit = (comp) => {
    setSelectedCompany(comp);
    setValue('name', comp.name);
    setValue('email', comp.email);
    setValue('phone', comp.phone || '');
    setValue('website', comp.website || '');
    setValue('subscriptionPlan', comp.subscriptionPlan || 'Free');
    setValue('status', comp.status || 'Active');
    setValue('maxEmployees', comp.maxEmployees || 50);
    setValue('expiresAt', comp.expiresAt ? new Date(comp.expiresAt).toISOString().split('T')[0] : '');
    setEditOpen(true);
  };

  const openDelete = (comp) => {
    setSelectedCompany(comp);
    setDeleteOpen(true);
  };

  const statsItems = [
    { label: 'Total Companies', value: stats.totalCompanies, icon: Building2, desc: 'Registered tenants', color: 'text-blue-500' },
    { label: 'Active Logins', value: stats.totalUsers, icon: Users, desc: 'Total database credentials', color: 'text-violet-500' },
    { label: 'Linked Employees', value: stats.totalEmployees, icon: Users, desc: 'Aggregated profiles', color: 'text-emerald-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Platform Administration</h1>
            <Badge variant="success" className="gap-1 animate-pulse"><Sparkles className="h-3 w-3" /> Platform Console</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Manage organization workspaces, subscriptions, and platform status.</p>
        </div>
        <Button onClick={() => { reset(); setCreateOpen(true); }} className="vibrant-gradient text-white border-0 shadow-md gap-1.5 text-xs font-semibold">
          <Plus className="h-4 w-4" /> Provision Company
        </Button>
      </div>

      {/* Alert Messages */}
      {successMsg && (
        <div className="p-3 text-xs text-emerald-600 bg-emerald-50 rounded-lg font-medium border border-emerald-100 flex justify-between items-center">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="font-bold">×</button>
        </div>
      )}
      {errorMsg && (
        <div className="p-3 text-xs text-destructive bg-destructive/5 rounded-lg font-medium border border-destructive/10 flex justify-between items-center">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="font-bold">×</button>
        </div>
      )}

      {/* Grid Metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        {statsItems.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="hover:scale-[1.02] duration-300 shadow-sm border">
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
                <p className="text-[11px] text-muted-foreground mt-1">{stat.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tenant Matrix Table */}
      <Card className="shadow-sm border">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Company Workspaces</CardTitle>
            <CardDescription>Directory of all registered multi-tenant portals</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <SearchBar value={search} onChange={setSearch} placeholder="Search workspaces..." />
            <Button variant="outline" size="sm" onClick={loadData} className="gap-1.5 text-xs">
              <RefreshCw className="h-3 w-3" /> Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Admin Email</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Employee Cap</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-xs text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin inline mr-2 text-primary" /> Loading workspaces...
                  </TableCell>
                </TableRow>
              ) : companies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-xs text-muted-foreground">
                    No company workspaces found.
                  </TableCell>
                </TableRow>
              ) : (
                companies.map((comp) => (
                  <TableRow key={comp._id}>
                    <TableCell className="font-semibold text-xs text-foreground">{comp.name}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{comp.slug}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{comp.email}</TableCell>
                    <TableCell>
                      <Badge variant={comp.subscriptionPlan === 'Enterprise' ? 'success' : comp.subscriptionPlan === 'Premium' ? 'default' : 'secondary'} className="text-[10px]">
                        {comp.subscriptionPlan}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-foreground">{comp.maxEmployees} max</TableCell>
                    <TableCell>
                      <Badge variant={comp.status === 'Active' ? 'success' : 'destructive'} className="text-[10px]">
                        {comp.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(comp)}>
                          <Edit2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openDelete(comp)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive/80 hover:text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex justify-end gap-1.5 mt-4">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="text-xs">
                Previous
              </Button>
              <Badge variant="outline" className="px-3 text-xs">
                Page {page} of {totalPages}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="text-xs">
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Provision Company Dialog */}
      <Dialog isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Provision New Company">
        <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Company Name</label>
              <Input {...register('name')} placeholder="Acme Inc." required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Admin Email</label>
              <Input {...register('email')} type="email" placeholder="admin@acme.com" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Phone</label>
              <Input {...register('phone')} placeholder="+1 555-0199" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Website</label>
              <Input {...register('website')} placeholder="https://acme.com" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Plan</label>
              <select {...register('subscriptionPlan')} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm">
                <option value="Free">Free</option>
                <option value="Basic">Basic</option>
                <option value="Premium">Premium</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Max Employees</label>
              <Input {...register('maxEmployees')} type="number" defaultValue={50} required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Expiry Date</label>
              <Input {...register('expiresAt')} type="date" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="ghost" size="sm" type="button" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button size="sm" type="submit">Provision Portal</Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Company Dialog */}
      <Dialog isOpen={editOpen} onClose={() => setEditOpen(false)} title="Modify Company Settings">
        <form onSubmit={handleSubmit(handleEdit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Company Name</label>
              <Input {...register('name')} placeholder="Company Name" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Admin Email</label>
              <Input {...register('email')} type="email" placeholder="Email" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Phone</label>
              <Input {...register('phone')} placeholder="Phone" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Website</label>
              <Input {...register('website')} placeholder="Website" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1 col-span-1">
              <label className="text-xs font-semibold text-muted-foreground">Status</label>
              <select {...register('status')} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm">
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
            <div className="space-y-1 col-span-1">
              <label className="text-xs font-semibold text-muted-foreground">Plan</label>
              <select {...register('subscriptionPlan')} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm">
                <option value="Free">Free</option>
                <option value="Basic">Basic</option>
                <option value="Premium">Premium</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
            <div className="space-y-1 col-span-1">
              <label className="text-xs font-semibold text-muted-foreground">Max Employees</label>
              <Input {...register('maxEmployees')} type="number" required />
            </div>
            <div className="space-y-1 col-span-1">
              <label className="text-xs font-semibold text-muted-foreground">Expiry Date</label>
              <Input {...register('expiresAt')} type="date" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="ghost" size="sm" type="button" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button size="sm" type="submit">Save Changes</Button>
          </div>
        </form>
      </Dialog>

      {/* Confirm Suspension */}
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Suspend Workspace"
        message={`Are you sure you want to suspend company "${selectedCompany?.name}"? All associated employee profiles and system credentials will be disabled.`}
        confirmText="Suspend Portal"
        variant="destructive"
      />
    </div>
  );
};

export default SuperAdminDashboard;
