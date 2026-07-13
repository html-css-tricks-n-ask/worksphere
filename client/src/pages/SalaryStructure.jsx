 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, AlertCircle, Wallet } from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';




























const StructureModal



 = ({ structure, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    employeeId: _optionalChain([structure, 'optionalAccess', _ => _.employeeId, 'optionalAccess', _2 => _2.id]) || '',
    basicSalary: _optionalChain([structure, 'optionalAccess', _3 => _3.basicSalary]) || 3000,
    hra: _optionalChain([structure, 'optionalAccess', _4 => _4.hra]) || 1000,
    specialAllowance: _optionalChain([structure, 'optionalAccess', _5 => _5.specialAllowance]) || 500,
    conveyance: _optionalChain([structure, 'optionalAccess', _6 => _6.conveyance]) || 200,
    medicalAllowance: _optionalChain([structure, 'optionalAccess', _7 => _7.medicalAllowance]) || 150,
    bonus: _optionalChain([structure, 'optionalAccess', _8 => _8.bonus]) || 0,
    incentive: _optionalChain([structure, 'optionalAccess', _9 => _9.incentive]) || 0,
    overtimePay: _optionalChain([structure, 'optionalAccess', _10 => _10.overtimePay]) || 0,
    pf: _optionalChain([structure, 'optionalAccess', _11 => _11.pf]) || 360,
    esi: _optionalChain([structure, 'optionalAccess', _12 => _12.esi]) || 100,
    professionalTax: _optionalChain([structure, 'optionalAccess', _13 => _13.professionalTax]) || 200,
    incomeTax: _optionalChain([structure, 'optionalAccess', _14 => _14.incomeTax]) || 400,
    otherDeductions: _optionalChain([structure, 'optionalAccess', _15 => _15.otherDeductions]) || 0,
  });

  const [error, setError] = useState('');

  // Fetch employees options list
  const { data: empData } = useQuery({
    queryKey: ['employees-options'],
    queryFn: () => axiosInstance.get('/employees?limit=200').then(r => r.data),
  });

  const mutation = useMutation({
    mutationFn: (data) =>
      structure
        ? axiosInstance.put(`/payroll/salary-structure/${structure._id}`, data)
        : axiosInstance.post('/payroll/salary-structure', data),
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (err) => setError(_optionalChain([err, 'access', _16 => _16.response, 'optionalAccess', _17 => _17.data, 'optionalAccess', _18 => _18.message]) || 'Failed to configure structure.'),
  });

  const employees = _optionalChain([empData, 'optionalAccess', _19 => _19.data, 'optionalAccess', _20 => _20.employees]) || [];

  return (
    React.createElement('div', { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"        , onClick: onClose,}
      , React.createElement('div', { className: "bg-card border border-border/60 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"        , onClick: e => e.stopPropagation(),}
        , React.createElement('div', { className: "p-6 border-b border-border/40"  ,}
          , React.createElement('h2', { className: "text-lg font-bold flex items-center gap-2"    ,}
            , React.createElement(Wallet, { size: 20, className: "text-indigo-500",} )
            , structure ? 'Modify Salary Settings' : 'Configure New Salary Structure'
          )
        )

        , React.createElement('div', { className: "p-6 space-y-6" ,}
          , !structure && (
            React.createElement('div', null
              , React.createElement('label', { className: "text-xs font-semibold block mb-1.5"   ,}, "Select Employee" )
              , React.createElement('select', {
                value: form.employeeId,
                onChange: e => setForm(f => ({ ...f, employeeId: e.target.value })),
                className: "w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"       ,}

                , React.createElement('option', { value: "",}, "Choose employee..." )
                , employees.map(e => (
                  React.createElement('option', { key: e.id, value: e.id,}, e.firstName, " " , e.lastName, " (" , e.employeeId, ")")
                ))
              )
            )
          )

          , React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 gap-6"   ,}
            /* Earnings segment */
            , React.createElement('div', { className: "space-y-4",}
              , React.createElement('h3', { className: "text-sm font-bold text-indigo-500 border-b pb-1"    ,}, "Monthly Earnings" )
              , React.createElement('div', { className: "space-y-2",}
                , React.createElement('label', { className: "text-xs font-semibold block"  ,}, "Basic Salary" )
                , React.createElement('input', {
                  type: "number",
                  value: form.basicSalary,
                  onChange: e => setForm(f => ({ ...f, basicSalary: parseFloat(e.target.value) || 0 })),
                  className: "w-full h-9 px-3 rounded-lg border border-border bg-background text-sm"       ,}
                )
              )
              , React.createElement('div', { className: "space-y-2",}
                , React.createElement('label', { className: "text-xs font-semibold block"  ,}, "House Rent Allowance (HRA)"   )
                , React.createElement('input', {
                  type: "number",
                  value: form.hra,
                  onChange: e => setForm(f => ({ ...f, hra: parseFloat(e.target.value) || 0 })),
                  className: "w-full h-9 px-3 rounded-lg border border-border bg-background text-sm"       ,}
                )
              )
              , React.createElement('div', { className: "space-y-2",}
                , React.createElement('label', { className: "text-xs font-semibold block"  ,}, "Special Allowance" )
                , React.createElement('input', {
                  type: "number",
                  value: form.specialAllowance,
                  onChange: e => setForm(f => ({ ...f, specialAllowance: parseFloat(e.target.value) || 0 })),
                  className: "w-full h-9 px-3 rounded-lg border border-border bg-background text-sm"       ,}
                )
              )
              , React.createElement('div', { className: "space-y-2",}
                , React.createElement('label', { className: "text-xs font-semibold block"  ,}, "Conveyance Allowance" )
                , React.createElement('input', {
                  type: "number",
                  value: form.conveyance,
                  onChange: e => setForm(f => ({ ...f, conveyance: parseFloat(e.target.value) || 0 })),
                  className: "w-full h-9 px-3 rounded-lg border border-border bg-background text-sm"       ,}
                )
              )
              , React.createElement('div', { className: "space-y-2",}
                , React.createElement('label', { className: "text-xs font-semibold block"  ,}, "Medical Allowance" )
                , React.createElement('input', {
                  type: "number",
                  value: form.medicalAllowance,
                  onChange: e => setForm(f => ({ ...f, medicalAllowance: parseFloat(e.target.value) || 0 })),
                  className: "w-full h-9 px-3 rounded-lg border border-border bg-background text-sm"       ,}
                )
              )
            )

            /* Deductions segment */
            , React.createElement('div', { className: "space-y-4",}
              , React.createElement('h3', { className: "text-sm font-bold text-rose-500 border-b pb-1"    ,}, "Deductions")
              , React.createElement('div', { className: "space-y-2",}
                , React.createElement('label', { className: "text-xs font-semibold block"  ,}, "Provident Fund (PF)"  )
                , React.createElement('input', {
                  type: "number",
                  value: form.pf,
                  onChange: e => setForm(f => ({ ...f, pf: parseFloat(e.target.value) || 0 })),
                  className: "w-full h-9 px-3 rounded-lg border border-border bg-background text-sm"       ,}
                )
              )
              , React.createElement('div', { className: "space-y-2",}
                , React.createElement('label', { className: "text-xs font-semibold block"  ,}, "ESI Contribution" )
                , React.createElement('input', {
                  type: "number",
                  value: form.esi,
                  onChange: e => setForm(f => ({ ...f, esi: parseFloat(e.target.value) || 0 })),
                  className: "w-full h-9 px-3 rounded-lg border border-border bg-background text-sm"       ,}
                )
              )
              , React.createElement('div', { className: "space-y-2",}
                , React.createElement('label', { className: "text-xs font-semibold block"  ,}, "Professional Tax" )
                , React.createElement('input', {
                  type: "number",
                  value: form.professionalTax,
                  onChange: e => setForm(f => ({ ...f, professionalTax: parseFloat(e.target.value) || 0 })),
                  className: "w-full h-9 px-3 rounded-lg border border-border bg-background text-sm"       ,}
                )
              )
              , React.createElement('div', { className: "space-y-2",}
                , React.createElement('label', { className: "text-xs font-semibold block"  ,}, "Income Tax (TDS)"  )
                , React.createElement('input', {
                  type: "number",
                  value: form.incomeTax,
                  onChange: e => setForm(f => ({ ...f, incomeTax: parseFloat(e.target.value) || 0 })),
                  className: "w-full h-9 px-3 rounded-lg border border-border bg-background text-sm"       ,}
                )
              )
              , React.createElement('div', { className: "space-y-2",}
                , React.createElement('label', { className: "text-xs font-semibold block"  ,}, "Other Deductions" )
                , React.createElement('input', {
                  type: "number",
                  value: form.otherDeductions,
                  onChange: e => setForm(f => ({ ...f, otherDeductions: parseFloat(e.target.value) || 0 })),
                  className: "w-full h-9 px-3 rounded-lg border border-border bg-background text-sm"       ,}
                )
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
            disabled: mutation.isPending || (!structure && !form.employeeId),
            className: "bg-indigo-600 hover:bg-indigo-700 text-white"  ,}

            , mutation.isPending ? 'Saving…' : 'Save Configurations'
          )
        )
      )
    )
  );
};

