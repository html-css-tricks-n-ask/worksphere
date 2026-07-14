import Location from '../models/Location.js';
import Department from '../models/Department.js';
import { createLocationSchema, updateLocationSchema } from '../validators/location.validator.js';
import { ApiResponse, ApiError } from '../utils/responseWrapper.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getLocations = asyncHandler(async (req, res) => {
  const locations = await Location.find().sort({ name: 1 }).exec();
  res.status(200).json(new ApiResponse(200, locations, 'Locations fetched successfully.'));
});

export const createLocation = asyncHandler(async (req, res) => {
  const parsed = createLocationSchema.parse(req.body);
  
  const existing = await Location.findOne({ name: { $regex: new RegExp(`^${parsed.name}$`, 'i') } });
  if (existing) {
    throw new ApiError(400, `A location with name "${parsed.name}" already exists.`);
  }

  const location = await Location.create(parsed);
  res.status(201).json(new ApiResponse(201, location, 'Location created successfully.'));
});

export const updateLocation = asyncHandler(async (req, res) => {
  const parsed = updateLocationSchema.parse(req.body);

  const location = await Location.findById(req.params.id);
  if (!location) {
    throw new ApiError(404, 'Location not found.');
  }

  if (parsed.name) {
    const existing = await Location.findOne({
      name: { $regex: new RegExp(`^${parsed.name}$`, 'i') },
      _id: { $ne: location._id }
    });
    if (existing) {
      throw new ApiError(400, `A location with name "${parsed.name}" already exists.`);
    }
  }

  const updated = await Location.findByIdAndUpdate(req.params.id, parsed, { new: true });
  res.status(200).json(new ApiResponse(200, updated, 'Location updated successfully.'));
});

export const deleteLocation = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.id);
  if (!location) {
    throw new ApiError(404, 'Location not found.');
  }

  // Verify if any department references this location
  const isReferenced = await Department.findOne({ locationId: location._id });
  if (isReferenced) {
    throw new ApiError(400, 'Cannot delete location because it is linked to one or more active departments.');
  }

  await location.softDelete();
  res.status(200).json(new ApiResponse(200, null, 'Location deleted successfully.'));
});
