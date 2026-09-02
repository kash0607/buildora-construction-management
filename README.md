# BUILDORA — Construction & Project Operations Management Platform

## 1. Project Overview

BUILDORA is an Enterprise SaaS platform for managing construction project operations.

The project is based on the internship specification and is intended to cover:

- Project planning and project management
- Tasks and milestones
- Daily site reports
- Site issues
- Material and inventory management
- Vendors and procurement
- Purchase requests, approvals and purchase orders
- Delivery/receiving workflows
- Expenses, invoices and budget tracking
- Documents
- Client-facing project progress
- Notifications
- Audit logs
- Analytics
- Role-based access control

The current repository is **Phase 1: Frontend Prototype / UI Foundation**.

The frontend has been built using:

- HTML5
- CSS3
- Vanilla JavaScript
- Chart.js CDN for dashboard charts
- Browser `localStorage` for temporary mock persistence

> **Important:** The current project is NOT connected to MongoDB yet and does NOT have the real Node.js/Express backend yet.

---

# 2. Current Team

| Member | Current/Planned Responsibility |
|---|---|
| Kashish | Frontend + Full Stack coordination |
| Shreya | Node.js/Express Backend + Testing |
| Jitesh | Backend business logic, architecture, algorithms + Node.js learning |
| Zaara | Frontend modules and responsive UI |

The backend work should be divided so that Jitesh can use his Java knowledge for business rules, workflows and architecture while gradually implementing those concepts in Node.js/Express.

---

# 3. Current Project Structure

```text
Buildora/
│
├── index.html
├── login.html
├── register.html
├── server.js
│
├── css/
│   ├── components.css
│   ├── dashboard.css
│   ├── forms.css
│   ├── layout.css
│   ├── projects.css
│   ├── responsive.css
│   └── style.css
│
├── js/
│   ├── api.js
│   ├── auth.js
│   ├── components.js
│   ├── dashboard.js
│   ├── main.js
│   ├── mock-data.js
│   ├── project-details.js
│   └── projects.js
│
└── pages/
    ├── dashboard.html
    ├── projects.html
    └── project-details.html
```

---

# 4. What Has Already Been Completed

## A. Authentication UI

Completed:

- Login page
- Registration page
- Password visibility toggle
- Demo login personas
- Basic client-side validation
- Session simulation using localStorage
- Role/persona simulation

### Current limitation

Authentication is currently only a frontend demo.

The file `js/auth.js` contains demo users and a demo password. It must NOT be considered production authentication.

The final system must use:

```text
React/Frontend
      ↓
Node.js + Express
      ↓
JWT/session authentication
      ↓
MongoDB
```

with secure password hashing such as bcrypt.

---

# 5. Dashboard — Completed

The dashboard currently contains:

### KPIs

- Active Projects
- Total Budget
- Budget Used
- Pending Approvals
- Overdue Tasks
- Low Stock Materials

### Analytics

- Monthly Budget vs Actual Expenditure
- Project Portfolio Health

### Operational sections

- Priority Construction Projects
- Recent Site Activity
- Urgent Approvals
- Upcoming Milestones
- Critical Low Stock Materials

The dashboard currently uses mock data from:

```text
js/mock-data.js
```

and the frontend service abstraction:

```text
js/api.js
```

---

# 6. Projects Module — Frontend Completed

The following frontend screens are currently present:

```text
pages/projects.html
pages/project-details.html
```

and their JavaScript/CSS:

```text
js/projects.js
js/project-details.js
css/projects.css
```

## Projects Directory

Current features include:

- Project cards
- Table view
- Search
- Status filtering
- Manager filtering
- Location filtering
- Clear filters
- Create Project modal
- Edit project
- Archive project
- Project progress
- Budget
- Deadline
- Client
- Location
- Project manager
- Project status

## Project Details

Current project workspace includes:

- Project overview
- Progress information
- Budget information
- Timeline information
- Team information
- Issues
- Recent activity
- Project tabs for:
  - Tasks
  - Milestones
  - Team
  - Materials & BOQ
  - Procurement
  - Expenses
  - Documents
  - Site Reports

Some of these tabs are currently placeholders and need to be implemented later.

---

# 7. Current Data Architecture

The project currently has:

```text
mock-data.js
      ↓
api.js
      ↓
localStorage
      ↓
HTML + Vanilla JS UI
```

`api.js` is an abstraction layer prepared for future backend APIs.

For example, it currently has methods such as:

```text
getProjects()
getProject()
createProject()
updateProject()
archiveProject()
getUpcomingMilestones()
getPendingApprovals()
getRecentSiteReports()
getLowStockMaterials()
getAnalyticsSummary()
```

At the moment these methods read/write browser `localStorage`.

## This means:

### Current

```text
Frontend
   ↓
api.js
   ↓
localStorage/mock-data
```