const SalaryStructureManager = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const { data } = useQuery({
    queryKey: ['salary-structures'],
    queryFn: () => axiosInstance.get('/payroll/salary-structure').then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/payroll/salary-structure/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['salary-structures'] }),
  });

  const list = _optionalChain([data, 'optionalAccess', _21 => _21.data, 'optionalAccess', _22 => _22.structures]) || [];

  return (
    React.createElement('div', { className: "space-y-6 p-1" ,}
      , React.createElement('div', { className: "flex items-center justify-between"  ,}
        , React.createElement('div', null
          , React.createElement('h1', { className: "text-2xl font-bold tracking-tight"  ,}, "Salary Structures" )
          , React.createElement('p', { className: "text-sm text-muted-foreground mt-1"  ,}, "Configure individual basic salaries, allowances, and tax allocations"       )
        )
        , React.createElement(Button, { onClick: () => setShowModal(true), className: "bg-indigo-600 hover:bg-indigo-700 text-white gap-2"   ,}
          , React.createElement(Plus, { size: 16,} ), " Configure Salary"
        )
      )

      , showModal && (
        React.createElement(StructureModal, {
          onClose: () => setShowModal(false),
          onSuccess: () => queryClient.invalidateQueries({ queryKey: ['salary-structures'] }),}
        )
      )
      , editItem && (
        React.createElement(StructureModal, {
          structure: editItem,
          onClose: () => setEditItem(null),
          onSuccess: () => queryClient.invalidateQueries({ queryKey: ['salary-structures'] }),}
        )
      )

      , React.createElement(Card, null
        , React.createElement(CardHeader, null
          , React.createElement(CardTitle, { className: "text-base",}, "Salary Allocations Feed"  )
        )
        , React.createElement(CardContent, { className: "p-0",}
          , React.createElement('div', { className: "overflow-x-auto",}
            , React.createElement('table', { className: "w-full text-sm" ,}
              , React.createElement('thead', null
                , React.createElement('tr', { className: "border-b border-border/50 bg-muted/30"  ,}
                  , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Employee")
                  , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Basic Salary" )
                  , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Allowances (HRA+)" )
                  , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Deductions (Tax+)" )
                  , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Net Payout" )
                  , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Actions")
                )
              )
              , React.createElement('tbody', null
                , list.map(s => {
                  const allowances = s.hra + s.specialAllowance + s.conveyance + s.medicalAllowance;
                  const deductions = s.pf + s.esi + s.professionalTax + s.incomeTax + s.otherDeductions;
                  return (
                    React.createElement('tr', { key: s._id, className: "border-b border-border/30 hover:bg-muted/20 transition-colors"   ,}
                      , React.createElement('td', { className: "py-3 px-4" ,}
                        , React.createElement('p', { className: "font-semibold",}, _optionalChain([s, 'access', _23 => _23.employeeId, 'optionalAccess', _24 => _24.firstName]), " " , _optionalChain([s, 'access', _25 => _25.employeeId, 'optionalAccess', _26 => _26.lastName]))
                        , React.createElement('p', { className: "text-xs text-muted-foreground" ,}, _optionalChain([s, 'access', _27 => _27.employeeId, 'optionalAccess', _28 => _28.employeeId]))
                      )
                      , React.createElement('td', { className: "py-3 px-4 font-medium"  ,}, "$", s.basicSalary.toLocaleString())
                      , React.createElement('td', { className: "py-3 px-4 text-emerald-600 font-medium"   ,}, "+$", allowances.toLocaleString())
                      , React.createElement('td', { className: "py-3 px-4 text-rose-600 font-medium"   ,}, "-$", deductions.toLocaleString())
                      , React.createElement('td', { className: "py-3 px-4 font-bold text-indigo-600"   ,}, "$", s.netSalary.toLocaleString())
                      , React.createElement('td', { className: "py-3 px-4" ,}
                        , React.createElement('div', { className: "flex gap-2" ,}
                          , React.createElement('button', {
                            onClick: () => setEditItem(s),
                            className: "p-1 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-500/10 rounded transition-colors"     ,}

                            , React.createElement(Pencil, { size: 14,} )
                          )
                          , React.createElement('button', {
                            onClick: () => deleteMutation.mutate(s._id),
                            className: "p-1 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors"     ,}

                            , React.createElement(Trash2, { size: 14,} )
                          )
                        )
                      )
                    )
                  );
                })
                , list.length === 0 && (
                  React.createElement('tr', null
                    , React.createElement('td', { colSpan: 6, className: "py-12 text-center text-muted-foreground"  ,}, "No salary configurations registered yet."    )
                  )
                )
              )
            )
          )
        )
      )
    )
  );
};

export default SalaryStructureManager;
