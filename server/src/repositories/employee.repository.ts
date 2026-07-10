import { Employee, EmployeeDocument, IEmployee, IDocument } from '../models/Employee.js';
import { Department } from '../models/Department.js';

export class EmployeeRepository {
  async create(data: Partial<IEmployee>): Promise<EmployeeDocument> {
    return Employee.create(data);
  }

  async findById(id: string): Promise<EmployeeDocument | null> {
    return Employee.findById(id)
      .populate('userId', 'firstName lastName email role status')
      .populate('professionalInfo.departmentId', 'name')
      .populate('professionalInfo.designationId', 'title')
      .populate('professionalInfo.managerId', 'firstName lastName email employeeId');
  }

  async findByEmployeeId(employeeId: string): Promise<EmployeeDocument | null> {
    return Employee.findOne({ employeeId: { $regex: new RegExp(`^${employeeId}$`, 'i') } });
  }

  async findByEmail(email: string): Promise<EmployeeDocument | null> {
    return Employee.findOne({ email: email.toLowerCase() });
  }

  async update(id: string, data: Partial<IEmployee>): Promise<EmployeeDocument | null> {
    return Employee.findByIdAndUpdate(id, data, { new: true })
      .populate('userId', 'firstName lastName email role status')
      .populate('professionalInfo.departmentId', 'name')
      .populate('professionalInfo.designationId', 'title')
      .populate('professionalInfo.managerId', 'firstName lastName email employeeId');
  }

  async softDelete(id: string): Promise<EmployeeDocument | null> {
    const employee = await Employee.findById(id);
    if (employee) {
      await employee.softDelete();
    }
    return employee;
  }

  async restore(id: string): Promise<EmployeeDocument | null> {
    const employee = await Employee.findById(id);
    if (employee) {
      await employee.restore();
    }
    return employee;
  }

  async findAll(params: {
    search?: string;
    departmentId?: string;
    designationId?: string;
    managerId?: string;
    status?: string;
    employmentType?: string;
    page: number;
    limit: number;
    sortField: string;
    sortOrder: 'asc' | 'desc';
  }): Promise<{ employees: EmployeeDocument[]; total: number }> {
    const filter: any = {};

    if (params.search) {
      filter.$or = [
        { firstName: { $regex: params.search, $options: 'i' } },
        { lastName: { $regex: params.search, $options: 'i' } },
        { email: { $regex: params.search, $options: 'i' } },
        { employeeId: { $regex: params.search, $options: 'i' } },
        { phone: { $regex: params.search, $options: 'i' } },
      ];
    }

    if (params.departmentId) {
      filter['professionalInfo.departmentId'] = params.departmentId;
    }
    if (params.designationId) {
      filter['professionalInfo.designationId'] = params.designationId;
    }
    if (params.managerId) {
      filter['professionalInfo.managerId'] = params.managerId;
    }
    if (params.status) {
      filter.status = params.status;
    }
    if (params.employmentType) {
      filter['professionalInfo.employmentType'] = params.employmentType;
    }

    const sort: any = {};
    sort[params.sortField] = params.sortOrder === 'desc' ? -1 : 1;

    const skip = (params.page - 1) * params.limit;

    const [employees, total] = await Promise.all([
      Employee.find(filter)
        .populate('professionalInfo.departmentId', 'name')
        .populate('professionalInfo.designationId', 'title')
        .populate('professionalInfo.managerId', 'firstName lastName email employeeId')
        .sort(sort)
        .skip(skip)
        .limit(params.limit)
        .exec(),
      Employee.countDocuments(filter).exec(),
    ]);

    return { employees, total };
  }

  async appendDocument(id: string, document: IDocument): Promise<EmployeeDocument | null> {
    return Employee.findByIdAndUpdate(
      id,
      { $push: { documents: document } },
      { new: true }
    );
  }

  async removeDocument(id: string, documentId: string): Promise<EmployeeDocument | null> {
    return Employee.findByIdAndUpdate(
      id,
      { $pull: { documents: { _id: documentId } } as any },
      { new: true }
    );
  }

  async getDashboardWidgets(): Promise<{
    totalEmployees: number;
    activeEmployees: number;
    inactiveEmployees: number;
    departmentCount: number;
    newEmployeesThisMonth: number;
  }> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [totalEmployees, activeEmployees, inactiveEmployees, departmentCount, newEmployeesThisMonth] = await Promise.all([
      Employee.countDocuments({}).exec(),
      Employee.countDocuments({ status: 'Active' }).exec(),
      Employee.countDocuments({ status: 'Inactive' }).exec(),
      Department.countDocuments({ status: 'Active' }).exec(),
      Employee.countDocuments({ 'professionalInfo.joiningDate': { $gte: startOfMonth } }).exec(),
    ]);

    return {
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      departmentCount,
      newEmployeesThisMonth,
    };
  }
}

export const employeeRepository = new EmployeeRepository();
export default employeeRepository;
