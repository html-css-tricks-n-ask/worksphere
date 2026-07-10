import crypto from "crypto";
import { ApiError } from "../utils/responseWrapper.js";
import { companyRepository } from "../repositories/company.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { emailService } from "./email/email.service.js";
import { IUser } from "../models/User.js";
import { ICompany } from "../models/Company.js";

class AuthService {
  async registerCompany(
    companyData: Partial<ICompany>,
    adminData: Partial<IUser>,
  ) {
    if (!companyData.email || !companyData.name) {
      throw new ApiError(400, "Company name and email are required.");
    }
    if (!adminData.email || !adminData.password) {
      throw new ApiError(400, "Admin email and password are required.");
    }

    // Check if Company Email is unique
    const existingCompany = await companyRepository.findByEmail(
      companyData.email,
    );
    if (existingCompany) {
      throw new ApiError(
        400,
        "A company with this email address already exists.",
      );
    }

    // Check if Admin Email is unique
    const existingAdmin = await userRepository.findByEmail(adminData.email);
    if (existingAdmin) {
      throw new ApiError(
        400,
        "An administrator account with this email address already exists.",
      );
    }

    // Create Company
    const company = await companyRepository.create({
      ...companyData,
      status: "Active",
    });

    // Hash Admin Password
    const hashedPassword = await hashPassword(adminData.password);

    // Generate Verification Token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create Admin User
    const admin = await userRepository.create({
      firstName: adminData.firstName || "Admin",
      lastName: adminData.lastName || "User",
      email: adminData.email.toLowerCase(),
      password: hashedPassword,
      phone: adminData.phone,
      role: "Company Admin",
      companyId: company._id as any,
      status: "Pending",
      emailVerified: false,
      verificationToken,
      verificationExpires,
    });

    // Link Company Creator
    await companyRepository.update(company.id, { createdBy: admin._id as any });

    // Send Verification Email
    await emailService.sendVerificationEmail(
      admin.email,
      `${admin.firstName} ${admin.lastName}`,
      verificationToken,
    );

    return {
      company: { id: company.id, name: company.name, slug: company.slug },
      admin: { id: admin.id, email: admin.email },
    };
  }

  async login(email: string, password: string) {
    // Find user and select password
    const user = await userRepository.findByEmail(email, true);
    if (!user) {
      throw new ApiError(401, "Invalid email or password.");
    }

    // Validate Password
    const isMatch = await comparePassword(password, user.password || "");
    if (!isMatch) {
      throw new ApiError(401, "Invalid email or password.");
    }

    // Check Email Verification
    // if (!user.emailVerified) {
    //   throw new ApiError(403, 'Please verify your email address before logging in.');
    // }

    // Check Account Status
    if (user.status === "Inactive") {
      throw new ApiError(
        403,
        "Your account has been deactivated. Please contact support.",
      );
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

  async verifyEmail(token: string) {
    const user = await userRepository.findByVerificationToken(token);
    if (!user) {
      throw new ApiError(400, "Invalid or expired verification token.");
    }

    // Update User verification status
    user.emailVerified = true;
    user.status = "Active";
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    // Get Company details for welcome email
    const company = await companyRepository.findById(user.companyId.toString());
    const companyName = company ? company.name : "WorkSphere";

    // Send Welcome Email
    await emailService.sendWelcomeEmail(
      user.email,
      `${user.firstName} ${user.lastName}`,
      companyName,
    );

    return { message: "Email address verified successfully." };
  }

  async resendVerificationEmail(email: string) {
    const user = await userRepository.findByEmail(email, true);
    if (!user) {
      throw new ApiError(404, "No account found with this email address.");
    }

    if (user.emailVerified) {
      throw new ApiError(400, "This email address is already verified.");
    }

    // Generate New Token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.verificationToken = verificationToken;
    user.verificationExpires = verificationExpires;
    await user.save();

    await emailService.sendVerificationEmail(
      user.email,
      `${user.firstName} ${user.lastName}`,
      verificationToken,
    );

    return { message: "Verification email resent successfully." };
  }

  async forgotPassword(email: string) {
    const user = await userRepository.findByEmail(email, true);
    if (!user) {
      // Return success anyway for security reasons (don't leak registered accounts)
      return {
        message:
          "If an account exists with this email, a reset link has been sent.",
      };
    }

    // Generate Reset Token
    const resetPasswordToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    await emailService.sendResetPasswordEmail(
      user.email,
      `${user.firstName} ${user.lastName}`,
      resetPasswordToken,
    );

    return { message: "Password reset link sent successfully." };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await userRepository.findByResetToken(token);
    if (!user) {
      throw new ApiError(400, "Invalid or expired password reset token.");
    }

    // Hash New Password
    user.password = await hashPassword(newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return {
      message:
        "Password has been reset successfully. Please log in with your new credentials.",
    };
  }

  async rotateAccessToken(refreshTokenStr: string) {
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
      throw new ApiError(401, "Invalid or expired refresh token.");
    }
  }
}

export const authService = new AuthService();
export default authService;
