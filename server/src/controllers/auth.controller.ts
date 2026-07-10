import { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { ApiResponse, ApiError } from '../utils/responseWrapper.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  registerCompanySchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator.js';

const COOKIE_NAME = 'worksphere_refresh_token';

const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/v1/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const parsed = registerCompanySchema.parse(req.body);
  const result = await authService.registerCompany(parsed.company, parsed.admin);
  res.status(201).json(new ApiResponse(201, result, 'Company registered successfully. Please verify your email.'));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.parse(req.body);
  const result = await authService.login(parsed.email, parsed.password);
  
  // Set HttpOnly refresh token cookie
  setRefreshTokenCookie(res, result.refreshToken);

  res.status(200).json(
    new ApiResponse(
      200,
      { accessToken: result.accessToken, user: result.user },
      'Logged in successfully.'
    )
  );
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/v1/auth',
  });
  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully.'));
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  // Try loading from cookie first, fallback to request body
  const token = req.cookies[COOKIE_NAME] || req.body.refreshToken;
  
  if (!token) {
    throw new ApiError(401, 'Refresh token not found.');
  }

  const result = await authService.rotateAccessToken(token);
  res.status(200).json(new ApiResponse(200, result, 'Access token refreshed successfully.'));
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const token = String(req.query.token || req.body.token);
  if (!token) {
    throw new ApiError(400, 'Verification token is required.');
  }
  const result = await authService.verifyEmail(token);
  res.status(200).json(new ApiResponse(200, null, result.message));
});

export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, 'Email address is required.');
  }
  const result = await authService.resendVerificationEmail(email);
  res.status(200).json(new ApiResponse(200, null, result.message));
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const parsed = forgotPasswordSchema.parse(req.body);
  const result = await authService.forgotPassword(parsed.email);
  res.status(200).json(new ApiResponse(200, null, result.message));
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const parsed = resetPasswordSchema.parse(req.body);
  const result = await authService.resetPassword(parsed.token, parsed.password);
  res.status(200).json(new ApiResponse(200, null, result.message));
});
