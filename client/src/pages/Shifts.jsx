 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Timer, Plus, Trash2, Pencil, Check, X, AlertCircle } from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';

// ─── Types ─────────────────────────────────────────────────────────────────










// ─── Shift Form Modal ───────────────────────────────────────────────────────
const ShiftModal



 = ({ shift, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: _optionalChain([shift, 'optionalAccess', _ => _.name]) || '',
    startTime: _optionalChain([shift, 'optionalAccess', _2 => _2.startTime]) || '09:00',
    endTime: _optionalChain([shift, 'optionalAccess', _3 => _3.endTime]) || '18:00',
    gracePeriod: _nullishCoalesce(_optionalChain([shift, 'optionalAccess', _4 => _4.gracePeriod]), () => ( 15)),
    breakTime: _nullishCoalesce(_optionalChain([shift, 'optionalAccess', _5 => _5.breakTime]), () => ( 60)),
    workingHours: _nullishCoalesce(_optionalChain([shift, 'optionalAccess', _6 => _6.workingHours]), () => ( 8)),
  });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (data) =>
      shift
        ? axiosInstance.put(`/shifts/${shift._id}`, data)
        : axiosInstance.post('/shifts', data),
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (err) => setError(_optionalChain([err, 'access', _7 => _7.response, 'optionalAccess', _8 => _8.data, 'optionalAccess', _9 => _9.message]) || 'Failed to save shift.'),
  });

  return (
    React.createElement('div', { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"        , onClick: onClose,}
      , React.createElement('div', { className: "bg-card border border-border/60 rounded-2xl shadow-2xl w-full max-w-lg"      , onClick: e => e.stopPropagation(),}
        , React.createElement('div', { className: "p-6 border-b border-border/40"  ,}
          , React.createElement('h2', { className: "text-lg font-bold flex items-center gap-2"    ,}
            , React.createElement(Timer, { size: 20, className: "text-blue-500",} )
            , shift ? 'Edit Shift' : 'Create New Shift'
          )
          , React.createElement('p', { className: "text-sm text-muted-foreground mt-1"  ,}
            , shift ? 'Update shift schedule configuration' : 'Define a new work schedule'
          )
        )
        , React.createElement('div', { className: "p-6 space-y-4" ,}
          , React.createElement('div', null
            , React.createElement('label', { className: "text-sm font-medium block mb-1.5"   ,}, "Shift Name" )
            , React.createElement('input', {
              type: "text",
              value: form.name,
              onChange: e => setForm(f => ({ ...f, name: e.target.value })),
              placeholder: "e.g. Morning Shift"  ,
              className: "w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"          ,}
            )
          )
          , React.createElement('div', { className: "grid grid-cols-2 gap-3"  ,}
            , React.createElement('div', null
              , React.createElement('label', { className: "text-sm font-medium block mb-1.5"   ,}, "Start Time" )
              , React.createElement('input', {
                type: "time",
                value: form.startTime,
                onChange: e => setForm(f => ({ ...f, startTime: e.target.value })),
                className: "w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"          ,}
              )
            )
            , React.createElement('div', null
              , React.createElement('label', { className: "text-sm font-medium block mb-1.5"   ,}, "End Time" )
              , React.createElement('input', {
                type: "time",
                value: form.endTime,
                onChange: e => setForm(f => ({ ...f, endTime: e.target.value })),
                className: "w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"          ,}
              )
            )
          )
          , React.createElement('div', { className: "grid grid-cols-3 gap-3"  ,}
            , React.createElement('div', null
              , React.createElement('label', { className: "text-sm font-medium block mb-1.5"   ,}, "Working Hours" )
              , React.createElement('input', {
                type: "number",
                min: 1,
                max: 24,
                value: form.workingHours,
                onChange: e => setForm(f => ({ ...f, workingHours: parseFloat(e.target.value) })),
                className: "w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"          ,}
              )
            )
            , React.createElement('div', null
              , React.createElement('label', { className: "text-sm font-medium block mb-1.5"   ,}, "Grace Period (min)"  )
              , React.createElement('input', {
                type: "number",
                min: 0,
                max: 60,
                value: form.gracePeriod,
                onChange: e => setForm(f => ({ ...f, gracePeriod: parseInt(e.target.value) })),
                className: "w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"          ,}
              )
            )
            , React.createElement('div', null
              , React.createElement('label', { className: "text-sm font-medium block mb-1.5"   ,}, "Break Time (min)"  )
              , React.createElement('input', {
                type: "number",
                min: 0,
                max: 120,
                value: form.breakTime,
                onChange: e => setForm(f => ({ ...f, breakTime: parseInt(e.target.value) })),
                className: "w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"          ,}
              )
            )
          )
          , error && (
            React.createElement('div', { className: "flex items-center gap-2 text-rose-600 text-sm bg-rose-500/10 px-3 py-2 rounded-lg"        ,}
              , React.createElement(AlertCircle, { size: 14,} )
              , error
            )
          )
        )
        , React.createElement('div', { className: "p-6 border-t border-border/40 flex justify-end gap-3"     ,}
          , React.createElement(Button, { variant: "outline", onClick: onClose,}, "Cancel")
          , React.createElement(Button, {
            onClick: () => mutation.mutate(form),
            disabled: mutation.isPending || !form.name,
            className: "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"     ,}

            , mutation.isPending ? 'Saving…' : shift ? 'Update Shift' : 'Create Shift'
          )
        )
      )
    )
  );
};

