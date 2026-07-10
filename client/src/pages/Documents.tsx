import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card.js';
import { Badge } from '../components/ui/badge.js';

export const Documents: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
          <p className="text-sm text-muted-foreground">Store employee profiles, compliance papers, and credentials.</p>
        </div>
        <Badge variant="secondary">12 pending signature</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documents Manager</CardTitle>
          <CardDescription>Upload credentials, agreements, and corporate policies securely.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center border-2 border-dashed rounded-lg text-sm text-muted-foreground bg-muted/10">
            [Placeholder] Secure DMS cloud storage and signature tracing features will be implemented in Phase 2.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Documents;
