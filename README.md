# BUILDORA — Construction & Project Operations Management Platform

## 1. Project purpose

BUILDORA is an Enterprise SaaS / Project Operations / Resource Management platform for construction companies.

The internship brief requires the platform to cover project planning, tasks, milestones, site reports, materials, procurement, vendors, expenses, documents, approvals and client-facing progress. It also identifies approval workflows, resource allocation, budget logic, document permissions and operational traceability as key engineering challenges. fileciteturn1file0

The current repository is the **frontend foundation/prototype**. The real Node.js/Express backend and MongoDB/Mongoose database are the next major phase.

---

## 2. Team — 5 members

| Member            | Primary responsibility                      | Current sprint          |
| ----------------- | ------------------------------------------- | ----------------------- |
| **Kashish** | Frontend Lead + Full-Stack Integration      | Tasks & Milestones      |
| **Shreya**  | Node.js/Express + Database + Auth + Testing | Backend foundation      |
| **Jitesh**  | Backend Business Logic + Architecture       | Workflow/business rules |
| **Zaara**   | Frontend — Site Operations                 | Site Reports + Issues   |
| **Isika**   | Frontend — Resources/Procurement           | Materials + Inventory   |

The brief explicitly supports a 4–5 member team and says Java-focused students can contribute to backend architecture, business rules and algorithms while learning Node.js/Express. fileciteturn1file1

---

## 3. Current status

### Already implemented

- Login UI
- Registration UI
- Demo authentication/personas
- Shared layout/sidebar/navbar
- Responsive styling foundation
- Dashboard
- KPI cards
- Dashboard charts
- Project directory
- Project search/filtering
- Project card/table views
- Create/edit/archive project UI
- Project details foundation
- Mock construction data
- Frontend API abstraction through `js/api.js`
- LocalStorage-based demo persistence

### Current limitation

The current application is **not yet a real full-stack application**.

There is currently:

- No MongoDB connection
- No Mongoose models
- No Express REST API
- No real JWT authentication
- No production RBAC
- No secure file upload
- No automated testing
- No production deployment

The current `server.js` is only being used to serve the frontend.

---

# 4. Current architecture

### Current prototype

```text
HTML
CSS
Vanilla JavaScript
      ↓
   api.js
      ↓
mock-data.js / localStorage
```

### Target architecture

```text
Frontend
   ↓
REST API
   ↓
Node.js + Express
   ↓
Controllers / Services
   ↓
Mongoose
   ↓
MongoDB
```

The internship specification expects React on the frontend, Node.js/Express for backend, MongoDB/Mongoose for database, authentication/authorization, security, Git/GitHub, testing and deployment. fileciteturn1file1

**Important:** The current frontend uses HTML/CSS/Vanilla JS. Confirm with the mentor whether this is acceptable; if React is mandatory, the current UI should later be migrated into React components.

---

# 5. Planned modules

The specification's core scope is:

1. Projects
2. Tasks & Milestones
3. Site Reports
4. Issues
5. Materials
6. Inventory
7. Vendors
8. Purchase Requests
9. Approvals
10. Purchase Orders
11. Deliveries/Receiving
12. Expenses
13. Invoices
14. Client Payments
15. Budget Utilization
16. Documents
17. Client Portal
18. Notifications
19. Audit Logs
20. Analytics

These modules map directly to the construction platform requirements in the brief. fileciteturn1file0

---

# 6. One-month development plan

## WEEK 1 — Foundation + parallel module development

### Kashish

**Tasks & Milestones frontend**

Build:

- Tasks page
- Task CRUD UI
- Search/filter
- Status
- Priority
- Assignee
- Start/due dates
- Progress
- Overdue tasks
- Milestone UI

Branch:

```text
feature/tasks-milestones
```

### Shreya

**Backend foundation**

Build:

- Node.js/Express setup
- MongoDB/Mongoose connection
- `.env`
- User model
- Authentication foundation
- JWT
- Auth middleware
- Error-handling middleware
- Project model

Branch:

```text
feature/backend-foundation
```

### Jitesh

**Business rules**

Design/document and begin implementing:

