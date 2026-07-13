# Database Schema & Collections Design

This document details the MongoDB collection schemas, indexes strategy, relationships, and data isolation patterns designed for **WorkSphere**.

---

## 🏗️ 1. Global Scoping: The Tenant Isolation Pattern

Every database collection (except for system configuration and global telemetry if applicable) inherits from a `BaseModel` that enforces the `companyId` constraint.

- **Isolation Key**: `companyId` (Mongoose `Schema.Types.ObjectId`, references `companies`).
- **Plugin Integration**: The backend automatically loads the custom Mongoose plugin `tenantPlugin.ts`. This plugin intercepts write and read queries to ensure that:
  - New documents are auto-assigned the tenant ID active in the `AsyncLocalStorage` request store.
  - Queries are pre-filtered with `{ companyId: activeTenantId }`.

---

## 🗄️ 2. Core Collections Reference

### 1. `companies` (Organizations Collection)
Acts as the global tenant entity defining the active organization space.

| Field | Type | Rules / Validation | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Auto-generated identifier. |
| `name` | String | Required, Trimmed | The official legal name of the tenant. |
| `slug` | String | Unique, Lowercase, Trimmed | Workspace subdomain key (e.g., `acme`). |
| `email` | String | Required, Unique, Lowercase | Primary contact/billing email. |
| `status` | String | Enum: `'Active' \| 'Suspended'` | Operational state of the workspace tenant. |
| `logo` | String | Optional (HTTPS Url) | Hosted company branding asset. |
| `createdBy` | ObjectId | References `users` | The system user that registered the workspace. |

**Indexes:**
- Unique Index: `{ slug: 1 }` (fast routing during workspace lookup).
- Unique Index: `{ email: 1 }` (prevents duplicate corporate space allocation).

---

### 2. `companysettings` (Tenant Configurations)
Overrides operational constraints per organization workspace.

| Field | Type | Rules / Validation | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Auto-generated. |
| `companyId` | ObjectId | Ref: `companies`, Required | Scopes settings to organization. |
| `currency` | String | Default: `'USD'` | Corporate currency code. |
| `timezone` | String | Default: `'America/New_York'` | Default workspace timezone. |
| `weekendDays` | Number[] | Default: `[0, 6]` | Array representing rest days (0 = Sunday, 6 = Saturday). |
| `officeHours` | Object | `{ start: '09:00', end: '18:00' }` | Expected working hours shift block. |

**Indexes:**
- Unique Index: `{ companyId: 1 }` (only one settings document allowed per organization).

---

### 3. `users` (System Login Accounts)
Houses credentials and role states allowing system login across workspaces.

| Field | Type | Rules / Validation | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Auto-generated. |
| `companyId` | ObjectId | Ref: `companies`, Required | Tenant reference. |
| `firstName` | String | Required, Trimmed | User's first name. |
| `lastName` | String | Required, Trimmed | User's last name. |
| `email` | String | Required, Unique, Lowercase | Login credential email address. |
| `password` | String | Selected false by default, Hashed | Bcrypt hashed login credential password. |
| `role` | String | Enum: `'Super Admin' \| 'Company Admin' \| 'HR' \| 'Manager' \| 'Employee'` | Granular RBAC role. |
| `status` | String | Enum: `'Pending' \| 'Active' \| 'Inactive'` | User status. |
| `emailVerified`| Boolean | Default: `false` | Status verification check. |
| `verificationToken` | String | Optional, Selected false | Verification token. |
| `verificationExpires` | Date | Optional, Selected false | Token expiry timestamp. |
| `resetPasswordToken` | String | Optional, Selected false | Password reset token. |
| `resetPasswordExpires` | Date | Optional, Selected false | Reset token expiry timestamp. |
| `lastLogin` | Date | Optional | Last successful authentication timestamp. |

**Indexes:**
- Compound Index: `{ companyId: 1, email: 1 }` (prevents cross-tenant email conflicts).
- Compound Index: `{ verificationToken: 1 }` (speeds up email confirmation lookups).

---

### 4. `employees` (Staff Profile Ledger)
Houses HR data, emergency info, address ledger, skills, and payroll configurations. Separated from the `User` document to protect personal details.

