 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  DollarSign, Plus, AlertCircle, ShoppingBag, Trash2
} from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useSelector } from 'react-redux';



















const SubmitClaimModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'Travel' ,
    expenseDate: '',
    description: '',
  });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (data) =>
      axiosInstance.post('/reimbursements', {
        ...data,
        amount: parseFloat(data.amount) || 0,
        expenseDate: new Date(data.expenseDate).toISOString(),
      }),
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (err) => setError(_optionalChain([err, 'access', _ => _.response, 'optionalAccess', _2 => _2.data, 'optionalAccess', _3 => _3.message]) || 'Failed to submit claim.'),
  });

  return (
    React.createElement('div', { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"        , onClick: onClose,}
      , React.createElement('div', { className: "bg-card border border-border/60 rounded-2xl shadow-2xl w-full max-w-md"      , onClick: e => e.stopPropagation(),}
        , React.createElement('div', { className: "p-6 border-b border-border/40"  ,}
          , React.createElement('h2', { className: "text-lg font-bold flex items-center gap-2"    ,}
            , React.createElement(DollarSign, { size: 20, className: "text-emerald-500",} ), "Submit Expense Claim"

          )
        )

        , React.createElement('div', { className: "p-6 space-y-4" ,}
          , React.createElement('div', null
            , React.createElement('label', { className: "text-xs font-semibold block mb-1.5"   ,}, "Expense Title" )
            , React.createElement('input', {
              type: "text",
              value: form.title,
              onChange: e => setForm(f => ({ ...f, title: e.target.value })),
              placeholder: "e.g. Client Dinner, Taxi Fare"    ,
              className: "w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"       ,}
            )
          )

          , React.createElement('div', { className: "grid grid-cols-2 gap-3"  ,}
            , React.createElement('div', null
              , React.createElement('label', { className: "text-xs font-semibold block mb-1.5"   ,}, "Amount ($)" )
              , React.createElement('input', {
                type: "number",
                step: "0.01",
                value: form.amount,
                onChange: e => setForm(f => ({ ...f, amount: e.target.value })),
                placeholder: "0.00",
                className: "w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"       ,}
              )
            )
            , React.createElement('div', null
              , React.createElement('label', { className: "text-xs font-semibold block mb-1.5"   ,}, "Category")
              , React.createElement('select', {
                value: form.category,
                onChange: e => setForm(f => ({ ...f, category: e.target.value  })),
                className: "w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"       ,}

                , React.createElement('option', null, "Travel")
                , React.createElement('option', null, "Food")
                , React.createElement('option', null, "Internet")
                , React.createElement('option', null, "Medical")
                , React.createElement('option', null, "Other")
              )
            )
          )

          , React.createElement('div', null
            , React.createElement('label', { className: "text-xs font-semibold block mb-1.5"   ,}, "Expense Date" )
            , React.createElement('input', {
              type: "date",
              value: form.expenseDate,
              onChange: e => setForm(f => ({ ...f, expenseDate: e.target.value })),
              className: "w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"       ,}
            )
          )

          , React.createElement('div', null
            , React.createElement('label', { className: "text-xs font-semibold block mb-1.5"   ,}, "Description / Remarks"  )
            , React.createElement('textarea', {
              rows: 3,
              value: form.description,
              onChange: e => setForm(f => ({ ...f, description: e.target.value })),
              placeholder: "Brief details about the expense..."    ,
              className: "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none"        ,}
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
            disabled: mutation.isPending || !form.title || !form.amount || !form.expenseDate,
            className: "bg-emerald-600 hover:bg-emerald-700 text-white"  ,}

            , mutation.isPending ? 'Submitting…' : 'Submit Claim'
          )
        )
      )
    )
  );
};

