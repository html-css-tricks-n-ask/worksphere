 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Megaphone, Plus, Calendar, Trash2, Pin, Globe, AlertCircle } from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useSelector } from 'react-redux';















const AddAnnouncementModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    title: '',
    content: '',
    pinned: false,
    targetDepartmentId: '',
  });
  const [error, setError] = useState('');

  // Fetch departments list
  const { data: deptData } = useQuery({
    queryKey: ['departments-options'],
    queryFn: () => axiosInstance.get('/departments?limit=100').then(r => r.data),
  });

  const mutation = useMutation({
    mutationFn: (data) =>
      axiosInstance.post('/announcements', {
        ...data,
        targetDepartmentId: data.targetDepartmentId || undefined,
      }),
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (err) => setError(_optionalChain([err, 'access', _ => _.response, 'optionalAccess', _2 => _2.data, 'optionalAccess', _3 => _3.message]) || 'Failed to publish bulletin.'),
  });

  const depts = _optionalChain([deptData, 'optionalAccess', _4 => _4.data, 'optionalAccess', _5 => _5.departments]) || [];

  return (
    React.createElement('div', { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"        , onClick: onClose,}
      , React.createElement('div', { className: "bg-card border border-border/60 rounded-2xl shadow-2xl w-full max-w-md"      , onClick: e => e.stopPropagation(),}
        , React.createElement('div', { className: "p-6 border-b border-border/40"  ,}
          , React.createElement('h2', { className: "text-lg font-bold flex items-center gap-2"    ,}
            , React.createElement(Megaphone, { size: 20, className: "text-indigo-500",} ), "Publish Company Announcement"

          )
        )

        , React.createElement('div', { className: "p-6 space-y-4" ,}
          , React.createElement('div', null
            , React.createElement('label', { className: "text-xs font-semibold block mb-1.5"   ,}, "Announcement Title" )
            , React.createElement('input', {
              type: "text",
              value: form.title,
              onChange: e => setForm(f => ({ ...f, title: e.target.value })),
              placeholder: "e.g. Town Hall Meeting, Office Holiday Notice"      ,
              className: "w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"       ,}
            )
          )

          , React.createElement('div', null
            , React.createElement('label', { className: "text-xs font-semibold block mb-1.5"   ,}, "Bulletin Message" )
            , React.createElement('textarea', {
              rows: 4,
              value: form.content,
              onChange: e => setForm(f => ({ ...f, content: e.target.value })),
              placeholder: "Type the message body details here..."     ,
              className: "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none"        ,}
            )
          )

          , React.createElement('div', { className: "grid grid-cols-2 gap-3"  ,}
            , React.createElement('div', null
              , React.createElement('label', { className: "text-xs font-semibold block mb-1.5"   ,}, "Target Department" )
              , React.createElement('select', {
                value: form.targetDepartmentId,
                onChange: e => setForm(f => ({ ...f, targetDepartmentId: e.target.value })),
                className: "w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"       ,}

                , React.createElement('option', { value: "",}, "All Departments" )
                , depts.map(d => (
                  React.createElement('option', { key: d.id, value: d.id,}, d.name)
                ))
              )
            )
            , React.createElement('div', { className: "flex items-center gap-2 pt-6 pl-4"    ,}
              , React.createElement('input', {
                type: "checkbox",
                id: "pinned",
                checked: form.pinned,
                onChange: e => setForm(f => ({ ...f, pinned: e.target.checked })),
                className: "w-4 h-4 rounded text-indigo-600 border-border"    ,}
              )
              , React.createElement('label', { htmlFor: "pinned", className: "text-xs font-semibold cursor-pointer"  ,}, "Pin to Dashboard"  )
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
            disabled: mutation.isPending || !form.title || !form.content,
            className: "bg-indigo-600 hover:bg-indigo-700 text-white"  ,}

            , mutation.isPending ? 'Publishing…' : 'Publish Announcement'
          )
        )
      )
    )
  );
};

