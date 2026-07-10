import { Schema, Document, Types } from 'mongoose';
import { tenantStorage } from '../../utils/tenantContext.js';

export interface TenantDocument extends Document {
  companyId: Types.ObjectId;
}

export function tenantPlugin(schema: Schema) {
  schema.add({
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
  });

  // Automatically populate companyId from context before validation
  schema.pre('validate', function (this: any, next) {
    if (this.isNew && !this.companyId) {
      const companyId = tenantStorage.getStore();
      if (companyId) {
        this.companyId = companyId;
      }
    }
    next();
  });

  // Automatically filter all find queries by the request-scoped companyId context
  const filterByCompanyContext = function (this: any, next: (err?: any) => void) {
    const companyId = tenantStorage.getStore();
    if (companyId) {
      // Apply filter to current query
      this.where({ companyId });
    }
    next();
  };

  schema.pre('find', filterByCompanyContext);
  schema.pre('findOne', filterByCompanyContext);
  schema.pre('findOneAndUpdate', filterByCompanyContext);
  schema.pre('updateMany', filterByCompanyContext);
  schema.pre('countDocuments', filterByCompanyContext);

  // Query helpers to enforce company filters manually if needed
  (schema.query as any).forCompany = function (this: any, companyId: string | Types.ObjectId) {
    return this.where({ companyId: new Types.ObjectId(companyId.toString()) });
  };
}
