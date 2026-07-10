import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaOptions } from './BaseModel.js';
import { softDeletePlugin, SoftDeleteDocument } from './plugins/softDelete.js';
import { tenantPlugin, TenantDocument } from './plugins/tenant.js';

export interface IPersonalInfo {
  dateOfBirth?: Date;
  gender?: 'Male' | 'Female' | 'Other';
  bloodGroup?: string;
  maritalStatus?: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  nationality?: string;
}

export interface IProfessionalInfo {
  departmentId?: Types.ObjectId; // References Department
  designationId?: Types.ObjectId; // References Designation
  managerId?: Types.ObjectId; // References Employee
  joiningDate?: Date;
  employmentType?: 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern';
  workLocation?: string;
  salaryGrade?: string;
  shiftId?: Types.ObjectId; // References Shift
}

export interface IAddress {
  currentAddress?: string;
  permanentAddress?: string;
}

export interface IEmergencyContact {
  contactName?: string;
  relation?: string;
  phone?: string;
}

export interface IExperience {
  company: string;
  role: string;
  duration: string;
  description?: string;
}

export interface IEducation {
  degree: string;
  college?: string;
  university?: string;
  year: number;
  percentage?: number;
}

export interface IDocument {
  name: string; // e.g. "Resume", "Aadhaar", "PAN"
  url: string;
  publicId: string;
  uploadedAt: Date;
}

export interface IEmployee {
  userId?: Schema.Types.ObjectId; // References User (for system login accounts)
  employeeId: string; // unique code per company (e.g. EMP001)
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  avatarPublicId?: string;
  personalInfo?: IPersonalInfo;
  professionalInfo?: IProfessionalInfo;
  address?: IAddress;
  emergencyContact?: IEmergencyContact;
  skills?: string[];
  experience?: IExperience[];
  education?: IEducation[];
  documents?: IDocument[];
  status: 'Active' | 'Inactive';
}

export interface EmployeeDocument extends IEmployee, SoftDeleteDocument, TenantDocument, Document {}

const employeeSchema = new Schema<EmployeeDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required.'],
      trim: true,
    },
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
      required: [true, 'Email address is required.'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
    avatarPublicId: {
      type: String,
    },
    personalInfo: {
      dateOfBirth: Date,
      gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
      },
      bloodGroup: String,
      maritalStatus: {
        type: String,
        enum: ['Single', 'Married', 'Divorced', 'Widowed'],
      },
      nationality: String,
    },
    professionalInfo: {
      departmentId: {
        type: Schema.Types.ObjectId,
        ref: 'Department',
      },
      designationId: {
        type: Schema.Types.ObjectId,
        ref: 'Designation',
      },
      managerId: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
      },
      joiningDate: Date,
      employmentType: {
        type: String,
        enum: ['Full-Time', 'Part-Time', 'Contract', 'Intern'],
        default: 'Full-Time',
      },
      workLocation: String,
      salaryGrade: String,
      shiftId: {
        type: Schema.Types.ObjectId,
        ref: 'Shift',
      },
    },
    address: {
      currentAddress: String,
      permanentAddress: String,
    },
    emergencyContact: {
      contactName: String,
      relation: String,
      phone: String,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    experience: [
      {
        company: { type: String, required: true },
        role: { type: String, required: true },
        duration: { type: String, required: true },
        description: String,
      },
    ],
    education: [
      {
        degree: { type: String, required: true },
        college: String,
        university: String,
        year: { type: Number, required: true },
        percentage: Number,
      },
    ],
    documents: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  baseSchemaOptions
);

// Guarantee unique employee IDs and emails within each tenant company
employeeSchema.index({ companyId: 1, employeeId: 1, isDeleted: 1 }, { unique: true });
employeeSchema.index({ companyId: 1, email: 1, isDeleted: 1 }, { unique: true });

employeeSchema.plugin(softDeletePlugin);
employeeSchema.plugin(tenantPlugin);

export const Employee = model<EmployeeDocument>('Employee', employeeSchema);
export default Employee;
