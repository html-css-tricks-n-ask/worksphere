import React, { useEffect, useState } from 'react';
import { Users, Loader2, GitMerge, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';

export const OrgChart = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await axiosInstance.get('/employees?limit=100');
      setEmployees(res.data.data.employees || []);
    } catch (err) {
      setErrorMsg('Failed to load employee list for organizational chart.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Build Hierarchy Tree
  const buildTree = () => {
    const idMap = {};
    const roots = [];

    // Map each employee profile
    employees.forEach((emp) => {
      idMap[emp._id || emp.id] = { ...emp, children: [] };
    });

    // Link child nodes to reporting managers
    employees.forEach((emp) => {
      const managerId = emp.professionalInfo?.managerId?._id || emp.professionalInfo?.managerId;
      if (managerId && idMap[managerId]) {
        idMap[managerId].children.push(idMap[emp._id || emp.id]);
      } else {
        roots.push(idMap[emp._id || emp.id]);
      }
    });

    return roots;
  };

  const treeData = buildTree();

  // Recursive Tree Node Renderer
  const TreeNode = ({ node }) => {
    const [collapsed, setCollapsed] = useState(false);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div className="flex flex-col items-center ml-4 mr-4 mt-2">
        <div className="relative flex flex-col items-center">
          {/* Card */}
          <div className="flex flex-col items-center p-3 w-48 bg-white dark:bg-card border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border-indigo-100 dark:border-border/50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-bold flex items-center justify-center text-xs uppercase shadow-sm">
              {node.firstName ? node.firstName[0] : ''}
              {node.lastName ? node.lastName[0] : ''}
            </div>
            <h3 className="font-semibold text-xs text-foreground mt-2 text-center truncate w-full">
              {node.firstName} {node.lastName}
            </h3>
            <p className="text-[10px] text-indigo-600 font-medium text-center truncate w-full mt-0.5">
              {node.professionalInfo?.designationId?.title || 'Team Member'}
            </p>
            <p className="text-[9px] text-muted-foreground text-center truncate w-full">
              {node.professionalInfo?.departmentId?.name || 'Unassigned'}
            </p>
            
            {hasChildren && (
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="mt-1.5 p-0.5 hover:bg-slate-50 dark:hover:bg-muted rounded-full"
              >
                {collapsed ? <ChevronRight size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
              </button>
            )}
          </div>

          {/* Child branch indicator line */}
          {hasChildren && !collapsed && (
            <div className="w-0.5 h-6 bg-slate-200 dark:bg-border/60 mt-1"></div>
          )}
        </div>

        {/* Children Grid */}
        {hasChildren && !collapsed && (
          <div className="flex flex-row justify-center items-start border-t border-slate-200 dark:border-border/60 pt-4 gap-2 relative">
            {node.children.map((child) => (
              <TreeNode key={child._id || child.id} node={child} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Organization Chart</h1>
          <p className="text-sm text-muted-foreground">Visual tree mapping of corporate reporting structure and managers.</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} className="gap-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {errorMsg && (
        <div className="p-3 text-xs text-destructive bg-destructive/5 rounded-lg font-medium border border-destructive/10 flex justify-between items-center">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="font-bold">×</button>
        </div>
      )}

      {loading ? (
        <Card className="flex flex-col items-center justify-center py-20 border shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground mt-2">Assembling organization chart structure...</p>
        </Card>
      ) : treeData.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 border shadow-sm text-center px-4">
          <Users className="h-10 w-10 text-muted-foreground mb-2" />
          <CardTitle className="text-sm font-bold">No Directory Records Found</CardTitle>
          <CardDescription>Add employee profiles with Reporting Managers to configure this visualization.</CardDescription>
        </Card>
      ) : (
        <div className="w-full overflow-auto bg-slate-50/50 dark:bg-muted/10 p-6 border rounded-2xl flex flex-col items-center min-h-[500px]">
          <div className="flex items-start justify-center gap-6">
            {treeData.map((root) => (
              <TreeNode key={root._id || root.id} node={root} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgChart;
