import { Schema, model } from 'mongoose';
import { baseSchemaOptions } from './BaseModel.js';
import { softDeletePlugin } from './plugins/softDelete.js';
import { tenantPlugin } from './plugins/tenant.js';

const teamSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Team name is required.'],
      trim: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required for team allocation.'],
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
  },
  baseSchemaOptions
);

// Compound index to ensure team name uniqueness per tenant under a department
teamSchema.index({ companyId: 1, departmentId: 1, name: 1, isDeleted: 1 }, { unique: true });

teamSchema.plugin(softDeletePlugin);
teamSchema.plugin(tenantPlugin);

export const Team = model('Team', teamSchema);
export default Team;
