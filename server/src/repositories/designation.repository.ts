import { Designation, DesignationDocument, IDesignation } from '../models/Designation.js';

export class DesignationRepository {
  async create(data: Partial<IDesignation>): Promise<DesignationDocument> {
    return Designation.create(data);
  }

  async findById(id: string): Promise<DesignationDocument | null> {
    return Designation.findById(id);
  }

  async findByTitle(title: string): Promise<DesignationDocument | null> {
    return Designation.findOne({ title: { $regex: new RegExp(`^${title}$`, 'i') } });
  }

  async update(id: string, data: Partial<IDesignation>): Promise<DesignationDocument | null> {
    return Designation.findByIdAndUpdate(id, data, { new: true });
  }

  async softDelete(id: string): Promise<DesignationDocument | null> {
    const designation = await Designation.findById(id);
    if (designation) {
      await designation.softDelete();
    }
    return designation;
  }

  async restore(id: string): Promise<DesignationDocument | null> {
    const designation = await Designation.findById(id);
    if (designation) {
      await designation.restore();
    }
    return designation;
  }

  async findAll(params: {
    search?: string;
    page: number;
    limit: number;
    sortField: string;
    sortOrder: 'asc' | 'desc';
  }): Promise<{ designations: DesignationDocument[]; total: number }> {
    const filter: any = {};

    if (params.search) {
      filter.$or = [
        { title: { $regex: params.search, $options: 'i' } },
        { level: { $regex: params.search, $options: 'i' } },
        { description: { $regex: params.search, $options: 'i' } },
      ];
    }

    const sort: any = {};
    sort[params.sortField] = params.sortOrder === 'desc' ? -1 : 1;

    const skip = (params.page - 1) * params.limit;

    const [designations, total] = await Promise.all([
      Designation.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(params.limit)
        .exec(),
      Designation.countDocuments(filter).exec(),
    ]);

    return { designations, total };
  }
}

export const designationRepository = new DesignationRepository();
export default designationRepository;
