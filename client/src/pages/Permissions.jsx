import React, { useState } from 'react';
import { Shield, Save, CheckCircle2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';

const Permissions = () => {
  const [matrix, setMatrix] = useState({
    'Company Admin': { employees: true, attendance: true, payroll: true, reports: true, settings: true, notification: true },
    HR: { employees: true, attendance: true, payroll: true, reports: true, settings: false, notification: true },
    Manager: { employees: true, attendance: true, payroll: false, reports: true, settings: false, notification: true },
    Employee: { employees: false, attendance: true, payroll: false, reports: false, settings: false, notification: true },
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const togglePermission = (role, module) => {
    setMatrix(m => ({
      ...m,
      [role]: {
        ...m[role],
        [module]: !m[role][module],
      },
    }));
  };

  const savePermissions = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess('Permissions Matrix updated and saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }, 1000);
  };

  const modules = ['employees', 'attendance', 'payroll', 'reports', 'settings', 'notification'];
  const roles = Object.keys(matrix);

  return (
    React.createElement('div', { className: "space-y-6 p-1" ,}
      , React.createElement('div', { className: "flex items-center justify-between"  ,}
        , React.createElement('div', null
          , React.createElement('h1', { className: "text-2xl font-bold tracking-tight flex items-center gap-2"     ,}
            , React.createElement(Shield, { className: "text-indigo-500", size: 24,} ), "Role Permission Matrix"

          )
          , React.createElement('p', { className: "text-sm text-muted-foreground mt-1"  ,}, "Configure workspace module access and read/write scopes per role"        )
        )
        , React.createElement(Button, { onClick: savePermissions, disabled: saving, className: "bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-lg"    ,}
          , saving ? React.createElement(Loader2, { className: "h-4 w-4 animate-spin"  ,} ) : React.createElement(Save, { size: 16,} )
          , saving ? 'Saving...' : 'Save Settings'
        )
      )

      , success && (
        React.createElement('div', { className: "flex items-center gap-2 text-emerald-600 text-sm bg-emerald-500/10 px-4 py-3 rounded-xl border border-emerald-500/20"          ,}
          , React.createElement(CheckCircle2, { size: 16,} )
          , success
        )
      )

      , React.createElement(Card, null
        , React.createElement(CardHeader, null
          , React.createElement(CardTitle, { className: "text-base",}, "Role Permissions Mapping"  )
          , React.createElement(CardDescription, null, "Grant or restrict modules access dynamically"     )
        )
        , React.createElement(CardContent, { className: "p-0",}
          , React.createElement('div', { className: "overflow-x-auto",}
            , React.createElement('table', { className: "w-full text-sm" ,}
              , React.createElement('thead', null
                , React.createElement('tr', { className: "border-b border-border/50 bg-muted/30"  ,}
                  , React.createElement('th', { className: "text-left py-3 px-6 font-medium text-muted-foreground"    ,}, "Module / Permission"  )
                  , roles.map(role => (
                    React.createElement('th', { key: role, className: "text-center py-3 px-4 font-medium text-muted-foreground"    ,}, role)
                  ))
                )
              )
              , React.createElement('tbody', null
                , modules.map(module => (
                  React.createElement('tr', { key: module, className: "border-b border-border/30 hover:bg-muted/10 transition-colors"   ,}
                    , React.createElement('td', { className: "py-4 px-6 font-semibold capitalize text-foreground"    ,}, module)
                    , roles.map(role => {
                      const enabled = matrix[role][module];
                      return (
                        React.createElement('td', { key: `${role}-${module}`, className: "py-4 px-4 text-center"  ,}
                          , React.createElement('input', {
                            type: "checkbox",
                            checked: enabled,
                            onChange: () => togglePermission(role, module),
                            className: "w-4.5 h-4.5 rounded text-indigo-600 border-border cursor-pointer focus:ring-indigo-500"      ,}
                          )
                        )
                      );
                    })
                  )
                ))
              )
            )
          )
        )
      )
    )
  );
};

export default Permissions;
