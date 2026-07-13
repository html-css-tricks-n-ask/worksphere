

import { notificationRepository } from '../repositories/notification.repository.js';
import { ApiResponse, ApiError } from '../utils/responseWrapper.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const { companyId, userId } = req.user;
  const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;
  const isRead = req.query.isRead !== undefined ? req.query.isRead === 'true' : undefined;

  const result = await notificationRepository.findAll({
    companyId: companyId.toString(),
    userId,
    isRead,
    page,
    limit,
  });

  res.status(200).json(new ApiResponse(200, result, 'In-app notifications logs fetched.'));
});

export const markRead = asyncHandler(async (req, res) => {
  const notification = await notificationRepository.findById(req.params.id);
  if (!notification) {
    throw new ApiError(404, 'Notification not found.');
  }

  const updated = await notificationRepository.update(req.params.id, { isRead: true } );
  res.status(200).json(new ApiResponse(200, updated, 'Notification marked as read.'));
});

export const markAllRead = asyncHandler(async (req, res) => {
  const { userId, companyId } = req.user;
  await notificationRepository.markAllRead(userId, companyId.toString());
  res.status(200).json(new ApiResponse(200, null, 'All notifications marked as read.'));
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await notificationRepository.findById(req.params.id);
  if (!notification) {
    throw new ApiError(404, 'Notification not found.');
  }

  await notificationRepository.delete(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Notification deleted.'));
});
