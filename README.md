# BUILDORA

### Construction Project & Operations Management Platform

[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Bundler-Vite%206-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Backend-Express%205-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**BUILDORA** is a modern, full-stack construction operations platform designed to help teams manage projects, track field activities, monitor progress, control inventory, and streamline approvals in one unified workspace.

It replaces fragmented communication, manual spreadsheets, and disconnected site diaries with a clean, centralized system accessible to both field personnel and executive management.

---

## What Problem Does BUILDORA Solve?

Construction projects often suffer from schedule delays, budget overruns, unrecorded field issues, and untracked material usage. Information is often scattered across chat groups, paper logs, and disparate files.

BUILDORA provides a single source of truth that connects jobsites with head-office project controllers:
- **Centralized Project Oversight**: View health, timelines, and budgets across your entire project portfolio.
- **Field-to-Office Traceability**: Capture daily logs, safety issues, and material requisitions directly from the site.
- **Governance & Approvals**: Ensure requisitions and milestone completions pass through verified review workflows.

---

## System Architecture

BUILDORA is built on a clean full-stack architecture with a React single-page application communicating with an Express REST API:

```text
React 19 Frontend (Vite)
          │
          ▼  REST API (JWT Bearer Auth)
Express 5 Backend (Node.js)
          │
          ▼  Mongoose 9 ODM
   MongoDB Database
```

For complete endpoint contracts, request/response formats, and error codes, refer to [backend/API.md](backend/API.md).

---

## Core Features

### 🏗️ Project Management
- **Portfolio Directory**: Search, filter, and track all active and planned projects.
- **Budget & Cost Tracking**: Monitor sanctioned budgets versus actual expenses.
- **Milestone Scheduling**: Align target deliverables with overall project timelines.
- **Project Dossier**: Detailed project records with linked tasks, site reports, and manager assignments.

### 📋 Tasks & Progress
- **Task Scheduling**: Create and assign work packages with start dates, deadlines, and priorities.
- **Multi-View Modes**: Switch effortlessly between **Table**, **Kanban Board**, and **Timeline / Gantt** views.
- **Dependencies & Milestones**: Link trade activities to prerequisites to prevent out-of-order execution.
- **Progress Tracking**: Real-time percentage tracking normalized across parent phases.

### 📝 Daily Site Reports
- **Site Diaries**: Record daily work progress, active work zones, and subcontractors on duty.
- **Workforce Logging**: Track labor headcounts across various trades and shifts.
- **Site Conditions**: Log weather conditions, equipment operations, and site observations.
- **Safety Logs**: Document safety checks, hazards, and field incidents.

### ⚠️ Issues & Quality Assurance
- **Defect Reporting**: Log field defects with priority flags (`Critical`, `High`, `Medium`, `Low`).
- **Trade Categorization**: Classify issues by trade (Structural, Electrical, Plumbing, HVAC, Architectural).
- **Resolution Lifecycle**: Track defects from open inquiry to verified closure.

### 📦 Materials & Inventory
- **Master Materials Catalog**: Standard catalog of construction materials with unit metrics.
- **Warehouse & Site Stock**: Live visibility of on-hand inventory across all site locations.
- **Stock Movement Ledger**: Log audited movements (`Inbound`, `Outbound`, and `Adjustments`).
- **Shortage Alerts**: Automatic indicators when inventory dips below minimum buffer stock.

### ✅ Approvals & Requisitions
- **Material Requisitions**: Field superintendents can draft and submit supply requests directly.
- **Review Queue**: Managers review, approve, or reject pending requests with feedback notes.
- **Audit History**: Complete timestamped logs of all approvals and rejections.

### 📊 Executive Dashboard
- **Telemetry KPIs**: Live summaries of active projects, open defects, pending approvals, and budget burn rate.
- **Analytics Charts**: Interactive visual charts rendering progress curves and task distributions.
- **Live Activity Feed**: Chronological log of recent site submissions and project updates.
- **Global Project Filter**: Toggle analytics across the entire portfolio or focus on a single site.

---

## User Roles

BUILDORA provides tailored experiences based on user responsibilities:

- **Admin / Management**: Full operational control to manage projects, schedule tasks, review site reports, resolve defects, control inventory movements, process approvals, and manage user accounts. (Includes specialized roles for Project Managers, Site Supervisors, and Procurement Officers).
- **Client / Stakeholder**: Clean, read-only interface to monitor overall project progress, key milestones, approved site reports, and high-level expenditure.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 6, React Router v7, Chart.js, Lucide Icons, Framer Motion, Vanilla CSS |
| **Backend** | Node.js (ES Modules), Express 5, Mongoose 9 |
| **Database** | MongoDB |
| **Security & Auth** | JSON Web Tokens (JWT), bcryptjs, Helmet, CORS, Express Rate Limit |
| **Testing** | Node.js Native Test Runner (`node --test`) |

---

## Repository Structure

```text
buildora-construction-management/
├── backend/
│   ├── config/             # Database and server configuration
│   ├── controllers/        # Request handling and business logic
│   ├── middleware/         # JWT authentication, RBAC, and error handlers
│   ├── models/             # Mongoose data schemas (Project, Task, User, etc.)
│   ├── routes/             # REST API endpoint definitions
│   ├── scripts/            # Database seed script & test utilities
│   ├── services/           # Business rule engines (dependencies, budget formulas)
│   ├── tests/              # Automated unit and integration test suite
│   ├── API.md              # Complete REST API specification
│   └── server.js           # Express server entrypoint
├── frontend/
│   ├── src/
│   │   ├── components/     # UI primitives, modals, layout, and page components
│   │   ├── context/        # Auth and global project filter contexts
│   │   ├── pages/          # Dashboard, Projects, Tasks, Reports, Inventory, etc.
│   │   ├── services/       # Frontend API communication layer
│   │   └── styles/         # Design tokens, color system, and layout styles
│   ├── index.html          # HTML entrypoint
│   └── vite.config.js      # Vite bundling configuration
├── package.json            # Monorepo workspaces and npm scripts
└── README.md               # Project documentation
```

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or MongoDB Atlas connection URI

### 1. Clone & Install
```bash
git clone https://github.com/kash0607/buildora-construction-management.git
cd buildora-construction-management
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/buildora
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### 3. Seed Database (Optional)
Populate the database with sample construction projects, tasks, materials, and users:
```bash
npm run seed
```

*Default Demo Credentials:*
- **Project Manager**: `kashish.pm@buildora.com` / `Password123!`
- **Site Supervisor**: `zaara.site@buildora.com` / `Password123!`
- **Procurement Officer**: `isika.procure@buildora.com` / `Password123!`

### 4. Start Development Servers

**Backend API:**
```bash
npm run server
# Running at http://localhost:5000
```

**Frontend Client:**
```bash
npm run dev
# Running at http://localhost:5173
```

---

## Automated Testing

Run the automated backend test suite covering authorization, dependency validation, budget calculations, and stock movements:

```bash
npm run test:backend
```

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
