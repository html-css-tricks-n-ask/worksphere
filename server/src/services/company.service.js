import { companyRepository } from '../repositories/company.repository.js';
import { ApiError } from '../utils/responseWrapper.js';


class CompanyService {
  async getCompanyProfile(companyId) {
    const company = await companyRepository.findById(companyId);
    if (!company) {
      throw new ApiError(404, 'Company details not found.');
    }
    return company;
  }

  async updateCompanyProfile(companyId, updateData) {
    const company = await companyRepository.findById(companyId);
    if (!company) {
      throw new ApiError(404, 'Company details not found.');
    }

    // Do not allow updating email or slug dynamically without dedicated verification
    const safeUpdateData = { ...updateData };
    delete safeUpdateData.email;
    delete safeUpdateData.slug;
    delete safeUpdateData.createdBy;

    const updatedCompany = await companyRepository.update(companyId, safeUpdateData);
    if (!updatedCompany) {
      throw new ApiError(500, 'Failed to update company details.');
    }

    return updatedCompany;
  }
}

export const companyService = new CompanyService();
export default companyService;
