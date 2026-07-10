import { Schema, model, Document } from 'mongoose';
import { baseSchemaOptions } from './BaseModel.js';
import { softDeletePlugin } from './plugins/softDelete.js';

export interface ICompany {
  name: string;
  slug: string;
  email: string;
  phone?: string;
  website?: string;
  logo?: string;
  address?: string;
  country?: string;
  timezone?: string;
  industry?: string;
  companySize?: string;
  status: 'Active' | 'Suspended';
  createdBy?: Schema.Types.ObjectId;
}

export interface CompanyDocument extends ICompany, Document {}

const companySchema = new Schema<CompanyDocument>(
  {
    name: {
      type: String,
      required: [true, 'Company name is required.'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Company email is required.'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
    },
    address: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    timezone: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    companySize: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Suspended'],
      default: 'Active',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  baseSchemaOptions
);

// Apply soft delete plugin
companySchema.plugin(softDeletePlugin);

// Helper function to slugify text
const generateSlug = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// Pre-save hook to generate unique slug
companySchema.pre('validate', async function (this: CompanyDocument, next) {
  if (this.isModified('name')) {
    let newSlug = generateSlug(this.name);
    
    // Check if slug exists in DB, append random string if it does
    const existing = await model('Company').findOne({ slug: newSlug, _id: { $ne: this._id } });
    if (existing) {
      newSlug = `${newSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    
    this.slug = newSlug;
  }
  next();
});

export const Company = model<CompanyDocument>('Company', companySchema);
export default Company;
