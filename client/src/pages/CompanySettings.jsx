 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save, CheckCircle2, Loader2, Calendar } from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';

const CompanySettings = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    currency: 'USD',
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    weekendDays: [] ,
    officeHours: { start: '09:00', end: '18:00' },
    leavePolicy: { sickLeaveQuota: 10, casualLeaveQuota: 12, paidLeaveQuota: 15, wfhQuota: 30 },
  });

  const [message, setMessage] = useState('');

  const { data } = useQuery({
    queryKey: ['company-settings-config'],
    queryFn: () => axiosInstance.get('/settings').then(r => r.data),
  });

  useEffect(() => {
    if (_optionalChain([data, 'optionalAccess', _ => _.data])) {
      setForm(data.data);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (payload) => axiosInstance.put('/settings', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-settings-config'] });
      setMessage('Company configurations updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    },
  });

  const toggleWeekend = (day) => {
    setForm(f => {
      const idx = f.weekendDays.indexOf(day);
      const newDays = idx === -1 ? [...f.weekendDays, day] : f.weekendDays.filter(d => d !== day);
      return { ...f, weekendDays: newDays };
    });
  };

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    React.createElement('div', { className: "space-y-6 p-1" ,}
      , React.createElement('div', { className: "flex items-center justify-between"  ,}
        , React.createElement('div', null
          , React.createElement('h1', { className: "text-2xl font-bold tracking-tight flex items-center gap-2"     ,}
            , React.createElement(Settings, { className: "text-indigo-500", size: 24,} ), "Company Administration"

          )
          , React.createElement('p', { className: "text-sm text-muted-foreground mt-1"  ,}, "Configure weekend rest days, leave quotas, and office timings"        )
        )
        , React.createElement(Button, {
          onClick: () => mutation.mutate(form),
          disabled: mutation.isPending,
          className: "bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-lg"    ,}

          , mutation.isPending ? React.createElement(Loader2, { className: "h-4 w-4 animate-spin"  ,} ) : React.createElement(Save, { size: 16,} ), "Save Configurations"

        )
      )

      , message && (
        React.createElement('div', { className: "flex items-center gap-2 text-emerald-600 text-sm bg-emerald-500/10 px-4 py-3 rounded-xl border border-emerald-500/20"          ,}
          , React.createElement(CheckCircle2, { size: 16,} )
          , message
        )
      )

      , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-6"   ,}
        /* Left Column: Weekend days and parameters */
        , React.createElement('div', { className: "md:col-span-1 space-y-6" ,}
          , React.createElement(Card, null
            , React.createElement(CardHeader, null
              , React.createElement(CardTitle, { className: "text-sm font-bold flex items-center gap-2"    ,}
                , React.createElement(Calendar, { size: 16, className: "text-indigo-500",} ), " Weekend Days Config"
              )
              , React.createElement(CardDescription, null, "Select organization rest days"   )
            )
            , React.createElement(CardContent, { className: "space-y-3",}
              , daysOfWeek.map((day, idx) => {
                const isSelected = form.weekendDays.includes(idx);
                return (
                  React.createElement('div', {
                    key: day,
                    onClick: () => toggleWeekend(idx),
                    className: `flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-500/40 bg-indigo-500/5 text-indigo-600 font-semibold'
                        : 'border-border/55 bg-background text-muted-foreground hover:bg-muted/15'
                    }`,}

                    , React.createElement('span', { className: "text-xs",}, day)
                    , React.createElement('input', {
                      type: "checkbox",
                      checked: isSelected,
                      readOnly: true,
                      className: "w-4 h-4 rounded text-indigo-600 border-border"    ,}
                    )
                  )
                );
              })
            )
          )
        )

        /* Right Column: Policies & Hours */
        , React.createElement('div', { className: "md:col-span-2 space-y-6" ,}
          , React.createElement(Card, null
            , React.createElement(CardHeader, null
              , React.createElement(CardTitle, { className: "text-sm font-bold" ,}, "Standard Office Hour Limits"   )
              , React.createElement(CardDescription, null, "Configure business hours properties"   )
            )
            , React.createElement(CardContent, { className: "grid grid-cols-2 gap-4"  ,}
              , React.createElement('div', null
                , React.createElement('label', { className: "text-xs font-semibold block mb-1.5"   ,}, "Shift Starts" )
                , React.createElement('input', {
                  type: "time",
                  value: _optionalChain([form, 'access', _2 => _2.officeHours, 'optionalAccess', _3 => _3.start]) || '09:00',
                  onChange: e => setForm(f => ({ ...f, officeHours: { ...f.officeHours, start: e.target.value } })),
                  className: "w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"       ,}
                )
              )
              , React.createElement('div', null
                , React.createElement('label', { className: "text-xs font-semibold block mb-1.5"   ,}, "Shift Ends" )
                , React.createElement('input', {
                  type: "time",
                  value: _optionalChain([form, 'access', _4 => _4.officeHours, 'optionalAccess', _5 => _5.end]) || '18:00',
                  onChange: e => setForm(f => ({ ...f, officeHours: { ...f.officeHours, end: e.target.value } })),
                  className: "w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"       ,}
                )
              )
            )
          )

          , React.createElement(Card, null
            , React.createElement(CardHeader, null
              , React.createElement(CardTitle, { className: "text-sm font-bold" ,}, "Default Leaves Policies Quota"   )
              , React.createElement(CardDescription, null, "Configure annual leave counts assigned to new employees"       )
            )
            , React.createElement(CardContent, { className: "grid grid-cols-2 sm:grid-cols-4 gap-4"   ,}
              , [
                { key: 'sickLeaveQuota', label: 'Sick Leave' },
                { key: 'casualLeaveQuota', label: 'Casual Leave' },
                { key: 'paidLeaveQuota', label: 'Paid Leave' },
                { key: 'wfhQuota', label: 'WFH Limit' },
              ].map(item => (
                React.createElement('div', { key: item.key,}
                  , React.createElement('label', { className: "text-xs font-semibold block mb-1.5"   ,}, item.label)
                  , React.createElement('input', {
                    type: "number",
                    value: _optionalChain([(form.leavePolicy ), 'optionalAccess', _6 => _6[item.key]]) || 0,
                    onChange: e => {
                      const val = parseInt(e.target.value) || 0;
                      setForm(f => ({ ...f, leavePolicy: { ...f.leavePolicy, [item.key]: val } }));
                    },
                    className: "w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-center"        ,}
                  )
                )
              ))
            )
          )
        )
      )
    )
  );
};

export default CompanySettings;
