import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Users, RefreshCw, Loader2, Landmark } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { axiosInstance } from '../services/axiosInstance';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog } from '../components/ui/dialog';
import { ConfirmDialog } from '../components/ui/confirm-dialog';

export const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const { register, handleSubmit, reset, setValue } = useForm();

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [teamsRes, deptsRes, employeesRes] = await Promise.all([
        axiosInstance.get('/teams'),
        axiosInstance.get('/departments?limit=100'),
        axiosInstance.get('/employees?limit=100'),
      ]);
      setTeams(teamsRes.data.data);
      setDepartments(deptsRes.data.data.departments);
      setEmployees(employeesRes.data.data.employees);
    } catch (err) {
      setErrorMsg('Failed to load team structures.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (data) => {
    try {
      if (!data.managerId) delete data.managerId;
      await axiosInstance.post('/teams', data);
      setSuccessMsg('Team created successfully.');
      setCreateOpen(false);
      reset();
      loadData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create team.');
    }
  };

  const handleEdit = async (data) => {
    if (!selectedTeam) return;
    try {
      if (!data.managerId) data.managerId = null;
      await axiosInstance.put(`/teams/${selectedTeam._id}`, data);
      setSuccessMsg('Team settings updated successfully.');
      setEditOpen(false);
      setSelectedTeam(null);
      loadData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update team.');
    }
  };

  const handleDelete = async () => {
    if (!selectedTeam) return;
    try {
      await axiosInstance.delete(`/teams/${selectedTeam._id}`);
      setSuccessMsg('Team removed successfully.');
      setDeleteOpen(false);
      setSelectedTeam(null);
      loadData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete team.');
    }
  };

  const openEdit = (team) => {
    setSelectedTeam(team);
    setValue('name', team.name);
    setValue('departmentId', team.departmentId?._id || team.departmentId || '');
    setValue('managerId', team.managerId?._id || team.managerId || '');
    setEditOpen(true);
  };

  const openDelete = (team) => {
    setSelectedTeam(team);
    setDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Teams & Groups</h1>
          <p className="text-sm text-muted-foreground">Define smaller working groups, projects, and Team Leads.</p>
        </div>
        <Button onClick={() => { reset(); setCreateOpen(true); }} className="vibrant-gradient text-white border-0 shadow-md gap-1.5 text-xs font-semibold">
          <Plus className="h-4 w-4" /> Create Team
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

      {/* Teams Matrix */}
      <Card className="shadow-sm border">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle>Organization Teams</CardTitle>
            <CardDescription>Directory of working teams mapped under departments</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadData} className="gap-1.5 text-xs">
            <RefreshCw className="h-3 w-3" /> Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team Name</TableHead>
                <TableHead>Parent Department</TableHead>
                <TableHead>Team Lead / Manager</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-xs text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin inline mr-2 text-primary" /> Loading teams...
                  </TableCell>
                </TableRow>
              ) : teams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-xs text-muted-foreground">
                    No teams registered.
                  </TableCell>
                </TableRow>
              ) : (
                teams.map((team) => (
                  <TableRow key={team._id}>
                    <TableCell className="font-semibold text-xs text-foreground flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-600" /> {team.name}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Landmark className="h-3.5 w-3.5 text-muted-foreground" />
                        {team.departmentId?.name || team.departmentId || 'Unassigned'}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-foreground">
                      {team.managerId ? `${team.managerId.firstName} ${team.managerId.lastName}` : 'Unassigned'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(team)}>
                          <Edit2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openDelete(team)}>
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
      <Dialog isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create New Team">
        <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Team Name</label>
            <Input {...register('name')} placeholder="e.g. Frontend Core, Enterprise Sales" required />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Parent Department</label>
              <select {...register('departmentId')} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus-visible:outline-none" required>
                <option value="">Select Department...</option>
                {departments.map((d) => (
                  <option key={d.id || d._id} value={d.id || d._id}>{d.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Team Lead / Manager</label>
              <select {...register('managerId')} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus-visible:outline-none">
                <option value="">Unassigned</option>
                {employees.map((emp) => (
                  <option key={emp.id || emp._id} value={emp.id || emp._id}>{emp.firstName} {emp.lastName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="ghost" size="sm" type="button" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button size="sm" type="submit">Create Team</Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog isOpen={editOpen} onClose={() => setEditOpen(false)} title="Modify Team Settings">
        <form onSubmit={handleSubmit(handleEdit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Team Name</label>
            <Input {...register('name')} placeholder="Team Name" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Parent Department</label>
              <select {...register('departmentId')} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus-visible:outline-none" required>
                <option value="">Select Department...</option>
                {departments.map((d) => (
                  <option key={d.id || d._id} value={d.id || d._id}>{d.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Team Lead / Manager</label>
              <select {...register('managerId')} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus-visible:outline-none">
                <option value="">Unassigned</option>
                {employees.map((emp) => (
                  <option key={emp.id || emp._id} value={emp.id || emp._id}>{emp.firstName} {emp.lastName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="ghost" size="sm" type="button" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button size="sm" type="submit">Save Changes</Button>
          </div>
        </form>
      </Dialog>

      {/* Confirm Deletion */}
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Remove Team Structure"
        message={`Are you sure you want to remove team "${selectedTeam?.name}"? Associated employees will be cleared of this team association.`}
        confirmText="Remove Team"
        variant="destructive"
      />
    </div>
  );
};

export default Teams;
