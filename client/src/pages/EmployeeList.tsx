import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Edit2, Eye, Trash2, Download, Upload, Filter, RefreshCw, User } from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance.js';
import { Button } from '../components/ui/button.js';
import { Card, CardContent, CardHeader } from '../components/ui/card.js';
import { Badge } from '../components/ui/badge.js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table.js';
import { Dialog } from '../components/ui/dialog.js';
import { SearchBar } from '../components/ui/search-bar.js';
import { FilterDrawer } from '../components/ui/filter-drawer.js';
import { ConfirmDialog } from '../components/ui/confirm-dialog.js';

export const EmployeeList: React.FC = () => {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filtering
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [filterOpen, setFilterOpen] = useState(false);
  const [deptFilter, setDeptFilter] = useState('');
  const [desigFilter, setDesigFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Dialog actions
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<any | null>(null);
  const [importText, setImportText] = useState('');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchFiltersOptions = async () => {
    try {
      const [deptRes, desigRes] = await Promise.all([
        axiosInstance.get('/departments?limit=100'),
        axiosInstance.get('/designations?limit=100'),
      ]);
      setDepartments(deptRes.data.data.departments || []);
      setDesignations(desigRes.data.data.designations || []);
    } catch (err) {
      // Ignore filter load failures
    }
  };

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const url = `/employees?search=${search}&departmentId=${deptFilter}&designationId=${desigFilter}&status=${statusFilter}&employmentType=${typeFilter}&page=${page}&limit=10`;
      const response = await axiosInstance.get(url);
      setEmployees(response.data.data.employees);
      setTotalPages(response.data.data.pagination.pages);
    } catch (err: any) {
      setErrorMsg('Failed to fetch employee registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiltersOptions();
  }, []);

  useEffect(() => {
    loadData();
  }, [search, deptFilter, desigFilter, statusFilter, typeFilter, page]);

  const handleExportCSV = async () => {
    try {
      const response = await axiosInstance.get('/employees/export', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'employees_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setErrorMsg('Failed to download CSV export file.');
    }
  };

  const handleImportJSON = async () => {
    if (!importText) return;
    try {
      const parsed = JSON.parse(importText);
      const payload = Array.isArray(parsed) ? { employees: parsed } : parsed;

      const response = await axiosInstance.post('/employees/import', payload);
      setSuccessMsg(response.data.message);
      setImportOpen(false);
      setImportText('');
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'JSON Import failed. Verify schema validation formatting.');
    }
  };

  const handleDelete = async () => {
    if (!selectedEmp) return;
    try {
      await axiosInstance.delete(`/employees/${selectedEmp.id}`);
      setSuccessMsg('Employee profile soft-deleted successfully.');
      loadData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to soft delete employee.');
    }
  };

  const clearFilters = () => {
    setDeptFilter('');
    setDesigFilter('');
    setStatusFilter('');
    setTypeFilter('');
    setPage(1);
    setFilterOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employee Registry</h1>
          <p className="text-sm text-muted-foreground">Manage profile folders, document archives, and careers.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)} className="gap-1.5 text-xs font-semibold">
            <Upload className="h-4 w-4" /> Bulk Import
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5 text-xs font-semibold">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Link to="/employees/create">
            <Button className="vibrant-gradient text-white border-0 shadow-md gap-1.5 text-xs font-semibold">
              <Plus className="h-4 w-4" /> Register Employee
            </Button>
          </Link>
        </div>
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

      {/* Main Container */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <SearchBar value={search} onChange={setSearch} placeholder="Search employees..." />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setFilterOpen(true)} className="gap-1.5 text-xs">
              <Filter className="h-3.5 w-3.5" /> Filters
            </Button>
            <Button variant="outline" size="sm" onClick={loadData} className="gap-1.5 text-xs">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Work Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-xs text-muted-foreground">
                    Loading registry folder...
                  </TableCell>
                </TableRow>
              ) : employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-xs text-muted-foreground">
                    No employees matching filters found.
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-semibold text-xs flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-muted">
                        {emp.avatar ? (
                          <img src={emp.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span>{emp.firstName} {emp.lastName}</span>
                        <span className="text-[10px] text-muted-foreground font-normal">{emp.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-semibold font-mono">{emp.employeeId}</TableCell>
                    <TableCell className="text-xs">{emp.professionalInfo?.departmentId?.name || 'Unassigned'}</TableCell>
                    <TableCell className="text-xs">{emp.professionalInfo?.designationId?.title || 'Unassigned'}</TableCell>
                    <TableCell className="text-xs">
                      <Badge variant="outline">{emp.professionalInfo?.employmentType || 'Full-Time'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={emp.status === 'Active' ? 'default' : 'secondary'}>
                        {emp.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/employees/${emp.id}`)}>
                          <Eye className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/employees/${emp.id}/edit`)}>
                          <Edit2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setSelectedEmp(emp); setDeleteOpen(true); }}>
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

      {/* Filter Drawer */}
      <FilterDrawer isOpen={filterOpen} onClose={() => setFilterOpen(false)} onClear={clearFilters}>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Department</label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus-visible:outline-none"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Designation</label>
            <select
              value={desigFilter}
              onChange={(e) => setDesigFilter(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus-visible:outline-none"
            >
              <option value="">All Designations</option>
              {designations.map((d) => (
                <option key={d.id} value={d.id}>{d.title}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Work Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm"
            >
              <option value="">All Work Types</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Contract">Contract</option>
              <option value="Intern">Intern</option>
            </select>
          </div>
        </div>
      </FilterDrawer>

      {/* Confirm Deletion */}
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Soft Delete Employee"
        message={`Are you sure you want to delete profile registry for "${selectedEmp?.firstName} ${selectedEmp?.lastName}"? This blocks their SSO login permissions.`}
        confirmText="Delete"
        variant="destructive"
      />

      {/* Import JSON Dialog */}
      <Dialog isOpen={importOpen} onClose={() => setImportOpen(false)} title="Bulk Import Employees (JSON Format)">
        <div className="space-y-4">
          <p className="text-[10px] text-muted-foreground">
            Paste JSON array representation conforming to the employee creation validation rules.
          </p>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='[ { "employeeId": "EMP010", "firstName": "John", "lastName": "Smith", "email": "john.smith@comp.com" } ]'
            className="flex min-h-[150px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs font-mono shadow-sm focus-visible:outline-none"
          />
          <div className="flex justify-end gap-2 border-t pt-3">
            <Button variant="ghost" size="sm" onClick={() => setImportOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleImportJSON} disabled={!importText}>
              Process Import
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default EmployeeList;
