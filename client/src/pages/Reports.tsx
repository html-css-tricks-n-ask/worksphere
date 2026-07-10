import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card.js';
import { Badge } from '../components/ui/badge.js';

export const Reports: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">Analyze attrition, performance evaluations, and check-in logs.</p>
        </div>
        <Badge variant="secondary">Ready</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reports Engine</CardTitle>
          <CardDescription>Export visual charts, employee statistics, and payroll reports.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center border-2 border-dashed rounded-lg text-sm text-muted-foreground bg-muted/10">
            [Placeholder] Advanced custom exports and reports builder will be implemented in Phase 2.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
