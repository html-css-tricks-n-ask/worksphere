import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, RefreshCw, Award } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { axiosInstance } from '../services/axiosInstance.js';
import { Button } from '../components/ui/button.js';
import { Card, CardContent, CardHeader } from '../components/ui/card.js';
import { Input } from '../components/ui/input.js';
import { Badge } from '../components/ui/badge.js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table.js';
import { Dialog } from '../components/ui/dialog.js';
import { SearchBar } from '../components/ui/search-bar.js';
import { ConfirmDialog } from '../components/ui/confirm-dialog.js';

export const Designations: React.FC = () => {
  const [designations, setDesignations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedDesig, setSelectedDesig] = useState<any | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm();

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await axiosInstance.get(`/designations?search=${search}&page=${page}&limit=10`);
      setDesignations(response.data.data.designations);
      setTotalPages(response.data.data.pagination.pages);
    } catch (err: any) {
      setErrorMsg('Failed to fetch designations data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, page]);

  const handleCreate = async (data: any) => {
    try {
      await axiosInstance.post('/designations', data);
      setSuccessMsg('Designation created successfully.');
      setCreateOpen(false);
      reset();
      loadData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to create designation.');
    }
  };

  const handleEdit = async (data: any) => {
    if (!selectedDesig) return;
    try {
      await axiosInstance.put(`/designations/${selectedDesig.id}`, data);
      setSuccessMsg('Designation updated successfully.');
      setEditOpen(false);
      setSelectedDesig(null);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update designation.');
    }
  };

  const handleDelete = async () => {
    if (!selectedDesig) return;
    try {
      await axiosInstance.delete(`/designations/${selectedDesig.id}`);
      setSuccessMsg('Designation deleted successfully.');
      loadData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete designation.');
    }
  };

  const openEdit = (desig: any) => {
    setSelectedDesig(desig);
    setValue('title', desig.title);
    setValue('level', desig.level || '');
    setValue('description', desig.description || '');
    setEditOpen(true);
  };

  const openDelete = (desig: any) => {
    setSelectedDesig(desig);
    setDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Designation Matrix</h1>
          <p className="text-sm text-muted-foreground">Manage organization levels, titles, and grades.</p>
        </div>
        <Button onClick={() => { reset(); setCreateOpen(true); }} className="vibrant-gradient text-white border-0 shadow-md gap-1.5 text-xs font-semibold">
          <Plus className="h-4 w-4" /> Add Designation
        </Button>
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
          <SearchBar value={search} onChange={setSearch} placeholder="Search designations..." />
          <Button variant="outline" size="sm" onClick={loadData} className="gap-1.5 text-xs">
            <RefreshCw className="h-3 w-3" /> Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Designation Title</TableHead>
                <TableHead>Grade Level</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-xs text-muted-foreground">
                    Loading designations matrix...
                  </TableCell>
                </TableRow>
              ) : designations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-xs text-muted-foreground">
                    No designations found.
                  </TableCell>
                </TableRow>
              ) : (
                designations.map((desig) => (
                  <TableRow key={desig.id}>
                    <TableCell className="font-semibold text-xs flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary/70 shrink-0" />
                      <span>{desig.title}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs bg-muted/30">
                        {desig.level || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs max-w-xs truncate text-muted-foreground">{desig.description || 'No description'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(desig)}>
                          <Edit2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openDelete(desig)}>
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
      <Dialog isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add Designation">
        <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Title Name</label>
            <Input {...register('title')} placeholder="e.g. Software Engineer, HR Specialist" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Grade Level</label>
            <Input {...register('level')} placeholder="e.g. L1, L2, L3" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Description</label>
            <textarea
              {...register('description')}
              placeholder="Provide role description..."
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="ghost" size="sm" type="button" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit">
              Save Designation
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog isOpen={editOpen} onClose={() => setEditOpen(false)} title="Modify Designation">
        <form onSubmit={handleSubmit(handleEdit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Title Name</label>
            <Input {...register('title')} placeholder="Title" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Grade Level</label>
            <Input {...register('level')} placeholder="e.g. L1, L2" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Description</label>
            <textarea
              {...register('description')}
              placeholder="Description"
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1"
            />
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
        title="Delete Designation"
        message={`Are you sure you want to delete designation "${selectedDesig?.title}"? You can restore it later if needed.`}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};

export default Designations;
