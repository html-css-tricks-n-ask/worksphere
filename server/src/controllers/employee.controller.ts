import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import { employeeRepository } from '../repositories/employee.repository.js';
import { employmentHistoryRepository } from '../repositories/employmentHistory.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { departmentRepository } from '../repositories/department.repository.js';
import { designationRepository } from '../repositories/designation.repository.js';
import { uploadService } from '../services/upload.service.js';
import { createEmployeeSchema, updateEmployeeSchema } from '../validators/employee.validator.js';
import { ApiResponse, ApiError } from '../utils/responseWrapper.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { hashPassword } from '../utils/password.js';
import crypto from 'crypto';

export const createEmployee = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const parsed = createEmployeeSchema.parse(req.body);
  const companyId = req.user?.companyId;
  if (!companyId) {
    throw new ApiError(401, 'Tenant context not established.');
  }

  // Check unique employeeId per company
  const existingId = await employeeRepository.findByEmployeeId(parsed.employeeId);
  if (existingId) {
    throw new ApiError(400, `An employee with ID "${parsed.employeeId}" already exists.`);
  }

  // Check unique email
  const existingEmail = await employeeRepository.findByEmail(parsed.email);
  if (existingEmail) {
    throw new ApiError(400, `An employee with email "${parsed.email}" already exists.`);
  }

  // Auto-create basic User record for login credentials (marked as Pending)
  const defaultPassword = crypto.randomBytes(8).toString('hex');
  const hashedPassword = await hashPassword(defaultPassword);
  
  const user = await userRepository.create({
    firstName: parsed.firstName,
    lastName: parsed.lastName,
    email: parsed.email.toLowerCase(),
    password: hashedPassword,
    phone: parsed.phone,
    role: 'Employee',
    companyId: companyId as any,
    status: 'Pending',
    emailVerified: false,
  });

  const employee = await employeeRepository.create({
    ...parsed,
    userId: user._id as any,
    status: 'Active',
  } as any);

  // Track initial career placement in timeline
  await employmentHistoryRepository.create({
    employeeId: employee._id as any,
    type: 'Other',
    description: `Joined the company as an employee (ID: ${employee.employeeId}).`,
    date: new Date(),
    companyId: companyId as any,
  });

  res.status(201).json(new ApiResponse(201, employee, 'Employee registered successfully and user profile linked.'));
});

export const getEmployees = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const search = req.query.search ? String(req.query.search) : undefined;
  const departmentId = req.query.departmentId ? String(req.query.departmentId) : undefined;
  const designationId = req.query.designationId ? String(req.query.designationId) : undefined;
  const managerId = req.query.managerId ? String(req.query.managerId) : undefined;
  const status = req.query.status ? String(req.query.status) : undefined;
  const employmentType = req.query.employmentType ? String(req.query.employmentType) : undefined;
  
  const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;
  const sortField = req.query.sortField ? String(req.query.sortField) : 'createdAt';
  const sortOrder = req.query.sortOrder === 'desc' ? 'desc' : 'asc';

  const result = await employeeRepository.findAll({
    search,
    departmentId,
    designationId,
    managerId,
    status,
    employmentType,
    page,
    limit,
    sortField,
    sortOrder,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        employees: result.employees,
        pagination: {
          page,
          limit,
          total: result.total,
          pages: Math.ceil(result.total / limit),
        },
      },
      'Employees fetched successfully.'
    )
  );
});

export const getEmployeeById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const employee = await employeeRepository.findById(req.params.id);
  if (!employee) {
    throw new ApiError(404, 'Employee profile not found.');
  }
  res.status(200).json(new ApiResponse(200, employee, 'Employee profile fetched successfully.'));
});

