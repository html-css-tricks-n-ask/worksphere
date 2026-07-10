import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save, CheckCircle2, Loader2, Calendar } from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card.js';
import { Button } from '../components/ui/button.js';

const CompanySettings: React.FC = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    currency: 'USD',
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    weekendDays: [] as number[],
    officeHours: { start: '09:00', end: '18:00' },
    leavePolicy: { sickLeaveQuota: 10, casualLeaveQuota: 12, paidLeaveQuota: 15, wfhQuota: 30 },
  });

  const [message, setMessage] = useState('');

  const { data } = useQuery({
    queryKey: ['company-settings-config'],
    queryFn: () => axiosInstance.get('/settings').then(r => r.data),
  });

  useEffect(() => {
    if (data?.data) {
      setForm(data.data);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (payload: typeof form) => axiosInstance.put('/settings', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-settings-config'] });
      setMessage('Company configurations updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    },
  });

  const toggleWeekend = (day: number) => {
    setForm(f => {
      const idx = f.weekendDays.indexOf(day);
      const newDays = idx === -1 ? [...f.weekendDays, day] : f.weekendDays.filter(d => d !== day);
      return { ...f, weekendDays: newDays };
    });
  };

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6 p-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="text-indigo-500" size={24} />
            Company Administration
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Configure weekend rest days, leave quotas, and office timings</p>
        </div>
        <Button
          onClick={() => mutation.mutate(form)}
          disabled={mutation.isPending}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-lg"
        >
          {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
          Save Configurations
        </Button>
      </div>

      {message && (
        <div className="flex items-center gap-2 text-emerald-600 text-sm bg-emerald-500/10 px-4 py-3 rounded-xl border border-emerald-500/20">
          <CheckCircle2 size={16} />
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Weekend days and parameters */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Calendar size={16} className="text-indigo-500" /> Weekend Days Config
              </CardTitle>
              <CardDescription>Select organization rest days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {daysOfWeek.map((day, idx) => {
                const isSelected = form.weekendDays.includes(idx);
                return (
                  <div
                    key={day}
                    onClick={() => toggleWeekend(idx)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-500/40 bg-indigo-500/5 text-indigo-600 font-semibold'
                        : 'border-border/55 bg-background text-muted-foreground hover:bg-muted/15'
                    }`}
                  >
                    <span className="text-xs">{day}</span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="w-4 h-4 rounded text-indigo-600 border-border"
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Policies & Hours */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold">Standard Office Hour Limits</CardTitle>
              <CardDescription>Configure business hours properties</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold block mb-1.5">Shift Starts</label>
                <input
                  type="time"
                  value={form.officeHours?.start || '09:00'}
                  onChange={e => setForm(f => ({ ...f, officeHours: { ...f.officeHours, start: e.target.value } }))}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5">Shift Ends</label>
                <input
                  type="time"
                  value={form.officeHours?.end || '18:00'}
                  onChange={e => setForm(f => ({ ...f, officeHours: { ...f.officeHours, end: e.target.value } }))}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold">Default Leaves Policies Quota</CardTitle>
              <CardDescription>Configure annual leave counts assigned to new employees</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { key: 'sickLeaveQuota', label: 'Sick Leave' },
                { key: 'casualLeaveQuota', label: 'Casual Leave' },
                { key: 'paidLeaveQuota', label: 'Paid Leave' },
                { key: 'wfhQuota', label: 'WFH Limit' },
              ].map(item => (
                <div key={item.key}>
                  <label className="text-xs font-semibold block mb-1.5">{item.label}</label>
                  <input
                    type="number"
                    value={(form.leavePolicy as any)?.[item.key] || 0}
                    onChange={e => {
                      const val = parseInt(e.target.value) || 0;
                      setForm(f => ({ ...f, leavePolicy: { ...f.leavePolicy, [item.key]: val } }));
                    }}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-center"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompanySettings;
