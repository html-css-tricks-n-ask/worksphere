import nodemailer from 'nodemailer';
import { logger } from '../../config/logger.js';
import { verifyEmailTemplate } from './templates/verifyEmail.js';
import { resetPasswordTemplate } from './templates/resetPassword.js';
import { welcomeEmailTemplate } from './templates/welcomeEmail.js';

class EmailService {
  private transporter;

  constructor() {
    const isTest = process.env.NODE_ENV === 'test';
    
    // Config transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  private async sendMail(to: string, subject: string, html: string): Promise<boolean> {
    const from = `"WorkSphere Hub" <${process.env.SMTP_USER || 'no-reply@worksphere.io'}>`;
    
    // If SMTP auth is dummy or missing, fallback to console log
    if (!process.env.SMTP_USER || process.env.SMTP_USER.includes('your_') || !process.env.SMTP_PASS || process.env.SMTP_PASS === 'dummy') {
      logger.info(`[Email Service Mock] to: ${to} | subject: ${subject}`);
      logger.debug(`[Email Service Mock HTML content]\n${html}`);
      return true;
    }

    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      logger.info(`Email sent successfully: ${info.messageId} to ${to}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send email to ${to}: ${(error as Error).message}`);
      return false;
    }
  }

  async sendVerificationEmail(email: string, name: string, token: string): Promise<boolean> {
    const verifyUrl = `${process.env.VITE_API_URL || 'http://localhost:5002/api/v1'}/auth/verify-email?token=${token}`;
    const html = verifyEmailTemplate(name, verifyUrl);
    return this.sendMail(email, 'Verify Your WorkSphere Account', html);
  }

  async sendResetPasswordEmail(email: string, name: string, token: string): Promise<boolean> {
    // In React 19 Frontend:
    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
    const html = resetPasswordTemplate(name, resetUrl);
    return this.sendMail(email, 'Reset Your WorkSphere Password', html);
  }

  async sendWelcomeEmail(email: string, name: string, companyName: string): Promise<boolean> {
    const html = welcomeEmailTemplate(name, companyName);
    return this.sendMail(email, `Welcome to WorkSphere, ${name}!`, html);
  }
}

export const emailService = new EmailService();
export default emailService;
