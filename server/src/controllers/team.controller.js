import Team from '../models/Team.js';
import Employee from '../models/Employee.js';
import { createTeamSchema, updateTeamSchema } from '../validators/team.validator.js';
import { ApiResponse, ApiError } from '../utils/responseWrapper.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getTeams = asyncHandler(async (req, res) => {
  const teams = await Team.find()
    .populate('departmentId', 'name')
    .populate('managerId', 'firstName lastName email')
    .sort({ name: 1 })
    .exec();

  res.status(200).json(new ApiResponse(200, teams, 'Teams fetched successfully.'));
});

export const createTeam = asyncHandler(async (req, res) => {
  const parsed = createTeamSchema.parse(req.body);

  const existing = await Team.findOne({
    name: { $regex: new RegExp(`^${parsed.name}$`, 'i') },
    departmentId: parsed.departmentId
  });
  if (existing) {
    throw new ApiError(400, `A team with name "${parsed.name}" already exists in this department.`);
  }

  const team = await Team.create({
    name: parsed.name,
    departmentId: parsed.departmentId,
    managerId: parsed.managerId || null
  });

  res.status(201).json(new ApiResponse(201, team, 'Team created successfully.'));
});

export const updateTeam = asyncHandler(async (req, res) => {
  const parsed = updateTeamSchema.parse(req.body);

  const team = await Team.findById(req.params.id);
  if (!team) {
    throw new ApiError(404, 'Team not found.');
  }

  if (parsed.name && parsed.departmentId) {
    const existing = await Team.findOne({
      name: { $regex: new RegExp(`^${parsed.name}$`, 'i') },
      departmentId: parsed.departmentId,
      _id: { $ne: team._id }
    });
    if (existing) {
      throw new ApiError(400, `A team with name "${parsed.name}" already exists in that department.`);
    }
  }

  const updated = await Team.findByIdAndUpdate(req.params.id, parsed, { new: true });
  res.status(200).json(new ApiResponse(200, updated, 'Team updated successfully.'));
});

export const deleteTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) {
    throw new ApiError(404, 'Team not found.');
  }

  // Update associated employees to clear teamId
  await Employee.updateMany(
    { 'professionalInfo.teamId': team._id },
    { $set: { 'professionalInfo.teamId': null } }
  );

  await team.softDelete();
  res.status(200).json(new ApiResponse(200, null, 'Team deleted successfully.'));
});
