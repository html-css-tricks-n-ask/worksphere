 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, RefreshCw, Award } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { axiosInstance } from '../services/axiosInstance';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog } from '../components/ui/dialog';
import { SearchBar } from '../components/ui/search-bar';
import { ConfirmDialog } from '../components/ui/confirm-dialog';

export const Designations = () => {
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedDesig, setSelectedDesig] = useState(null);

  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const { register, handleSubmit, reset, setValue } = useForm();

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await axiosInstance.get(`/designations?search=${search}&page=${page}&limit=10`);
      setDesignations(response.data.data.designations);
      setTotalPages(response.data.data.pagination.pages);
    } catch (err) {
      setErrorMsg('Failed to fetch designations data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, page]);

  const handleCreate = async (data) => {
    try {
      await axiosInstance.post('/designations', data);
      setSuccessMsg('Designation created successfully.');
      setCreateOpen(false);
      reset();
      loadData();
    } catch (err) {
      setErrorMsg(_optionalChain([err, 'access', _ => _.response, 'optionalAccess', _2 => _2.data, 'optionalAccess', _3 => _3.message]) || 'Failed to create designation.');
    }
  };

  const handleEdit = async (data) => {
    if (!selectedDesig) return;
    try {
      await axiosInstance.put(`/designations/${selectedDesig.id}`, data);
      setSuccessMsg('Designation updated successfully.');
      setEditOpen(false);
      setSelectedDesig(null);
      loadData();
    } catch (err) {
      setErrorMsg(_optionalChain([err, 'access', _4 => _4.response, 'optionalAccess', _5 => _5.data, 'optionalAccess', _6 => _6.message]) || 'Failed to update designation.');
    }
  };

  const handleDelete = async () => {
    if (!selectedDesig) return;
    try {
      await axiosInstance.delete(`/designations/${selectedDesig.id}`);
      setSuccessMsg('Designation deleted successfully.');
      loadData();
    } catch (err) {
      setErrorMsg(_optionalChain([err, 'access', _7 => _7.response, 'optionalAccess', _8 => _8.data, 'optionalAccess', _9 => _9.message]) || 'Failed to delete designation.');
    }
  };

  const openEdit = (desig) => {
    setSelectedDesig(desig);
    setValue('title', desig.title);
    setValue('level', desig.level || '');
    setValue('description', desig.description || '');
    setEditOpen(true);
  };

  const openDelete = (desig) => {
    setSelectedDesig(desig);
    setDeleteOpen(true);
  };

  return (
    React.createElement('div', { className: "space-y-6",}
      , React.createElement('div', { className: "flex items-center justify-between"  ,}
        , React.createElement('div', null
          , React.createElement('h1', { className: "text-2xl font-bold tracking-tight"  ,}, "Designation Matrix" )
          , React.createElement('p', { className: "text-sm text-muted-foreground" ,}, "Manage organization levels, titles, and grades."     )
        )
        , React.createElement(Button, { onClick: () => { reset(); setCreateOpen(true); }, className: "vibrant-gradient text-white border-0 shadow-md gap-1.5 text-xs font-semibold"      ,}
          , React.createElement(Plus, { className: "h-4 w-4" ,} ), " Add Designation"
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
          , React.createElement(SearchBar, { value: search, onChange: setSearch, placeholder: "Search designations..." ,} )
          , React.createElement(Button, { variant: "outline", size: "sm", onClick: loadData, className: "gap-1.5 text-xs" ,}
            , React.createElement(RefreshCw, { className: "h-3 w-3" ,} ), " Refresh"
          )
        )
        , React.createElement(CardContent, null
          , React.createElement(Table, null
            , React.createElement(TableHeader, null
              , React.createElement(TableRow, null
                , React.createElement(TableHead, null, "Designation Title" )
                , React.createElement(TableHead, null, "Grade Level" )
                , React.createElement(TableHead, null, "Description")
                , React.createElement(TableHead, { className: "text-right",}, "Actions")
              )
            )
            , React.createElement(TableBody, null
              , loading ? (
                React.createElement(TableRow, null
                  , React.createElement(TableCell, { colSpan: 4, className: "text-center py-8 text-xs text-muted-foreground"   ,}, "Loading designations matrix..."

                  )
                )
              ) : designations.length === 0 ? (
                React.createElement(TableRow, null
                  , React.createElement(TableCell, { colSpan: 4, className: "text-center py-8 text-xs text-muted-foreground"   ,}, "No designations found."

                  )
                )
              ) : (
                designations.map((desig) => (
                  React.createElement(TableRow, { key: desig.id,}
                    , React.createElement(TableCell, { className: "font-semibold text-xs flex items-center gap-2"    ,}
                      , React.createElement(Award, { className: "h-4 w-4 text-primary/70 shrink-0"   ,} )
                      , React.createElement('span', null, desig.title)
                    )
                    , React.createElement(TableCell, null
                      , React.createElement(Badge, { variant: "outline", className: "text-xs bg-muted/30" ,}
                        , desig.level || 'N/A'
                      )
                    )
                    , React.createElement(TableCell, { className: "text-xs max-w-xs truncate text-muted-foreground"   ,}, desig.description || 'No description')
                    , React.createElement(TableCell, { className: "text-right",}
                      , React.createElement('div', { className: "flex justify-end gap-1.5"  ,}
                        , React.createElement(Button, { variant: "ghost", size: "icon", className: "h-7 w-7" , onClick: () => openEdit(desig),}
                          , React.createElement(Edit2, { className: "h-3.5 w-3.5 text-muted-foreground hover:text-foreground"   ,} )
                        )
                        , React.createElement(Button, { variant: "ghost", size: "icon", className: "h-7 w-7" , onClick: () => openDelete(desig),}
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
      , React.createElement(Dialog, { isOpen: createOpen, onClose: () => setCreateOpen(false), title: "Add Designation" ,}
        , React.createElement('form', { onSubmit: handleSubmit(handleCreate), className: "space-y-4",}
          , React.createElement('div', { className: "space-y-1.5",}
            , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  ,}, "Title Name" )
            , React.createElement(Input, { ...register('title'), placeholder: "e.g. Software Engineer, HR Specialist"    , required: true,} )
          )
          , React.createElement('div', { className: "space-y-1.5",}
            , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  ,}, "Grade Level" )
            , React.createElement(Input, { ...register('level'), placeholder: "e.g. L1, L2, L3"   ,} )
          )
          , React.createElement('div', { className: "space-y-1.5",}
            , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  ,}, "Description")
            , React.createElement('textarea', {
              ...register('description'),
              placeholder: "Provide role description..."  ,
              className: "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"             ,}
            )
          )
          , React.createElement('div', { className: "flex justify-end gap-2 pt-3 border-t"    ,}
            , React.createElement(Button, { variant: "ghost", size: "sm", type: "button", onClick: () => setCreateOpen(false),}, "Cancel"

            )
            , React.createElement(Button, { size: "sm", type: "submit",}, "Save Designation"

            )
          )
        )
      )

      /* Edit Dialog */
      , React.createElement(Dialog, { isOpen: editOpen, onClose: () => setEditOpen(false), title: "Modify Designation" ,}
        , React.createElement('form', { onSubmit: handleSubmit(handleEdit), className: "space-y-4",}
          , React.createElement('div', { className: "space-y-1.5",}
            , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  ,}, "Title Name" )
            , React.createElement(Input, { ...register('title'), placeholder: "Title", required: true,} )
          )
          , React.createElement('div', { className: "space-y-1.5",}
            , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  ,}, "Grade Level" )
            , React.createElement(Input, { ...register('level'), placeholder: "e.g. L1, L2"  ,} )
          )
          , React.createElement('div', { className: "space-y-1.5",}
            , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  ,}, "Description")
            , React.createElement('textarea', {
              ...register('description'),
              placeholder: "Description",
              className: "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1"            ,}
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
        title: "Delete Designation" ,
        message: `Are you sure you want to delete designation "${_optionalChain([selectedDesig, 'optionalAccess', _10 => _10.title])}"? You can restore it later if needed.`,
        confirmText: "Delete",
        variant: "destructive",}
      )
    )
  );
};

export default Designations;
