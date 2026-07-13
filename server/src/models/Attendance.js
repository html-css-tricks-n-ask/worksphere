import { Schema, model, } from 'mongoose';
import { baseSchemaOptions } from './BaseModel.js';
import { tenantPlugin, } from './plugins/tenant.js';




















const attendanceSchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required.'],
    },
    checkIn: {
      type: Date,
    },
    checkOut: {
      type: Date,
    },
    totalHours: {
      type: Number,
      default: 0,
    },
    breakHours: {
      type: Number,
      default: 0,
    },
    overtimeHours: {
      type: Number,
      default: 0,
    },
    location: {
      type: String,
      trim: true,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    qrCode: {
      type: String,
    },
    attendanceType: {
      type: String,
      enum: ['Web', 'Mobile', 'QR', 'GPS', 'Manual'],
      required: [true, 'Attendance type is required.'],
    },
    remarks: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Leave', 'Holiday', 'Weekend', 'Half Day'],
      required: [true, 'Attendance status is required.'],
    },
  },
  baseSchemaOptions
);

// Apply tenant plugin
attendanceSchema.plugin(tenantPlugin);

// Compound index to speed up daily lookup checks per employee
attendanceSchema.index({ companyId: 1, employeeId: 1, checkIn: 1 });

export const Attendance = model('Attendance', attendanceSchema);
export default Attendance;
