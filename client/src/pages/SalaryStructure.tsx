import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, AlertCircle, Wallet } from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance.js';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.js';
import { Button } from '../components/ui/button.js';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
}

interface SalaryStructure {
  _id: string;
  employeeId: Employee;
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  conveyance: number;
  medicalAllowance: number;
  bonus: number;
  incentive: number;
  overtimePay: number;
  pf: number;
  esi: number;
  professionalTax: number;
  incomeTax: number;
  otherDeductions: number;
  netSalary: number;
  status: 'Active' | 'Inactive';
}

const StructureModal: React.FC<{
  structure?: SalaryStructure;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ structure, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    employeeId: structure?.employeeId?.id || '',
    basicSalary: structure?.basicSalary || 3000,
    hra: structure?.hra || 1000,
    specialAllowance: structure?.specialAllowance || 500,
    conveyance: structure?.conveyance || 200,
    medicalAllowance: structure?.medicalAllowance || 150,
    bonus: structure?.bonus || 0,
    incentive: structure?.incentive || 0,
    overtimePay: structure?.overtimePay || 0,
    pf: structure?.pf || 360,
    esi: structure?.esi || 100,
    professionalTax: structure?.professionalTax || 200,
    incomeTax: structure?.incomeTax || 400,
    otherDeductions: structure?.otherDeductions || 0,
  });

  const [error, setError] = useState('');

  // Fetch employees options list
  const { data: empData } = useQuery<{ data: { employees: Employee[] } }>({
    queryKey: ['employees-options'],
    queryFn: () => axiosInstance.get('/employees?limit=200').then(r => r.data),
  });

  const mutation = useMutation({
    mutationFn: (data: typeof form) =>
      structure
        ? axiosInstance.put(`/payroll/salary-structure/${structure._id}`, data)
        : axiosInstance.post('/payroll/salary-structure', data),
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to configure structure.'),
  });

  const employees = empData?.data?.employees || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border/60 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-border/40">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Wallet size={20} className="text-indigo-500" />
            {structure ? 'Modify Salary Settings' : 'Configure New Salary Structure'}
          </h2>
        </div>

        <div className="p-6 space-y-6">
          {!structure && (
            <div>
              <label className="text-xs font-semibold block mb-1.5">Select Employee</label>
              <select
                value={form.employeeId}
                onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm"
              >
                <option value="">Choose employee...</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeId})</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Earnings segment */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-indigo-500 border-b pb-1">Monthly Earnings</h3>
              <div className="space-y-2">
                <label className="text-xs font-semibold block">Basic Salary</label>
                <input
                  type="number"
                  value={form.basicSalary}
                  onChange={e => setForm(f => ({ ...f, basicSalary: parseFloat(e.target.value) || 0 }))}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold block">House Rent Allowance (HRA)</label>
                <input
                  type="number"
                  value={form.hra}
                  onChange={e => setForm(f => ({ ...f, hra: parseFloat(e.target.value) || 0 }))}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold block">Special Allowance</label>
                <input
                  type="number"
                  value={form.specialAllowance}
                  onChange={e => setForm(f => ({ ...f, specialAllowance: parseFloat(e.target.value) || 0 }))}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold block">Conveyance Allowance</label>
                <input
                  type="number"
                  value={form.conveyance}
                  onChange={e => setForm(f => ({ ...f, conveyance: parseFloat(e.target.value) || 0 }))}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold block">Medical Allowance</label>
                <input
                  type="number"
                  value={form.medicalAllowance}
                  onChange={e => setForm(f => ({ ...f, medicalAllowance: parseFloat(e.target.value) || 0 }))}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm"
                />
              </div>
            </div>

            {/* Deductions segment */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-rose-500 border-b pb-1">Deductions</h3>
              <div className="space-y-2">
                <label className="text-xs font-semibold block">Provident Fund (PF)</label>
                <input
                  type="number"
                  value={form.pf}
                  onChange={e => setForm(f => ({ ...f, pf: parseFloat(e.target.value) || 0 }))}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold block">ESI Contribution</label>
                <input
                  type="number"
                  value={form.esi}
                  onChange={e => setForm(f => ({ ...f, esi: parseFloat(e.target.value) || 0 }))}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold block">Professional Tax</label>
                <input
                  type="number"
                  value={form.professionalTax}
                  onChange={e => setForm(f => ({ ...f, professionalTax: parseFloat(e.target.value) || 0 }))}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold block">Income Tax (TDS)</label>
                <input
                  type="number"
                  value={form.incomeTax}
                  onChange={e => setForm(f => ({ ...f, incomeTax: parseFloat(e.target.value) || 0 }))}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold block">Other Deductions</label>
                <input
                  type="number"
                  value={form.otherDeductions}
                  onChange={e => setForm(f => ({ ...f, otherDeductions: parseFloat(e.target.value) || 0 }))}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-600 text-sm bg-rose-500/10 px-3 py-2 rounded-lg">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border/40 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending || (!structure && !form.employeeId)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {mutation.isPending ? 'Saving…' : 'Save Configurations'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const SalaryStructureManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<SalaryStructure | null>(null);

  const { data } = useQuery<{ data: { structures: SalaryStructure[] } }>({
    queryKey: ['salary-structures'],
    queryFn: () => axiosInstance.get('/payroll/salary-structure').then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axiosInstance.delete(`/payroll/salary-structure/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['salary-structures'] }),
  });

  const list = data?.data?.structures || [];

  return (
    <div className="space-y-6 p-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Salary Structures</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure individual basic salaries, allowances, and tax allocations</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
          <Plus size={16} /> Configure Salary
        </Button>
      </div>

      {showModal && (
        <StructureModal
          onClose={() => setShowModal(false)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['salary-structures'] })}
        />
      )}
      {editItem && (
        <StructureModal
          structure={editItem}
          onClose={() => setEditItem(null)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['salary-structures'] })}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Salary Allocations Feed</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Employee</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Basic Salary</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Allowances (HRA+)</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Deductions (Tax+)</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Net Payout</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map(s => {
                  const allowances = s.hra + s.specialAllowance + s.conveyance + s.medicalAllowance;
                  const deductions = s.pf + s.esi + s.professionalTax + s.incomeTax + s.otherDeductions;
                  return (
                    <tr key={s._id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-semibold">{s.employeeId?.firstName} {s.employeeId?.lastName}</p>
                        <p className="text-xs text-muted-foreground">{s.employeeId?.employeeId}</p>
                      </td>
                      <td className="py-3 px-4 font-medium">${s.basicSalary.toLocaleString()}</td>
                      <td className="py-3 px-4 text-emerald-600 font-medium">+${allowances.toLocaleString()}</td>
                      <td className="py-3 px-4 text-rose-600 font-medium">-${deductions.toLocaleString()}</td>
                      <td className="py-3 px-4 font-bold text-indigo-600">${s.netSalary.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditItem(s)}
                            className="p-1 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-500/10 rounded transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(s._id)}
                            className="p-1 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {list.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">No salary configurations registered yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalaryStructureManager;
