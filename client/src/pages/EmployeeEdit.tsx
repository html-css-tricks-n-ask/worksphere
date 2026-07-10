import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Loader2, Save, Users, Building } from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance.js';
import { Button } from '../components/ui/button.js';
import { Input } from '../components/ui/input.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.js';
import { Dropdown } from '../components/ui/dropdown.js';

export const EmployeeEdit: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        const [deptRes, desigRes, managersRes, empRes] = await Promise.all([
          axiosInstance.get('/departments?limit=100'),
          axiosInstance.get('/designations?limit=100'),
          axiosInstance.get('/employees?limit=200'),
          axiosInstance.get(`/employees/${id}`),
        ]);

        setDepartments(deptRes.data.data.departments || []);
        setDesignations(desigRes.data.data.designations || []);
        setManagers(managersRes.data.data.employees || []);

        const emp = empRes.data.data;
        reset({
          employeeId: emp.employeeId,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          phone: emp.phone || '',
          status: emp.status,
          professionalInfo: {
            departmentId: emp.professionalInfo?.departmentId?.id || emp.professionalInfo?.departmentId || '',
            designationId: emp.professionalInfo?.designationId?.id || emp.professionalInfo?.designationId || '',
            managerId: emp.professionalInfo?.managerId?.id || emp.professionalInfo?.managerId || '',
            joiningDate: emp.professionalInfo?.joiningDate ? new Date(emp.professionalInfo.joiningDate).toISOString().split('T')[0] : '',
            employmentType: emp.professionalInfo?.employmentType || 'Full-Time',
            workLocation: emp.professionalInfo?.workLocation || '',
            salaryGrade: emp.professionalInfo?.salaryGrade || '',
          },
        });
      } catch (err: any) {
        setError('Failed to load employee details.');
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id, reset]);

  const onSubmit = async (data: any) => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...data,
        professionalInfo: {
          ...data.professionalInfo,
          departmentId: data.professionalInfo.departmentId || undefined,
          designationId: data.professionalInfo.designationId || undefined,
          managerId: data.professionalInfo.managerId || undefined,
        },
      };

      await axiosInstance.put(`/employees/${id}`, payload);
      navigate(`/employees/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save employee profile.');
    } finally {
      setSaving(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/employees/${id}`}>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Modify Employee Profile</h1>
          <p className="text-sm text-muted-foreground">Adjust placement specs, credentials, and locations.</p>
        </div>
      </div>

      {error && (
        <div className="p-3 text-xs text-destructive bg-destructive/5 rounded-lg font-medium border border-destructive/10">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Personal info */}
        <Card className="md:col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Personal Data
            </CardTitle>
            <CardDescription>Setup identifiers and names</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Employee ID / Code</label>
              <Input placeholder="e.g. EMP001" {...register('employeeId')} required />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">First Name</label>
                <Input placeholder="First Name" {...register('firstName')} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Last Name</label>
                <Input placeholder="Last Name" {...register('lastName')} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Work Email Address</label>
              <Input type="email" placeholder="Email" {...register('email')} required />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
              <Input placeholder="Phone" {...register('phone')} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Status</label>
              <select
                {...register('status')}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus-visible:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Professional info */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Building className="h-4 w-4 text-primary" /> Placement Details
            </CardTitle>
            <CardDescription>Adjust professional configurations and reporting channels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Department</label>
                <select
                  {...register('professionalInfo.departmentId')}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus-visible:outline-none"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Designation</label>
                <select
                  {...register('professionalInfo.designationId')}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus-visible:outline-none"
                >
                  <option value="">Select Designation</option>
                  {designations.map((d) => (
                    <option key={d.id} value={d.id}>{d.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Reports To / Manager</label>
                <select
                  {...register('professionalInfo.managerId')}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus-visible:outline-none"
                >
                  <option value="">No Manager / Direct Report</option>
                  {managers.filter(m => m.id !== id).map((m) => (
                    <option key={m.id} value={m.id}>{m.firstName} {m.lastName} ({m.employeeId})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Joining Date</label>
                <Input type="date" {...register('professionalInfo.joiningDate')} />
              </div>

              <div className="space-y-1.5">
                <Dropdown
                  label="Employment Type"
                  options={[
                    { value: 'Full-Time', label: 'Full-Time' },
                    { value: 'Part-Time', label: 'Part-Time' },
                    { value: 'Contract', label: 'Contract' },
                    { value: 'Intern', label: 'Intern' },
                  ]}
                  {...register('professionalInfo.employmentType')}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Work Location</label>
                <Input placeholder="e.g. New York HQ, Remote" {...register('professionalInfo.workLocation')} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Salary Grade</label>
                <Input placeholder="e.g. SG-12" {...register('professionalInfo.salaryGrade')} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t mt-4">
              <Button type="button" variant="outline" onClick={() => navigate(`/employees/${id}`)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="vibrant-gradient text-white border-0 shadow-md gap-1.5">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save Profile Details
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default EmployeeEdit;
