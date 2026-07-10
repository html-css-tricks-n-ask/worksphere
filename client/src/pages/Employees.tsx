import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card.js';
import { Badge } from '../components/ui/badge.js';

export const Employees: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
          <p className="text-sm text-muted-foreground">Manage and track your workforce credentials and roles.</p>
        </div>
        <Badge variant="secondary">1,284 Active</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workforce Directory</CardTitle>
          <CardDescription>A comprehensive listing of all active team members across the organization.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center border-2 border-dashed rounded-lg text-sm text-muted-foreground bg-muted/10">
            [Placeholder] Employee CRUD and profile management systems will be implemented in Phase 2.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Employees;
