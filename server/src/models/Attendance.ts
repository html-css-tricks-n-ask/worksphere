import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaOptions } from './BaseModel.js';
import { tenantPlugin, TenantDocument } from './plugins/tenant.js';

export interface IAttendance {
  employeeId: Types.ObjectId; // References Employee
  companyId: Types.ObjectId;
  checkIn?: Date;
  checkOut?: Date;
  totalHours: number;
  breakHours: number;
  overtimeHours: number;
  location?: string; // e.g. "Office", "Remote"
  latitude?: number;
  longitude?: number;
  qrCode?: string;
  attendanceType: 'Web' | 'Mobile' | 'QR' | 'GPS' | 'Manual';
  remarks?: string;
  status: 'Present' | 'Absent' | 'Leave' | 'Holiday' | 'Weekend' | 'Half Day';
}

export interface AttendanceDocument extends IAttendance, TenantDocument, Document {}

const attendanceSchema = new Schema<AttendanceDocument>(
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

export const Attendance = model<AttendanceDocument>('Attendance', attendanceSchema);
export default Attendance;