export const updateEmployee = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const parsed = updateEmployeeSchema.parse(req.body);
  const companyId = req.user?.companyId;
  if (!companyId) {
    throw new ApiError(401, 'Tenant context not established.');
  }

  const current = await employeeRepository.findById(req.params.id);
  if (!current) {
    throw new ApiError(404, 'Employee not found.');
  }

  if (parsed.employeeId) {
    const existing = await employeeRepository.findByEmployeeId(parsed.employeeId);
    if (existing && existing.id !== req.params.id) {
      throw new ApiError(400, `Employee ID "${parsed.employeeId}" is already taken.`);
    }
  }

  if (parsed.email) {
    const existing = await employeeRepository.findByEmail(parsed.email);
    if (existing && existing.id !== req.params.id) {
      throw new ApiError(400, `Email address "${parsed.email}" is already registered.`);
    }
  }

  // Automated career timeline history tracking when designations, departments, managers or salary grade change
  const currentProf = (current.professionalInfo || {}) as any;
  const updatedProf = (parsed.professionalInfo || {}) as any;

  if (updatedProf.designationId && String(updatedProf.designationId) !== String(currentProf.designationId)) {
    const prevDes = currentProf.designationId ? (current as any).professionalInfo?.designationId?.title || 'None' : 'None';
    const newDesignation = await designationRepository.findById(String(updatedProf.designationId));
    const nextDes = newDesignation ? newDesignation.title : 'None';

    if (prevDes !== nextDes) {
      await employmentHistoryRepository.create({
        employeeId: current._id as any,
        type: 'Designation Change',
        description: `Designation upgraded from "${prevDes}" to "${nextDes}".`,
        date: new Date(),
        details: { previous: prevDes, new: nextDes } as any,
        companyId: companyId as any,
      });
    }
  }

  if (updatedProf.departmentId && String(updatedProf.departmentId) !== String(currentProf.departmentId)) {
    const prevDep = currentProf.departmentId ? (current as any).professionalInfo?.departmentId?.name || 'None' : 'None';
    const newDept = await departmentRepository.findById(String(updatedProf.departmentId));
    const nextDep = newDept ? newDept.name : 'None';

    if (prevDep !== nextDep) {
      await employmentHistoryRepository.create({
        employeeId: current._id as any,
        type: 'Department Change',
        description: `Transferred departments from "${prevDep}" to "${nextDep}".`,
        date: new Date(),
        details: { previous: prevDep, new: nextDep } as any,
        companyId: companyId as any,
      });
    }
  }

  if (updatedProf.salaryGrade && updatedProf.salaryGrade !== currentProf.salaryGrade) {
    const prevSalary = currentProf.salaryGrade || 'None';
    await employmentHistoryRepository.create({
      employeeId: current._id as any,
      type: 'Salary Revision',
      description: `Salary grade revised from "${prevSalary}" to "${updatedProf.salaryGrade}".`,
      date: new Date(),
      details: { previous: prevSalary, new: updatedProf.salaryGrade } as any,
      companyId: companyId as any,
    });
  }

  const updatedEmployee = await employeeRepository.update(req.params.id, parsed as any);
  res.status(200).json(new ApiResponse(200, updatedEmployee, 'Employee profile updated successfully.'));
});

export const deleteEmployee = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const employee = await employeeRepository.softDelete(req.params.id);
  if (!employee) {
    throw new ApiError(404, 'Employee not found.');
  }

  // Deactivate linked system login user too
  if (employee.userId) {
    await userRepository.update(employee.userId.toString(), { status: 'Inactive' });
  }

  res.status(200).json(new ApiResponse(200, null, 'Employee profile soft-deleted successfully.'));
});

export const restoreEmployee = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const employee = await employeeRepository.restore(req.params.id);
  if (!employee) {
    throw new ApiError(404, 'Employee not found.');
  }

  if (employee.userId) {
    await userRepository.update(employee.userId.toString(), { status: 'Active' });
  }

  res.status(200).json(new ApiResponse(200, employee, 'Employee profile restored successfully.'));
});

export const uploadAvatar = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, 'No avatar file uploaded.');
  }

  const employee = await employeeRepository.findById(req.params.id);
  if (!employee) {
    throw new ApiError(404, 'Employee profile not found.');
  }

  // Clean old avatar from Cloudinary
  if (employee.avatarPublicId) {
    await uploadService.deleteFile(employee.avatarPublicId);
  }

  const uploadResult = await uploadService.uploadAvatar(req.file.buffer);
  const updated = await employeeRepository.update(req.params.id, {
    avatar: uploadResult.url,
    avatarPublicId: uploadResult.publicId,
  });

  res.status(200).json(new ApiResponse(200, updated, 'Avatar uploaded and profile updated.'));
});

export const uploadDocument = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded.');
  }
  const documentName = req.body.name || 'Document';

  const employee = await employeeRepository.findById(req.params.id);
  if (!employee) {
    throw new ApiError(404, 'Employee not found.');
  }

  const uploadResult = await uploadService.uploadDocument(req.file.buffer);
  
  const documentObject = {
    name: documentName,
    url: uploadResult.url,
    publicId: uploadResult.publicId,
    uploadedAt: new Date(),
  };

  const updated = await employeeRepository.appendDocument(req.params.id, documentObject);

  res.status(200).json(new ApiResponse(200, updated, 'Document uploaded successfully.'));
});