### Final target

```text
Frontend
   ↓
REST API
   ↓
Node.js + Express
   ↓
Mongoose
   ↓
MongoDB
```

---

# 8. Is MongoDB Connected?

## NO — MongoDB is NOT connected yet.

There is currently:

- No MongoDB connection
- No Mongoose setup
- No Express API
- No real database models
- No `.env` database configuration
- No backend authentication
- No real API persistence

The current `server.js` is only a very small static HTTP file server.

It serves HTML/CSS/JS files but is not an Express application.

This is intentional for the current frontend prototype phase.

---

# 9. Requirement Status

Based on the project specification, the current state is:

| Requirement | Current Status |
|---|---|
| Responsive frontend | 🟢 Partially/Mostly complete |
| Dashboard | 🟢 Frontend complete |
| Project creation | 🟢 Mock frontend complete |
| Project listing/filtering | 🟢 Frontend complete |
| Project details | 🟢 Frontend foundation complete |
| Tasks | 🟡 Not implemented yet |
| Task dependencies | 🔴 Not implemented |
| Gantt-style timeline | 🔴 Not implemented |
| Milestones | 🟡 Placeholder/mock data |
| Daily site reports | 🟡 Dashboard feed only |
| Photo uploads | 🔴 Not implemented |
| Issue reporting | 🟡 Mock project issue data |
| Materials | 🟡 Mock dashboard data |
| Inventory | 🟡 Mock dashboard data |
| Low-stock alerts | 🟡 Mock frontend |
| Vendors | 🔴 Not implemented |
| Purchase requests | 🟡 Mock dashboard action |
| Approval workflow | 🟡 Mock approve/reject |
| Purchase orders | 🔴 Not implemented |
| Deliveries/receiving | 🔴 Not implemented |
| Quantity/quality checks | 🔴 Not implemented |
| Expenses | 🟡 Dashboard/mock data |
| Invoices | 🔴 Not implemented |
| Client payments | 🔴 Not implemented |
| Budget utilization | 🟡 Dashboard/mock calculation |
| Documents | 🔴 Not implemented |
| Client portal | 🔴 Not implemented |
| Notifications | 🔴 Not implemented |
| Audit logs | 🔴 Not implemented |
| Analytics | 🟡 Dashboard charts/mock data |
| Authentication | 🟡 Demo frontend only |
| RBAC | 🟡 Demo role switching only |
| JWT/session security | 🔴 Not implemented |
| Password hashing | 🔴 Not implemented |
| Secure file uploads | 🔴 Not implemented |
| Socket.IO/WebSockets | 🔴 Not implemented |
| Sandbox payments | 🔴 Not implemented |
| Node.js/Express backend | 🔴 Not implemented |
| MongoDB/Mongoose | 🔴 Not implemented |
| API documentation | 🔴 Not implemented |
| Automated testing | 🔴 Not implemented |
| Production deployment | 🔴 Not implemented |

### Overall assessment

The current work is a **strong frontend foundation**, but it is not yet a complete implementation of the internship specification.

The major next step is to build the backend and then connect the existing UI to real APIs.

---

# 10. IMPORTANT FRONTEND NOTE

The original specification expects a React frontend.

The current implementation uses:

```text
HTML + CSS + Vanilla JavaScript
```

This should be confirmed with the mentor/supervisor.

If React is mandatory, the existing UI should be migrated into React components rather than continuing to build a large Vanilla JS application.

If Vanilla JS is accepted, the current architecture can continue.

---

# 11. Work To Assign Now

The team should work in parallel.

## KASHISH — Frontend Lead / Integration

Continue:

### Module 1 — Tasks & Milestones

Build:

```text
pages/tasks.html
js/tasks.js
css/tasks.css
```

Features:

- Task list
- Create task
- Edit task
- Delete/archive task
- Task status
- Priority
- Assignee
- Start date
- Due date
- Progress
- Project filter
- Search
- Milestone list
- Create milestone
- Milestone status
- Dependency display
- Overdue highlighting

Then add:

- Kanban view
- Gantt-style timeline

Keep the same existing BUILDORA design system.

---

# 12. SHREYA — Node.js/Express Backend

Shreya should start the real backend.

Create:

```text
backend/
├── server.js
├── app.js
├── config/
│   └── db.js
├── models/
├── controllers/
├── routes/
├── middleware/
├── services/
└── utils/
```

First implement:

### Database

- MongoDB connection
- Mongoose
- Environment variables
- Connection error handling

### Authentication

- Register
- Login
- Password hashing
- JWT
- Authentication middleware
- Logout/session handling as required

### First API modules

Start with:

```text
POST   /api/auth/register
POST   /api/auth/login

GET    /api/projects
GET    /api/projects/:id
POST   /api/projects
PUT    /api/projects/:id
DELETE /api/projects/:id
```

