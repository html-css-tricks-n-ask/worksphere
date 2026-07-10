import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { axiosInstance } from '../services/axiosInstance.js';
import { Button } from '../components/ui/button.js';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.js';
import { Input } from '../components/ui/input.js';
import { Badge } from '../components/ui/badge.js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table.js';
import { Dialog } from '../components/ui/dialog.js';
import { SearchBar } from '../components/ui/search-bar.js';
import { ConfirmDialog } from '../components/ui/confirm-dialog.js';

export const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<any | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm();

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [listRes, statsRes] = await Promise.all([
        axiosInstance.get(`/departments?search=${search}&page=${page}&limit=10`),
        axiosInstance.get('/departments/stats'),
      ]);
      setDepartments(listRes.data.data.departments);
      setTotalPages(listRes.data.data.pagination.pages);
      setStats(statsRes.data.data);
    } catch (err: any) {
      setErrorMsg('Failed to fetch departments data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, page]);

  const handleCreate = async (data: any) => {
    try {
      await axiosInstance.post('/departments', data);
      setSuccessMsg('Department created successfully.');
      setCreateOpen(false);
      reset();
      loadData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to create department.');
    }
  };

  const handleEdit = async (data: any) => {
    if (!selectedDept) return;
    try {
      await axiosInstance.put(`/departments/${selectedDept.id}`, data);
      setSuccessMsg('Department updated successfully.');
      setEditOpen(false);
      setSelectedDept(null);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update department.');
    }
  };

  const handleDelete = async () => {
    if (!selectedDept) return;
    try {
      await axiosInstance.delete(`/departments/${selectedDept.id}`);
      setSuccessMsg('Department deleted successfully.');
      loadData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete department.');
    }
  };

  const openEdit = (dept: any) => {
    setSelectedDept(dept);
    setValue('name', dept.name);
    setValue('description', dept.description || '');
    setValue('status', dept.status);
    setEditOpen(true);
  };

  const openDelete = (dept: any) => {
    setSelectedDept(dept);
    setDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Department Management</h1>
          <p className="text-sm text-muted-foreground">Define business structures, managers, and fields.</p>
        </div>
        <Button onClick={() => { reset(); setCreateOpen(true); }} className="vibrant-gradient text-white border-0 shadow-md gap-1.5 text-xs font-semibold">
          <Plus className="h-4 w-4" /> Create Department
        </Button>
      </div>

      {/* Stats Widgets */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Total Departments</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold text-emerald-600 uppercase">Active Units</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold text-amber-600 uppercase">Inactive Units</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

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

      {/* List Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <SearchBar value={search} onChange={setSearch} placeholder="Search departments..." />
          <Button variant="outline" size="sm" onClick={loadData} className="gap-1.5 text-xs">
            <RefreshCw className="h-3 w-3" /> Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Head of Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-xs text-muted-foreground">
                    Loading departments dataset...
                  </TableCell>
                </TableRow>
              ) : departments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-xs text-muted-foreground">
                    No departments found.
                  </TableCell>
                </TableRow>
              ) : (
                departments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-semibold text-xs">{dept.name}</TableCell>
                    <TableCell className="text-xs max-w-xs truncate text-muted-foreground">{dept.description || 'No description'}</TableCell>
                    <TableCell className="text-xs">
                      {dept.departmentHead ? `${dept.departmentHead.firstName} ${dept.departmentHead.lastName}` : 'Unassigned'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={dept.status === 'Active' ? 'default' : 'secondary'}>
                        {dept.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(dept)}>
                          <Edit2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openDelete(dept)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive/80 hover:text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
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

      {/* Create Dialog */}
      <Dialog isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create New Department">
        <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Department Name</label>
            <Input {...register('name')} placeholder="e.g. Engineering, Sales" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Description</label>
            <textarea
              {...register('description')}
              placeholder="Provide a short description..."
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="ghost" size="sm" type="button" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit">
              Save Department
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog isOpen={editOpen} onClose={() => setEditOpen(false)} title="Modify Department">
        <form onSubmit={handleSubmit(handleEdit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Department Name</label>
            <Input {...register('name')} placeholder="Name" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Description</label>
            <textarea
              {...register('description')}
              placeholder="Description"
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Status</label>
            <select
              {...register('status')}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="ghost" size="sm" type="button" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Confirm Deletion */}
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Department"
        message={`Are you sure you want to delete the department "${selectedDept?.name}"? You can restore it later if needed.`}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};

export default Departments;
