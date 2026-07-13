# REST API Specification

This document details the REST API specifications for the **WorkSphere** platform. All routes require specific headers, enforce payload validation using Zod schemas, and respond with standardized JSON formats.

---

## 🌐 1. Global Specifications

- **Base URL**: `/api/v1`
- **Request Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <Access_Token>` (Required for all protected routes)
- **Response Format**:
  - All responses are wrapped in a standard JSON envelope:
    ```json
    {
      "statusCode": 200,
      "success": true,
      "message": "Action completed successfully.",
      "data": { ... }
    }
    ```
  - In case of failure:
    ```json
    {
      "statusCode": 400,
      "success": false,
      "message": "Validation failed.",
      "errors": [
        { "field": "email", "message": "Invalid email address format." }
      ]
    }
    ```

---

## 🔑 2. Authentication APIs

### 1. Register Company & Admin User
Provision a new tenant space and initial admin credentials in one transactional block.

- **Endpoint**: `POST /auth/register`
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "company": {
      "name": "Acme Industries",
      "email": "contact@acme.com",
      "phone": "+15551234567"
    },
    "admin": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@acme.com",
      "password": "Password@123"
    }
  }
  ```
- **Validation**:
  - `company.name` must be at least 2 characters.
  - `admin.password` must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number.
- **Success Response (201 Created)**:
  ```json
  {
    "statusCode": 201,
    "success": true,
    "message": "Company registered successfully. Please verify your email.",
    "data": {
      "company": { "id": "60c72b2f9b1d8e234c8b4567", "name": "Acme Industries", "slug": "acme-industries" },
      "admin": { "id": "60c72b2f9b1d8e234c8b4568", "email": "john.doe@acme.com" }
    }
  }
  ```

### 2. Login User
Authenticate credentials and issue JWT structures.

- **Endpoint**: `POST /auth/login`
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "email": "john.doe@acme.com",
    "password": "Password@123"
  }
  ```
- **Cookies Set**:
  - `worksphere_refresh_token`: Secure, HttpOnly, SameSite=Lax (or None in production), expires in 7 days.
- **Success Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Logged in successfully.",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "60c72b2f9b1d8e234c8b4568",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@acme.com",
        "role": "Company Admin",
        "companyId": "60c72b2f9b1d8e234c8b4567"
      }
    }
  }
  ```

### 3. Refresh Access Token
Generate a new transient access token.

- **Endpoint**: `POST /auth/refresh`
- **Authentication**: None (Reads `worksphere_refresh_token` cookie or accepts `refreshToken` in request body)
- **Success Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Access token refreshed successfully.",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

---

## 👥 3. Employee APIs

### 1. List Employees
Retrieve a paginated, filtered grid of active tenant workers.

- **Endpoint**: `GET /employees`
- **Authentication**: JWT, Roles: `Company Admin`, `HR`, `Manager`, `Employee` (Managers and employees only see scoped sets)
- **Query Parameters**:
  - `page` (default: 1)
  - `limit` (default: 10)
  - `search` (filters by name/email)
  - `departmentId` (filters by department)
- **Success Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Employees fetched successfully.",
    "data": {
      "employees": [
        {
          "id": "60c72b2f9b1d8e234c8b4590",
          "employeeId": "EMP001",
          "firstName": "Alice",
          "lastName": "Smith",
          "email": "alice@acme.com",
          "status": "Active"
        }
      ],
      "pagination": { "total": 12, "page": 1, "pages": 2 }
    }
  }
  ```

### 2. Create Employee
Add a new employee and automatically provision their user login account.

- **Endpoint**: `POST /employees`
- **Authentication**: JWT, Roles: `Company Admin`, `HR`
- **Request Body**:
  ```json
  {
    "employeeId": "EMP005",
    "firstName": "Bob",
    "lastName": "Williams",
    "email": "bob@acme.com",
    "phone": "+15559876543",
    "role": "Employee",
    "professionalInfo": {
      "departmentId": "60c72b2f9b1d8e234c8b4501",
      "designationId": "60c72b2f9b1d8e234c8b4502",
      "employmentType": "Full-Time",
      "joiningDate": "2026-07-01"
    }
  }
  ```
- **Success Response (210 Created)**:
  ```json
  {
    "statusCode": 201,
    "success": true,
    "message": "Employee created and system login account provisioned.",
    "data": {
      "employee": {
        "id": "60c72b2f9b1d8e234c8b4599",
        "employeeId": "EMP005",
        "firstName": "Bob",
        "lastName": "Williams"
      }
    }
  }
  ```

---

## 🏢 4. Department APIs

### 1. List Departments
Get all departments configured for the active tenant.

- **Endpoint**: `GET /departments`
- **Authentication**: JWT
- **Success Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Departments retrieved.",
    "data": [
      {
        "id": "60c72b2f9b1d8e234c8b4501",
        "name": "Engineering",
        "description": "Software development division"
      }
    ]
  }
  ```

### 2. Create Department
- **Endpoint**: `POST /departments`
- **Authentication**: JWT, Roles: `Company Admin`, `HR`
- **Request Body**:
  ```json
  {
    "name": "Quality Assurance",
    "description": "Automation and product validation"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "statusCode": 201,
    "success": true,
    "message": "Department created.",
    "data": { "id": "60c72b2f9b1d8e234c8b4505", "name": "Quality Assurance" }
  }
  ```

---

## 📅 5. Leave APIs

### 1. Apply for Leave
- **Endpoint**: `POST /leaves`
- **Authentication**: JWT, Role: `Employee`, `Manager`, `HR`
- **Request Body**:
  ```json
  {
    "leaveType": "Sick",
    "startDate": "2026-07-20",
    "endDate": "2026-07-22",
    "reason": "Recovering from medical surgery."
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "statusCode": 201,
    "success": true,
    "message": "Leave application submitted.",
    "data": {
      "id": "60c72b2f9b1d8e234c8b4700",
      "leaveType": "Sick",
      "daysRequested": 3,
      "status": "Pending"
    }
  }
  ```

### 2. Update Leave Status (Process Application)
Approve or reject a leave request.

- **Endpoint**: `PATCH /leaves/:id/status`
- **Authentication**: JWT, Roles: `Company Admin`, `HR`, `Manager`
- **Request Body**:
  ```json
  {
    "status": "Approved",
    "comments": "Enjoy your time off. Recover well."
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Leave application approved successfully.",
    "data": {
      "id": "60c72b2f9b1d8e234c8b4700",
      "status": "Approved"
    }
  }
  ```

---

## 📈 6. Dashboard & Metrics APIs

### 1. Get HR Metrics
Retrieve aggregates for HR overview widgets (attendance rates, headcount, active leave counts).

- **Endpoint**: `GET /company/dashboard-metrics`
- **Authentication**: JWT, Roles: `Company Admin`, `HR`
- **Success Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Metrics calculated successfully.",
    "data": {
      "totalHeadcount": 142,
      "activeLeavesToday": 4,
      "attendanceRateToday": "94.2%",
      "pendingClaimsCount": 11
    }
  }
  ```

---

## 💬 7. AI HR Chatbot APIs

### 1. Send Query
Interact with the natural-language processing chatbot assistant.

- **Endpoint**: `POST /ai/chat`
- **Authentication**: JWT
- **Request Body**:
  ```json
  {
    "message": "Who is currently on leave this week?"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "AI answer generated.",
    "data": {
      "response": "Currently, Alice Smith (Engineering) is on Sick leave from July 13th to July 15th, and Bob Williams is on Casual leave from July 14th to July 14th."
    }
  }
  ```