| Field | Type | Rules / Validation | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Auto-generated. |
| `userId` | ObjectId | Ref: `users`, Optional | Links user credentials if system access is granted. |
| `companyId` | ObjectId | Ref: `companies`, Required | Parent tenant. |
| `employeeId` | String | Required, Trimmed | Corporate internal staff ID (e.g. `EMP1024`). |
| `firstName` | String | Required, Trimmed | Employee first name. |
| `lastName` | String | Required, Trimmed | Employee last name. |
| `email` | String | Required, Lowercase | Personal/Work email address. |
| `personalInfo` | Object | Nested Schema | Fields: `dateOfBirth`, `gender`, `maritalStatus`, `nationality`. |
| `professionalInfo`| Object | Nested Schema | Fields: `departmentId` (Ref), `designationId` (Ref), `managerId` (Ref), `joiningDate`, `employmentType` (Enum), `workLocation`, `shiftId` (Ref). |
| `address` | Object | Nested Schema | Fields: `currentAddress`, `permanentAddress`. |
| `emergencyContact`| Object | Nested Schema | Fields: `contactName`, `relation`, `phone`. |
| `skills` | String[] | Default: `[]` | List of employee skills. |
| `documents` | Array | Nested Document | Fields: `name`, `url` (Cloudinary), `publicId`, `uploadedAt`. |
| `status` | String | Enum: `'Active' \| 'Inactive'` | Active state of the employee. |

**Indexes:**
- Compound Unique Index: `{ companyId: 1, employeeId: 1, isDeleted: 1 }` (guarantees unique IDs per company, ignoring soft-deleted documents).
- Compound Unique Index: `{ companyId: 1, email: 1, isDeleted: 1 }` (guarantees unique emails per company, ignoring soft-deleted documents).
- Reference Index: `{ 'professionalInfo.departmentId': 1 }` (speeds up department listing lookups).
- Reference Index: `{ 'professionalInfo.managerId': 1 }` (resolves manager structure trees).

---

### 5. `leaves` (Leaves Collection)
Tracks leave applications, dates, quotas, and approvals.

| Field | Type | Rules / Validation | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Auto-generated. |
| `employeeId` | ObjectId | Ref: `employees`, Required | Applied by worker. |
| `companyId` | ObjectId | Ref: `companies`, Required | Scoping tenant ID. |
| `leaveType` | String | Enum: `'Casual' \| 'Sick' \| 'Earned' \| 'Maternity' \| 'Paternity' \| 'LWP'` | Categorization details. |
| `startDate` | Date | Required | Start date of leave. |
| `endDate` | Date | Required | End date of leave. |
| `daysRequested` | Number | Minimum: 0.5 | Count of requested working days off. |
| `reason` | String | Required | Reasoning statement. |
| `status` | String | Enum: `'Pending' \| 'Approved' \| 'Rejected'` | Approval cycle status. |
| `approvedBy` | ObjectId | Ref: `employees`, Optional | HR/Manager who processed the action. |
| `approvedAt` | Date | Optional | Processing date. |
| `comments` | String | Optional | Notes added by the approver. |

**Indexes:**
- Compound Index: `{ companyId: 1, employeeId: 1, status: 1 }` (resolves personal leaves).
- Compound Index: `{ companyId: 1, startDate: -1, endDate: -1 }` (resolves active calendar listings).

---

### 6. `salarystructures` (Payroll Setup templates)
Core salary structure records containing allowances and tax configurations.

| Field | Type | Rules / Validation | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Auto-generated. |
| `employeeId` | ObjectId | Ref: `employees`, Unique per company | Employee structure target. |
| `companyId` | ObjectId | Ref: `companies`, Required | Scoping tenant. |
| `basicSalary` | Number | Required, Min: 0 | Base structural salary. |
| `hra` | Number | Default: 0 | House Rent Allowance. |
| `specialAllowance`| Number | Default: 0 | Special allowances. |
| `conveyance` | Number | Default: 0 | Transport allowance. |
| `medicalAllowance`| Number | Default: 0 | Medical allowance. |
| `pf` | Number | Default: 0 | Provident Fund deduction. |
| `esi` | Number | Default: 0 | Employee State Insurance deduction. |
| `professionalTax` | Number | Default: 0 | Professional tax deduction. |
| `incomeTax` | Number | Default: 0 | Estimated monthly TDS deduction. |
| `netSalary` | Number | Automatically computed | `Earnings - Deductions`. |
| `status` | String | Enum: `'Active' \| 'Inactive'` | Active state of structure. |
| `effectiveDate` | Date | Required | Execution date template target. |

