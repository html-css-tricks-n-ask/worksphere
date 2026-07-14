function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Edit2, Eye, Trash2, Download, Upload, Filter, RefreshCw, User, Mail } from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog } from '../components/ui/dialog';
import { SearchBar } from '../components/ui/search-bar';
import { FilterDrawer } from '../components/ui/filter-drawer';
import { ConfirmDialog } from '../components/ui/confirm-dialog';

export const EmployeeList = () => {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
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
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [importText, setImportText] = useState('');

  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

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
    } catch (err) {
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
    } catch (err) {
      setErrorMsg(err.message || 'JSON Import failed. Verify schema validation formatting.');
    }
  };

  const handleDelete = async () => {
    if (!selectedEmp) return;
    try {
      await axiosInstance.delete(`/employees/${selectedEmp.id}`);
      setSuccessMsg('Employee profile soft-deleted successfully.');
      setDeleteOpen(false);
      loadData();
    } catch (err) {
      setErrorMsg(_optionalChain([err, 'access', _ => _.response, 'optionalAccess', _2 => _2.data, 'optionalAccess', _3 => _3.message]) || 'Failed to soft delete employee.');
    }
  };

  const handleSendInvite = async (empId) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await axiosInstance.post(`/employees/${empId}/invite`);
      setSuccessMsg('Onboarding invitation email sent successfully.');
      loadData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to send account invitation.');
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
    React.createElement('div', { className: "space-y-6",}
      , React.createElement('div', { className: "flex items-center justify-between"  ,}
        , React.createElement('div', null
          , React.createElement('h1', { className: "text-2xl font-bold tracking-tight"  ,}, "Employee Registry" )
          , React.createElement('p', { className: "text-sm text-muted-foreground" ,}, "Manage profile folders, document archives, invites, and careers."      )
        )
        , React.createElement('div', { className: "flex gap-2" ,}
          , React.createElement(Button, { variant: "outline", size: "sm", onClick: () => setImportOpen(true), className: "gap-1.5 text-xs font-semibold"  ,}
            , React.createElement(Upload, { className: "h-4 w-4" ,} ), " Bulk Import"
          )
          , React.createElement(Button, { variant: "outline", size: "sm", onClick: handleExportCSV, className: "gap-1.5 text-xs font-semibold"  ,}
            , React.createElement(Download, { className: "h-4 w-4" ,} ), " Export CSV"
          )
          , React.createElement(Link, { to: "/employees/create",}
            , React.createElement(Button, { className: "vibrant-gradient text-white border-0 shadow-md gap-1.5 text-xs font-semibold"      ,}
              , React.createElement(Plus, { className: "h-4 w-4" ,} ), " Register Employee"
            )
          )
        )
      )

      , successMsg && (
        React.createElement('div', { className: "p-3 text-xs text-emerald-600 bg-emerald-50 rounded-lg font-medium border border-emerald-100 flex justify-between items-center"          ,}
          , React.createElement('span', null, successMsg)
          , React.createElement('button', { onClick: () => setSuccessMsg(null), className: "font-bold",}, "×")
        )
      )

      , errorMsg && (
        React.createElement('div', { className: "p-3 text-xs text-destructive bg-destructive/5 rounded-lg font-medium border border-destructive/10 flex justify-between items-center"          ,}
          , React.createElement('span', null, errorMsg)
          , React.createElement('button', { onClick: () => setErrorMsg(null), className: "font-bold",}, "×")
        )
      )

      /* Main Container */
      , React.createElement(Card, { className: "shadow-sm",}
        , React.createElement(CardHeader, { className: "pb-3 flex flex-row items-center justify-between"    ,}
          , React.createElement(SearchBar, { value: search, onChange: setSearch, placeholder: "Search employees..." ,} )
          , React.createElement('div', { className: "flex gap-2" ,}
            , React.createElement(Button, { variant: "outline", size: "sm", onClick: () => setFilterOpen(true), className: "gap-1.5 text-xs" ,}
              , React.createElement(Filter, { className: "h-3.5 w-3.5" ,} ), " Filters"
            )
            , React.createElement(Button, { variant: "outline", size: "sm", onClick: loadData, className: "gap-1.5 text-xs" ,}
              , React.createElement(RefreshCw, { className: "h-3.5 w-3.5" ,} ), " Refresh"
            )
          )
        )
        , React.createElement(CardContent, null
          , React.createElement(Table, null
            , React.createElement(TableHeader, null
              , React.createElement(TableRow, null
                , React.createElement(TableHead, null, "Employee")
                , React.createElement(TableHead, null, "Employee ID" )
                , React.createElement(TableHead, null, "Department")
                , React.createElement(TableHead, null, "Designation")
                , React.createElement(TableHead, null, "Work Type" )
                , React.createElement(TableHead, null, "Invite Status" )
                , React.createElement(TableHead, null, "Status")
                , React.createElement(TableHead, { className: "text-right",}, "Actions")
              )
            )
            , React.createElement(TableBody, null
              , loading ? (
                React.createElement(TableRow, null
                  , React.createElement(TableCell, { colSpan: 8, className: "text-center py-8 text-xs text-muted-foreground"   ,}, "Loading registry folder..."

                  )
                )
              ) : employees.length === 0 ? (
                React.createElement(TableRow, null
                  , React.createElement(TableCell, { colSpan: 8, className: "text-center py-8 text-xs text-muted-foreground"   ,}, "No employees matching filters found."

                  )
                )
              ) : (
                employees.map((emp) => (
                  React.createElement(TableRow, { key: emp.id,}
                    , React.createElement(TableCell, { className: "font-semibold text-xs flex items-center gap-3"    ,}
                      , React.createElement('div', { className: "w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-muted"       ,}
                        , emp.avatar ? (
                          React.createElement('img', { src: emp.avatar, alt: "Avatar", className: "w-full h-full object-cover"  ,} )
                        ) : (
                          React.createElement(User, { className: "h-4 w-4 text-muted-foreground"  ,} )
                        )
                      )
                      , React.createElement('div', { className: "flex flex-col" ,}
                        , React.createElement('span', null, emp.firstName, " " , emp.lastName)
                        , React.createElement('span', { className: "text-[10px] text-muted-foreground font-normal"  ,}, emp.email)
                      )
                    )
                    , React.createElement(TableCell, { className: "text-xs font-semibold font-mono"  ,}, emp.employeeId)
                    , React.createElement(TableCell, { className: "text-xs",}, _optionalChain([emp, 'access', _4 => _4.professionalInfo, 'optionalAccess', _5 => _5.departmentId, 'optionalAccess', _6 => _6.name]) || 'Unassigned')
                    , React.createElement(TableCell, { className: "text-xs",}, _optionalChain([emp, 'access', _7 => _7.professionalInfo, 'optionalAccess', _8 => _8.designationId, 'optionalAccess', _9 => _9.title]) || 'Unassigned')
                    , React.createElement(TableCell, { className: "text-xs",}
                      , React.createElement(Badge, { variant: "outline",}, _optionalChain([emp, 'access', _10 => _10.professionalInfo, 'optionalAccess', _11 => _11.employmentType]) || 'Full-Time')
                    )
                    , React.createElement(TableCell, null
                      , React.createElement(Badge, { variant: emp.inviteStatus === 'Accepted' ? 'default' : emp.inviteStatus === 'Sent' ? 'outline' : 'secondary', className: emp.inviteStatus === 'Sent' ? 'text-indigo-600 border-indigo-200 bg-indigo-50/50' : '' }
                        , emp.inviteStatus || 'Pending'
                      )
                    )
                    , React.createElement(TableCell, null
                      , React.createElement(Badge, { variant: emp.status === 'Active' ? 'default' : 'secondary',}
                        , emp.status
                      )
                    )
                    , React.createElement(TableCell, { className: "text-right",}
                      , React.createElement('div', { className: "flex justify-end gap-1.5"  ,}
                        , emp.inviteStatus !== 'Accepted' && (
                          React.createElement(Button, { variant: "ghost", size: "icon", className: "h-7 w-7" , onClick: () => handleSendInvite(emp.id), title: "Send Activation Email" ,}
                            , React.createElement(Mail, { className: "h-3.5 w-3.5 text-indigo-600 hover:text-indigo-800"   ,} )
                          )
                        )
                        , React.createElement(Button, { variant: "ghost", size: "icon", className: "h-7 w-7" , onClick: () => navigate(`/employees/${emp.id}`),}
                          , React.createElement(Eye, { className: "h-3.5 w-3.5 text-muted-foreground hover:text-foreground"   ,} )
                        )
                        , React.createElement(Button, { variant: "ghost", size: "icon", className: "h-7 w-7" , onClick: () => navigate(`/employees/${emp.id}/edit`),}
                          , React.createElement(Edit2, { className: "h-3.5 w-3.5 text-muted-foreground hover:text-foreground"   ,} )
                        )
                        , React.createElement(Button, { variant: "ghost", size: "icon", className: "h-7 w-7" , onClick: () => { setSelectedEmp(emp); setDeleteOpen(true); },}
                          , React.createElement(Trash2, { className: "h-3.5 w-3.5 text-destructive/80 hover:text-destructive"   ,} )
                        )
                      )
                    )
                  )
                ))
              )
            )
          )

          /* Pagination */
          , totalPages > 1 && (
            React.createElement('div', { className: "flex justify-end gap-1.5 mt-4"   ,}
              , React.createElement(Button, { variant: "outline", size: "sm", onClick: () => setPage(p => Math.max(p - 1, 1)), disabled: page === 1, className: "text-xs",}, "Previous"

              )
              , React.createElement(Badge, { variant: "outline", className: "px-3 text-xs" ,}, "Page "
                 , page, " of "  , totalPages
              )
              , React.createElement(Button, { variant: "outline", size: "sm", onClick: () => setPage(p => Math.min(p + 1, totalPages)), disabled: page === totalPages, className: "text-xs",}, "Next"

              )
            )
          )
        )
      )

      /* Filter Drawer */
      , React.createElement(FilterDrawer, { isOpen: filterOpen, onClose: () => setFilterOpen(false), onClear: clearFilters,}
        , React.createElement('div', { className: "space-y-4",}
          , React.createElement('div', { className: "space-y-1.5",}
            , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground block mb-1"    ,}, "Department")
            , React.createElement('select', {
              value: deptFilter,
              onChange: (e) => setDeptFilter(e.target.value),
              className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus-visible:outline-none"           ,}

              , React.createElement('option', { value: "",}, "All Departments" )
              , departments.map((d) => (
                React.createElement('option', { key: d.id, value: d.id,}, d.name)
              ))
            )
          )

          , React.createElement('div', { className: "space-y-1.5",}
            , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground block mb-1"    ,}, "Designation")
            , React.createElement('select', {
              value: desigFilter,
              onChange: (e) => setDesigFilter(e.target.value),
              className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus-visible:outline-none"           ,}

              , React.createElement('option', { value: "",}, "All Designations" )
              , designations.map((d) => (
                React.createElement('option', { key: d.id, value: d.id,}, d.title)
              ))
            )
          )

          , React.createElement('div', { className: "space-y-1.5",}
            , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground block mb-1"    ,}, "Status")
            , React.createElement('select', {
              value: statusFilter,
              onChange: (e) => setStatusFilter(e.target.value),
              className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm"          ,}

              , React.createElement('option', { value: "",}, "All Statuses" )
              , React.createElement('option', { value: "Active",}, "Active")
              , React.createElement('option', { value: "Inactive",}, "Inactive")
            )
          )

          , React.createElement('div', { className: "space-y-1.5",}
            , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground block mb-1"    ,}, "Work Type" )
            , React.createElement('select', {
              value: typeFilter,
              onChange: (e) => setTypeFilter(e.target.value),
              className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm"          ,}

              , React.createElement('option', { value: "",}, "All Work Types"  )
              , React.createElement('option', { value: "Full-Time",}, "Full-Time")
              , React.createElement('option', { value: "Part-Time",}, "Part-Time")
              , React.createElement('option', { value: "Contract",}, "Contract")
              , React.createElement('option', { value: "Intern",}, "Intern")
            )
          )
        )
      )

      /* Confirm Deletion */
      , React.createElement(ConfirmDialog, {
        isOpen: deleteOpen,
        onClose: () => setDeleteOpen(false),
        onConfirm: handleDelete,
        title: "Soft Delete Employee"  ,
        message: `Are you sure you want to delete profile registry for "${_optionalChain([selectedEmp, 'optionalAccess', _12 => _12.firstName])} ${_optionalChain([selectedEmp, 'optionalAccess', _13 => _13.lastName])}"? This blocks their SSO login permissions.`,
        confirmText: "Delete",
        variant: "destructive",}
      )

      /* Import JSON Dialog */
      , React.createElement(Dialog, { isOpen: importOpen, onClose: () => setImportOpen(false), title: "Bulk Import Employees (JSON Format)"    ,}
        , React.createElement('div', { className: "space-y-4",}
          , React.createElement('p', { className: "text-[10px] text-muted-foreground" ,}, "Paste JSON array representation conforming to the employee creation validation rules."

          )
          , React.createElement('textarea', {
            value: importText,
            onChange: (e) => setImportText(e.target.value),
            placeholder: "[ { \"employeeId\": \"EMP010\", \"firstName\": \"John\", \"lastName\": \"Smith\", \"email\": \"john.smith@comp.com\" } ]"           ,
            className: "flex min-h-[150px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs font-mono shadow-sm focus-visible:outline-none"            ,}
          )
          , React.createElement('div', { className: "flex justify-end gap-2 border-t pt-3"    ,}
            , React.createElement(Button, { variant: "ghost", size: "sm", onClick: () => setImportOpen(false),}, "Cancel"

            )
            , React.createElement(Button, { size: "sm", onClick: handleImportJSON, disabled: !importText,}, "Process Import"

            )
          )
        )
      )
    )
  );
};

export default EmployeeList;
