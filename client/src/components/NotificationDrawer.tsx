import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { X, Bell, CheckSquare, Trash2 } from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance.js';

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();

  const { data } = useQuery<{ data: { notifications: NotificationItem[] } }>({
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
    mutationFn: (id: string) => axiosInstance.put(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-bell-list'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axiosInstance.delete(`/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-bell-list'] });
    },
  });

  const list = data?.data?.notifications || [];
  const unreadCount = list.filter(n => !n.isRead).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm bg-card border-l shadow-2xl animate-in slide-in-from-right duration-250">
      <div className="flex flex-col flex-1 h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b bg-muted/20">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-indigo-500" />
            <h2 className="font-bold text-sm">Notifications</h2>
            {unreadCount > 0 && (
              <span className="text-[10px] bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => markAllReadMutation.mutate()}
              className="p-1.5 hover:bg-muted text-muted-foreground rounded-lg transition-colors"
              title="Mark all read"
            >
              <CheckSquare size={15} />
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-muted text-muted-foreground rounded-lg transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* List items */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/40">
          {list.map(n => (
            <div
              key={n._id}
              onClick={() => !n.isRead && markReadMutation.mutate(n._id)}
              className={`p-4 hover:bg-muted/10 transition-colors cursor-pointer relative ${
                !n.isRead ? 'bg-indigo-500/5' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="p-1.5 bg-indigo-500/10 text-indigo-500 rounded-lg mt-0.5"><Bell size={14} /></span>
                <div className="flex-1 pr-4">
                  <p className={`text-xs ${!n.isRead ? 'font-bold' : 'font-medium'}`}>{n.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-[9px] text-muted-foreground/80 mt-1">
                    {format(new Date(n.createdAt), 'dd MMM HH:mm')}
                  </p>
                </div>
              </div>
              <button
                onClick={e => {
                  e.stopPropagation();
                  deleteMutation.mutate(n._id);
                }}
                className="absolute right-4 top-4 p-1 hover:text-rose-500 text-muted-foreground transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          {list.length === 0 && (
            <div className="py-20 text-center text-muted-foreground">
              <Bell size={40} className="mx-auto mb-3 opacity-20" />
              <p className="font-semibold text-sm">All caught up!</p>
              <p className="text-xs mt-1">No notifications recorded.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationDrawer;
