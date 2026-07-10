import emailService from './email/email.service.js';
import { PayrollDocument } from '../models/Payroll.js';
import { format } from 'date-fns';

class PayslipService {
  generateHtmlPayslip(payroll: any, employeeName: string, employeeId: string, department: string, designation: string): string {
    const totalEarnings = payroll.totalEarnings || 0;
    const totalDeductions = payroll.totalDeductions || 0;
    const netSalary = payroll.netSalary || 0;

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 24px; border-radius: 8px;">
        <div style="text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 16px;">
          <h2 style="margin: 0; color: #4f46e5;">WorkSphere Hub</h2>
          <p style="margin: 4px 0 0; color: #64748b; font-size: 14px;">Official Salary Payslip</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px; color: #1e293b; font-size: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">Employee Information</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 4px 0; color: #64748b;"><strong>Name:</strong></td>
              <td style="padding: 4px 0; color: #1e293b;">${employeeName}</td>
              <td style="padding: 4px 0; color: #64748b;"><strong>Employee ID:</strong></td>
              <td style="padding: 4px 0; color: #1e293b;">${employeeId}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;"><strong>Department:</strong></td>
              <td style="padding: 4px 0; color: #1e293b;">${department}</td>
              <td style="padding: 4px 0; color: #64748b;"><strong>Designation:</strong></td>
              <td style="padding: 4px 0; color: #1e293b;">${designation}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;"><strong>Pay Period:</strong></td>
              <td style="padding: 4px 0; color: #1e293b;">${payroll.month}</td>
              <td style="padding: 4px 0; color: #64748b;"><strong>Paid Days:</strong></td>
              <td style="padding: 4px 0; color: #1e293b;">${payroll.paidDays} / ${payroll.workingDays}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px; color: #1e293b; font-size: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">Earnings & Deductions</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <th style="text-align: left; padding: 8px;">Earnings</th>
              <th style="text-align: right; padding: 8px;">Amount</th>
              <th style="text-align: left; padding: 8px; border-left: 1px solid #e2e8f0;">Deductions</th>
              <th style="text-align: right; padding: 8px;">Amount</th>
            </tr>
            <tr>
              <td style="padding: 6px 8px;">Basic Salary</td>
              <td style="text-align: right; padding: 6px 8px;">$${payroll.basicSalary.toFixed(2)}</td>
              <td style="padding: 6px 8px; border-left: 1px solid #e2e8f0;">Provident Fund (PF)</td>
              <td style="text-align: right; padding: 6px 8px;">$${payroll.pf.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 8px;">HRA</td>
              <td style="text-align: right; padding: 6px 8px;">$${payroll.hra.toFixed(2)}</td>
              <td style="padding: 6px 8px; border-left: 1px solid #e2e8f0;">ESI</td>
              <td style="text-align: right; padding: 6px 8px;">$${payroll.esi.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 8px;">Special Allowance</td>
              <td style="text-align: right; padding: 6px 8px;">$${payroll.specialAllowance.toFixed(2)}</td>
              <td style="padding: 6px 8px; border-left: 1px solid #e2e8f0;">Professional Tax</td>
              <td style="text-align: right; padding: 6px 8px;">$${payroll.professionalTax.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 8px;">Conveyance</td>
              <td style="text-align: right; padding: 6px 8px;">$${payroll.conveyance.toFixed(2)}</td>
              <td style="padding: 6px 8px; border-left: 1px solid #e2e8f0;">Income Tax (TDS)</td>
              <td style="text-align: right; padding: 6px 8px;">$${payroll.incomeTax.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 8px;">Overtime Pay</td>
              <td style="text-align: right; padding: 6px 8px;">$${payroll.overtimePay.toFixed(2)}</td>
              <td style="padding: 6px 8px; border-left: 1px solid #e2e8f0;">Leave Deductions</td>
              <td style="text-align: right; padding: 6px 8px;">$${payroll.leaveDeductions.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 8px;">Bonus/Incentive</td>
              <td style="text-align: right; padding: 6px 8px;">$${(payroll.bonus + payroll.incentive).toFixed(2)}</td>
              <td style="padding: 6px 8px; border-left: 1px solid #e2e8f0;">Other Deductions</td>
              <td style="text-align: right; padding: 6px 8px;">$${payroll.otherDeductions.toFixed(2)}</td>
            </tr>
            <tr style="background-color: #f8fafc; font-weight: bold; border-top: 1px solid #e2e8f0;">
              <td style="padding: 8px;">Total Earnings</td>
              <td style="text-align: right; padding: 8px;">$${totalEarnings.toFixed(2)}</td>
              <td style="padding: 8px; border-left: 1px solid #e2e8f0;">Total Deductions</td>
              <td style="text-align: right; padding: 8px;">$${totalDeductions.toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 6px; text-align: center; margin-top: 24px;">
          <span style="font-size: 14px; color: #166534;"><strong>Net Take-Home Salary:</strong></span>
          <span style="font-size: 20px; font-weight: bold; color: #15803d; margin-left: 8px;">$${netSalary.toFixed(2)}</span>
        </div>

        <div style="text-align: center; margin-top: 24px; color: #64748b; font-size: 11px;">
          This is an electronically generated salary slip and does not require signature. Generated on ${format(new Date(), 'dd MMMM yyyy')}.
        </div>
      </div>
    `;
  }

  async sendPayslipEmail(email: string, employeeName: string, payroll: any, employeeId: string, department: string, designation: string): Promise<boolean> {
    const html = this.generateHtmlPayslip(payroll, employeeName, employeeId, department, designation);
    const subject = `Your Salary Payslip for ${payroll.month} – WorkSphere`;
    return emailService['sendMail'](email, subject, html);
  }
}

export const payslipService = new PayslipService();
export default payslipService;
