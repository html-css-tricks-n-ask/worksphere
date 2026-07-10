import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ShieldCheck, RefreshCw, FileText } from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance.js';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.js';

interface AuditLog {
  _id: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  actorId?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const AuditLogs: React.FC = () => {
  const { data, refetch } = useQuery<{ data: { logs: AuditLog[] } }>({
    queryKey: ['audit-logs-list'],
    queryFn: () => axiosInstance.get('/audit?limit=100').then(r => r.data),
  });

  const list = data?.data?.logs || [];

  return (
    <div className="space-y-6 p-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-indigo-500" size={24} />
            Security Audit Logs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Track all write mutations, creations, updates, logins, and status revisions</p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-3 py-1.5 border border-border text-sm font-semibold rounded-lg bg-card hover:bg-muted/10 transition-colors"
        >
          <RefreshCw size={14} /> Refresh Logs
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText size={18} className="text-indigo-500" />
            Audit Log Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Timestamp</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actor</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Action</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">IP Address</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Browser/Agent</th>
                </tr>
              </thead>
              <tbody>
                {list.map(log => (
                  <tr key={log._id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 text-xs font-medium text-muted-foreground">
                      {format(new Date(log.timestamp), 'dd MMM yyyy HH:mm:ss')}
                    </td>
                    <td className="py-3 px-4">
                      {log.actorId ? (
                        <>
                          <p className="font-semibold text-foreground">{log.actorId.firstName} {log.actorId.lastName}</p>
                          <p className="text-xs text-muted-foreground">{log.actorId.email}</p>
                        </>
                      ) : (
                        <span className="text-xs font-semibold text-muted-foreground">System / Guest</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-muted/60 text-indigo-600 border border-border/50">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground max-w-xs truncate" title={log.userAgent}>
                      {log.userAgent || '—'}
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">No audit entries found. Try executing updates or adding profiles to populate.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogs;
