import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Megaphone, Plus, Calendar, Trash2, Pin, Globe, AlertCircle } from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card.js';
import { Button } from '../components/ui/button.js';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store.js';

interface Department {
  name: string;
}

interface Announcement {
  _id: string;
  title: string;
  content: string;
  pinned: boolean;
  targetDepartmentId?: Department;
  publishDate: string;
}

const AddAnnouncementModal: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    title: '',
    content: '',
    pinned: false,
    targetDepartmentId: '',
  });
  const [error, setError] = useState('');

  // Fetch departments list
  const { data: deptData } = useQuery<{ data: { departments: { id: string; name: string }[] } }>({
    queryKey: ['departments-options'],
    queryFn: () => axiosInstance.get('/departments?limit=100').then(r => r.data),
  });

  const mutation = useMutation({
    mutationFn: (data: typeof form) =>
      axiosInstance.post('/announcements', {
        ...data,
        targetDepartmentId: data.targetDepartmentId || undefined,
      }),
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to publish bulletin.'),
  });

  const depts = deptData?.data?.departments || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border/60 rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-border/40">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Megaphone size={20} className="text-indigo-500" />
            Publish Company Announcement
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold block mb-1.5">Announcement Title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Town Hall Meeting, Office Holiday Notice"
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold block mb-1.5">Bulletin Message</label>
            <textarea
              rows={4}
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="Type the message body details here..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold block mb-1.5">Target Department</label>
              <select
                value={form.targetDepartmentId}
                onChange={e => setForm(f => ({ ...f, targetDepartmentId: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
              >
                <option value="">All Departments</option>
                {depts.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6 pl-4">
              <input
                type="checkbox"
                id="pinned"
                checked={form.pinned}
                onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))}
                className="w-4 h-4 rounded text-indigo-600 border-border"
              />
              <label htmlFor="pinned" className="text-xs font-semibold cursor-pointer">Pin to Dashboard</label>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-600 text-sm bg-rose-500/10 px-3 py-2 rounded-lg">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border/40 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending || !form.title || !form.content}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {mutation.isPending ? 'Publishing…' : 'Publish Announcement'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const Announcements: React.FC = () => {
  const queryClient = useQueryClient();
  const user = useSelector((state: RootState) => state.auth.user);
  const [showModal, setShowModal] = useState(false);

  const { data } = useQuery<{ data: { announcements: Announcement[] } }>({
    queryKey: ['announcements-bulletin'],
    queryFn: () => axiosInstance.get('/announcements?limit=50').then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axiosInstance.delete(`/announcements/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements-bulletin'] }),
  });

  const list = data?.data?.announcements || [];

  return (
    <div className="space-y-6 p-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
          <p className="text-sm text-muted-foreground mt-1">Review official notices and bulletins from management</p>
        </div>
        {user?.role !== 'Employee' && (
          <Button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
            <Plus size={16} /> Add Bulletin
          </Button>
        )}
      </div>

      {showModal && (
        <AddAnnouncementModal
          onClose={() => setShowModal(false)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['announcements-bulletin'] })}
        />
      )}

      {/* Feed list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map(bulletin => (
          <Card key={bulletin._id} className={`transition-shadow hover:shadow-md relative ${
            bulletin.pinned ? 'border-2 border-indigo-500/20 bg-indigo-500/5' : ''
          }`}>
            <CardHeader className="pb-3 pr-10">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                  <Calendar size={13} /> {format(new Date(bulletin.publishDate), 'dd MMM yyyy')}
                </span>
                {bulletin.pinned && (
                  <span className="text-indigo-600" title="Pinned Announcement">
                    <Pin size={14} className="fill-indigo-600 rotate-45" />
                  </span>
                )}
              </div>
              <CardTitle className="text-base font-bold mt-2 leading-tight">{bulletin.title}</CardTitle>
              <CardDescription className="text-xs flex items-center gap-1.5 mt-1 text-indigo-500 font-medium">
                <Globe size={12} /> {bulletin.targetDepartmentId?.name || 'All Departments'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{bulletin.content}</p>
              {user?.role !== 'Employee' && (
                <div className="absolute right-4 bottom-4">
                  <button
                    onClick={() => deleteMutation.mutate(bulletin._id)}
                    className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {list.length === 0 && (
          <div className="md:col-span-2 py-16 text-center text-muted-foreground">
            <Megaphone size={40} className="mx-auto mb-3 opacity-20" />
            <p className="font-semibold text-lg">No announcements posted yet</p>
            <p className="text-sm">There are no bulletins currently active for your target group.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
