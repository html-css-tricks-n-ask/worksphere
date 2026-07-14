

import { reimbursementRepository } from '../repositories/reimbursement.repository.js';

import {
  createReimbursementSchema,

  approveReimbursementSchema,
} from '../validators/reimbursement.validator.js';
import { ApiResponse, ApiError } from '../utils/responseWrapper.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Employee from '../models/Employee.js';
import Reimbursement from '../models/Reimbursement.js';
import { Types } from 'mongoose';

export const createReimbursement = asyncHandler(async (req, res) => {
  const parsed = createReimbursementSchema.parse(req.body);
  const emp = req.employee;
  const companyId = emp.companyId.toString();

  let initialStage = 'HR Manager';
  if (emp.professionalInfo && emp.professionalInfo.teamLeadId) {
    initialStage = 'Team Lead';
  } else if (emp.professionalInfo && emp.professionalInfo.managerId) {
    initialStage = 'Department Manager';
  }

  const claim = await reimbursementRepository.create({
    ...parsed,
    employeeId: emp._id ,
    companyId: new Types.ObjectId(companyId),
    status: 'Pending',
    currentStage: initialStage,
    approvals: []
  } );

  res.status(201).json(new ApiResponse(201, claim, 'Expense reimbursement claim submitted.'));
});

export const getReimbursements = asyncHandler(async (req, res) => {
  const { companyId, userId, role } = req.user;
  const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;
  const category = req.query.category ? String(req.query.category) : undefined;
  const status = req.query.status ? String(req.query.status) : undefined;

  // If role is basic Employee, only return their own claims
  let employeeId;
  if (role === 'Employee') {
    employeeId = req.employee._id.toString();
  }

  const result = await reimbursementRepository.findAll({
    companyId: companyId.toString(),
    employeeId,
    category,
    status,
    page,
    limit,
  });

  res.status(200).json(new ApiResponse(200, result, 'Reimbursements fetched successfully.'));
});

export const getReimbursementById = asyncHandler(async (req, res) => {
  const claim = await reimbursementRepository.findById(req.params.id);
  if (!claim) {
    throw new ApiError(404, 'Reimbursement claim not found.');
  }
  res.status(200).json(new ApiResponse(200, claim, 'Reimbursement claim fetched.'));
});

export const approveReimbursement = asyncHandler(async (req, res) => {
  const parsed = approveReimbursementSchema.parse(req.body);
  const approver = req.employee;

  const claim = await Reimbursement.findById(req.params.id);
  if (!claim) {
    throw new ApiError(404, 'Reimbursement claim not found.');
  }

  if (claim.status !== 'Pending') {
    throw new ApiError(400, `Cannot update a claim that is already "${claim.status}".`);
  }

  const submitter = await Employee.findById(claim.employeeId);
  if (!submitter) {
    throw new ApiError(404, 'Submitter profile not found.');
  }

  const comments = parsed.comments || '';

  // Process Stage Actions
  if (claim.currentStage === 'Team Lead') {
    if (!submitter.professionalInfo?.teamLeadId || submitter.professionalInfo.teamLeadId.toString() !== approver._id.toString()) {
      throw new ApiError(403, 'You are not the designated Team Lead for this claim.');
    }

    if (parsed.status === 'Rejected') {
      claim.status = 'Rejected';
    } else {
      claim.currentStage = submitter.professionalInfo.managerId ? 'Department Manager' : 'HR Manager';
    }
    claim.approvals.push({
      approverId: approver._id,
      role: 'Team Lead',
      status: parsed.status,
      comments,
      actionedAt: new Date()
    });
  } else if (claim.currentStage === 'Department Manager') {
    if (!submitter.professionalInfo?.managerId || submitter.professionalInfo.managerId.toString() !== approver._id.toString()) {
      throw new ApiError(403, 'You are not the designated Department Manager for this claim.');
    }

    if (parsed.status === 'Rejected') {
      claim.status = 'Rejected';
    } else {
      claim.currentStage = 'HR Manager';
    }
    claim.approvals.push({
      approverId: approver._id,
      role: 'Department Manager',
      status: parsed.status,
      comments,
      actionedAt: new Date()
    });
  } else if (claim.currentStage === 'HR Manager') {
    if (req.user.role !== 'HR' && req.user.role !== 'Company Admin') {
      throw new ApiError(403, 'Only HR Managers or Company Admins can perform final approval.');
    }

    claim.status = parsed.status === 'Approved' ? 'Approved' : 'Rejected'; // Approved or Rejected
    claim.hrApprovedBy = req.user._id || req.user.userId;
    claim.hrApprovedAt = new Date();
    claim.approvals.push({
      approverId: approver._id,
      role: 'HR Manager',
      status: parsed.status,
      comments,
      actionedAt: new Date()
    });
  }

  await claim.save();
  res.status(200).json(new ApiResponse(200, claim, `Expense claim status updated.`));
});

export const deleteReimbursement = asyncHandler(async (req, res) => {
  const claim = await reimbursementRepository.findById(req.params.id);
  if (!claim) {
    throw new ApiError(404, 'Reimbursement claim not found.');
  }
  if (claim.status !== 'Pending') {
    throw new ApiError(400, 'Cannot delete a processed expense claim.');
  }

  await reimbursementRepository.delete(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Expense claim deleted.'));
});

export const getPendingReimbursements = asyncHandler(async (req, res) => {
  const { role } = req.user;
  const emp = req.employee;
  const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;
  const skip = (page - 1) * limit;

  let filter = { status: 'Pending' };

  if (role === 'Super Admin') {
    // Super Admin views all
  } else if (role === 'Company Admin' || role === 'HR') {
    filter.currentStage = 'HR Manager';
  } else {
    // Team Lead or Department Manager
    const supervised = await Employee.find({
      $or: [
        { 'professionalInfo.teamLeadId': emp._id },
        { 'professionalInfo.managerId': emp._id }
      ]
    });
    const leadEmps = supervised.filter(e => _optionalChain([e, 'access', _9 => _9.professionalInfo, 'optionalAccess', _10 => _10.teamLeadId, 'optionalAccess', _11 => _11.toString])() === emp._id.toString()).map(e => e._id);
    const mgrEmps = supervised.filter(e => _optionalChain([e, 'access', _12 => _12.professionalInfo, 'optionalAccess', _13 => _13.managerId, 'optionalAccess', _14 => _14.toString])() === emp._id.toString()).map(e => e._id);

    filter.$or = [
      { currentStage: 'Team Lead', employeeId: { $in: leadEmps } },
      { currentStage: 'Department Manager', employeeId: { $in: mgrEmps } }
    ];
  }

  const [claims, total] = await Promise.all([
    Reimbursement.find(filter)
      .populate('employeeId', 'firstName lastName employeeId email professionalInfo')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec(),
    Reimbursement.countDocuments(filter).exec(),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        claims,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      },
      'Pending reimbursement approvals fetched successfully.'
    )
  );
});
