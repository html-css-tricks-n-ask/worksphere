import dotenv from 'dotenv';
dotenv.config();

import mongoose, { Types } from 'mongoose';
import { hashPassword } from '../utils/password.js';
import Company from '../models/Company.js';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Department from '../models/Department.js';
import Designation from '../models/Designation.js';
import SalaryStructure from '../models/SalaryStructure.js';
import Payroll from '../models/Payroll.js';
import Reimbursement from '../models/Reimbursement.js';
import Announcement from '../models/Announcement.js';
import Notification from '../models/Notification.js';
import CompanySettings from '../models/CompanySettings.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Shift from '../models/Shift.js';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI is missing from environment.');
  process.exit(1);
}

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to database. Wiping existing data...');

    // Wipe existing data
    await Company.deleteMany({});
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Department.deleteMany({});
    await Designation.deleteMany({});
    await SalaryStructure.deleteMany({});
    await Payroll.deleteMany({});
    await Reimbursement.deleteMany({});
    await Announcement.deleteMany({});
    await Notification.deleteMany({});
    await CompanySettings.deleteMany({});
    await Attendance.deleteMany({});
    await Leave.deleteMany({});
    await Shift.deleteMany({});

    console.log('Data wiped. Generating seed entries...');

    // 1. Company
    const company = await Company.create({
      name: 'Demo Corp Ltd',
      slug: 'demo-corp',
      email: 'contact@democorp.com',
      status: 'Active',
    });
    const companyId = company._id;

    // 2. Company Settings
    await CompanySettings.create({
      companyId,
      currency: 'USD',
      timezone: 'America/New_York',
      weekendDays: [0, 6], // Saturday, Sunday
      officeHours: { start: '09:00', end: '18:00' },
    });

    // 3. Shift Template
    const shift = await Shift.create({
      companyId,
      name: 'Day Shift',
      startTime: '09:00',
      endTime: '18:00',
      workingHours: 9,
    });

    // 4. Hash passwords
    const adminHashed = await hashPassword('Pixel@123');
    const employeeHashed = await hashPassword('Employee@123');

    // 5. Admin User & Profile
    const adminUser = await User.create({
      firstName: 'Neha',
      lastName: 'Admin',
      email: 'neha@pixelcraft.io',
      password: adminHashed,
      role: 'Company Admin',
      companyId,
      status: 'Active',
      emailVerified: true,
    });

    // 6. Employee User & Profile
    const empUser = await User.create({
      firstName: 'John',
      lastName: 'Employee',
      email: 'employee@worksphere.com',
      password: employeeHashed,
      role: 'Employee',
      companyId,
      status: 'Active',
      emailVerified: true,
    });

    // 7. Departments
    const engDept = await Department.create({
      name: 'Engineering',
      description: 'Technology Division',
      status: 'Active',
      companyId,
    });

    const hrDept = await Department.create({
      name: 'Human Resources',
      description: 'HR and Recruitments',
      status: 'Active',
      companyId,
    });

    // 8. Designations
    const devDesig = await Designation.create({
      title: 'Senior Developer',
      departmentId: engDept._id,
      companyId,
    });

    const hrDesig = await Designation.create({
      title: 'HR Generalist',
      departmentId: hrDept._id,
      companyId,
    });

    // 9. Employee Profile Details
    const adminEmp = await Employee.create({
      userId: adminUser._id,
      employeeId: 'EMP001',
      firstName: 'Neha',
      lastName: 'Admin',
      email: 'neha@pixelcraft.io',
      phone: '+15550000001',
      status: 'Active',
      companyId,
      professionalInfo: {
        departmentId: hrDept._id,
        designationId: hrDesig._id,
        joiningDate: new Date('2025-01-01'),
        employmentType: 'Full-Time',
        workLocation: 'New York Office',
      },
    });

    const regularEmp = await Employee.create({
      userId: empUser._id,
      employeeId: 'EMP002',
      firstName: 'John',
      lastName: 'Employee',
      email: 'employee@worksphere.com',
      phone: '+15550000002',
      status: 'Active',
      companyId,
      professionalInfo: {
        departmentId: engDept._id,
        designationId: devDesig._id,
        joiningDate: new Date('2025-06-01'),
        employmentType: 'Full-Time',
        workLocation: 'Remote',
      },
    });

    // Link designations
    await Department.findByIdAndUpdate(hrDept._id, { departmentHead: adminEmp._id });
    await Department.findByIdAndUpdate(engDept._id, { departmentHead: adminEmp._id });

    // 10. Salary Structures
    await SalaryStructure.create({
      employeeId: adminEmp._id,
      companyId,
      basicSalary: 6000,
      hra: 2000,
      specialAllowance: 1000,
      conveyance: 300,
      medicalAllowance: 200,
      pf: 720,
      esi: 150,
      professionalTax: 200,
      incomeTax: 800,
      status: 'Active',
      effectiveDate: new Date('2025-01-01'),
    });

    await SalaryStructure.create({
      employeeId: regularEmp._id,
      companyId,
      basicSalary: 4500,
      hra: 1500,
      specialAllowance: 800,
      conveyance: 200,
      medicalAllowance: 150,
      pf: 540,
      esi: 100,
      professionalTax: 200,
      incomeTax: 500,
      status: 'Active',
      effectiveDate: new Date('2025-06-01'),
    });

    // 11. Attendance Logs (Present for last 5 days)
    for (let i = 1; i <= 5; i++) {
      const logDate = new Date();
      logDate.setDate(logDate.getDate() - i);
      logDate.setHours(9, 0, 0, 0);

      const checkOutDate = new Date(logDate);
      checkOutDate.setHours(18, 0, 0, 0);

      await Attendance.create({
        employeeId: regularEmp._id,
        companyId,
        checkIn: logDate,
        checkOut: checkOutDate,
        status: 'Present',
        attendanceType: 'Web',
        workingHours: 9,
      });
    }

    // 12. Payout Runs (June 2026)
    await Payroll.create({
      employeeId: regularEmp._id,
      companyId,
      month: '2026-06',
      basicSalary: 4500,
      hra: 1500,
      specialAllowance: 800,
      conveyance: 200,
      medicalAllowance: 150,
      bonus: 500,
      pf: 540,
      esi: 100,
      professionalTax: 200,
      incomeTax: 500,
      workingDays: 30,
      paidDays: 30,
      status: 'Locked',
      lockedBy: adminUser._id,
      lockedAt: new Date(),
    });

    // 13. Bulletins Announcements
    await Announcement.create({
      title: 'Quarterly Town Hall Notice',
      content: 'Hello Team,\n\nPlease join us for the Q3 town hall presentation on July 15th at 3 PM EST. We will review growth metrics and product plans.\n\nBest,\nManagement',
      pinned: true,
      companyId,
      publishDate: new Date(),
    });

    // 14. Notifications
    await Notification.create({
      userId: empUser._id,
      companyId,
      title: 'Welcome to WorkSphere!',
      message: 'Your corporate SSO workspace has been provisioned. Explore dashboard and mark attendance.',
      type: 'Announcement',
      isRead: false,
    });

    console.log('Database seeded successfully!');
    console.log('\n--- DEMO CREDENTIALS ---');
    console.log('Company Admin: neha@pixelcraft.io | Password: Pixel@123');
    console.log('Regular Employee: employee@worksphere.com | Password: Employee@123');
    console.log('------------------------\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedDatabase();
