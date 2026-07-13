 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ShieldCheck, RefreshCw, FileText } from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';














const AuditLogs = () => {
  const { data, refetch } = useQuery({
    queryKey: ['audit-logs-list'],
    queryFn: () => axiosInstance.get('/audit?limit=100').then(r => r.data),
  });

  const list = _optionalChain([data, 'optionalAccess', _ => _.data, 'optionalAccess', _2 => _2.logs]) || [];

  return (
    React.createElement('div', { className: "space-y-6 p-1" ,}
      , React.createElement('div', { className: "flex items-center justify-between"  ,}
        , React.createElement('div', null
          , React.createElement('h1', { className: "text-2xl font-bold tracking-tight flex items-center gap-2"     ,}
            , React.createElement(ShieldCheck, { className: "text-indigo-500", size: 24,} ), "Security Audit Logs"

          )
          , React.createElement('p', { className: "text-sm text-muted-foreground mt-1"  ,}, "Track all write mutations, creations, updates, logins, and status revisions"         )
        )
        , React.createElement('button', {
          onClick: () => refetch(),
          className: "inline-flex items-center gap-2 px-3 py-1.5 border border-border text-sm font-semibold rounded-lg bg-card hover:bg-muted/10 transition-colors"            ,}

          , React.createElement(RefreshCw, { size: 14,} ), " Refresh Logs"
        )
      )

      , React.createElement(Card, null
        , React.createElement(CardHeader, null
          , React.createElement(CardTitle, { className: "text-base flex items-center gap-2"   ,}
            , React.createElement(FileText, { size: 18, className: "text-indigo-500",} ), "Audit Log Timeline"

          )
        )
        , React.createElement(CardContent, { className: "p-0",}
          , React.createElement('div', { className: "overflow-x-auto",}
            , React.createElement('table', { className: "w-full text-sm" ,}
              , React.createElement('thead', null
                , React.createElement('tr', { className: "border-b border-border/50 bg-muted/30"  ,}
                  , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Timestamp")
                  , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Actor")
                  , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Action")
                  , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "IP Address" )
                  , React.createElement('th', { className: "text-left py-3 px-4 font-medium text-muted-foreground"    ,}, "Browser/Agent")
                )
              )
              , React.createElement('tbody', null
                , list.map(log => (
                  React.createElement('tr', { key: log._id, className: "border-b border-border/30 hover:bg-muted/20 transition-colors"   ,}
                    , React.createElement('td', { className: "py-3 px-4 text-xs font-medium text-muted-foreground"    ,}
                      , format(new Date(log.timestamp), 'dd MMM yyyy HH:mm:ss')
                    )
                    , React.createElement('td', { className: "py-3 px-4" ,}
                      , log.actorId ? (
                        React.createElement(React.Fragment, null
                          , React.createElement('p', { className: "font-semibold text-foreground" ,}, log.actorId.firstName, " " , log.actorId.lastName)
                          , React.createElement('p', { className: "text-xs text-muted-foreground" ,}, log.actorId.email)
                        )
                      ) : (
                        React.createElement('span', { className: "text-xs font-semibold text-muted-foreground"  ,}, "System / Guest"  )
                      )
                    )
                    , React.createElement('td', { className: "py-3 px-4" ,}
                      , React.createElement('span', { className: "text-xs font-bold font-mono px-2 py-0.5 rounded bg-muted/60 text-indigo-600 border border-border/50"         ,}
                        , log.action
                      )
                    )
                    , React.createElement('td', { className: "py-3 px-4 font-mono text-xs text-muted-foreground"    ,}
                      , log.ipAddress || '127.0.0.1'
                    )
                    , React.createElement('td', { className: "py-3 px-4 text-xs text-muted-foreground max-w-xs truncate"     , title: log.userAgent,}
                      , log.userAgent || '—'
                    )
                  )
                ))
                , list.length === 0 && (
                  React.createElement('tr', null
                    , React.createElement('td', { colSpan: 5, className: "py-12 text-center text-muted-foreground"  ,}, "No audit entries found. Try executing updates or adding profiles to populate."           )
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

export default AuditLogs;
