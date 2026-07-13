 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Plus, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';



















const AddRevisionModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    employeeId: '',
    type: 'Salary Revision' ,
    amount: '',
    remarks: '',
  });
  const [error, setError] = useState('');

  const { data: empData } = useQuery({
    queryKey: ['employees-options'],
    queryFn: () => axiosInstance.get('/employees?limit=200').then(r => r.data),
  });

  const mutation = useMutation({
    mutationFn: (data) =>
      axiosInstance.post('/compensation', {
        ...data,
        amount: parseFloat(data.amount) || 0,
      }),
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (err) => setError(_optionalChain([err, 'access', _ => _.response, 'optionalAccess', _2 => _2.data, 'optionalAccess', _3 => _3.message]) || 'Failed to submit revision.'),
  });

  const employees = _optionalChain([empData, 'optionalAccess', _4 => _4.data, 'optionalAccess', _5 => _5.employees]) || [];

  return (
    React.createElement('div', { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"        , onClick: onClose,}
      , React.createElement('div', { className: "bg-card border border-border/60 rounded-2xl shadow-2xl w-full max-w-md"      , onClick: e => e.stopPropagation(),}
        , React.createElement('div', { className: "p-6 border-b border-border/40"  ,}
          , React.createElement('h2', { className: "text-lg font-bold flex items-center gap-2"    ,}
            , React.createElement(TrendingUp, { size: 20, className: "text-indigo-500",} ), "Create Salary Revision Log"

          )
        )

        , React.createElement('div', { className: "p-6 space-y-4" ,}
          , React.createElement('div', null
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

          , React.createElement('div', { className: "grid grid-cols-2 gap-3"  ,}
            , React.createElement('div', null
              , React.createElement('label', { className: "text-xs font-semibold block mb-1.5"   ,}, "Type")
              , React.createElement('select', {
                value: form.type,
                onChange: e => setForm(f => ({ ...f, type: e.target.value  })),
                className: "w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"       ,}

                , React.createElement('option', null, "Salary Revision" )
                , React.createElement('option', null, "Promotion Increment" )
                , React.createElement('option', null, "Bonus")
                , React.createElement('option', null, "Incentive")
              )
            )
            , React.createElement('div', null
              , React.createElement('label', { className: "text-xs font-semibold block mb-1.5"   ,}, "Increment Amount ($)"  )
              , React.createElement('input', {
                type: "number",
                value: form.amount,
                onChange: e => setForm(f => ({ ...f, amount: e.target.value })),
                placeholder: "0.00",
                className: "w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"       ,}
              )
            )
          )

          , React.createElement('div', null
            , React.createElement('label', { className: "text-xs font-semibold block mb-1.5"   ,}, "Remarks")
            , React.createElement('textarea', {
              rows: 3,
              value: form.remarks,
              onChange: e => setForm(f => ({ ...f, remarks: e.target.value })),
              placeholder: "e.g. Annual merit promotion increment..."    ,
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
            disabled: mutation.isPending || !form.employeeId || !form.amount,
            className: "bg-indigo-600 hover:bg-indigo-700 text-white"  ,}

            , mutation.isPending ? 'Logging…' : 'Log Revision'
          )
        )
      )
    )
  );
};

const Compensation = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const { data } = useQuery({
    queryKey: ['compensations-history'],
    queryFn: () => axiosInstance.get('/compensation?limit=100').then(r => r.data),
  });

  const list = _optionalChain([data, 'optionalAccess', _6 => _6.data, 'optionalAccess', _7 => _7.history]) || [];

  return (
    React.createElement('div', { className: "space-y-6 p-1" ,}
      , React.createElement('div', { className: "flex items-center justify-between"  ,}
        , React.createElement('div', null
          , React.createElement('h1', { className: "text-2xl font-bold tracking-tight"  ,}, "Compensation Timeline" )
          , React.createElement('p', { className: "text-sm text-muted-foreground mt-1"  ,}, "Track career promotion increments and base salary adjustments"       )
        )
        , React.createElement(Button, { onClick: () => setShowModal(true), className: "bg-indigo-600 hover:bg-indigo-700 text-white gap-2"   ,}
          , React.createElement(Plus, { size: 16,} ), " Log Revision"
        )
      )

      , showModal && (
        React.createElement(AddRevisionModal, {
          onClose: () => setShowModal(false),
          onSuccess: () => queryClient.invalidateQueries({ queryKey: ['compensations-history'] }),}
        )
      )

      /* Timeline view */
      , React.createElement(Card, null
        , React.createElement(CardHeader, null
          , React.createElement(CardTitle, { className: "text-base flex items-center gap-2"   ,}
            , React.createElement(Clock, { size: 18, className: "text-indigo-500",} ), "Revision Timeline"

          )
        )
        , React.createElement(CardContent, { className: "p-6",}
          , React.createElement('div', { className: "relative border-l border-border/60 ml-4 space-y-8 pb-4"     ,}
            , list.map(item => (
              React.createElement('div', { key: item._id, className: "relative pl-6" ,}
                , React.createElement('div', { className: "absolute -left-[6px] top-1.5 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20"        ,} )
                , React.createElement('div', { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-border/40 p-4 rounded-xl hover:bg-muted/10 transition-colors"           ,}
                  , React.createElement('div', null
                    , React.createElement('h3', { className: "font-bold text-sm text-foreground flex items-center gap-2"     ,}
                      , _optionalChain([item, 'access', _8 => _8.employeeId, 'optionalAccess', _9 => _9.firstName]), " " , _optionalChain([item, 'access', _10 => _10.employeeId, 'optionalAccess', _11 => _11.lastName])
                      , React.createElement('span', { className: "text-xs font-normal text-muted-foreground"  ,}, "(", _optionalChain([item, 'access', _12 => _12.employeeId, 'optionalAccess', _13 => _13.employeeId]), ")")
                    )
                    , React.createElement('p', { className: "text-xs font-semibold text-indigo-600 mt-1"   ,}, item.type)
                    , React.createElement('p', { className: "text-xs text-muted-foreground mt-1 line-clamp-2"   ,}, item.remarks || '—')
                  )
                  , React.createElement('div', { className: "text-right sm:border-l sm:pl-6 sm:border-border/40"   ,}
                    , React.createElement('p', { className: "text-sm font-semibold text-emerald-600"  ,}, "+$", item.amount.toLocaleString())
                    , React.createElement('p', { className: "text-[10px] text-muted-foreground mt-1"  ,}
                      , format(new Date(item.effectiveDate), 'dd MMM yyyy')
                    )
                  )
                )
              )
            ))
            , list.length === 0 && (
              React.createElement('p', { className: "text-sm text-muted-foreground text-center py-12 pl-0 border-0"     ,}, "No salary revisions recorded yet."    )
            )
          )
        )
      )
    )
  );
};

export default Compensation;
