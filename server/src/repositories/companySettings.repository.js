import CompanySettings, { } from '../models/CompanySettings.js';

class CompanySettingsRepository {
  async findByCompanyId(companyId) {
    return CompanySettings.findOne({ companyId });
  }

  async createDefault(companyId) {
    return CompanySettings.create({ companyId });
  }

  async update(companyId, payload) {
    return CompanySettings.findOneAndUpdate(
      { companyId },
      { $set: payload },
      { new: true, upsert: true }
    );
  }
}

export const companySettingsRepository = new CompanySettingsRepository();
export default companySettingsRepository;
