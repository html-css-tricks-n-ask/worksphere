import React, { useState } from 'react';
import { Shield, Save, CheckCircle2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card.js';
import { Button } from '../components/ui/button.js';

const Permissions: React.FC = () => {
  const [matrix, setMatrix] = useState<Record<string, Record<string, boolean>>>({
    'Company Admin': { employees: true, attendance: true, payroll: true, reports: true, settings: true, notification: true },
    HR: { employees: true, attendance: true, payroll: true, reports: true, settings: false, notification: true },
    Manager: { employees: true, attendance: true, payroll: false, reports: true, settings: false, notification: true },
    Employee: { employees: false, attendance: true, payroll: false, reports: false, settings: false, notification: true },
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const togglePermission = (role: string, module: string) => {
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
    <div className="space-y-6 p-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="text-indigo-500" size={24} />
            Role Permission Matrix
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Configure workspace module access and read/write scopes per role</p>
        </div>
        <Button onClick={savePermissions} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-lg">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {success && (
        <div className="flex items-center gap-2 text-emerald-600 text-sm bg-emerald-500/10 px-4 py-3 rounded-xl border border-emerald-500/20">
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Role Permissions Mapping</CardTitle>
          <CardDescription>Grant or restrict modules access dynamically</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left py-3 px-6 font-medium text-muted-foreground">Module / Permission</th>
                  {roles.map(role => (
                    <th key={role} className="text-center py-3 px-4 font-medium text-muted-foreground">{role}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modules.map(module => (
                  <tr key={module} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                    <td className="py-4 px-6 font-semibold capitalize text-foreground">{module}</td>
                    {roles.map(role => {
                      const enabled = matrix[role][module];
                      return (
                        <td key={`${role}-${module}`} className="py-4 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={() => togglePermission(role, module)}
                            className="w-4.5 h-4.5 rounded text-indigo-600 border-border cursor-pointer focus:ring-indigo-500"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Permissions;
