import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card.js';
import { Badge } from '../components/ui/badge.js';

export const Profile: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-sm text-muted-foreground">Manage personal contact data, login logs, and settings.</p>
        </div>
        <Badge variant="secondary">Active Employee</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Details</CardTitle>
          <CardDescription>Review and modify basic employee details, qualifications, and payroll setup.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center border-2 border-dashed rounded-lg text-sm text-muted-foreground bg-muted/10">
            [Placeholder] Employee profile records and credential verification will be implemented in Phase 2.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
