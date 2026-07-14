import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, MapPin, Globe, RefreshCw, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { axiosInstance } from '../services/axiosInstance';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog } from '../components/ui/dialog';
import { ConfirmDialog } from '../components/ui/confirm-dialog';

export const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedLoc, setSelectedLoc] = useState(null);

  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const { register, handleSubmit, reset, setValue } = useForm();

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await axiosInstance.get('/locations');
      setLocations(response.data.data);
    } catch (err) {
      setErrorMsg('Failed to load office locations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (data) => {
    try {
      await axiosInstance.post('/locations', data);
      setSuccessMsg('Office location created successfully.');
      setCreateOpen(false);
      reset();
      loadData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create location.');
    }
  };

  const handleEdit = async (data) => {
    if (!selectedLoc) return;
    try {
      await axiosInstance.put(`/locations/${selectedLoc._id}`, data);
      setSuccessMsg('Location details updated successfully.');
      setEditOpen(false);
      setSelectedLoc(null);
      loadData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update location.');
    }
  };

  const handleDelete = async () => {
    if (!selectedLoc) return;
    try {
      await axiosInstance.delete(`/locations/${selectedLoc._id}`);
      setSuccessMsg('Office location removed successfully.');
      setDeleteOpen(false);
      setSelectedLoc(null);
      loadData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete location.');
    }
  };

  const openEdit = (loc) => {
    setSelectedLoc(loc);
    setValue('name', loc.name);
    setValue('address', loc.address || '');
    setValue('timezone', loc.timezone || 'America/New_York');
    setEditOpen(true);
  };

  const openDelete = (loc) => {
    setSelectedLoc(loc);
    setDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Office Locations</h1>
          <p className="text-sm text-muted-foreground">Manage regional branch offices and regional settings.</p>
        </div>
        <Button onClick={() => { reset(); setCreateOpen(true); }} className="vibrant-gradient text-white border-0 shadow-md gap-1.5 text-xs font-semibold">
          <Plus className="h-4 w-4" /> Add Location
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

      {/* Locations Matrix */}
      <Card className="shadow-sm border">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle>Physical & Remote Branches</CardTitle>
            <CardDescription>Directory of office locations mapped to your tenant</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadData} className="gap-1.5 text-xs">
            <RefreshCw className="h-3 w-3" /> Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Timezone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-xs text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin inline mr-2 text-primary" /> Loading branches...
                  </TableCell>
                </TableRow>
              ) : locations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-xs text-muted-foreground">
                    No office locations registered.
                  </TableCell>
                </TableRow>
              ) : (
                locations.map((loc) => (
                  <TableRow key={loc._id}>
                    <TableCell className="font-semibold text-xs text-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" /> {loc.name}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-sm truncate">{loc.address || 'Not specified'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      <span className="flex items-center gap-1">
                        <Globe className="h-3.5 w-3.5" /> {loc.timezone}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(loc)}>
                          <Edit2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openDelete(loc)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive/80 hover:text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add Office Location">
        <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Office / Location Name</label>
            <Input {...register('name')} placeholder="e.g. London HQ, Berlin Hub" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Full Address</label>
            <Input {...register('address')} placeholder="123 Corporate Blvd, Suite 400" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Timezone</label>
            <select {...register('timezone')} defaultValue="America/New_York" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus-visible:outline-none">
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="Europe/Berlin">Europe/Berlin (CET)</option>
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="ghost" size="sm" type="button" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button size="sm" type="submit">Create Location</Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Location Settings">
        <form onSubmit={handleSubmit(handleEdit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Office / Location Name</label>
            <Input {...register('name')} placeholder="Location Name" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Full Address</label>
            <Input {...register('address')} placeholder="Address" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Timezone</label>
            <select {...register('timezone')} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus-visible:outline-none">
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="Europe/Berlin">Europe/Berlin (CET)</option>
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="ghost" size="sm" type="button" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button size="sm" type="submit">Save Changes</Button>
          </div>
        </form>
      </Dialog>

      {/* Confirm deletion */}
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Remove Office Location"
        message={`Are you sure you want to remove the location "${selectedLoc?.name}"? You will not be able to delete it if any active departments map to it.`}
        confirmText="Remove Branch"
        variant="destructive"
      />
    </div>
  );
};

export default Locations;
