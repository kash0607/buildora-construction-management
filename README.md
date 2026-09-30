# BUILDORA — Enterprise Construction & Operations Management Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/kash0607/buildora-construction-management)
[![E2E Verification](<https://img.shields.io/badge/E2E%20Lifecycle-100%25%20Verified-blue.svg>)](https://github.com/kash0607/buildora-construction-management)
[![API Tests](<https://img.shields.io/badge/API%20%26%20Unit%20Tests-34%2F34%20Passed-success.svg>)](https://github.com/kash0607/buildora-construction-management)
[![Node](<https://img.shields.io/badge/node-%3E%3D20.0.0-informational.svg>)](https://nodejs.org/)
[![Database](<https://img.shields.io/badge/database-MongoDB%20Mongoose-green.svg>)](https://www.mongodb.com/)

**Buildora** is a client-ready, multi-role construction operations platform built with React 19, Vite, Node.js/Express, and MongoDB. It centralizes real-time field operations, material supply chains, site audits, subcontractor workflows, financial cost controls, and sanitized client progress tracking into a single source of truth.

---

## 1. System Architecture

```
                                  BUILDORA PLATFORM
                                          │
       ┌──────────────────────────────────┴──────────────────────────────────┐
       ▼                                                                     ▼
[React 19 + Vite Frontend]                                        [Express 5 REST API]
• Architectural Warm-Neutral Design System                       • Strict JWT Authentication & Session Hydration
• Dynamic Role-Aware Navigation                                  • RBAC Boundary Middleware (403 Gateways)
• Live Chart.js & Framer Motion Visualizations                   • Rate Limiting & Helmet Security Headers
• Zero Tailwind — Pure Flexible Vanilla CSS Tokens               • Business Rule Service Layer
       │                                                                     │
       │  (JSON REST via /api with Bearer JWT)                               │
       └──────────────────────────────────┬──────────────────────────────────┘
                                          ▼
                             [Mongoose 9.x Data Layer]
             ┌────────────────────────────┼────────────────────────────┐
             ▼                            ▼                            ▼
      [Core Operations]             [Procurement]                  [Finance]
      • User (7 Roles)              • Vendor                       • Expense
      • Project                     • PurchaseRequest              • Invoice
      • Task (DAG Dependencies)     • PurchaseOrder                • Payment (Reconciliation)
      • Milestone                   • Delivery (GRN & Stock Sync)  • Live Budget Utilization
      • SiteReport (Photos)         • InventoryTransaction
      • Material & Stock            • Document (Client Visible)
             │
             ▼
      [MongoDB Database: localhost/buildora]
```

---

## 2. Seeded User Credentials (7 Platform Roles)

The platform enforces strict backend Role-Based Access Control (RBAC). All 7 roles can be tested using the seeded credentials below:

| Role                           | Seeded Email                 | Password         | Primary Permissions & Capabilities                                    |
| :----------------------------- | :--------------------------- | :--------------- | :-------------------------------------------------------------------- |
| **Admin**                | `admin@buildora.com`       | `Password123!` | System administration, audit logs, all operational overrides          |
| **Project Manager**      | `pm@buildora.com`          | `Password123!` | Projects, task DAGs, milestones, daily site review, budget tracker    |
| **Site Supervisor**      | `supervisor@buildora.com`  | `Password123!` | Site reports, issue escalation, material requisitions, GRN receipts   |
| **Procurement Manager**  | `procurement@buildora.com` | `Password123!` | Vendor catalogs, RFQs, PR approval, PO issuance, deliveries           |
| **Finance Officer**      | `finance@buildora.com`     | `Password123!` | Expense approvals, client billing invoices, payment reconciliation    |
| **Client**               | `client@buildora.com`      | `Password123!` | Read-only executive dashboard: milestones, approved site photos, docs |
| **Vendor Subcontractor** | `vendor@apexsteel.com`     | `Password123!` | Vendor portal: assigned purchase orders, dispatch status, invoices    |

---

## 3. Implemented Modules & Business Rules

### 1. Authentication & Session Hydration (P0, P2)

- State hydration strictly from backend `/api/auth/me` on browser refresh.
- No client-side mock role swapping; genuine JWT tokens stored in localStorage.
- Role-scoped sidebar rendering dynamically configured from `src/config/navigation.js`.

### 2. Design System Components (P1)

Shared reusable UI library with warm stone/beige architectural aesthetics:

- `PageHeader`, `SectionHeader`, `StatCard`
- `DataTable`, `SearchBar`, `FilterBar`, `Pagination`
- `StatusBadge`, `PriorityBadge`
- `ConfirmDialog`, `FormModal`, `Drawer`
- `LoadingState`, `EmptyState`, `ErrorState`
- Standardized currency, date, and unit formatters in `src/utils/formatters.js`.

### 3. Project Management & Task DAGs

- Project creation, editing, status tracking, and worker counts.
- Task DAG dependency engine with circular dependency detection ($A \to B \to A$) and self-dependency prevention.
- Automatic task state normalization (100% progress $\leftrightarrow$ Completed).
- Milestones tracking linked to project schedules.

### 4. Site Operations & Photo Approvals (P7, P8)

- Daily site reports tracking weather, workers present, safety observations, and work completed.
- Site photo uploads with metadata (uploader, timestamp, caption).
- Multi-step photo review: site photos remain internal until a Project Manager or Admin marks them `clientApproved: true`.

### 5. Inventory & Materials

- Material catalog with real-time stock status (`In Stock`, `Low Stock`, `Out of Stock`).
- Automated stock movement auditing via `InventoryTransaction` (`IN`, `OUT`, `ADJUSTMENT`).
- Strict negative-stock prevention rules.

### 6. Procurement & Delivery Sync (P3, P4)

- **Vendors**: Catalog management with categories and performance ratings.
- **Purchase Requests (PR)**: Raised by site supervisors, reviewed and converted to POs.
- **Purchase Orders (PO)**: Line-item calculations with GST tax rates.
- **Deliveries (GRN)**: Partial delivery tracking (`Ordered`, `Received`, `Accepted`, `Rejected`).
- **Automated Inventory Sync**: Accepting delivery items automatically increments material stock and creates audit transactions. Prevents duplicate receiving or receiving against closed orders.

### 7. Finance & Live Budget Utilization (P5)

- **Expenses**: Project cost tracking with categorized expenses and approvals.
- **Invoices**: Client and subcontractor progress billing with automated GST calculation.
- **Payments**: Bank transfer, NEFT, RTGS, and cheque payment reconciliation.
- **Live Budget Utilization**: Calculates `budgetUtilization = ((actualCost + committedPO) / budget) * 100` dynamically, preventing division by zero.

### 8. Document Management & Access Control (P6)

- Blueprint, CAD, contract, specification, and safety sheet cataloging.
- Multi-tiered access visibility: `Internal`, `Client Visible`, `Vendor Visible`.

### 9. Client Portal (P7)

- **Zero Data Leakage**: Sanitized endpoints explicitly omit contractor cost margins, internal expenses, site supervisor issue logs, and material stock balances.
- Displays executive milestone progress, client-approved site photos, and client-visible architectural drawings.

### 10. Vendor Workspace (P9)

- Dedicated vendor dashboard scoped strictly to purchase orders assigned to the authenticated vendor account.

### 11. Notifications & Audit Logs (P10, P11)

- In-app notification center with read/unread tracking and filter tabs.
- Enterprise audit trail recording system-wide administrative actions, timestamps, and IP origins.

---

## 4. API Endpoints Overview

| Area                   | Method    | Endpoint                                      | Allowed Roles                      | Description                        |
| :--------------------- | :-------- | :-------------------------------------------- | :--------------------------------- | :--------------------------------- |
| **Auth**         | `POST`  | `/api/auth/register`                        | Public                             | Register new user account          |
|                        | `POST`  | `/api/auth/login`                           | Public                             | Authenticate and receive JWT       |
|                        | `GET`   | `/api/auth/me`                              | Authenticated                      | Restore current session profile    |
| **Projects**     | `GET`   | `/api/projects`                             | All roles                          | List projects                      |
|                        | `POST`  | `/api/projects`                             | Admin, PM                          | Create new construction project    |
|                        | `GET`   | `/api/projects/:id`                         | All roles                          | Project details and financials     |
| **Tasks**        | `GET`   | `/api/tasks`                                | All internal                       | Search and filter tasks            |
|                        | `POST`  | `/api/tasks`                                | Admin, PM, Supervisor              | Create task with dependency checks |
| **Site Reports** | `POST`  | `/api/site-reports`                         | Admin, PM, Supervisor              | Submit daily field report          |
|                        | `POST`  | `/api/site-reports/:id/photos`              | Admin, PM, Supervisor              | Attach site inspection photo       |
|                        | `PATCH` | `/api/site-reports/:id/photos/:pId/approve` | Admin, PM                          | Approve photo for client portal    |
| **Procurement**  | `GET`   | `/api/procurement/orders`                   | Internal + Vendor                  | View purchase orders               |
|                        | `POST`  | `/api/procurement/orders`                   | Admin, PM, Procurement             | Issue new purchase order           |
|                        | `POST`  | `/api/procurement/deliveries`               | Admin, PM, Procurement, Supervisor | Record GRN & sync inventory stock  |
| **Finance**      | `POST`  | `/api/finance/expenses`                     | Admin, PM, Finance, Supervisor     | Record construction site expense   |
|                        | `POST`  | `/api/finance/invoices`                     | Admin, PM, Finance                 | Generate client progress invoice   |
|                        | `POST`  | `/api/finance/payments`                     | Admin, Finance                     | Reconcile payment receipt          |
|                        | `GET`   | `/api/finance/budget-utilization`           | Admin, PM, Finance                 | Compute live financial metrics     |
| **Documents**    | `POST`  | `/api/documents`                            | Admin, PM, Procurement, Finance    | Upload and categorize document     |
| **Client**       | `GET`   | `/api/client/projects/:id`                  | Client, Admin, PM                  | Sanitized executive progress view  |
| **Audit Logs**   | `GET`   | `/api/audit-logs`                           | Admin                              | Security audit trail               |

---

## 5. Getting Started & Installation

### Prerequisites

- **Node.js**: v20.0.0 or higher
- **MongoDB**: Local running instance (`mongodb://localhost:27017/buildora`) or MongoDB Atlas URI

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/kash0607/buildora-construction-management.git
cd buildora-construction-management
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```ini
PORT=5000
MONGODB_URI=mongodb://localhost:27017/buildora
JWT_SECRET=buildora_enterprise_jwt_super_secret_key_2026_secure
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Seed Database

Populates standard mock projects, materials, tasks, vendors, and seeded accounts:

```bash
npm run seed
```

### 4. Run Development Servers

Start both the Node.js Express backend and Vite React frontend concurrently:

```bash
npm run dev:all
```

- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api`

---

## 6. Verification & Test Suite

Buildora includes automated test coverage across business rules, API security, and an end-to-end multi-persona lifecycle suite.

### Run Unit & Business Rules Test Suite

Executes 34 native Node.js tests validating stock protection, DAG cycles, PO state machines, and 7-role RBAC matrices:

```bash
npm run test:backend
```

### Run End-to-End Enterprise Lifecycle Suite

Executes the comprehensive 19-step lifecycle simulating real API calls from Auth $\to$ Project $\to$ Task $\to$ Daily Report $\to$ Material $\to$ Vendor $\to$ PO $\to$ Partial & Full GRN Deliveries $\to$ Stock Sync $\to$ Expense $\to$ Client Invoice $\to$ Finance Payment $\to$ Budget Analytics $\to$ Client Portal Sanitization $\to$ 403 RBAC Boundaries:

```bash
npm run test:e2e
```

### Verify Production Build

```bash
npm run build
```

---

## 7. Project Structure

```
Buildora/
├── backend/
│   ├── config/             # DB and environment configuration
│   ├── controllers/        # Express request handlers
│   ├── middleware/         # Auth, RBAC boundary, error handler, rate limiter
│   ├── models/             # Mongoose schemas (User, Project, Task, Vendor, PO, etc.)
│   ├── routes/             # Express API routes
│   ├── scripts/            # Seed scripts and verify_e2e.js lifecycle suite
│   ├── services/           # Pure business rules engine (businessRules.js)
│   ├── tests/              # Node test runner unit and API tests
│   └── app.js              # Express app entrypoint
├── src/
│   ├── components/
│   │   ├── common/         # Uniform Design System (DataTable, StatCard, etc.)
│   │   └── layout/         # Dynamic Sidebar, Navbar, PageShell
│   ├── config/             # Navigation role-scoping matrix
│   ├── context/            # AuthContext, NotificationContext
│   ├── pages/              # 18+ application pages (Procurement, Finance, ClientPortal, etc.)
│   ├── services/           # Axios API client wrapper
│   └── utils/              # Currency, date, and unit formatters
├── dist/                   # Production build output
├── README.md               # Enterprise documentation
└── package.json            # Scripts & project manifest
```

---

## 8. License & Authors

Developed by **Kashish & Zaara** as part of the Buildora Construction Operations Management Initiative. Licensed under the ISC License.
