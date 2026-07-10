import { EmploymentHistory, EmploymentHistoryDocument, IEmploymentHistory } from '../models/EmploymentHistory.js';

export class EmploymentHistoryRepository {
  async create(data: Partial<IEmploymentHistory>): Promise<EmploymentHistoryDocument> {
    return EmploymentHistory.create(data);
  }

  async findByEmployeeId(employeeId: string): Promise<EmploymentHistoryDocument[]> {
    return EmploymentHistory.find({ employeeId })
      .sort({ date: -1 })
      .exec();
  }
}

export const employmentHistoryRepository = new EmploymentHistoryRepository();
export default employmentHistoryRepository;
