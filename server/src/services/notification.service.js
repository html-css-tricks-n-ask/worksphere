import { logger } from '../config/logger.js';
import emailService from './email/email.service.js';

 















class NotificationService {
  async send(payload) {
    const { toEmail, toName, event, meta = {} } = payload;

    try {
      switch (event) {
        case 'LEAVE_APPLIED': {
          const subject = 'Leave Request Submitted – WorkSphere';
          const html = this.leaveAppliedTemplate(toName, meta);
          await emailService['sendMail'](toEmail, subject, html);
          break;
        }
        case 'LEAVE_APPROVED': {
          const subject = 'Your Leave Request Has Been Approved – WorkSphere';
          const html = this.leaveApprovedTemplate(toName, meta);
          await emailService['sendMail'](toEmail, subject, html);
          break;
        }
        case 'LEAVE_REJECTED': {
          const subject = 'Your Leave Request Has Been Rejected – WorkSphere';
          const html = this.leaveRejectedTemplate(toName, meta);
          await emailService['sendMail'](toEmail, subject, html);
          break;
        }
        case 'SHIFT_ASSIGNED': {
          const subject = 'Shift Schedule Updated – WorkSphere';
          const html = this.shiftAssignedTemplate(toName, meta);
          await emailService['sendMail'](toEmail, subject, html);
          break;
        }
        case 'ATTENDANCE_CORRECTION':
        case 'CHECKIN_SUCCESS':
        case 'CHECKOUT_SUCCESS': {
          // For these, log only — no email spam
          logger.info(`[Notification] ${event} for ${toName} (${toEmail})`);
          break;
        }
        default:
          logger.warn(`[NotificationService] Unknown event: ${event}`);
      }
    } catch (err) {
      logger.error(`[NotificationService] Failed to send ${event} notification: ${(err ).message}`);
    }
  }

   baseTemplate(body) {
    return `
      <div style="font-family:Inter,sans-serif;background:#f4f4f7;padding:40px 0;">
        <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:-0.5px;">WorkSphere</h1>
            <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">Enterprise HR Platform</p>
          </div>
          <div style="padding:32px;">
            ${body}
          </div>
          <div style="border-top:1px solid #f0f0f0;padding:20px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} WorkSphere. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;
  }

   leaveAppliedTemplate(name, meta) {
    return this.baseTemplate(`
      <h2 style="color:#1f2937;margin:0 0 16px;">Leave Request Submitted</h2>
      <p style="color:#6b7280;line-height:1.6;">Hi <strong>${name}</strong>,</p>
      <p style="color:#6b7280;line-height:1.6;">Your leave request has been submitted successfully and is pending approval.</p>
      <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:20px 0;">
        <p style="margin:4px 0;color:#374151;"><strong>Type:</strong> ${meta.leaveType || '—'}</p>
        <p style="margin:4px 0;color:#374151;"><strong>From:</strong> ${meta.startDate || '—'}</p>
        <p style="margin:4px 0;color:#374151;"><strong>To:</strong> ${meta.endDate || '—'}</p>
        <p style="margin:4px 0;color:#374151;"><strong>Days:</strong> ${meta.totalDays || '—'}</p>
      </div>
      <p style="color:#6b7280;font-size:13px;">You will be notified once your manager reviews your request.</p>
    `);
  }

   leaveApprovedTemplate(name, meta) {
    return this.baseTemplate(`
      <h2 style="color:#059669;margin:0 0 16px;">✓ Leave Approved</h2>
      <p style="color:#6b7280;line-height:1.6;">Hi <strong>${name}</strong>,</p>
      <p style="color:#6b7280;line-height:1.6;">Great news! Your leave request has been <strong style="color:#059669;">approved</strong>.</p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0;">
        <p style="margin:4px 0;color:#374151;"><strong>Type:</strong> ${meta.leaveType || '—'}</p>
        <p style="margin:4px 0;color:#374151;"><strong>From:</strong> ${meta.startDate || '—'}</p>
        <p style="margin:4px 0;color:#374151;"><strong>To:</strong> ${meta.endDate || '—'}</p>
      </div>
    `);
  }

   leaveRejectedTemplate(name, meta) {
    return this.baseTemplate(`
      <h2 style="color:#dc2626;margin:0 0 16px;">Leave Request Rejected</h2>
      <p style="color:#6b7280;line-height:1.6;">Hi <strong>${name}</strong>,</p>
      <p style="color:#6b7280;line-height:1.6;">Unfortunately, your leave request has been <strong style="color:#dc2626;">rejected</strong>.</p>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:20px 0;">
        <p style="margin:4px 0;color:#374151;"><strong>Type:</strong> ${meta.leaveType || '—'}</p>
        <p style="margin:4px 0;color:#374151;"><strong>From:</strong> ${meta.startDate || '—'}</p>
        <p style="margin:4px 0;color:#374151;"><strong>To:</strong> ${meta.endDate || '—'}</p>
      </div>
      <p style="color:#6b7280;font-size:13px;">Please reach out to your manager for more information.</p>
    `);
  }

   shiftAssignedTemplate(name, meta) {
    return this.baseTemplate(`
      <h2 style="color:#1f2937;margin:0 0 16px;">Shift Schedule Updated</h2>
      <p style="color:#6b7280;line-height:1.6;">Hi <strong>${name}</strong>,</p>
      <p style="color:#6b7280;line-height:1.6;">Your work shift has been updated in WorkSphere.</p>
      <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:20px 0;">
        <p style="margin:4px 0;color:#374151;"><strong>Shift Name:</strong> ${meta.shiftName || '—'}</p>
        <p style="margin:4px 0;color:#374151;"><strong>Start Time:</strong> ${meta.startTime || '—'}</p>
        <p style="margin:4px 0;color:#374151;"><strong>End Time:</strong> ${meta.endTime || '—'}</p>
        <p style="margin:4px 0;color:#374151;"><strong>Working Hours:</strong> ${meta.workingHours || '—'}h</p>
      </div>
    `);
  }
}

export const notificationService = new NotificationService();
export default notificationService;
