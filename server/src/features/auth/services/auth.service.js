import crypto from 'crypto';
import { ApiError } from '../../../utils/responseWrapper.js';
import { companyRepository } from '../../../repositories/company.repository.js';
import { userRepository } from '../../../repositories/user.repository.js';
import { hashPassword, comparePassword } from '../../../utils/password.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../../utils/jwt.js';
import { emailService } from '../../../services/email/email.service.js';
import { logger } from '../../../config/logger.js';
import { employeeRepository } from '../../../repositories/employee.repository.js';
import { employmentHistoryRepository } from '../../../repositories/employmentHistory.repository.js';
import Employee from '../../../models/Employee.js';

/**
 * Enterprise service coordinating authentication validation, credentials sync,
 * email invitations, and JWT token rotation policies.
 */
class AuthService {
  /**
   * Registers a new tenant organization and sets up its initial administrator user.
   */
  async registerCompany(
    companyData,
    adminData
  ) {
    if (!companyData.email || !companyData.name) {
      throw new ApiError(400, 'Company name and email are required.');
    }
    if (!adminData.email || !adminData.password) {
      throw new ApiError(400, 'Admin email and password are required.');
    }

    // Check if Company Email is unique
    const existingCompany = await companyRepository.findByEmail(companyData.email);
    if (existingCompany) {
      throw new ApiError(400, 'A company with this email address already exists.');
    }

    // Check if Admin Email is unique
    const existingAdmin = await userRepository.findByEmail(adminData.email);
    if (existingAdmin) {
      throw new ApiError(400, 'An administrator account with this email address already exists.');
    }

    // Create Company
    const company = await companyRepository.create({
      ...companyData,
      status: 'Active',
    });

    // Hash Admin Password
    const hashedPassword = await hashPassword(adminData.password);

    // Generate Verification Token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create Admin User
    const admin = await userRepository.create({
      firstName: adminData.firstName || 'Admin',
      lastName: adminData.lastName || 'User',
      email: adminData.email.toLowerCase(),
      password: hashedPassword,
      phone: adminData.phone,
      role: 'Company Admin',
      companyId: company._id ,
      status: 'Pending',
      emailVerified: false,
      verificationToken,
      verificationExpires,
    });

    // Link Company Creator
    await companyRepository.update(company.id, { createdBy: admin._id  });

    // Create Employee Profile for the Company Admin so they are correctly linked
    const employee = await employeeRepository.create({
      employeeId: 'EMP001',
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      phone: admin.phone,
      userId: admin._id,
      companyId: company._id,
      status: 'Active',
    });

    // Track initial career placement in timeline
    await employmentHistoryRepository.create({
      employeeId: employee._id,
      type: 'Other',
      description: 'Joined the company as the Workspace System Administrator.',
      date: new Date(),
      companyId: company._id,
    });

    // Send Verification Email in the background to avoid blocking request thread on slow SMTP setups
    emailService.sendVerificationEmail(
      admin.email,
      `${admin.firstName} ${admin.lastName}`,
      verificationToken
    ).catch((err) => {
      logger.error(`[BACKGROUND EMAIL ERROR] Failed to send registration verification email to ${admin.email}: ${err.message}`);
    });

    return {
      company: { id: company.id, name: company.name, slug: company.slug },
      admin: { id: admin.id, email: admin.email },
    };
  }

