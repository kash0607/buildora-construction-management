# BUILDORA — API Specification Document

This document provides complete reference documentation for the Buildora Backend REST API.

All endpoints adhere to the unified response envelopes:
- **Success:** `{ "success": true, "data": { ... } }`
- **Error:** `{ "success": false, "message": "Human-readable error" }`
- **Validation:** `{ "success": false, "message": "Validation failed", "errors": { ... } }`

---

## 1. System Endpoints

### Health Check
- **Endpoint:** `GET /api/health`
- **Auth Required:** No
- **Response `200`:**
  ```json
  {
    "success": true,
    "message": "Buildora API is running"
  }
  ```

---

## 2. Authentication API

### Register User
- **Endpoint:** `POST /api/auth/register`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "name": "Kashish Patel",
    "email": "kashish.pm@buildora.com",
    "password": "Password123!",
    "role": "Project Manager",
    "phone": "+91 98765 43210"
  }
  ```
- **Response `201`:**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "id": "60d0fe4f5311236168a109ca",
        "name": "Kashish Patel",
        "email": "kashish.pm@buildora.com",
        "role": "Project Manager"
      }
    }
  }
  ```
- **Possible Errors:** `400 Validation failed`, `400 Email is already registered`.

### Login
- **Endpoint:** `POST /api/auth/login`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "kashish.pm@buildora.com",
    "password": "Password123!"
  }
  ```
- **Response `200`:**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOi...",
      "user": { ... }
    }
  }
  ```
- **Possible Errors:** `400 Validation failed`, `401 Invalid email or password credentials`, `403 Account deactivated`.

### Get Current User Profile
- **Endpoint:** `GET /api/auth/me`
- **Auth Required:** Yes (`Bearer <token>`)
- **Response `200`:**
  ```json
  {
    "success": true,
    "data": {
      "id": "60d0fe4f5311236168a109ca",
      "name": "Kashish Patel",
      "email": "kashish.pm@buildora.com",
      "role": "Project Manager",
      "isActive": true
    }
  }
  ```
- **Possible Errors:** `401 Unauthorized`.

---

## 3. Projects API

### Get Projects
- **Endpoint:** `GET /api/projects`
- **Auth Required:** Yes
- **Query Parameters:**
  - `status` (`Planning` | `Active` | `Delayed` | `Completed` | `Archived`)
  - `manager` (string)
  - `search` (keyword)
  - `includeArchived` (`true` | `false`)
