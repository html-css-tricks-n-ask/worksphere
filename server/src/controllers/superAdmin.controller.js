import Company from '../models/Company.js';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import { createCompanySchema, updateCompanySchema } from '../validators/superAdmin.validator.js';
import { ApiResponse, ApiError } from '../utils/responseWrapper.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getCompanies = asyncHandler(async (req, res) => {
  const search = req.query.search ? String(req.query.search) : undefined;
  const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  // We query all companies (Super Admin bypass context allows querying all collections)
  const [companies, total] = await Promise.all([
    Company.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    Company.countDocuments(filter).exec(),
  ]);

  // Aggregate stats across all companies
  const [totalUsers, totalEmployees] = await Promise.all([
    User.countDocuments().exec(),
    Employee.countDocuments().exec(),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        companies,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        stats: {
          totalCompanies: total,
          totalUsers,
          totalEmployees,
        }
      },
      'Companies fetched successfully by platform Super Admin.'
    )
  );
});

export const getCompanyById = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) {
    throw new ApiError(404, 'Company workspace not found.');
  }

  const employeeCount = await Employee.countDocuments({ companyId: company._id }).exec();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        company,
        employeeCount,
      },
      'Company details fetched successfully.'
    )
  );
});

export const createCompany = asyncHandler(async (req, res) => {
  const parsed = createCompanySchema.parse(req.body);

  const existingEmail = await Company.findOne({ email: parsed.email.toLowerCase() });
  if (existingEmail) {
    throw new ApiError(400, `A company with email "${parsed.email}" already exists.`);
  }

  const company = await Company.create({
    ...parsed,
    createdBy: req.user.userId || req.user._id,
  });

  res.status(201).json(new ApiResponse(201, company, 'Company workspace provisioned successfully.'));
});

export const updateCompany = asyncHandler(async (req, res) => {
  const parsed = updateCompanySchema.parse(req.body);

  const company = await Company.findById(req.params.id);
  if (!company) {
    throw new ApiError(404, 'Company workspace not found.');
  }

  if (parsed.email) {
    const existing = await Company.findOne({ email: parsed.email.toLowerCase(), _id: { $ne: company._id } });
    if (existing) {
      throw new ApiError(400, `A company with email "${parsed.email}" already exists.`);
    }
  }

  // Update Company
  const updatedCompany = await Company.findByIdAndUpdate(req.params.id, parsed, { new: true, runValidators: true });

  res.status(200).json(new ApiResponse(200, updatedCompany, 'Company workspace details updated.'));
});

export const deleteCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) {
    throw new ApiError(404, 'Company workspace not found.');
  }

  // Soft delete company
  await company.softDelete();

  // Suspend associated user login access
  await User.updateMany({ companyId: company._id }, { status: 'Inactive' });

  res.status(200).json(new ApiResponse(200, null, 'Company workspace and logins suspended.'));
});
