import nodemailer from 'nodemailer';
import { logger } from '../../config/logger.js';
import { verifyEmailTemplate } from './templates/verifyEmail.js';
import { resetPasswordTemplate } from './templates/resetPassword.js';
import { welcomeEmailTemplate } from './templates/welcomeEmail.js';
import { invitationEmailTemplate } from './templates/invitationEmail.js';

class EmailService {
  

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

   async sendMail(to, subject, html) {
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
      logger.error(`Failed to send email to ${to}: ${(error ).message}`);
      return false;
    }
  }

  async sendVerificationEmail(email, name, token) {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const verifyUrl = `${clientUrl}/verify-email?token=${token}`;
    const html = verifyEmailTemplate(name, verifyUrl);
    return this.sendMail(email, 'Verify Your WorkSphere Account', html);
  }

  async sendResetPasswordEmail(email, name, token) {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const resetUrl = `${clientUrl}/reset-password?token=${token}`;
    const html = resetPasswordTemplate(name, resetUrl);
    return this.sendMail(email, 'Reset Your WorkSphere Password', html);
  }

  async sendWelcomeEmail(email, name, companyName) {
    const html = welcomeEmailTemplate(name, companyName);
    return this.sendMail(email, `Welcome to WorkSphere, ${name}!`, html);
  }

  async sendInvitationEmail(email, name, token) {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const activationUrl = `${clientUrl}/activate-account?token=${token}`;
    const html = invitationEmailTemplate(name, activationUrl);
    return this.sendMail(email, 'Set Up Your WorkSphere Account password', html);
  }
}

export const emailService = new EmailService();
export default emailService;