**Indexes:**
- Compound Unique Index: `{ companyId: 1, employeeId: 1 }` (only one active structure allowed per worker).

---

### 7. `payrolls` (Locked Salary Computations Runs)
Generates payroll runs containing locked structures.

| Field | Type | Rules / Validation | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Auto-generated. |
| `employeeId` | ObjectId | Ref: `employees`, Required | Payroll target. |
| `companyId` | ObjectId | Ref: `companies`, Required | Scoping tenant. |
| `month` | String | Format: `'YYYY-MM'`, Required | Target pay month. |
| `basicSalary` | Number | Locked value | Base structural salary. |
| `hra` | Number | Locked value | House Rent Allowance. |
| `specialAllowance`| Number | Locked value | Special allowances. |
| `conveyance` | Number | Locked value | Transport allowance. |
| `medicalAllowance`| Number | Locked value | Medical allowance. |
| `bonus` | Number | Default: 0 | Discretionary bonus. |
| `reimbursements` | Number | Default: 0 | Reimbursements. |
| `pf` | Number | Locked value | Provident Fund deduction. |
| `esi` | Number | Locked value | ESI deduction. |
| `professionalTax` | Number | Locked value | Professional tax deduction. |
| `incomeTax` | Number | Locked value | Income tax TDS deduction. |
| `lwpDeductions` | Number | Default: 0 | Leave Without Pay deduction. |
| `workingDays` | Number | Default: 30 | Calendar month days. |
| `paidDays` | Number | Default: 30 | Working days minus unpaid leaves. |
| `grossSalary` | Number | Automatically computed | Total earnings before tax. |
| `totalDeductions` | Number | Automatically computed | Total tax and fund deductions. |
| `netSalary` | Number | Automatically computed | Final payout amount. |
| `status` | String | Enum: `'Draft' \| 'Locked' \| 'Paid'` | Execution state. |
| `lockedBy` | ObjectId | Ref: `users`, Optional | User that locked the run. |
| `lockedAt` | Date | Optional | Locking date. |

**Indexes:**
- Compound Unique Index: `{ companyId: 1, employeeId: 1, month: 1 }` (prevents double payroll runs for a worker in the same month).
- Compound Index: `{ companyId: 1, month: 1, status: 1 }` (resolves payment batch grids).

---

### 8. `reimbursements` (Reimbursement Claims)
Tracks reimbursement claims.

| Field | Type | Rules / Validation | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Auto-generated. |
| `employeeId` | ObjectId | Ref: `employees`, Required | Claimant target. |
| `companyId` | ObjectId | Ref: `companies`, Required | Scoping tenant. |
| `title` | String | Required, Trimmed | Claim title. |
| `amount` | Number | Required, Min: 0.01 | Requested reimbursement amount. |
| `category` | String | Enum: `'Travel' \| 'Food' \| 'Internet' \| 'Medical' \| 'Other'` | Expense category. |
| `expenseDate` | Date | Required | Date expense was incurred. |
| `description` | String | Optional | Explanation details. |
| `receiptUrl` | String | Optional (HTTPS) | Attachment receipt image URL. |
| `status` | String | Enum: `'Pending' \| 'Approved' \| 'Rejected' \| 'Paid'` | Processing status. |

**Indexes:**
- Compound Index: `{ companyId: 1, employeeId: 1, status: 1 }` (speeds up user claim lists).

---

## 🗑️ 3. Soft Delete Strategy

WorkSphere implements soft deletion via the Mongoose schema plugin `softDelete.ts`. 

- **State Flags**: Adds `isDeleted: Boolean` (default `false`) and `deletedAt: Date` (default `null`) to schemas.
- **Interceptors**: Pre-hooks automatically intercept database queries (`find`, `findOne`, `countDocuments`, `updateMany`, `updateOne`, `findOneAndUpdate`) to filter out soft-deleted records:
  ```ts
  this.where({ isDeleted: { $ne: true } });
  ```
- **Cascade Deletion**: Handled inside the repository layers to ensure that soft-deleting an `employee` cleans up or disables their active `user` login session, preventing orphan reference bugs.
