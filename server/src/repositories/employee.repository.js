import { Employee, } from '../models/Employee.js';
import { Department } from '../models/Department.js';

export class EmployeeRepository {
  async create(data) {
    return Employee.create(data);
  }

  async findById(id) {
    return Employee.findById(id)
      .populate('userId', 'firstName lastName email role status')
      .populate('professionalInfo.departmentId', 'name')
      .populate('professionalInfo.designationId', 'title')
      .populate('professionalInfo.managerId', 'firstName lastName email employeeId');
  }

  async findByEmployeeId(employeeId) {
    return Employee.findOne({ employeeId: { $regex: new RegExp(`^${employeeId}$`, 'i') } });
  }

  async findByEmail(email) {
    return Employee.findOne({ email: email.toLowerCase() });
  }

  async update(id, data) {
    return Employee.findByIdAndUpdate(id, data, { new: true })
      .populate('userId', 'firstName lastName email role status')
      .populate('professionalInfo.departmentId', 'name')
      .populate('professionalInfo.designationId', 'title')
      .populate('professionalInfo.managerId', 'firstName lastName email employeeId');
  }

  async softDelete(id) {
    const employee = await Employee.findById(id);
    if (employee) {
      await employee.softDelete();
    }
    return employee;
  }

  async restore(id) {
    const employee = await Employee.findById(id);
    if (employee) {
      await employee.restore();
    }
    return employee;
  }

  async findAll(params










) {
    const filter = {};

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

    const sort = {};
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

  async appendDocument(id, document) {
    return Employee.findByIdAndUpdate(
      id,
      { $push: { documents: document } },
      { new: true }
    );
  }

  async removeDocument(id, documentId) {
    return Employee.findByIdAndUpdate(
      id,
      { $pull: { documents: { _id: documentId } }  },
      { new: true }
    );
  }

  async getDashboardWidgets()





 {
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
