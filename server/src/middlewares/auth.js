
import { ApiError } from '../utils/responseWrapper.js';
import { verifyAccessToken, } from '../utils/jwt.js';
import Employee from '../models/Employee.js';
import User from '../models/User.js';
import { employmentHistoryRepository } from '../repositories/employmentHistory.repository.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authenticateUser = (
  req,
  res,
  next
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication credentials were not provided.');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired access token.');
  }
};

export const requirePermissions = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'User is not authenticated.');
    }

    const { role } = req.user;

    if (!allowedRoles.includes(role)) {
      throw new ApiError(403, 'You do not have permission to perform this action.');
    }

    next();
  };
};

export const ensureEmployeeLinked = asyncHandler(async (req, res, next) => {
  const userId = req.user.userId || req.user._id || req.user.id;
  const companyId = req.user.companyId;

  let employee = await Employee.findOne({ userId, companyId });
  if (!employee) {
    if (req.user.role === 'Company Admin' || req.user.role === 'HR Manager') {
      const userDoc = await User.findById(userId);
      if (userDoc) {
        employee = await Employee.create({
          employeeId: 'EMP001',
          firstName: userDoc.firstName,
          lastName: userDoc.lastName,
          email: userDoc.email,
          phone: userDoc.phone,
          userId: userDoc._id,
          companyId: userDoc.companyId,
          status: 'Active',
        });
        await employmentHistoryRepository.create({
          employeeId: employee._id,
          type: 'Other',
          description: 'Linked and initialized admin employee profile.',
          date: new Date(),
          companyId: userDoc.companyId,
        });
      }
    }
  }

  if (!employee) {
    throw new ApiError(400, 'Employee profile not linked to your account.');
  }

  req.employee = employee;
  next();
});
