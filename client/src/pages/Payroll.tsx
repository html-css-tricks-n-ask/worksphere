import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card.js';
import { Badge } from '../components/ui/badge.js';

export const Payroll: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payroll</h1>
          <p className="text-sm text-muted-foreground">Manage salary templates, payslips, and compliance reports.</p>
        </div>
        <Badge variant="secondary">Next run: July 28</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payroll Management Console</CardTitle>
          <CardDescription>Calculate payouts, deductions, and print statements.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center border-2 border-dashed rounded-lg text-sm text-muted-foreground bg-muted/10">
            [Placeholder] Payroll engine calculations and tax compliance forms will be implemented in Phase 2.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payroll;
