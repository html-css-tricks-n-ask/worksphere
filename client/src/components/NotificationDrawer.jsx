 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { X, Bell, CheckSquare, Trash2 } from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance';















const NotificationDrawer = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications-bell-list'],
    queryFn: () => axiosInstance.get('/notifications?limit=30').then(r => r.data),
    enabled: isOpen,
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => axiosInstance.put('/notifications/mark-all-read'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-bell-list'] });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => axiosInstance.put(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-bell-list'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-bell-list'] });
    },
  });

  const list = _optionalChain([data, 'optionalAccess', _ => _.data, 'optionalAccess', _2 => _2.notifications]) || [];
  const unreadCount = list.filter(n => !n.isRead).length;

  if (!isOpen) return null;

  return (
    React.createElement('div', { className: "fixed inset-y-0 right-0 z-50 flex w-full max-w-sm bg-card border-l shadow-2xl animate-in slide-in-from-right duration-250"            ,}
      , React.createElement('div', { className: "flex flex-col flex-1 h-full"   ,}
        /* Header */
        , React.createElement('div', { className: "flex items-center justify-between px-6 h-16 border-b bg-muted/20"      ,}
          , React.createElement('div', { className: "flex items-center gap-2"  ,}
            , React.createElement(Bell, { size: 18, className: "text-indigo-500",} )
            , React.createElement('h2', { className: "font-bold text-sm" ,}, "Notifications")
            , unreadCount > 0 && (
              React.createElement('span', { className: "text-[10px] bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded-full"      ,}
                , unreadCount, " new"
              )
            )
          )
          , React.createElement('div', { className: "flex items-center gap-1"  ,}
            , React.createElement('button', {
              onClick: () => markAllReadMutation.mutate(),
              className: "p-1.5 hover:bg-muted text-muted-foreground rounded-lg transition-colors"    ,
              title: "Mark all read"  ,}

              , React.createElement(CheckSquare, { size: 15,} )
            )
            , React.createElement('button', { onClick: onClose, className: "p-1.5 hover:bg-muted text-muted-foreground rounded-lg transition-colors"    ,}
              , React.createElement(X, { size: 16,} )
            )
          )
        )

        /* List items */
        , React.createElement('div', { className: "flex-1 overflow-y-auto divide-y divide-border/40"   ,}
          , list.map(n => (
            React.createElement('div', {
              key: n._id,
              onClick: () => !n.isRead && markReadMutation.mutate(n._id),
              className: `p-4 hover:bg-muted/10 transition-colors cursor-pointer relative ${
                !n.isRead ? 'bg-indigo-500/5' : ''
              }`,}

              , React.createElement('div', { className: "flex items-start gap-3"  ,}
                , React.createElement('span', { className: "p-1.5 bg-indigo-500/10 text-indigo-500 rounded-lg mt-0.5"    ,}, React.createElement(Bell, { size: 14,} ))
                , React.createElement('div', { className: "flex-1 pr-4" ,}
                  , React.createElement('p', { className: `text-xs ${!n.isRead ? 'font-bold' : 'font-medium'}`,}, n.title)
                  , React.createElement('p', { className: "text-[10px] text-muted-foreground mt-0.5"  ,}, n.message)
                  , React.createElement('p', { className: "text-[9px] text-muted-foreground/80 mt-1"  ,}
                    , format(new Date(n.createdAt), 'dd MMM HH:mm')
                  )
                )
              )
              , React.createElement('button', {
                onClick: e => {
                  e.stopPropagation();
                  deleteMutation.mutate(n._id);
                },
                className: "absolute right-4 top-4 p-1 hover:text-rose-500 text-muted-foreground transition-colors"      ,}

                , React.createElement(Trash2, { size: 12,} )
              )
            )
          ))
          , list.length === 0 && (
            React.createElement('div', { className: "py-20 text-center text-muted-foreground"  ,}
              , React.createElement(Bell, { size: 40, className: "mx-auto mb-3 opacity-20"  ,} )
              , React.createElement('p', { className: "font-semibold text-sm" ,}, "All caught up!"  )
              , React.createElement('p', { className: "text-xs mt-1" ,}, "No notifications recorded."  )
            )
          )
        )
      )
    )
  );
};

export default NotificationDrawer;