  /**
   * Log in user and generate access & refresh token structures.
   */
  async login(email, password) {
    // Find user and select password
    const user = await userRepository.findByEmail(email, true);
    if (!user) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    // Validate Password
    const isMatch = await comparePassword(password, user.password || '');
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    // Check Account Status
    if (user.status === 'Inactive') {
      throw new ApiError(403, 'Your account has been deactivated. Please contact support.');
    }

    // Update Last Login
    await userRepository.update(user.id, { lastLogin: new Date() });

    const payload = {
      userId: user.id,
      _id: user.id,
      companyId: user.companyId.toString(),
      role: user.role,
      email: user.email,
      firstName: user.firstName,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        companyId: user.companyId.toString(),
      },
    };
  }

  /**
   * Verify email verification link token and activate user account profile.
   */
  async verifyEmail(token) {
    const user = await userRepository.findByVerificationToken(token);
    if (!user) {
      throw new ApiError(400, 'Invalid or expired verification token.');
    }

    // Update User verification status
    user.emailVerified = true;
    user.status = 'Active';
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    // Get Company details for welcome email
    const company = await companyRepository.findById(user.companyId.toString());
    const companyName = company ? company.name : 'WorkSphere';

    // Send Welcome Email in background
    emailService.sendWelcomeEmail(
      user.email,
      `${user.firstName} ${user.lastName}`,
      companyName
    ).catch((err) => {
      logger.error(`[BACKGROUND EMAIL ERROR] Failed to send welcome email to ${user.email}: ${err.message}`);
    });

    return { message: 'Email address verified successfully.' };
  }

  /**
   * Resend account verification token.
   */
  async resendVerificationEmail(email) {
    const user = await userRepository.findByEmail(email, true);
    if (!user) {
      throw new ApiError(404, 'No account found with this email address.');
    }

    if (user.emailVerified) {
      throw new ApiError(400, 'This email address is already verified.');
    }

    // Generate New Token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.verificationToken = verificationToken;
    user.verificationExpires = verificationExpires;
    await user.save();

    // Send Verification Email in background
    emailService.sendVerificationEmail(
      user.email,
      `${user.firstName} ${user.lastName}`,
      verificationToken
    ).catch((err) => {
      logger.error(`[BACKGROUND EMAIL ERROR] Failed to resend verification email to ${user.email}: ${err.message}`);
    });

    return { message: 'Verification email resent successfully.' };
  }

  /**
   * Generate password recovery token link and dispatch email.
   */
  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email, true);
    if (!user) {
      // Return success anyway for security reasons (don't leak registered accounts)
      return {
        message: 'If an account exists with this email, a reset link has been sent.',
      };
    }

    // Generate Reset Token
    const resetPasswordToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    // Send Reset Email in background
    emailService.sendResetPasswordEmail(
      user.email,
      `${user.firstName} ${user.lastName}`,
      resetPasswordToken
    ).catch((err) => {
      logger.error(`[BACKGROUND EMAIL ERROR] Failed to send password reset email to ${user.email}: ${err.message}`);
    });

    return { message: 'Password reset link sent successfully.' };
  }

  /**
   * Reset credentials configuration using recovery token details.
   */
  async resetPassword(token, newPassword) {
    const user = await userRepository.findByResetToken(token);
    if (!user) {
      throw new ApiError(400, 'Invalid or expired password reset token.');
    }

    // Hash New Password
    user.password = await hashPassword(newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return {
      message: 'Password has been reset successfully. Please log in with your new credentials.',
    };
  }

  /**
   * Rotate access token from request refresh token properties.
   */
  async rotateAccessToken(refreshTokenStr) {
    try {
      const decoded = verifyRefreshToken(refreshTokenStr);

      const payload = {
        userId: decoded.userId,
        _id: decoded.userId,
        companyId: decoded.companyId,
        role: decoded.role,
        email: decoded.email,
        firstName: decoded.firstName,
      };

      const accessToken = generateAccessToken(payload);
      return { accessToken };
    } catch (error) {
      throw new ApiError(401, 'Invalid or expired refresh token.');
    }
  }

  async activateAccount(token, password) {
    const employee = await Employee.findOne({
      inviteToken: token,
      inviteExpires: { $gt: new Date() }
    });

    if (!employee) {
      throw new ApiError(400, 'Invalid or expired activation token.');
    }

    const user = await userRepository.findById(employee.userId.toString());
    if (!user) {
      throw new ApiError(404, 'Linked user profile not found.');
    }

    // Hash and update password and status
    user.password = await hashPassword(password);
    user.status = 'Active';
    user.emailVerified = true;
    await user.save();

    // Update invitation status
    employee.inviteStatus = 'Accepted';
    employee.inviteToken = undefined;
    employee.inviteExpires = undefined;
    await employee.save();

    // Send welcome email in background
    const company = await companyRepository.findById(employee.companyId.toString());
    const companyName = company ? company.name : 'WorkSphere';

    emailService.sendWelcomeEmail(
      employee.email,
      `${employee.firstName} ${employee.lastName}`,
      companyName
    ).catch((err) => {
      logger.error(`[BACKGROUND EMAIL ERROR] Failed to send welcome email to ${employee.email}: ${err.message}`);
    });

    return { message: 'Account activated successfully. You can now log in.' };
  }
}

export const authService = new AuthService();
export default authService;
