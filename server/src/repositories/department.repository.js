import { Department, } from '../models/Department.js';

export class DepartmentRepository {
  async create(data) {
    return Department.create(data);
  }

  async findById(id) {
    return Department.findById(id)
      .populate('departmentHead', 'firstName lastName email')
      .populate('parentId', 'name')
      .populate('locationId', 'name');
  }

  async findByName(name) {
    return Department.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } })
      .populate('parentId', 'name')
      .populate('locationId', 'name');
  }

  async update(id, data) {
    return Department.findByIdAndUpdate(id, data, { new: true })
      .populate('departmentHead', 'firstName lastName email')
      .populate('parentId', 'name')
      .populate('locationId', 'name');
  }

  async softDelete(id) {
    const department = await Department.findById(id);
    if (department) {
      await department.softDelete();
    }
    return department;
  }

  async restore(id) {
    const department = await Department.findById(id);
    if (department) {
      await department.restore();
    }
    return department;
  }

  async findAll(params) {
    const filter = {};

    if (params.search) {
      filter.$or = [
        { name: { $regex: params.search, $options: 'i' } },
        { description: { $regex: params.search, $options: 'i' } },
      ];
    }

    if (params.status) {
      filter.status = params.status;
    }

    const sort = {};
    sort[params.sortField] = params.sortOrder === 'desc' ? -1 : 1;

    const skip = (params.page - 1) * params.limit;

    const [departments, total] = await Promise.all([
      Department.find(filter)
        .populate('departmentHead', 'firstName lastName email')
        .populate('parentId', 'name')
        .populate('locationId', 'name')
        .sort(sort)
        .skip(skip)
        .limit(params.limit)
        .exec(),
      Department.countDocuments(filter).exec(),
    ]);

    return { departments, total };
  }

  async getStats() {
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
