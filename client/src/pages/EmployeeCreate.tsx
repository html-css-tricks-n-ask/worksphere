import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Loader2, Save, Users, Building } from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance.js';
import { Button } from '../components/ui/button.js';
import { Input } from '../components/ui/input.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.js';
import { Dropdown } from '../components/ui/dropdown.js';

export const EmployeeCreate: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      employeeId: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      professionalInfo: {
        departmentId: '',
        designationId: '',
        managerId: '',
        joiningDate: new Date().toISOString().split('T')[0],
        employmentType: 'Full-Time',
        workLocation: '',
        salaryGrade: '',
      },
    },
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [deptRes, desigRes, managersRes] = await Promise.all([
          axiosInstance.get('/departments?limit=100'),
          axiosInstance.get('/designations?limit=100'),
          axiosInstance.get('/employees?limit=200'),
        ]);
        setDepartments(deptRes.data.data.departments || []);
        setDesignations(desigRes.data.data.designations || []);
        setManagers(managersRes.data.data.employees || []);
      } catch (err) {
        // Ignore load failures
      }
    };
    fetchOptions();
  }, []);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      // Clean empty fields
      const payload = {
        ...data,
        professionalInfo: {
          ...data.professionalInfo,
          departmentId: data.professionalInfo.departmentId || undefined,
          designationId: data.professionalInfo.designationId || undefined,
          managerId: data.professionalInfo.managerId || undefined,
        },
      };

      await axiosInstance.post('/employees', payload);
      navigate('/employees');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register employee.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/employees">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Register New Profile</h1>
          <p className="text-sm text-muted-foreground">Setup corporate details, profile linkages, and access keys.</p>
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
              <Users className="h-4 w-4 text-primary" /> Core Personal Data
            </CardTitle>
            <CardDescription>Configure identifiers and primary credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Employee ID / Code</label>
              <Input placeholder="e.g. EMP001" {...register('employeeId')} required />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">First Name</label>
                <Input placeholder="John" {...register('firstName')} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Last Name</label>
                <Input placeholder="Doe" {...register('lastName')} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Work Email Address</label>
              <Input type="email" placeholder="john.doe@company.com" {...register('email')} required />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
              <Input placeholder="+1 (555) 123-4567" {...register('phone')} />
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Professional info */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Building className="h-4 w-4 text-primary" /> Placement Details
            </CardTitle>
            <CardDescription>Update joining configurations, salaries grades, and locations</CardDescription>
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
                  {managers.map((m) => (
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
                <Input placeholder="e.g. SG-12, Grade-A" {...register('professionalInfo.salaryGrade')} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t mt-4">
              <Button type="button" variant="outline" onClick={() => navigate('/employees')}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="vibrant-gradient text-white border-0 shadow-md gap-1.5">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Registering...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save Profile Folder
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

export default EmployeeCreate;
