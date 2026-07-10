import { Schema, Document, Model } from 'mongoose';

export interface SoftDeleteDocument extends Document {
  isDeleted: boolean;
  deletedAt?: Date;
  softDelete(): Promise<this>;
  restore(): Promise<this>;
}

export function softDeletePlugin(schema: Schema) {
  schema.add({
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  });

  const excludeDeleted = function (this: any, next: (err?: any) => void) {
    const filter = this.getFilter();
    if (filter && filter.isDeleted === undefined) {
      this.where({ isDeleted: false });
    }
    next();
  };

  schema.pre('find', excludeDeleted);
  schema.pre('findOne', excludeDeleted);
  schema.pre('findOneAndUpdate', excludeDeleted);
  schema.pre('updateMany', excludeDeleted);
  schema.pre('countDocuments', excludeDeleted);

  schema.methods.softDelete = async function (this: SoftDeleteDocument) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return this.save();
  };

  schema.methods.restore = async function (this: SoftDeleteDocument) {
    this.isDeleted = false;
    this.deletedAt = undefined;
    return this.save();
  };
}