// ─── Shift Card ─────────────────────────────────────────────────────────────
const ShiftCard



 = ({ shift, onEdit, onDelete }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Determine shift period label
  const hour = parseInt(shift.startTime.split(':')[0]);
  const label = hour < 12 ? 'Morning' : hour < 17 ? 'Day' : 'Evening/Night';
  const labelColor = hour < 12 ? 'text-amber-600 bg-amber-500/10'
    : hour < 17 ? 'text-blue-600 bg-blue-500/10'
    : 'text-violet-600 bg-violet-500/10';

  return (
    React.createElement(Card, { className: "group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border-2 hover:border-blue-500/20"      ,}
      , React.createElement(CardContent, { className: "p-5",}
        , React.createElement('div', { className: "flex items-start justify-between mb-4"   ,}
          , React.createElement('div', { className: "flex items-center gap-3"  ,}
            , React.createElement('div', { className: "w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center"        ,}
              , React.createElement(Timer, { size: 22, className: "text-blue-600",} )
            )
            , React.createElement('div', null
              , React.createElement('h3', { className: "font-bold text-base leading-tight"  ,}, shift.name)
              , React.createElement('span', { className: `inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${labelColor}`,}
                , label, " Shift"
              )
            )
          )

          /* Actions */
          , React.createElement('div', { className: "flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"    ,}
            , React.createElement('button', {
              onClick: onEdit,
              className: "p-1.5 rounded-lg hover:bg-blue-500/10 hover:text-blue-600 text-muted-foreground transition-colors"     ,}

              , React.createElement(Pencil, { size: 14,} )
            )
            , !confirmDelete ? (
              React.createElement('button', {
                onClick: () => setConfirmDelete(true),
                className: "p-1.5 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 text-muted-foreground transition-colors"     ,}

                , React.createElement(Trash2, { size: 14,} )
              )
            ) : (
              React.createElement('div', { className: "flex gap-1" ,}
                , React.createElement('button', { onClick: onDelete, className: "p-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-colors"     ,}
                  , React.createElement(Check, { size: 14,} )
                )
                , React.createElement('button', { onClick: () => setConfirmDelete(false), className: "p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"    ,}
                  , React.createElement(X, { size: 14,} )
                )
              )
            )
          )
        )

        /* Time block */
        , React.createElement('div', { className: "flex items-center gap-2 mb-4"   ,}
          , React.createElement('div', { className: "flex-1 bg-muted/40 rounded-lg p-3 text-center"    ,}
            , React.createElement('p', { className: "text-xs text-muted-foreground mb-0.5"  ,}, "Start")
            , React.createElement('p', { className: "text-lg font-bold tabular-nums"  ,}, shift.startTime)
          )
          , React.createElement('div', { className: "text-muted-foreground text-xl font-light"  ,}, "→")
          , React.createElement('div', { className: "flex-1 bg-muted/40 rounded-lg p-3 text-center"    ,}
            , React.createElement('p', { className: "text-xs text-muted-foreground mb-0.5"  ,}, "End")
            , React.createElement('p', { className: "text-lg font-bold tabular-nums"  ,}, shift.endTime)
          )
        )

        /* Stats row */
        , React.createElement('div', { className: "grid grid-cols-3 gap-2 text-center"   ,}
          , React.createElement('div', { className: "bg-blue-500/5 rounded-lg p-2"  ,}
            , React.createElement('p', { className: "text-xs text-muted-foreground" ,}, "Hours")
            , React.createElement('p', { className: "text-sm font-bold text-blue-600"  ,}, shift.workingHours, "h")
          )
          , React.createElement('div', { className: "bg-amber-500/5 rounded-lg p-2"  ,}
            , React.createElement('p', { className: "text-xs text-muted-foreground" ,}, "Grace")
            , React.createElement('p', { className: "text-sm font-bold text-amber-600"  ,}, shift.gracePeriod, "m")
          )
          , React.createElement('div', { className: "bg-violet-500/5 rounded-lg p-2"  ,}
            , React.createElement('p', { className: "text-xs text-muted-foreground" ,}, "Break")
            , React.createElement('p', { className: "text-sm font-bold text-violet-600"  ,}, shift.breakTime, "m")
          )
        )
      )
    )
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
const Shifts = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editShift, setEditShift] = useState(null);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['shifts'],
    queryFn: () => axiosInstance.get('/shifts?limit=50').then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/shifts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shifts'] }),
  });

  const shifts = (_optionalChain([data, 'optionalAccess', _10 => _10.data, 'optionalAccess', _11 => _11.shifts]) || []).filter(
    s => !search || s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    React.createElement('div', { className: "space-y-6 p-1" ,}
      /* Header */
      , React.createElement('div', { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4"     ,}
        , React.createElement('div', null
          , React.createElement('h1', { className: "text-2xl font-bold tracking-tight flex items-center gap-2"     ,}
            , React.createElement(Timer, { className: "text-blue-500", size: 24,} ), "Shift Management"

          )
          , React.createElement('p', { className: "text-sm text-muted-foreground mt-1"  ,}, "Configure and manage work schedule templates"     )
        )
        , React.createElement(Button, {
          onClick: () => setShowModal(true),
          className: "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-500/20 gap-2"        ,}

          , React.createElement(Plus, { size: 16,} ), "Create Shift"

        )
      )

      /* Modals */
      , showModal && (
        React.createElement(ShiftModal, {
          onClose: () => setShowModal(false),
          onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shifts'] }),}
        )
      )
      , editShift && (
        React.createElement(ShiftModal, {
          shift: editShift,
          onClose: () => setEditShift(null),
          onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shifts'] }),}
        )
      )

      /* Search */
      , React.createElement('div', { className: "flex items-center gap-3"  ,}
        , React.createElement('input', {
          type: "text",
          value: search,
          onChange: e => setSearch(e.target.value),
          placeholder: "Search shifts…" ,
          className: "h-10 px-4 rounded-xl border border-border bg-background text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/30"          ,}
        )
        , React.createElement('p', { className: "text-sm text-muted-foreground" ,}, shifts.length, " shift" , shifts.length !== 1 ? 's' : '', " configured" )
      )

      /* Shifts Grid */
      , isLoading ? (
        React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"    ,}
          , [1, 2, 3].map(i => (
            React.createElement(Card, { key: i, className: "animate-pulse",}
              , React.createElement(CardContent, { className: "p-5 h-48" ,} )
            )
          ))
        )
      ) : shifts.length === 0 ? (
        React.createElement(Card, { className: "border-dashed",}
          , React.createElement(CardContent, { className: "py-20 text-center" ,}
            , React.createElement(Timer, { size: 48, className: "mx-auto mb-4 opacity-20"  ,} )
            , React.createElement('p', { className: "font-semibold text-lg" ,}, "No shifts configured"  )
            , React.createElement('p', { className: "text-sm text-muted-foreground mt-1 mb-4"   ,}, "Create your first shift to assign employees to work schedules"         )
            , React.createElement(Button, { onClick: () => setShowModal(true), className: "gap-2",}
              , React.createElement(Plus, { size: 15,} ), " Create First Shift"
            )
          )
        )
      ) : (
        React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"     ,}
          , shifts.map(shift => (
            React.createElement(ShiftCard, {
              key: shift._id,
              shift: shift,
              onEdit: () => setEditShift(shift),
              onDelete: () => deleteMutation.mutate(shift._id),}
            )
          ))
        )
      )

      /* Summary card */
      , shifts.length > 0 && (
        React.createElement(Card, { className: "bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border-blue-500/20"   ,}
          , React.createElement(CardHeader, null
            , React.createElement(CardTitle, { className: "text-base",}, "Shifts Overview" )
            , React.createElement(CardDescription, null, "Summary of all configured work schedules"     )
          )
          , React.createElement(CardContent, null
            , React.createElement('div', { className: "overflow-x-auto",}
              , React.createElement('table', { className: "w-full text-sm" ,}
                , React.createElement('thead', null
                  , React.createElement('tr', { className: "border-b border-border/40" ,}
                    , React.createElement('th', { className: "text-left py-2 px-3 font-medium text-muted-foreground"    ,}, "Name")
                    , React.createElement('th', { className: "text-left py-2 px-3 font-medium text-muted-foreground"    ,}, "Timing")
                    , React.createElement('th', { className: "text-left py-2 px-3 font-medium text-muted-foreground"    ,}, "Hours")
                    , React.createElement('th', { className: "text-left py-2 px-3 font-medium text-muted-foreground"    ,}, "Grace")
                    , React.createElement('th', { className: "text-left py-2 px-3 font-medium text-muted-foreground"    ,}, "Break")
                  )
                )
                , React.createElement('tbody', null
                  , shifts.map(s => (
                    React.createElement('tr', { key: s._id, className: "border-b border-border/30 hover:bg-muted/20 transition-colors"   ,}
                      , React.createElement('td', { className: "py-2.5 px-3 font-medium"  ,}, s.name)
                      , React.createElement('td', { className: "py-2.5 px-3 text-muted-foreground"  ,}, s.startTime, " – "  , s.endTime)
                      , React.createElement('td', { className: "py-2.5 px-3" ,}, React.createElement('span', { className: "font-semibold text-blue-600" ,}, s.workingHours, "h"))
                      , React.createElement('td', { className: "py-2.5 px-3 text-muted-foreground"  ,}, s.gracePeriod, " min" )
                      , React.createElement('td', { className: "py-2.5 px-3 text-muted-foreground"  ,}, s.breakTime, " min" )
                    )
                  ))
                )
              )
            )
          )
        )
      )
    )
  );
};

export default Shifts;
