import { EmploymentHistory, } from '../models/EmploymentHistory.js';

export class EmploymentHistoryRepository {
  async create(data) {
    return EmploymentHistory.create(data);
  }

  async findByEmployeeId(employeeId) {
    return EmploymentHistory.find({ employeeId })
      .sort({ date: -1 })
      .exec();
  }
}

export const employmentHistoryRepository = new EmploymentHistoryRepository();
export default employmentHistoryRepository;
