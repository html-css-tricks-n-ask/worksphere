import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card.js';
import { Badge } from '../components/ui/badge.js';

export const Company: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Company Details</h1>
          <p className="text-sm text-muted-foreground">Adjust corporate settings and address definitions.</p>
        </div>
        <Badge variant="secondary">Acme Corp</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Settings</CardTitle>
          <CardDescription>Setup details, workspaces, branches, and compliance certificates.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center border-2 border-dashed rounded-lg text-sm text-muted-foreground bg-muted/10">
            [Placeholder] Multi-branch registrations and legal detail configurations will be implemented in Phase 2.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Company;
