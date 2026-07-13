import { AsyncLocalStorage } from 'async_hooks';


// Storage containing the current tenant's companyId
export const tenantStorage = new AsyncLocalStorage();

export default tenantStorage;
