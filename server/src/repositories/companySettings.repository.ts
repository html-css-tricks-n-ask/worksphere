import CompanySettings, { CompanySettingsDocument } from '../models/CompanySettings.js';

class CompanySettingsRepository {
  async findByCompanyId(companyId: string): Promise<CompanySettingsDocument | null> {
    return CompanySettings.findOne({ companyId });
  }

  async createDefault(companyId: string): Promise<CompanySettingsDocument> {
    return CompanySettings.create({ companyId });
  }

  async update(companyId: string, payload: Partial<CompanySettingsDocument>): Promise<CompanySettingsDocument | null> {
    return CompanySettings.findOneAndUpdate(
      { companyId },
      { $set: payload },
      { new: true, upsert: true }
    );
  }
}

export const companySettingsRepository = new CompanySettingsRepository();
export default companySettingsRepository;
