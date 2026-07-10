import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card.js';
import { Badge } from '../components/ui/badge.js';

export const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Adjust security levels, workspace policies, and configurations.</p>
        </div>
        <Badge variant="secondary">Global</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Configurations</CardTitle>
          <CardDescription>Adjust roles, access control levels, and notification triggers.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center border-2 border-dashed rounded-lg text-sm text-muted-foreground bg-muted/10">
            [Placeholder] System settings panel and RBAC configuration widgets will be implemented in Phase 2.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