Then:

```text
GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
```

---

# 13. JITESH — Backend Business Logic / Architecture

Jitesh should work closely with Shreya.

His Java knowledge should be used for designing and implementing business rules.

Start with:

## A. Project business rules

Examples:

- Project status transitions
- Project progress calculation
- Deadline/overdue calculation
- Budget utilization calculation
- Project team assignment rules

## B. Task business rules

Examples:

- Task dependency validation
- Prevent completing a task if required dependencies are incomplete
- Overdue task calculation
- Project progress based on completed tasks

## C. Approval workflow

Design:

```text
Purchase Request
       ↓
Submitted
       ↓
Pending Approval
       ↓
Approved / Rejected
       ↓
Purchase Order
       ↓
Delivery
       ↓
Received
```

Create the business rules and validation for each state.

## D. Inventory logic

Design:

```text
Opening Stock
    +
Received Quantity
    -
Issued Quantity
    =
Current Stock
```

Also handle:

- Low-stock threshold
- Stock movement history
- Material request validation

Jitesh can first design these as clear service functions/classes, then implement them in Node.js.

---

# 14. ZAARA — Frontend Modules

Zaara should start building the next independent frontend modules.

Priority:

### Module 1 — Site Reports

Create:

```text
pages/site-reports.html
js/site-reports.js
css/site-reports.css
```

Features:

- Select project
- Report date
- Weather
- Workers present
- Work completed
- Work progress
- Issues encountered
- Notes
- Photo upload UI
- Report history
- View report details

### Module 2 — Issues

Create:

```text
pages/issues.html
js/issues.js
css/issues.css
```

Features:

- Issue list
- Project
- Title
- Description
- Priority
- Status
- Assignee
- Date
- Create issue
- Update status
- Search/filter

Use existing shared components.

---

# 15. AFTER THE FIRST MODULES

Once the first parallel work is complete, continue with:

## Frontend

```text
Tasks & Milestones
        ↓
Site Reports
        ↓
Issues
        ↓
Materials & Inventory
        ↓
Vendors
        ↓
Purchase Requests
        ↓
Approvals
        ↓
Purchase Orders
        ↓
Deliveries
        ↓
Expenses
        ↓
Invoices
        ↓
Documents
        ↓
Client Portal
        ↓
Analytics
        ↓
Notifications
        ↓
Audit Logs
        ↓
Settings
```

---

# 16. Backend Database Models

The final MongoDB database should eventually contain models similar to:

```text
User
Organization
Project
Task
Milestone
SiteReport
Issue
Material
InventoryTransaction
Vendor
PurchaseRequest
Approval
PurchaseOrder
Delivery
Expense
Invoice
Payment
Document
Notification
AuditLog
```

Relationships should be designed carefully.

For example:

```text
Project
 ├── Tasks
 ├── Milestones
 ├── Site Reports
 ├── Issues
 ├── Materials
 ├── Purchase Requests
 ├── Purchase Orders
 ├── Deliveries
 ├── Expenses
 ├── Documents
 └── Team Members
```

---

# 17. Role-Based Access Control

The system needs real RBAC.

Main roles from the current project:

```text
Admin
Project Manager
Site Supervisor
Procurement Manager
Finance
Client
Vendor
```

Example permissions:

### Admin

Full access.

### Project Manager

- Projects
- Tasks
- Milestones
- Site reports
- Issues
- Approvals
- Project documents
- Project analytics

### Site Supervisor

- Site reports
- Issues
- Material requests
- Delivery receiving

### Procurement Manager

- Vendors
- Purchase requests
- Purchase orders
- Deliveries

### Finance

- Expenses
- Invoices
- Payments
- Budgets

### Client

Read-only:

- Project progress
- Approved photos
- Milestones
- Approved documents

### Vendor

- Assigned purchase orders
- Dispatch information
- Delivery updates

These permissions must eventually be enforced on the backend, not only hidden in the frontend.

---

# 18. Git Workflow

Everyone should work using branches.

Example:

```text
main
develop

feature/tasks-module
feature/site-reports
feature/backend-auth
feature/project-api
feature/inventory
feature/procurement
```

Do NOT directly push unfinished work to `main`.

Recommended process:

```text
Create branch
     ↓
Develop
     ↓
Test locally
     ↓
Commit
     ↓
Push branch
     ↓
Pull Request
     ↓
Code review
     ↓
Merge
```

Commit examples:

```text
feat: add task management UI
feat: add project API
feat: add MongoDB connection
fix: correct project filter
test: add authentication tests
```

---

# 19. Integration Rule

Frontend should communicate with backend through `js/api.js` or its future React API/service layer.

Do NOT put MongoDB queries directly into frontend code.

Correct:

