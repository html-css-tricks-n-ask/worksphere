import { Schema, model, Document } from 'mongoose';
import { baseSchemaOptions } from './BaseModel.js';
import { softDeletePlugin } from './plugins/softDelete.js';
import { tenantPlugin } from './plugins/tenant.js';

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  avatar?: string;
  role: 'Super Admin' | 'Company Admin' | 'HR' | 'Manager' | 'Employee';
  companyId: Schema.Types.ObjectId;
  designation?: string;
  status: 'Pending' | 'Active' | 'Inactive';
  emailVerified: boolean;
  verificationToken?: string;
  verificationExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  lastLogin?: Date;
}

export interface UserDocument extends IUser, Document {}

const userSchema = new Schema<UserDocument>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required.'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required.'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      select: false, // Never expose password in query results by default
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
    role: {
      type: String,
      enum: ['Super Admin', 'Company Admin', 'HR', 'Manager', 'Employee'],
      required: true,
    },
    designation: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Active', 'Inactive'],
      default: 'Pending',
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    verificationExpires: {
      type: Date,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    lastLogin: {
      type: Date,
    },
  },
  baseSchemaOptions
);

// Apply soft delete plugin
userSchema.plugin(softDeletePlugin);

// Apply tenant plugin to isolate users per tenant automatically
userSchema.plugin(tenantPlugin);

export const User = model<UserDocument>('User', userSchema);
export default User;
