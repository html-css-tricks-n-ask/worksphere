import { Schema, Types } from 'mongoose';
import { tenantStorage } from '../../utils/tenantContext.js';





export function tenantPlugin(schema) {
  schema.add({
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
  });

  // Automatically populate companyId from context before validation
  schema.pre('validate', function ( next) {
    if (this.isNew && !this.companyId) {
      const store = tenantStorage.getStore();
      const companyId = store ? (store.companyId || store) : null;
      if (companyId) {
        this.companyId = companyId;
      }
    }
    next();
  });

  // Automatically filter all find queries by the request-scoped companyId context
  const filterByCompanyContext = function ( next) {
    const store = tenantStorage.getStore();
    if (store) {
      const companyId = store.companyId || store;
      const bypass = store.bypass || false;
      // Skip query filtering if bypass is set to true (e.g. for Super Admins)
      if (!bypass && companyId) {
        this.where({ companyId });
      }
    }
    next();
  };

  schema.pre('find', filterByCompanyContext);
  schema.pre('findOne', filterByCompanyContext);
  schema.pre('findOneAndUpdate', filterByCompanyContext);
  schema.pre('updateMany', filterByCompanyContext);
  schema.pre('countDocuments', filterByCompanyContext);

  // Query helpers to enforce company filters manually if needed
  (schema.query ).forCompany = function ( companyId) {
    return this.where({ companyId: new Types.ObjectId(companyId.toString()) });
  };
}