```text
Frontend
   ↓
API service
   ↓
Express route
   ↓
Controller
   ↓
Service/business logic
   ↓
Mongoose model
   ↓
MongoDB
```

Incorrect:

```text
Frontend
   ↓
MongoDB
```

---

# 20. Immediate Priority

The team should NOT try to build every page at once.

### Current priority:

```text
1. Tasks & Milestones       → Kashish
2. Site Reports             → Zaara
3. Issues                   → Zaara
4. MongoDB + Express setup  → Shreya
5. Auth + JWT               → Shreya
6. Business rules           → Jitesh
7. Project APIs             → Shreya + Jitesh
8. Connect Projects UI      → Kashish
```

After this:

```text
Materials + Inventory
Procurement
Approvals
Purchase Orders
Deliveries
Finance
Documents
Client Portal
Notifications
Audit Logs
Analytics
Testing
Deployment
```

---

# 21. Definition of Done

A module is NOT considered complete just because its HTML page looks finished.

Each module should eventually have:

- UI
- Form validation
- Backend API
- MongoDB model
- CRUD operations where applicable
- Authorization
- Error handling
- Loading states
- Empty states
- Responsive design
- Testing
- API documentation
- Git branch/PR

For example, "Projects" is finally complete only when:

```text
Projects UI
    +
Project API
    +
Project MongoDB model
    +
Authentication
    +
RBAC
    +
Validation
    +
Error handling
    +
Testing
```

are working together.

---

# 22. Current Demo Flow

The current frontend can demonstrate:

```text
Login
  ↓
Dashboard
  ↓
Projects
  ↓
Project Details
  ↓
Project Overview
```

The intended final demonstration should become:

```text
Login
  ↓
Dashboard
  ↓
Project
  ↓
Task / Milestone
  ↓
Daily Site Report
  ↓
Issue / Material Shortage
  ↓
Purchase Request
  ↓
Approval
  ↓
Purchase Order
  ↓
Delivery
  ↓
Inventory Update
  ↓
Expense
  ↓
Budget
  ↓
Client Progress
  ↓
Analytics / Audit Log
```

This single workflow should demonstrate how the major modules of BUILDORA work together.

---

# 23. Important Rules For Everyone

1. Do not delete or rewrite existing working modules without discussing it with the team.
2. Reuse the existing BUILDORA design system.
3. Do not create duplicate CSS/components when an existing component can be reused.
4. Keep frontend and backend responsibilities separate.
5. Do not hard-code real database credentials.
6. Use `.env` for secrets.
7. Never store plain-text passwords in the final system.
8. Do not rely on frontend-only RBAC for security.
9. Every API should validate input.
10. Every important operation should eventually be recorded in the audit log.
11. Test your module before opening a PR.
12. Keep mock data only until the corresponding real API is ready.
13. Use realistic INR/Indian construction data for the demo.
14. Keep the interface responsive for desktop, tablet and mobile.

---

# 24. Current Phase

## Phase 1 — Frontend Foundation

**Status: In progress / largely established**

Completed:

- Branding
- Login/Register UI
- Shared layout
- Sidebar
- Navbar
- Dashboard
- Dashboard charts
- Projects directory
- Project details foundation
- Mock data
- Frontend API abstraction

## Phase 2 — Core Backend

**Next**

- Node.js
- Express
- MongoDB
- Mongoose
- Authentication
- JWT
- RBAC
- Project API
- Task API
- Validation
- Error handling

## Phase 3 — Operational Modules

- Site reports
- Issues
- Materials
- Inventory
- Procurement
- Deliveries

## Phase 4 — Finance & Client

- Expenses
- Invoices
- Payments
- Budget
- Documents
- Client portal

## Phase 5 — Advanced Engineering

- Notifications
- Socket.IO/WebSockets where needed
- Audit logs
- Analytics
- Secure uploads
- Approval workflows
- Testing
- Deployment

---

# 25. Final Goal

BUILDORA should become a real multi-role construction operations platform rather than only a static frontend.

The final architecture should be:

```text
                    BUILDORA
                       │
             ┌─────────┴─────────┐
             │                   │
         Frontend             Backend
             │                   │
       React / UI          Node.js + Express
             │                   │
             └─────────┬─────────┘
                       │
                    REST API
                       │
                  Business Logic
                       │
                    Mongoose
                       │
                    MongoDB
                       │
       ┌───────────────┼────────────────┐
       │               │                │
      Auth           RBAC           Audit Logs
       │               │                │
       └───────────────┼────────────────┘
                       │
              Construction Modules
                       │
     Projects / Tasks / Site / Materials
     Procurement / Finance / Documents
     Client Portal / Analytics
```

**Current repository = frontend prototype + mock/localStorage data.**

**Next major milestone = real Node.js/Express + MongoDB backend and frontend API integration.**
