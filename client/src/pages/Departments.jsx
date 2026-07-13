 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { axiosInstance } from '../services/axiosInstance';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog } from '../components/ui/dialog';
import { SearchBar } from '../components/ui/search-bar';
import { ConfirmDialog } from '../components/ui/confirm-dialog';

export const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

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
    } catch (err) {
      setErrorMsg('Failed to fetch departments data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, page]);

  const handleCreate = async (data) => {
    try {
      await axiosInstance.post('/departments', data);
      setSuccessMsg('Department created successfully.');
      setCreateOpen(false);
      reset();
      loadData();
    } catch (err) {
      setErrorMsg(_optionalChain([err, 'access', _ => _.response, 'optionalAccess', _2 => _2.data, 'optionalAccess', _3 => _3.message]) || 'Failed to create department.');
    }
  };

  const handleEdit = async (data) => {
    if (!selectedDept) return;
    try {
      await axiosInstance.put(`/departments/${selectedDept.id}`, data);
      setSuccessMsg('Department updated successfully.');
      setEditOpen(false);
      setSelectedDept(null);
      loadData();
    } catch (err) {
      setErrorMsg(_optionalChain([err, 'access', _4 => _4.response, 'optionalAccess', _5 => _5.data, 'optionalAccess', _6 => _6.message]) || 'Failed to update department.');
    }
  };

  const handleDelete = async () => {
    if (!selectedDept) return;
    try {
      await axiosInstance.delete(`/departments/${selectedDept.id}`);
      setSuccessMsg('Department deleted successfully.');
      loadData();
    } catch (err) {
      setErrorMsg(_optionalChain([err, 'access', _7 => _7.response, 'optionalAccess', _8 => _8.data, 'optionalAccess', _9 => _9.message]) || 'Failed to delete department.');
    }
  };

  const openEdit = (dept) => {
    setSelectedDept(dept);
    setValue('name', dept.name);
    setValue('description', dept.description || '');
    setValue('status', dept.status);
    setEditOpen(true);
  };

  const openDelete = (dept) => {
    setSelectedDept(dept);
    setDeleteOpen(true);
  };

  return (
    React.createElement('div', { className: "space-y-6",}
      , React.createElement('div', { className: "flex items-center justify-between"  ,}
        , React.createElement('div', null
          , React.createElement('h1', { className: "text-2xl font-bold tracking-tight"  ,}, "Department Management" )
          , React.createElement('p', { className: "text-sm text-muted-foreground" ,}, "Define business structures, managers, and fields."     )
        )
        , React.createElement(Button, { onClick: () => { reset(); setCreateOpen(true); }, className: "vibrant-gradient text-white border-0 shadow-md gap-1.5 text-xs font-semibold"      ,}
          , React.createElement(Plus, { className: "h-4 w-4" ,} ), " Create Department"
        )
      )

      /* Stats Widgets */
      , React.createElement('div', { className: "grid gap-4 md:grid-cols-3"  ,}
        , React.createElement(Card, { className: "shadow-sm",}
          , React.createElement(CardHeader, { className: "flex flex-row items-center justify-between pb-2 space-y-0"     ,}
            , React.createElement(CardTitle, { className: "text-xs font-bold text-muted-foreground uppercase"   ,}, "Total Departments" )
            , React.createElement(Layers, { className: "h-4 w-4 text-muted-foreground"  ,} )
          )
          , React.createElement(CardContent, null
            , React.createElement('div', { className: "text-2xl font-bold" ,}, stats.total)
          )
        )
        , React.createElement(Card, { className: "shadow-sm",}
          , React.createElement(CardHeader, { className: "flex flex-row items-center justify-between pb-2 space-y-0"     ,}
            , React.createElement(CardTitle, { className: "text-xs font-bold text-emerald-600 uppercase"   ,}, "Active Units" )
            , React.createElement(CheckCircle2, { className: "h-4 w-4 text-emerald-500"  ,} )
          )
          , React.createElement(CardContent, null
            , React.createElement('div', { className: "text-2xl font-bold text-emerald-600"  ,}, stats.active)
          )
        )
        , React.createElement(Card, { className: "shadow-sm",}
          , React.createElement(CardHeader, { className: "flex flex-row items-center justify-between pb-2 space-y-0"     ,}
            , React.createElement(CardTitle, { className: "text-xs font-bold text-amber-600 uppercase"   ,}, "Inactive Units" )
            , React.createElement(AlertCircle, { className: "h-4 w-4 text-amber-500"  ,} )
          )
          , React.createElement(CardContent, null
            , React.createElement('div', { className: "text-2xl font-bold text-amber-600"  ,}, stats.inactive)
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

      /* List Table */
      , React.createElement(Card, { className: "shadow-sm",}
        , React.createElement(CardHeader, { className: "pb-3 flex flex-row items-center justify-between"    ,}
          , React.createElement(SearchBar, { value: search, onChange: setSearch, placeholder: "Search departments..." ,} )
          , React.createElement(Button, { variant: "outline", size: "sm", onClick: loadData, className: "gap-1.5 text-xs" ,}
            , React.createElement(RefreshCw, { className: "h-3 w-3" ,} ), " Refresh"
          )
        )
        , React.createElement(CardContent, null
          , React.createElement(Table, null
            , React.createElement(TableHeader, null
              , React.createElement(TableRow, null
                , React.createElement(TableHead, null, "Department Name" )
                , React.createElement(TableHead, null, "Description")
                , React.createElement(TableHead, null, "Head of Department"  )
                , React.createElement(TableHead, null, "Status")
                , React.createElement(TableHead, { className: "text-right",}, "Actions")
              )
            )
            , React.createElement(TableBody, null
              , loading ? (
                React.createElement(TableRow, null
                  , React.createElement(TableCell, { colSpan: 5, className: "text-center py-8 text-xs text-muted-foreground"   ,}, "Loading departments dataset..."

                  )
                )
              ) : departments.length === 0 ? (
                React.createElement(TableRow, null
                  , React.createElement(TableCell, { colSpan: 5, className: "text-center py-8 text-xs text-muted-foreground"   ,}, "No departments found."

                  )
                )
              ) : (
                departments.map((dept) => (
                  React.createElement(TableRow, { key: dept.id,}
                    , React.createElement(TableCell, { className: "font-semibold text-xs" ,}, dept.name)
                    , React.createElement(TableCell, { className: "text-xs max-w-xs truncate text-muted-foreground"   ,}, dept.description || 'No description')
                    , React.createElement(TableCell, { className: "text-xs",}
                      , dept.departmentHead ? `${dept.departmentHead.firstName} ${dept.departmentHead.lastName}` : 'Unassigned'
                    )
                    , React.createElement(TableCell, null
                      , React.createElement(Badge, { variant: dept.status === 'Active' ? 'default' : 'secondary',}
                        , dept.status
                      )
                    )
                    , React.createElement(TableCell, { className: "text-right",}
                      , React.createElement('div', { className: "flex justify-end gap-1.5"  ,}
                        , React.createElement(Button, { variant: "ghost", size: "icon", className: "h-7 w-7" , onClick: () => openEdit(dept),}
                          , React.createElement(Edit2, { className: "h-3.5 w-3.5 text-muted-foreground hover:text-foreground"   ,} )
                        )
                        , React.createElement(Button, { variant: "ghost", size: "icon", className: "h-7 w-7" , onClick: () => openDelete(dept),}
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

      /* Create Dialog */
      , React.createElement(Dialog, { isOpen: createOpen, onClose: () => setCreateOpen(false), title: "Create New Department"  ,}
        , React.createElement('form', { onSubmit: handleSubmit(handleCreate), className: "space-y-4",}
          , React.createElement('div', { className: "space-y-1.5",}
            , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  ,}, "Department Name" )
            , React.createElement(Input, { ...register('name'), placeholder: "e.g. Engineering, Sales"  , required: true,} )
          )
          , React.createElement('div', { className: "space-y-1.5",}
            , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  ,}, "Description")
            , React.createElement('textarea', {
              ...register('description'),
              placeholder: "Provide a short description..."   ,
              className: "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"             ,}
            )
          )
          , React.createElement('div', { className: "flex justify-end gap-2 pt-3 border-t"    ,}
            , React.createElement(Button, { variant: "ghost", size: "sm", type: "button", onClick: () => setCreateOpen(false),}, "Cancel"

            )
            , React.createElement(Button, { size: "sm", type: "submit",}, "Save Department"

            )
          )
        )
      )

      /* Edit Dialog */
      , React.createElement(Dialog, { isOpen: editOpen, onClose: () => setEditOpen(false), title: "Modify Department" ,}
        , React.createElement('form', { onSubmit: handleSubmit(handleEdit), className: "space-y-4",}
          , React.createElement('div', { className: "space-y-1.5",}
            , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  ,}, "Department Name" )
            , React.createElement(Input, { ...register('name'), placeholder: "Name", required: true,} )
          )
          , React.createElement('div', { className: "space-y-1.5",}
            , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  ,}, "Description")
            , React.createElement('textarea', {
              ...register('description'),
              placeholder: "Description",
              className: "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"             ,}
            )
          )
          , React.createElement('div', { className: "space-y-1.5",}
            , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground block mb-1"    ,}, "Status")
            , React.createElement('select', {
              ...register('status'),
              className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1"            ,}

              , React.createElement('option', { value: "Active",}, "Active")
              , React.createElement('option', { value: "Inactive",}, "Inactive")
            )
          )
          , React.createElement('div', { className: "flex justify-end gap-2 pt-3 border-t"    ,}
            , React.createElement(Button, { variant: "ghost", size: "sm", type: "button", onClick: () => setEditOpen(false),}, "Cancel"

            )
            , React.createElement(Button, { size: "sm", type: "submit",}, "Save Changes"

            )
          )
        )
      )

      /* Confirm Deletion */
      , React.createElement(ConfirmDialog, {
        isOpen: deleteOpen,
        onClose: () => setDeleteOpen(false),
        onConfirm: handleDelete,
        title: "Delete Department" ,
        message: `Are you sure you want to delete the department "${_optionalChain([selectedDept, 'optionalAccess', _10 => _10.name])}"? You can restore it later if needed.`,
        confirmText: "Delete",
        variant: "destructive",}
      )
    )
  );
};

export default Departments;
