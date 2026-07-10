import { AsyncLocalStorage } from 'async_hooks';
import { Types } from 'mongoose';

// Storage containing the current tenant's companyId
export const tenantStorage = new AsyncLocalStorage<Types.ObjectId>();

export default tenantStorage;