const Reimbursements = () => {
  const queryClient = useQueryClient();
  const user = useSelector((state) => state.auth.user);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const { data } = useQuery({
    queryKey: ['reimbursements', statusFilter],
    queryFn: () =>
      axiosInstance
        .get(`/reimbursements?status=${statusFilter}&limit=100`)
        .then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/reimbursements/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reimbursements'] }),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, status, role }) =>
      axiosInstance.put(`/reimbursements/${id}/approve`, { status, role }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reimbursements'] }),
  });

  const list = _optionalChain([data, 'optionalAccess', _4 => _4.data, 'optionalAccess', _5 => _5.claims]) || [];

  return (
    React.createElement('div', { className: "space-y-6 p-1" ,}
      , React.createElement('div', { className: "flex items-center justify-between"  ,}
        , React.createElement('div', null
          , React.createElement('h1', { className: "text-2xl font-bold tracking-tight"  ,}, "Reimbursements")
          , React.createElement('p', { className: "text-sm text-muted-foreground mt-1"  ,}, "Submit receipts and claim business expenses"     )
        )
        , React.createElement(Button, { onClick: () => setShowModal(true), className: "bg-emerald-600 hover:bg-emerald-700 text-white gap-2"   ,}
          , React.createElement(Plus, { size: 16,} ), " Submit Claim"
        )
      )

      , showModal && (
        React.createElement(SubmitClaimModal, {
          onClose: () => setShowModal(false),
          onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reimbursements'] }),}
        )
      )

      /* Filter and Feed */
      , React.createElement(Card, null
        , React.createElement(CardHeader, null
          , React.createElement('div', { className: "flex items-center justify-between flex-wrap gap-3"    ,}
            , React.createElement(CardTitle, { className: "text-base flex items-center gap-2"   ,}
              , React.createElement(ShoppingBag, { size: 18, className: "text-emerald-500",} ), "Expense Claims Matrix"

            )
            , React.createElement('select', {
              value: statusFilter,
              onChange: e => setStatusFilter(e.target.value),
              className: "h-9 px-3 rounded-lg border border-border bg-background text-sm"      ,}

              , React.createElement('option', { value: "",}, "All Statuses" )
              , React.createElement('option', null, "Pending")
              , React.createElement('option', null, "Approved")
              , React.createElement('option', null, "Rejected")
              , React.createElement('option', null, "Paid")
            )
          )
        )
        , React.createElement(CardContent, { className: "p-0",}
          , React.createElement('div', { className: "overflow-x-auto",}
            , React.createElement('table', { className: "w-full text-sm" ,}
              , React.createElement('thead', null
                , React.createElement('tr', { className: "border-b border-border/50 bg-muted/30"  ,}
                  , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Employee")
                  , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Expense Title" )
                  , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Amount")
                  , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Category")
                  , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Date")
                  , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Status")
                  , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Actions")
                )
              )
              , React.createElement('tbody', null
                , list.map(claim => (
                  React.createElement('tr', { key: claim._id, className: "border-b border-border/30 hover:bg-muted/20 transition-colors"   ,}
                    , React.createElement('td', { className: "py-3 px-4" ,}
                      , React.createElement('p', { className: "font-semibold",}, _optionalChain([claim, 'access', _6 => _6.employeeId, 'optionalAccess', _7 => _7.firstName]), " " , _optionalChain([claim, 'access', _8 => _8.employeeId, 'optionalAccess', _9 => _9.lastName]))
                      , React.createElement('p', { className: "text-xs text-muted-foreground" ,}, _optionalChain([claim, 'access', _10 => _10.employeeId, 'optionalAccess', _11 => _11.employeeId]))
                    )
                    , React.createElement('td', { className: "py-3 px-4" ,}
                      , React.createElement('p', { className: "font-medium text-foreground" ,}, claim.title)
                      , React.createElement('p', { className: "text-xs text-muted-foreground line-clamp-1"  ,}, claim.description || '—')
                    )
                    , React.createElement('td', { className: "py-3 px-4 font-bold text-foreground"   ,}, "$", claim.amount.toFixed(2))
                    , React.createElement('td', { className: "py-3 px-4 text-xs font-semibold text-muted-foreground"    ,}, claim.category)
                    , React.createElement('td', { className: "py-3 px-4 text-xs text-muted-foreground"   ,}
                      , format(new Date(claim.expenseDate), 'dd MMM yyyy')
                    )
                    , React.createElement('td', { className: "py-3 px-4" ,}
                      , React.createElement('span', { className: `inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        claim.status === 'Approved' || claim.status === 'Paid'
                          ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                          : claim.status === 'Rejected'
                          ? 'bg-rose-500/15 text-rose-600 border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-600 border-amber-500/30'
                      }`,}
                        , claim.status
                      )
                    )
                    , React.createElement('td', { className: "py-3 px-4" ,}
                      , React.createElement('div', { className: "flex gap-2" ,}
                        , _optionalChain([user, 'optionalAccess', _12 => _12.role]) !== 'Employee' && claim.status === 'Pending' && (
                          React.createElement(React.Fragment, null
                            , React.createElement('button', {
                              onClick: () => approveMutation.mutate({ id: claim._id, status: 'Approved', role: _optionalChain([user, 'optionalAccess', _13 => _13.role]) === 'HR' ? 'HR' : 'Manager' }),
                              className: "px-2 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 rounded text-xs font-medium"        ,}
, "Approve"

                            )
                            , React.createElement('button', {
                              onClick: () => approveMutation.mutate({ id: claim._id, status: 'Rejected', role: _optionalChain([user, 'optionalAccess', _14 => _14.role]) === 'HR' ? 'HR' : 'Manager' }),
                              className: "px-2 py-1 bg-rose-500/10 text-rose-600 border border-rose-500/30 rounded text-xs font-medium"        ,}
, "Reject"

                            )
                          )
                        )
                        , claim.status === 'Pending' && (
                          React.createElement('button', {
                            onClick: () => deleteMutation.mutate(claim._id),
                            className: "p-1 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors"     ,}

                            , React.createElement(Trash2, { size: 14,} )
                          )
                        )
                      )
                    )
                  )
                ))
                , list.length === 0 && (
                  React.createElement('tr', null
                    , React.createElement('td', { colSpan: 7, className: "py-12 text-center text-muted-foreground"  ,}, "No expense claims recorded."   )
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

export default Reimbursements;
