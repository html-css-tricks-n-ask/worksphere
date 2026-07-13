import { Company, } from '../models/Company.js';

export class CompanyRepository {
  async create(data) {
    return Company.create(data);
  }

  async findById(id) {
    return Company.findById(id);
  }

  async findBySlug(slug) {
    return Company.findOne({ slug });
  }

  async findByEmail(email) {
    return Company.findOne({ email: email.toLowerCase() });
  }

  async update(id, data) {
    return Company.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }
}

export const companyRepository = new CompanyRepository();
export default companyRepository;