const Announcements = () => {
  const queryClient = useQueryClient();
  const user = useSelector((state) => state.auth.user);
  const [showModal, setShowModal] = useState(false);

  const { data } = useQuery({
    queryKey: ['announcements-bulletin'],
    queryFn: () => axiosInstance.get('/announcements?limit=50').then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/announcements/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements-bulletin'] }),
  });

  const list = _optionalChain([data, 'optionalAccess', _6 => _6.data, 'optionalAccess', _7 => _7.announcements]) || [];

  return (
    React.createElement('div', { className: "space-y-6 p-1" ,}
      , React.createElement('div', { className: "flex items-center justify-between"  ,}
        , React.createElement('div', null
          , React.createElement('h1', { className: "text-2xl font-bold tracking-tight"  ,}, "Announcements")
          , React.createElement('p', { className: "text-sm text-muted-foreground mt-1"  ,}, "Review official notices and bulletins from management"      )
        )
        , _optionalChain([user, 'optionalAccess', _8 => _8.role]) !== 'Employee' && (
          React.createElement(Button, { onClick: () => setShowModal(true), className: "bg-indigo-600 hover:bg-indigo-700 text-white gap-2"   ,}
            , React.createElement(Plus, { size: 16,} ), " Add Bulletin"
          )
        )
      )

      , showModal && (
        React.createElement(AddAnnouncementModal, {
          onClose: () => setShowModal(false),
          onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements-bulletin'] }),}
        )
      )

      /* Feed list */
      , React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4"   ,}
        , list.map(bulletin => (
          React.createElement(Card, { key: bulletin._id, className: `transition-shadow hover:shadow-md relative ${
            bulletin.pinned ? 'border-2 border-indigo-500/20 bg-indigo-500/5' : ''
          }`,}
            , React.createElement(CardHeader, { className: "pb-3 pr-10" ,}
              , React.createElement('div', { className: "flex items-center justify-between"  ,}
                , React.createElement('span', { className: "text-xs text-muted-foreground font-semibold flex items-center gap-1"     ,}
                  , React.createElement(Calendar, { size: 13,} ), " " , format(new Date(bulletin.publishDate), 'dd MMM yyyy')
                )
                , bulletin.pinned && (
                  React.createElement('span', { className: "text-indigo-600", title: "Pinned Announcement" ,}
                    , React.createElement(Pin, { size: 14, className: "fill-indigo-600 rotate-45" ,} )
                  )
                )
              )
              , React.createElement(CardTitle, { className: "text-base font-bold mt-2 leading-tight"   ,}, bulletin.title)
              , React.createElement(CardDescription, { className: "text-xs flex items-center gap-1.5 mt-1 text-indigo-500 font-medium"      ,}
                , React.createElement(Globe, { size: 12,} ), " " , _optionalChain([bulletin, 'access', _9 => _9.targetDepartmentId, 'optionalAccess', _10 => _10.name]) || 'All Departments'
              )
            )
            , React.createElement(CardContent, { className: "pb-4",}
              , React.createElement('p', { className: "text-xs text-muted-foreground leading-relaxed whitespace-pre-line"   ,}, bulletin.content)
              , _optionalChain([user, 'optionalAccess', _11 => _11.role]) !== 'Employee' && (
                React.createElement('div', { className: "absolute right-4 bottom-4"  ,}
                  , React.createElement('button', {
                    onClick: () => deleteMutation.mutate(bulletin._id),
                    className: "p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded transition-all"     ,}

                    , React.createElement(Trash2, { size: 13,} )
                  )
                )
              )
            )
          )
        ))
        , list.length === 0 && (
          React.createElement('div', { className: "md:col-span-2 py-16 text-center text-muted-foreground"   ,}
            , React.createElement(Megaphone, { size: 40, className: "mx-auto mb-3 opacity-20"  ,} )
            , React.createElement('p', { className: "font-semibold text-lg" ,}, "No announcements posted yet"   )
            , React.createElement('p', { className: "text-sm",}, "There are no bulletins currently active for your target group."         )
          )
        )
      )
    )
  );
};

export default Announcements;
