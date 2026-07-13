import { Designation, } from '../models/Designation.js';

export class DesignationRepository {
  async create(data) {
    return Designation.create(data);
  }

  async findById(id) {
    return Designation.findById(id).populate('departmentId', 'name');
  }

  async findByTitle(title) {
    return Designation.findOne({ title: { $regex: new RegExp(`^${title}$`, 'i') } });
  }

  async update(id, data) {
    return Designation.findByIdAndUpdate(id, data, { new: true }).populate('departmentId', 'name');
  }

  async softDelete(id) {
    const designation = await Designation.findById(id);
    if (designation) {
      await designation.softDelete();
    }
    return designation;
  }

  async restore(id) {
    const designation = await Designation.findById(id);
    if (designation) {
      await designation.restore();
    }
    return designation;
  }

  async findAll(params) {
    const filter = {};

    if (params.search) {
      filter.$or = [
        { title: { $regex: params.search, $options: 'i' } },
        { level: { $regex: params.search, $options: 'i' } },
        { description: { $regex: params.search, $options: 'i' } },
      ];
    }

    const sort = {};
    sort[params.sortField] = params.sortOrder === 'desc' ? -1 : 1;

    const skip = (params.page - 1) * params.limit;

    const [designations, total] = await Promise.all([
      Designation.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(params.limit)
        .populate('departmentId', 'name')
        .exec(),
      Designation.countDocuments(filter).exec(),
    ]);

    return { designations, total };
  }
}

export const designationRepository = new DesignationRepository();
export default designationRepository;