export const deleteEmployeeDocument = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id, documentId } = req.params;
  
  const employee = await employeeRepository.findById(id);
  if (!employee) {
    throw new ApiError(404, 'Employee profile not found.');
  }

  const targetDoc = employee.documents?.find(d => String((d as any)._id) === documentId);
  if (!targetDoc) {
    throw new ApiError(404, 'Document details not found.');
  }

  // Delete from Cloudinary
  await uploadService.deleteFile(targetDoc.publicId);

  // Pull from Employee array
  const updated = await employeeRepository.removeDocument(id, documentId);

  res.status(200).json(new ApiResponse(200, updated, 'Document deleted successfully.'));
});

export const getEmployeeTimeline = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const timeline = await employmentHistoryRepository.findByEmployeeId(req.params.id);
  res.status(200).json(new ApiResponse(200, timeline, 'Career history timeline fetched.'));
});

export const getDashboardWidgets = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const widgets = await employeeRepository.getDashboardWidgets();
  res.status(200).json(new ApiResponse(200, widgets, 'Dashboard widgets statistics fetched.'));
});

export const exportEmployees = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await employeeRepository.findAll({
    page: 1,
    limit: 1000,
    sortField: 'employeeId',
    sortOrder: 'asc',
  });

  // Construct CSV headers
  const headers = ['Employee ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Joining Date', 'Employment Type', 'Status'];
  const csvRows = [headers.join(',')];

  result.employees.forEach(emp => {
    const joiningDate = emp.professionalInfo?.joiningDate 
      ? new Date(emp.professionalInfo.joiningDate).toLocaleDateString()
      : 'N/A';
      
    const row = [
      `"${emp.employeeId}"`,
      `"${emp.firstName}"`,
      `"${emp.lastName}"`,
      `"${emp.email}"`,
      `"${emp.phone || ''}"`,
      `"${joiningDate}"`,
      `"${emp.professionalInfo?.employmentType || 'Full-Time'}"`,
      `"${emp.status}"`,
    ];
    csvRows.push(row.join(','));
  });

  const csvContent = csvRows.join('\n');
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=employees_export.csv');
  res.status(200).send(csvContent);
});

export const importEmployees = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const companyId = req.user?.companyId;
  if (!companyId) {
    throw new ApiError(401, 'Tenant context not established.');
  }
  
  const employeesList = req.body.employees;
  if (!employeesList || !Array.isArray(employeesList)) {
    throw new ApiError(400, 'Import payload requires an array of employees under key "employees".');
  }

  const imported = [];
  const errors = [];

  for (const item of employeesList) {
    try {
      // Validate schema
      const parsed = createEmployeeSchema.parse(item);

      // Verify unique employeeId
      const idExists = await employeeRepository.findByEmployeeId(parsed.employeeId);
      if (idExists) {
        errors.push({ employeeId: parsed.employeeId, error: 'Employee ID already exists.' });
        continue;
      }

      // Verify unique email
      const emailExists = await employeeRepository.findByEmail(parsed.email);
      if (emailExists) {
        errors.push({ email: parsed.email, error: 'Email address already exists.' });
        continue;
      }

      // Auto-create basic User record
      const defaultPassword = crypto.randomBytes(8).toString('hex');
      const hashedPassword = await hashPassword(defaultPassword);
      
      const user = await userRepository.create({
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        email: parsed.email.toLowerCase(),
        password: hashedPassword,
        phone: parsed.phone,
        role: 'Employee',
        companyId: companyId as any,
        status: 'Active',
        emailVerified: true, // Auto-verified during bulk import
      });

      const emp = await employeeRepository.create({
        ...parsed,
        userId: user._id as any,
        status: 'Active',
      } as any);

      // Log career entry
      await employmentHistoryRepository.create({
        employeeId: emp._id as any,
        type: 'Other',
        description: `Imported in bulk into organizational database.`,
        date: new Date(),
        companyId: companyId as any,
      });

      imported.push(emp);
    } catch (err: any) {
      errors.push({ item: item.employeeId || item.email || 'unknown', error: err.message || 'Validation error.' });
    }
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        importedCount: imported.length,
        errors,
      },
      `Successfully imported ${imported.length} employees with ${errors.length} failures.`
    )
  );
});
