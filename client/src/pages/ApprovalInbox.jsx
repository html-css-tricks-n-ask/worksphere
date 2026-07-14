import React, { useEffect, useState } from 'react';
import { Check, X, Clock, FileText, CheckSquare, Loader2, RefreshCw } from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog } from '../components/ui/dialog';

export const ApprovalInbox = () => {
  const [activeTab, setActiveTab] = useState('leaves');
  const [leaves, setLeaves] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog / Action states
  const [actionOpen, setActionOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionType, setActionType] = useState('Approved'); // Approved or Rejected
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      if (activeTab === 'leaves') {
        const res = await axiosInstance.get('/leaves/approvals/pending');
        setLeaves(res.data.data.leaves || []);
      } else {
        const res = await axiosInstance.get('/reimbursements/approvals/pending');
        setClaims(res.data.data.claims || []);
      }
    } catch (err) {
      setErrorMsg('Failed to load pending approvals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const openAction = (item, type) => {
    setSelectedItem(item);
    setActionType(type);
    setComments('');
    setActionOpen(true);
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      if (activeTab === 'leaves') {
        await axiosInstance.put(`/leaves/${selectedItem._id || selectedItem.id}/status`, {
          status: actionType,
          comments,
        });
      } else {
        await axiosInstance.put(`/reimbursements/${selectedItem._id || selectedItem.id}/approve`, {
          status: actionType,
          comments,
        });
      }
      setSuccessMsg(`Request successfully ${actionType.toLowerCase()}!`);
      setActionOpen(false);
      loadData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update request status.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Approval Inbox</h1>
          <p className="text-sm text-muted-foreground">Review and action pending requests in your workflow chain.</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} className="gap-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {successMsg && (
        <div className="p-3 text-xs text-emerald-600 bg-emerald-50 rounded-lg font-medium border border-emerald-100 flex justify-between items-center">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="font-bold">×</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 text-xs text-destructive bg-destructive/5 rounded-lg font-medium border border-destructive/10 flex justify-between items-center">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="font-bold">×</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/40 p-1 rounded-xl w-fit border">
        <button
          onClick={() => setActiveTab('leaves')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'leaves' ? 'bg-white dark:bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Leave Applications
        </button>
        <button
          onClick={() => setActiveTab('claims')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'claims' ? 'bg-white dark:bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Expense Claims
        </button>
      </div>

      {/* Table Container */}
      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle className="text-sm font-bold">
            Pending {activeTab === 'leaves' ? 'Leave Requests' : 'Reimbursements'}
          </CardTitle>
          <CardDescription>
            Requests waiting for your level of review
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeTab === 'leaves' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Current Stage</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-xs text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin inline mr-2 text-primary" /> Loading leaves...
                    </TableCell>
                  </TableRow>
                ) : leaves.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-xs text-muted-foreground">
                      No leave requests pending your approval.
                    </TableCell>
                  </TableRow>
                ) : (
                  leaves.map((leave) => (
                    <TableRow key={leave._id}>
                      <TableCell className="font-semibold text-xs text-foreground">
                        {leave.employeeId ? `${leave.employeeId.firstName} ${leave.employeeId.lastName}` : 'Unknown'}
                      </TableCell>
                      <TableCell className="text-xs">{leave.leaveType}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-xs font-semibold">{leave.totalDays} days</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate">{leave.reason}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200">
                          {leave.currentStage}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button size="icon" variant="outline" className="h-7 w-7 border-emerald-200 hover:bg-emerald-50" onClick={() => openAction(leave, 'Approved')}>
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          </Button>
                          <Button size="icon" variant="outline" className="h-7 w-7 border-rose-200 hover:bg-rose-50" onClick={() => openAction(leave, 'Rejected')}>
                            <X className="h-3.5 w-3.5 text-rose-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Expense Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Current Stage</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-xs text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin inline mr-2 text-primary" /> Loading claims...
                    </TableCell>
                  </TableRow>
                ) : claims.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-xs text-muted-foreground">
                      No expense claims pending your approval.
                    </TableCell>
                  </TableRow>
                ) : (
                  claims.map((claim) => (
                    <TableRow key={claim._id}>
                      <TableCell className="font-semibold text-xs text-foreground">
                        {claim.employeeId ? `${claim.employeeId.firstName} ${claim.employeeId.lastName}` : 'Unknown'}
                      </TableCell>
                      <TableCell className="text-xs">{claim.title}</TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="secondary" className="text-[10px]">{claim.category}</Badge>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-foreground">${claim.amount.toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(claim.expenseDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700 border-purple-200">
                          {claim.currentStage}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button size="icon" variant="outline" className="h-7 w-7 border-emerald-200 hover:bg-emerald-50" onClick={() => openAction(claim, 'Approved')}>
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          </Button>
                          <Button size="icon" variant="outline" className="h-7 w-7 border-rose-200 hover:bg-rose-50" onClick={() => openAction(claim, 'Rejected')}>
                            <X className="h-3.5 w-3.5 text-rose-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog isOpen={actionOpen} onClose={() => setActionOpen(false)} title={`${actionType} Request`}>
        <form onSubmit={handleActionSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Comments / Remarks (Optional)</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="e.g. Approved. Have a nice holiday!"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="ghost" size="sm" type="button" onClick={() => setActionOpen(false)}>Cancel</Button>
            <Button size="sm" type="submit" disabled={submitting} className={actionType === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'}>
              {submitting ? 'Processing...' : `Confirm ${actionType}`}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default ApprovalInbox;
