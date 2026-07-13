 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Loader2, Save, Users, Building } from 'lucide-react';
import { axiosInstance } from '../services/axiosInstance';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dropdown } from '../components/ui/dropdown';

export const EmployeeCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [managers, setManagers] = useState([]);

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

  const onSubmit = async (data) => {
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
    } catch (err) {
      setError(_optionalChain([err, 'access', _ => _.response, 'optionalAccess', _2 => _2.data, 'optionalAccess', _3 => _3.message]) || 'Failed to register employee.');
    } finally {
      setLoading(false);
    }
  };

  return (
    React.createElement('div', { className: "space-y-6",}
      , React.createElement('div', { className: "flex items-center gap-4"  ,}
        , React.createElement(Link, { to: "/employees",}
          , React.createElement(Button, { variant: "outline", size: "icon", className: "h-8 w-8" ,}
            , React.createElement(ArrowLeft, { className: "h-4 w-4" ,} )
          )
        )
        , React.createElement('div', null
          , React.createElement('h1', { className: "text-2xl font-bold tracking-tight"  ,}, "Register New Profile"  )
          , React.createElement('p', { className: "text-sm text-muted-foreground" ,}, "Setup corporate details, profile linkages, and access keys."       )
        )
      )

      , error && (
        React.createElement('div', { className: "p-3 text-xs text-destructive bg-destructive/5 rounded-lg font-medium border border-destructive/10"       ,}
          , error
        )
      )

      , React.createElement('form', { onSubmit: handleSubmit(onSubmit), className: "grid gap-6 md:grid-cols-3"  ,}
        /* Left Column: Personal info */
        , React.createElement(Card, { className: "md:col-span-1 shadow-sm" ,}
          , React.createElement(CardHeader, null
            , React.createElement(CardTitle, { className: "text-sm font-bold flex items-center gap-2"    ,}
              , React.createElement(Users, { className: "h-4 w-4 text-primary"  ,} ), " Core Personal Data"
            )
            , React.createElement(CardDescription, null, "Configure identifiers and primary credentials"    )
          )
          , React.createElement(CardContent, { className: "space-y-4",}
            , React.createElement('div', { className: "space-y-1.5",}
              , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  ,}, "Employee ID / Code"   )
              , React.createElement(Input, { placeholder: "e.g. EMP001" , ...register('employeeId'), required: true,} )
            )

            , React.createElement('div', { className: "grid grid-cols-2 gap-2"  ,}
              , React.createElement('div', { className: "space-y-1.5",}
                , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  ,}, "First Name" )
                , React.createElement(Input, { placeholder: "John", ...register('firstName'), required: true,} )
              )
              , React.createElement('div', { className: "space-y-1.5",}
                , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  ,}, "Last Name" )
                , React.createElement(Input, { placeholder: "Doe", ...register('lastName'), required: true,} )
              )
            )

            , React.createElement('div', { className: "space-y-1.5",}
              , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  ,}, "Work Email Address"  )
              , React.createElement(Input, { type: "email", placeholder: "john.doe@company.com", ...register('email'), required: true,} )
            )

            , React.createElement('div', { className: "space-y-1.5",}
              , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  ,}, "Phone Number" )
              , React.createElement(Input, { placeholder: "+1 (555) 123-4567"  , ...register('phone'),} )
            )
          )
        )

        /* Right Column: Professional info */
        , React.createElement(Card, { className: "md:col-span-2 shadow-sm" ,}
          , React.createElement(CardHeader, null
            , React.createElement(CardTitle, { className: "text-sm font-bold flex items-center gap-2"    ,}
              , React.createElement(Building, { className: "h-4 w-4 text-primary"  ,} ), " Placement Details"
            )
            , React.createElement(CardDescription, null, "Update joining configurations, salaries grades, and locations"      )
          )
          , React.createElement(CardContent, { className: "space-y-4",}
            , React.createElement('div', { className: "grid gap-4 sm:grid-cols-2"  ,}
              , React.createElement('div', { className: "space-y-1.5",}
                , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground block mb-1"    ,}, "Department")
                , React.createElement('select', {
                  ...register('professionalInfo.departmentId'),
                  className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus-visible:outline-none"           ,}

                  , React.createElement('option', { value: "",}, "Select Department" )
                  , departments.map((d) => (
                    React.createElement('option', { key: d.id, value: d.id,}, d.name)
                  ))
                )
              )

              , React.createElement('div', { className: "space-y-1.5",}
                , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground block mb-1"    ,}, "Designation")
                , React.createElement('select', {
                  ...register('professionalInfo.designationId'),
                  className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus-visible:outline-none"           ,}

                  , React.createElement('option', { value: "",}, "Select Designation" )
                  , designations.map((d) => (
                    React.createElement('option', { key: d.id, value: d.id,}, d.title)
                  ))
                )
              )

              , React.createElement('div', { className: "space-y-1.5",}
                , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground block mb-1"    ,}, "Reports To / Manager"   )
                , React.createElement('select', {
                  ...register('professionalInfo.managerId'),
                  className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus-visible:outline-none"           ,}

                  , React.createElement('option', { value: "",}, "No Manager / Direct Report"    )
                  , managers.map((m) => (
                    React.createElement('option', { key: m.id, value: m.id,}, m.firstName, " " , m.lastName, " (" , m.employeeId, ")")
                  ))
                )
              )

              , React.createElement('div', { className: "space-y-1.5",}
                , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  ,}, "Joining Date" )
                , React.createElement(Input, { type: "date", ...register('professionalInfo.joiningDate'),} )
              )

              , React.createElement('div', { className: "space-y-1.5",}
                , React.createElement(Dropdown, {
                  label: "Employment Type" ,
                  options: [
                    { value: 'Full-Time', label: 'Full-Time' },
                    { value: 'Part-Time', label: 'Part-Time' },
                    { value: 'Contract', label: 'Contract' },
                    { value: 'Intern', label: 'Intern' },
                  ],
                  ...register('professionalInfo.employmentType'),}
                )
              )

              , React.createElement('div', { className: "space-y-1.5",}
                , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  ,}, "Work Location" )
                , React.createElement(Input, { placeholder: "e.g. New York HQ, Remote"    , ...register('professionalInfo.workLocation'),} )
              )

              , React.createElement('div', { className: "space-y-1.5",}
                , React.createElement('label', { className: "text-xs font-semibold text-muted-foreground"  ,}, "Salary Grade" )
                , React.createElement(Input, { placeholder: "e.g. SG-12, Grade-A"  , ...register('professionalInfo.salaryGrade'),} )
              )
            )

            , React.createElement('div', { className: "flex justify-end gap-2 pt-4 border-t mt-4"     ,}
              , React.createElement(Button, { type: "button", variant: "outline", onClick: () => navigate('/employees'),}, "Cancel"

              )
              , React.createElement(Button, { type: "submit", disabled: loading, className: "vibrant-gradient text-white border-0 shadow-md gap-1.5"    ,}
                , loading ? (
                  React.createElement(React.Fragment, null
                    , React.createElement(Loader2, { className: "h-4 w-4 animate-spin"  ,} ), " Registering..."
                  )
                ) : (
                  React.createElement(React.Fragment, null
                    , React.createElement(Save, { className: "h-4 w-4" ,} ), " Save Profile Folder"
                  )
                )
              )
            )
          )
        )
      )
    )
  );
};

export default EmployeeCreate;
