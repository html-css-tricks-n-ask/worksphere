import { Company, CompanyDocument, ICompany } from '../models/Company.js';

export class CompanyRepository {
  async create(data: Partial<ICompany>): Promise<CompanyDocument> {
    return Company.create(data);
  }

  async findById(id: string): Promise<CompanyDocument | null> {
    return Company.findById(id);
  }

  async findBySlug(slug: string): Promise<CompanyDocument | null> {
    return Company.findOne({ slug });
  }

  async findByEmail(email: string): Promise<CompanyDocument | null> {
    return Company.findOne({ email: email.toLowerCase() });
  }

  async update(id: string, data: Partial<ICompany>): Promise<CompanyDocument | null> {
    return Company.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }
}

export const companyRepository = new CompanyRepository();
export default companyRepository;
