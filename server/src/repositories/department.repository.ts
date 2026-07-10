import { Department, DepartmentDocument, IDepartment } from '../models/Department.js';

export class DepartmentRepository {
  async create(data: Partial<IDepartment>): Promise<DepartmentDocument> {
    return Department.create(data);
  }

  async findById(id: string): Promise<DepartmentDocument | null> {
    return Department.findById(id).populate('departmentHead', 'firstName lastName email');
  }

  async findByName(name: string): Promise<DepartmentDocument | null> {
    return Department.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  }

  async update(id: string, data: Partial<IDepartment>): Promise<DepartmentDocument | null> {
    return Department.findByIdAndUpdate(id, data, { new: true }).populate('departmentHead', 'firstName lastName email');
  }

  async softDelete(id: string): Promise<DepartmentDocument | null> {
    const department = await Department.findById(id);
    if (department) {
      await department.softDelete();
    }
    return department;
  }

  async restore(id: string): Promise<DepartmentDocument | null> {
    const department = await Department.findById(id);
    if (department) {
      await department.restore();
    }
    return department;
  }

  async findAll(params: {
    search?: string;
    status?: string;
    page: number;
    limit: number;
    sortField: string;
    sortOrder: 'asc' | 'desc';
  }): Promise<{ departments: DepartmentDocument[]; total: number }> {
    const filter: any = {};

    if (params.search) {
      filter.$or = [
        { name: { $regex: params.search, $options: 'i' } },
        { description: { $regex: params.search, $options: 'i' } },
      ];
    }

    if (params.status) {
      filter.status = params.status;
    }

    const sort: any = {};
    sort[params.sortField] = params.sortOrder === 'desc' ? -1 : 1;

    const skip = (params.page - 1) * params.limit;

    const [departments, total] = await Promise.all([
      Department.find(filter)
        .populate('departmentHead', 'firstName lastName email')
        .sort(sort)
        .skip(skip)
        .limit(params.limit)
        .exec(),
      Department.countDocuments(filter).exec(),
    ]);

    return { departments, total };
  }

  async getStats(): Promise<{ total: number; active: number; inactive: number }> {
    const [total, active, inactive] = await Promise.all([
      Department.countDocuments({}).exec(),
      Department.countDocuments({ status: 'Active' }).exec(),
      Department.countDocuments({ status: 'Inactive' }).exec(),
    ]);
    return { total, active, inactive };
  }
}

export const departmentRepository = new DepartmentRepository();
export default departmentRepository;