- **Response `200`:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "PRJ-101",
        "name": "Skyline Heights",
        "client": "Apex Developers",
        "location": "Worli, Mumbai",
        "manager": "Kashish Patel",
        "progress": 68,
        "budget": 185000000,
        "committedCost": 35000000,
        "actualCost": 124000000,
        "remainingBudget": 61000000,
        "budgetUtilization": 67.03,
        "status": "Active"
      }
    ]
  }
  ```

### Get Single Project
- **Endpoint:** `GET /api/projects/:id`
- **Auth Required:** Yes
- **Response `200`:** Full project object with derived progress and budget calculations.
- **Possible Errors:** `404 Project not found`.

### Create Project
- **Endpoint:** `POST /api/projects`
- **Auth Required:** Yes (Role: `Admin`, `Project Manager`)
- **Request Body:**
  ```json
  {
    "name": "Palm Grove Estates Phase II",
    "client": "Sobha Developers",
    "location": "Kochi, Kerala",
    "manager": "Kashish Patel",
    "budget": 95000000,
    "startDate": "2026-10-01",
    "deadline": "2028-06-30",
    "status": "Planning",
    "description": "Luxury waterfront villa community."
  }
  ```
- **Response `201`:** Created project document.
- **Possible Errors:** `400 Validation failed`, `403 Forbidden`.

### Update Project
- **Endpoint:** `PUT /api/projects/:id`
- **Auth Required:** Yes (Role: `Admin`, `Project Manager`)
- **Request Body:** Partial update fields. (Protected fields `_id`, `createdBy`, `projectId` cannot be overwritten).
- **Response `200`:** Updated project document.

### Archive Project
- **Endpoint:** `DELETE /api/projects/:id`
- **Auth Required:** Yes (Role: `Admin`, `Project Manager`)
- **Behavior:** Soft-deletes project by setting status to `Archived`.
- **Response `200`:** Archived project document.

---

## 4. Tasks API

### Get Tasks
- **Endpoint:** `GET /api/tasks`
- **Auth Required:** Yes
- **Query Parameters:** `project`, `assignee`, `status`, `priority`, `search`, `includeArchived`
- **Response `200`:** Array of tasks with populated dependency summaries.

### Get Task Statistics Summary
- **Endpoint:** `GET /api/tasks/stats/summary`
- **Auth Required:** Yes
- **Query Parameters:** `project` (optional)
- **Response `200`:**
  ```json
  {
    "success": true,
    "data": {
      "total": 24,
      "toDo": 6,
      "inProgress": 10,
      "review": 3,
      "completed": 5,
      "blocked": 2,
      "overdue": 1
    }
  }
  ```

### Create Task
- **Endpoint:** `POST /api/tasks`
- **Auth Required:** Yes (Role: `Admin`, `Project Manager`, `Site Supervisor`)
- **Request Body:**
  ```json
  {
    "title": "Tower A 19th Floor Concrete Pouring",
    "projectId": "PRJ-101",
    "assignee": "Sanjay Verma",
    "priority": "Critical",
    "status": "To Do",
    "startDate": "2026-09-10",
    "dueDate": "2026-09-16",
    "dependencies": []
  }
  ```
- **Enforced Business Rules:**
  - Cannot depend on itself.
  - Dependencies must belong to same project.
  - Cycle detection prevents circular dependencies.
- **Response `201`:** Created task document.
- **Possible Errors:** `400 Validation failed`, `400 Dependency error`.

### Update Task
- **Endpoint:** `PUT /api/tasks/:id`
- **Auth Required:** Yes (Role: `Admin`, `Project Manager`, `Site Supervisor`)
- **Enforced Business Rules:**
  - Cannot complete task if prerequisite dependencies are not `Completed`.
  - Setting status to `Completed` sets `progress = 100`.
- **Response `200`:** Updated task document.

### Archive Task
- **Endpoint:** `DELETE /api/tasks/:id`
- **Auth Required:** Yes (Role: `Admin`, `Project Manager`)
- **Response `200`:** Soft-deleted task object.

---

## 5. Materials API

### Get Materials
- **Endpoint:** `GET /api/materials`
- **Auth Required:** Yes
- **Query Parameters:** `category`, `status`, `project`, `search`
- **Response `200`:** Array of materials with live stock statuses (`In Stock`, `Low Stock`, `Out of Stock`).

### Get Low Stock Alerts
- **Endpoint:** `GET /api/materials/alerts/low-stock`
- **Auth Required:** Yes
- **Response `200`:** Materials with stock at or below reorder level.

### Create Material
- **Endpoint:** `POST /api/materials`
- **Auth Required:** Yes (Role: `Admin`, `Project Manager`, `Procurement Manager`)
- **Request Body:**
  ```json
  {
    "name": "UltraTech OPC 53 Grade Cement",
    "category": "Cement & Binders",
    "unit": "bag",
    "projectId": "PRJ-101",
    "currentStock": 500,
    "minimumStock": 800,
    "reorderLevel": 1200,
    "unitCost": 390
  }
  ```
- **Response `201`:** Created material document with derived status.

---

## 6. Inventory & Stock Movement API

### Get Inventory Transactions
- **Endpoint:** `GET /api/inventory/transactions`
- **Auth Required:** Yes
- **Query Parameters:** `limit` (default 50)
- **Response `200`:** Array of audit transactions sorted by `createdAt DESC`.

### Receive Stock (IN)
- **Endpoint:** `POST /api/inventory/receive`
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "materialId": "MAT-101",
    "quantity": 500,
    "unit": "bag",
    "reference": "PO-8821",
    "notes": "Bulk cement delivery batch from supplier."
  }
  ```
- **Response `201`:** Returns updated material and recorded transaction.

### Issue Stock to Site (OUT)
- **Endpoint:** `POST /api/inventory/issue`
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "materialId": "MAT-101",
    "quantity": 250,
    "unit": "bag",
    "reference": "ISS-19TH-FLOOR",
    "notes": "Issued for 19th floor column casting."
  }
  ```
- **Enforced Business Rules:**
  - Stock cannot become negative. Returns `400` if requested quantity > current stock.
- **Response `200`:** Returns updated material and recorded transaction.

### Adjust Stock (ADJUSTMENT)
- **Endpoint:** `POST /api/inventory/adjust`
- **Auth Required:** Yes (Role: `Admin`, `Project Manager`, `Procurement Manager`)
- **Request Body:**
  ```json
  {
    "materialId": "MAT-101",
    "newStock": 480,
    "reference": "AUDIT-SEP-26",
    "notes": "Physical inventory count adjustment: 20 bags damaged."
  }
  ```
- **Response `200`:** Returns adjusted material and recorded transaction.

---

## 7. Material Requests API

### Get Material Requests
- **Endpoint:** `GET /api/material-requests`
- **Auth Required:** Yes
- **Query Parameters:** `status` (`Pending`, `Approved`, `Rejected`, `Fulfilled`), `project`

### Create Material Request
- **Endpoint:** `POST /api/material-requests`
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "materialName": "Fe 500D 16mm TMT Rebar",
    "projectId": "PRJ-101",
    "projectName": "Skyline Heights",
    "quantity": 15,
    "unit": "ton",
    "notes": "Required for 19th floor slab fabrication."
  }
  ```
- **Response `201`:** Created material request document.

### Update Request Status
- **Endpoint:** `PUT /api/material-requests/:id`
- **Auth Required:** Yes (Role: `Admin`, `Project Manager`, `Procurement Manager`)
- **Request Body:**
  ```json
  {
    "status": "Approved",
    "reviewNotes": "Approved for vendor purchase order release."
  }
  ```
- **Enforced Business Rules:**
  - Transition validation: Terminal statuses cannot revert to `Pending`.
- **Response `200`:** Updated material request document.
