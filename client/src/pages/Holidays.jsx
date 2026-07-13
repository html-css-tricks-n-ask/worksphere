 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar, Plus, Trash2, Globe, Building2, Star, Upload, AlertCircle } from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';

// ─── Types ─────────────────────────────────────────────────────────────────







const typeStyles = {
  National: { color: 'text-emerald-600', bg: 'bg-emerald-500/10 border-emerald-500/30', icon: React.createElement(Globe, { size: 14,} ) },
  Company: { color: 'text-indigo-600', bg: 'bg-indigo-500/10 border-indigo-500/30', icon: React.createElement(Building2, { size: 14,} ) },
  Optional: { color: 'text-amber-600', bg: 'bg-amber-500/10 border-amber-500/30', icon: React.createElement(Star, { size: 14,} ) },
};

// ─── Add Holiday Modal ──────────────────────────────────────────────────────
const AddHolidayModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({ name: '', date: '', type: 'Company'  });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (data) =>
      axiosInstance.post('/holidays', { ...data, date: new Date(data.date).toISOString() }),
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (err) => setError(_optionalChain([err, 'access', _ => _.response, 'optionalAccess', _2 => _2.data, 'optionalAccess', _3 => _3.message]) || 'Failed to create holiday.'),
  });

  return (
    React.createElement('div', { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"        , onClick: onClose,}
      , React.createElement('div', { className: "bg-card border border-border/60 rounded-2xl shadow-2xl w-full max-w-md"      , onClick: e => e.stopPropagation(),}
        , React.createElement('div', { className: "p-6 border-b border-border/40"  ,}
          , React.createElement('h2', { className: "text-lg font-bold flex items-center gap-2"    ,}
            , React.createElement(Calendar, { size: 20, className: "text-emerald-500",} ), "Add Holiday"

          )
        )
        , React.createElement('div', { className: "p-6 space-y-4" ,}
          , React.createElement('div', null
            , React.createElement('label', { className: "text-sm font-medium block mb-1.5"   ,}, "Holiday Name" )
            , React.createElement('input', {
              type: "text",
              value: form.name,
              onChange: e => setForm(f => ({ ...f, name: e.target.value })),
              placeholder: "e.g. Republic Day"  ,
              className: "w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"          ,}
            )
          )
          , React.createElement('div', null
            , React.createElement('label', { className: "text-sm font-medium block mb-1.5"   ,}, "Date")
            , React.createElement('input', {
              type: "date",
              value: form.date,
              onChange: e => setForm(f => ({ ...f, date: e.target.value })),
              className: "w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"          ,}
            )
          )
          , React.createElement('div', null
            , React.createElement('label', { className: "text-sm font-medium block mb-1.5"   ,}, "Type")
            , React.createElement('select', {
              value: form.type,
              onChange: e => setForm(f => ({ ...f, type: e.target.value  })),
              className: "w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"          ,}

              , React.createElement('option', null, "National")
              , React.createElement('option', null, "Company")
              , React.createElement('option', null, "Optional")
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
            disabled: mutation.isPending || !form.name || !form.date,
            className: "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"     ,}

            , mutation.isPending ? 'Adding…' : 'Add Holiday'
          )
        )
      )
    )
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
const Holidays = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filterType, setFilterType] = useState('');
  const [activeView, setActiveView] = useState('calendar');

  const { data, isLoading } = useQuery({
    queryKey: ['holidays', selectedYear],
    queryFn: () => axiosInstance.get(`/holidays?year=${selectedYear}&limit=100`).then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/holidays/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['holidays'] }),
  });

  const holidays = (_optionalChain([data, 'optionalAccess', _4 => _4.data, 'optionalAccess', _5 => _5.holidays]) || []).filter(h => !filterType || h.type === filterType);

  // Build calendar grid — group by month
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const holidaysByMonth = {};
  holidays.forEach(h => {
    const m = new Date(h.date).getMonth();
    if (!holidaysByMonth[m]) holidaysByMonth[m] = [];
    holidaysByMonth[m].push(h);
  });

  return (
    React.createElement('div', { className: "space-y-6 p-1" ,}
      /* Header */
      , React.createElement('div', { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4"     ,}
        , React.createElement('div', null
          , React.createElement('h1', { className: "text-2xl font-bold tracking-tight flex items-center gap-2"     ,}
            , React.createElement(Calendar, { className: "text-emerald-500", size: 24,} ), "Holiday Calendar"

          )
          , React.createElement('p', { className: "text-sm text-muted-foreground mt-1"  ,}, "Manage national and company holidays"    )
        )
        , React.createElement('div', { className: "flex gap-3 flex-wrap"  ,}
          , React.createElement(Button, { variant: "outline", className: "gap-2 text-sm" ,}
            , React.createElement(Upload, { size: 15,} ), "Import CSV"

          )
          , React.createElement(Button, {
            onClick: () => setShowModal(true),
            className: "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20 gap-2"        ,}

            , React.createElement(Plus, { size: 16,} ), "Add Holiday"

          )
        )
      )

      , showModal && (
        React.createElement(AddHolidayModal, {
          onClose: () => setShowModal(false),
          onSuccess: () => queryClient.invalidateQueries({ queryKey: ['holidays'] }),}
        )
      )

      /* Controls */
      , React.createElement('div', { className: "flex flex-wrap items-center gap-3"   ,}
        , React.createElement('div', { className: "flex gap-1 bg-muted/40 p-1 rounded-xl border border-border/50"      ,}
          , (['calendar', 'list'] ).map(view => (
            React.createElement('button', {
              key: view,
              onClick: () => setActiveView(view),
              className: `px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all duration-200 ${
                activeView === view ? 'bg-white dark:bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`,}

              , view === 'calendar' ? '🗓 Calendar' : '📋 List'
            )
          ))
        )

        , React.createElement('select', {
          value: selectedYear,
          onChange: e => setSelectedYear(parseInt(e.target.value)),
          className: "h-9 px-3 rounded-lg border border-border bg-background text-sm"      ,}

          , [2024, 2025, 2026, 2027].map(y => React.createElement('option', { key: y,}, y))
        )

        , React.createElement('select', {
          value: filterType,
          onChange: e => setFilterType(e.target.value),
          className: "h-9 px-3 rounded-lg border border-border bg-background text-sm"      ,}

          , React.createElement('option', { value: "",}, "All Types" )
          , React.createElement('option', null, "National")
          , React.createElement('option', null, "Company")
          , React.createElement('option', null, "Optional")
        )

        , React.createElement('div', { className: "ml-auto flex items-center gap-4 text-xs text-muted-foreground"     ,}
          , Object.entries(typeStyles).map(([type, meta]) => (
            React.createElement('div', { key: type, className: "flex items-center gap-1.5"  ,}
              , React.createElement('span', { className: meta.color,}, meta.icon)
              , type
            )
          ))
        )
      )

      /* Stats Strip */
      , React.createElement('div', { className: "grid grid-cols-3 gap-4"  ,}
        , [
          { label: 'National', color: 'emerald', icon: React.createElement(Globe, { size: 18,} ) },
          { label: 'Company', color: 'indigo', icon: React.createElement(Building2, { size: 18,} ) },
          { label: 'Optional', color: 'amber', icon: React.createElement(Star, { size: 18,} ) },
        ].map(({ label, color, icon }) => {
          const count = (_optionalChain([data, 'optionalAccess', _6 => _6.data, 'optionalAccess', _7 => _7.holidays]) || []).filter(h => h.type === label).length;
          return (
            React.createElement(Card, { key: label,}
              , React.createElement(CardContent, { className: "p-4 flex items-center gap-3"   ,}
                , React.createElement('div', { className: `p-2 bg-${color}-500/10 text-${color}-500 rounded-xl`,}, icon)
                , React.createElement('div', null
                  , React.createElement('p', { className: "text-xl font-bold" ,}, count)
                  , React.createElement('p', { className: "text-xs text-muted-foreground" ,}, label, " Holidays" )
                )
              )
            )
          );
        })
      )

      /* Calendar View */
      , activeView === 'calendar' && (
        React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"     ,}
          , monthNames.map((month, idx) => {
            const mHolidays = holidaysByMonth[idx] || [];
            return (
              React.createElement(Card, { key: month, className: `transition-all ${mHolidays.length > 0 ? 'border-indigo-500/20' : ''}`,}
                , React.createElement(CardHeader, { className: "pb-2",}
                  , React.createElement(CardTitle, { className: "text-sm font-semibold flex items-center justify-between"    ,}
                    , month, " " , selectedYear
                    , mHolidays.length > 0 && (
                      React.createElement('span', { className: "text-xs font-medium bg-indigo-500/10 text-indigo-600 px-2 py-0.5 rounded-full"      ,}
                        , mHolidays.length
                      )
                    )
                  )
                )
                , React.createElement(CardContent, { className: "pt-0",}
                  , mHolidays.length === 0 ? (
                    React.createElement('p', { className: "text-xs text-muted-foreground py-2"  ,}, "No holidays this month"   )
                  ) : (
                    React.createElement('div', { className: "space-y-2",}
                      , mHolidays.map(h => {
                        const meta = typeStyles[h.type];
                        return (
                          React.createElement('div', { key: h._id, className: "group flex items-center gap-2"   ,}
                            , React.createElement('div', { className: `flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-xs ${meta.bg}`,}
                              , React.createElement('span', { className: meta.color,}, meta.icon)
                              , React.createElement('span', { className: "font-medium flex-1 line-clamp-1"  ,}, h.name)
                              , React.createElement('span', { className: "text-muted-foreground shrink-0" ,}, format(new Date(h.date), 'dd'))
                            )
                            , React.createElement('button', {
                              onClick: () => deleteMutation.mutate(h._id),
                              className: "opacity-0 group-hover:opacity-100 p-1 hover:text-rose-500 text-muted-foreground transition-all rounded"      ,}

                              , React.createElement(Trash2, { size: 12,} )
                            )
                          )
                        );
                      })
                    )
                  )
                )
              )
            );
          })
        )
      )

      /* List View */
      , activeView === 'list' && (
        React.createElement(Card, null
          , React.createElement(CardHeader, null
            , React.createElement(CardTitle, { className: "text-base",}, "All Holidays — "   , selectedYear)
            , React.createElement(CardDescription, null, holidays.length, " holidays configured"  )
          )
          , React.createElement(CardContent, { className: "p-0",}
            , isLoading ? (
              React.createElement('div', { className: "py-16 text-center text-muted-foreground"  ,}, "Loading holidays…" )
            ) : holidays.length === 0 ? (
              React.createElement('div', { className: "py-16 text-center text-muted-foreground"  ,}
                , React.createElement(Calendar, { size: 40, className: "mx-auto mb-3 opacity-30"  ,} )
                , React.createElement('p', { className: "font-medium",}, "No holidays found"  )
                , React.createElement('p', { className: "text-sm mt-1" ,}, "Click \"Add Holiday\" to get started"     )
              )
            ) : (
              React.createElement('div', { className: "overflow-x-auto",}
                , React.createElement('table', { className: "w-full text-sm" ,}
                  , React.createElement('thead', null
                    , React.createElement('tr', { className: "border-b border-border/50 bg-muted/30"  ,}
                      , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Name")
                      , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Date")
                      , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Day")
                      , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Type")
                      , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Actions")
                    )
                  )
                  , React.createElement('tbody', null
                    , holidays.map(h => {
                      const meta = typeStyles[h.type];
                      return (
                        React.createElement('tr', { key: h._id, className: "border-b border-border/30 hover:bg-muted/20 transition-colors"   ,}
                          , React.createElement('td', { className: "py-3 px-4 font-medium"  ,}, h.name)
                          , React.createElement('td', { className: "py-3 px-4" ,}, format(new Date(h.date), 'dd MMMM yyyy'))
                          , React.createElement('td', { className: "py-3 px-4 text-muted-foreground"  ,}, format(new Date(h.date), 'EEEE'))
                          , React.createElement('td', { className: "py-3 px-4" ,}
                            , React.createElement('span', { className: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.bg} ${meta.color}`,}
                              , meta.icon, " " , h.type
                            )
                          )
                          , React.createElement('td', { className: "py-3 px-4" ,}
                            , React.createElement('button', {
                              onClick: () => deleteMutation.mutate(h._id),
                              className: "p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"     ,}

                              , React.createElement(Trash2, { size: 14,} )
                            )
                          )
                        )
                      );
                    })
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

export default Holidays;