- Project status rules
- Project progress calculation
- Task dependency rules
- Task completion rules
- Budget calculation rules

Branch:

```text
feature/business-logic
```

### Zaara

**Site Operations**

Build:

- Site Reports
- Report history
- Report details
- Issues page
- Issue creation/update
- Priority/status/filtering

Branch:

```text
feature/site-operations
```

### Isika

**Resources**

Build:

- Materials page
- Inventory page
- Stock list
- Stock status
- Low-stock alerts
- Material request UI
- Stock movement UI

Branch:

```text
feature/materials-inventory
```

### Week 1 target

By the end of Week 1:

```text
Frontend modules progressing
+
Express running
+
MongoDB connected
+
User model
+
Project model
+
Business rules documented
```

---

# WEEK 2 — Connect core modules

## Kashish

Complete:

- Task dependencies
- Kanban view
- Gantt-style timeline
- Milestone relationships
- Connect Projects/Tasks UI to API when APIs are ready

## Shreya

Implement:

```text
POST /api/auth/register
POST /api/auth/login

GET /api/projects
GET /api/projects/:id
POST /api/projects
PUT /api/projects/:id
DELETE /api/projects/:id

GET /api/tasks
GET /api/tasks/:id
POST /api/tasks
PUT /api/tasks/:id
DELETE /api/tasks/:id
```

Add:

- Request validation
- Protected routes
- JWT verification
- Proper error responses

## Jitesh

Implement backend services for:

- Project progress
- Task dependency validation
- Budget calculations
- Approval state rules

Example:

```text
Task A
   ↓
Task B
   ↓
Task C
```

Task B should not be allowed to complete/start in situations where the defined dependency rules prohibit it.

## Zaara

Finish:

- Site Reports
- Issues
- Photo upload UI
- Report/project relationships

Prepare frontend to consume API endpoints.

## Isika

Finish:

- Materials
- Inventory
- Stock movement
- Low-stock logic/UI
- Material request UI

Coordinate stock business rules with Jitesh.

### Week 2 target

```text
Projects
Tasks
Milestones
Site Reports
Issues
Materials
Inventory

        ↓

Connected to backend where APIs are ready
```

---

# WEEK 3 — Procurement + Finance + Client

## Kashish

Frontend:

- Procurement UI
- Purchase Requests
- Approvals
- Purchase Orders

Coordinate UI integration.

## Shreya

Backend:

- Vendor model/API
- Purchase Request API
- Approval API
- Purchase Order API
- Role authorization
- Validation

## Jitesh

Business logic:

### Procurement workflow

```text
Purchase Request
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
       ↓
Inventory Updated
```

### Delivery rules

Handle:

- Ordered quantity
- Received quantity
- Quality status
- Partial delivery
- Inventory update

## Zaara

Frontend:

- Documents
- Client Portal UI

Client portal should expose appropriate project information such as:

- Progress
- Approved photos
- Milestones
- Documents

## Isika

Frontend:

- Vendors
- Deliveries
- Receiving
- Quantity/quality checks

Coordinate inventory update behavior with backend.

### Week 3 target

```text
Procurement workflow
+
Inventory
+
Deliveries
+
Documents
+
Client Portal foundation
```

---

# WEEK 4 — Finance + Security + Testing + Deployment

## Kashish

- Finish dashboard integration
- Connect frontend to real APIs
- Fix responsive issues
- UI consistency
- Final user flow
- Demo preparation

## Shreya

- Expenses
- Invoices
- Payments where applicable
- Final authentication
- RBAC
- API validation
- Security
- Testing
- Deployment configuration

The brief expects authentication/authorization, protected APIs, secure uploads and rate limiting. fileciteturn1file1

## Jitesh

- Finalize business rules
- Approval workflows
- Budget logic
- Inventory calculations
- Audit-event logic
- Edge cases
- Backend testing support

## Zaara

- Final responsive testing
- Client portal polish
- Documents UI
- Notifications UI
- Accessibility/usability fixes

## Isika

- Analytics UI
- Inventory analytics
- Procurement analytics
- Low-stock dashboard
- Final procurement testing

### Final Week common work

Everyone:

- Test assigned modules
- Fix bugs
- Review PRs
- Update documentation
- Prepare demo data
- Verify complete workflow
- Help with deployment

The brief specifically expects Git/GitHub, branches, pull requests, reviews, API documentation and testing, followed by production deployment/environment configuration. fileciteturn1file1

---

# 7. GitHub workflow

Repository:

```text
buildora-construction-management
```

Branches:

```text
main
develop
```

Feature branches:

```text
feature/tasks-milestones
feature/backend-foundation
feature/business-logic
feature/site-operations
feature/materials-inventory
```

Workflow:

```text
Feature branch
      ↓
Commit
      ↓
Push
      ↓
Pull Request
      ↓
develop
      ↓
Testing
      ↓
main
```

**Never directly push unfinished work to `main`.**

---

# 8. Database plan

Planned MongoDB/Mongoose models:

```text
User
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

Relationships should be designed around the Project.

Example:

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
 └── Team
```

---

# 9. RBAC plan

Potential roles:

```text
Admin
Project Manager
Site Supervisor
Procurement Manager
Finance
Client
Vendor
```

Permissions must eventually be enforced by the backend, not only by hiding frontend buttons.

Examples:

### Project Manager

- Projects
- Tasks
- Milestones
- Site reports
- Issues
- Project documents
- Project analytics

### Site Supervisor

- Site reports
- Issues
- Material requests
- Delivery receiving

### Procurement

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

Read-only project progress, approved photos, milestones and documents.

---

# 10. Security requirements

Before final submission:

- Password hashing
- JWT/session strategy
- Protected APIs
- Backend RBAC
- Input validation
- Rate limiting
- Secure file uploads
- Environment variables
- No secrets committed to GitHub
- Proper error handling
- Audit logs

Never commit:

```text
.env
MongoDB passwords
JWT secrets
API keys
```

Use:

```text
.env.example
```

for required variable names.

---

# 11. Definition of Done

A frontend page is **not** considered fully complete just because the UI looks finished.

A module should eventually have:

```text
UI
+
Validation
+
Backend API
+
MongoDB model
+
CRUD/business logic
+
Authentication
+
Authorization
+
Error handling
+
Loading/empty states
+
Responsive design
+
Testing
+
Documentation
```

---

# 12. Final demo workflow

The final presentation should demonstrate one connected construction workflow:

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
Analytics / Audit
```

This is better than demonstrating unrelated pages because it shows the platform operating as one system.

---

# 13. Important team rules

1. Reuse existing BUILDORA design components.
2. Do not rewrite another person's module without discussing it.
3. Do not create duplicate components unnecessarily.
4. Keep frontend and backend separated.
5. Use `api.js`/service layer for API communication.
6. Never connect frontend directly to MongoDB.
7. Do not store real passwords in source code.
8. Do not rely on frontend-only authorization.
9. Validate all important API input.
10. Test before opening a PR.
11. Keep mock data until the corresponding API is available.
12. Use realistic Indian/INR construction data.
13. Keep desktop/tablet/mobile responsive.
14. Communicate before changing shared architecture.

---

# 14. Current immediate assignments

## Kashish

```text
Tasks & Milestones
```

## Shreya

```text
Node.js
Express
MongoDB
Mongoose
Authentication
JWT
Project APIs
```

## Jitesh

```text
Business rules
Approval workflow
Budget logic
Task dependencies
Inventory logic
Backend architecture
```

## Zaara

```text
Site Reports
Issues
```

## Isika

```text
Materials
Inventory
```

---

# 15. One-month success criteria

By the end of the month, the goal is to have a working production-style prototype with:

- Real authentication
- Real MongoDB persistence
- Core project/task management
- Site operations
- Materials/inventory
- Procurement workflow
- Approvals
- Deliveries
- Finance foundation
- Documents/client portal foundation
- RBAC
- Audit/notification/analytics foundation
- Testing
- GitHub collaboration
- Deployment

Not every advanced feature needs to be equally deep, but the core workflow should work end-to-end and demonstrate the engineering requirements of the brief.

---

## Reference to project brief

The official project brief defines the core construction scope and engineering expectations used for this roadmap. fileciteturn1file0turn1file1
