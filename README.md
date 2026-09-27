# BUILDORA

### Construction Project & Operations Management Platform

BUILDORA is a modern construction management platform designed to help teams manage projects, monitor progress, track site activities, handle issues, and keep essential project information organized in one place.

It provides a centralized workspace for construction operations while keeping the interface simple, clear, and easy to navigate.

---

## Overview

Construction projects often struggle with fragmented communication, scattered spreadsheets, unrecorded site activities, and delayed decision-making. Important updates are frequently trapped in messaging threads or manual site logs, making it difficult for teams and stakeholders to track real progress.

BUILDORA addresses these challenges by bringing project planning, site operations, quality management, inventory tracking, and approvals into a single unified platform. Teams can maintain clear accountability, monitor timelines and budgets, and ensure that field and office personnel stay aligned throughout the construction lifecycle.

---

## Architecture Overview

BUILDORA uses a decoupled full-stack architecture with a React client communicating with a Node.js REST API:

```text
Frontend (React + Vite)
       ↓
    REST API
       ↓
Backend (Node.js + Express)
       ↓
Database (MongoDB + Mongoose)
```

For detailed API specifications and request/response contracts, refer to [backend/API.md](backend/API.md).

---

## Core Features

### Project Management
- Project portfolio directory with status, timeline, and location filters
- Progress tracking and milestone scheduling
- Sanctioned budget vs. incurred expenditure tracking
- Client and project manager assignment
- Project creation, editing, and archiving

### Task & Progress Management
- Task creation, assignment, and status updates
- Priority levels, start dates, and due date management
- Task dependencies and milestone linkage
- Multiple views: Table view, Kanban board, and Timeline / Gantt overview
- Progress percentage tracking

### Site Reports
- Daily site logs capturing daily work performed
- Workforce headcount and subcontractor tracking
- Weather conditions and site impact observations
- Safety incidents and hazard documentation

### Issues & Quality
- Field issue reporting with severity classification (Critical, High, Medium, Low)
- Defect categorisation by trade (Structural, Electrical, Plumbing, HVAC, Architectural)
- Assignment and resolution tracking
- Status lifecycle from open to investigation, resolution, and closure

### Materials & Inventory
- Master catalog of construction materials and standard unit metrics
- Real-time warehouse and on-site stock levels
- Stock movement logs (Inbound receipts, Outbound issues, and Adjustments)
- Low-stock and shortage threshold indicators
- Material requisitions linked to active jobsites

### Approvals
- Requisition and purchase request submission
- Multi-tier approval workflows with approval/rejection actions
- Reviewer remarks and timestamped audit history

### Dashboard
- Executive overview of active projects and total budgets
- Visual KPI cards for open issues, pending approvals, and active tasks
- Interactive charts showing project progress curves and status distributions
- Recent site activity feed and upcoming milestone schedules
- Global project filter for focused analysis

---

## User Roles

BUILDORA organizes access around primary operational experiences:

- **Admin / Management**: Full operational control to create and manage projects, assign tasks, review site reports, resolve issues, control inventory movements, process approvals, and manage system users. Specific roles including Project Manager, Site Supervisor, and Procurement Officer operate within this tier.
- **Client**: Read-only stakeholder access to monitor project progress, milestone achievements, approved site reports, and high-level project status.

---

## Tech Stack

### Frontend
- React 19
- Vite
- React Router
- Chart.js & react-chartjs-2
- Lucide React
- Framer Motion
- Vanilla CSS

### Backend
- Node.js
- Express
- MongoDB
- Mongoose

### Authentication & Security
- JSON Web Tokens (JWT)
- bcryptjs
- Helmet
- CORS
- Express Rate Limit

---

## API

BUILDORA provides a RESTful API powering all frontend operations, including authentication, project management, tasks, site reports, issues, inventory, and approvals.

For detailed endpoint documentation, request/response formats, and status codes, see [backend/API.md](backend/API.md).

---

## Repository Structure

```text
buildora-construction-management/
├── backend/
│   ├── config/             # Database and server configuration
│   ├── controllers/        # Route controllers and request handling
│   ├── middleware/         # Authentication, authorization, and error handling
│   ├── models/             # Mongoose schemas (User, Project, Task, etc.)
│   ├── routes/             # Express API route definitions
│   ├── scripts/            # Database seeding and utility scripts
│   ├── services/           # Core business logic and rules
│   ├── tests/              # Automated unit and integration test suite
│   ├── API.md              # Full REST API endpoint reference
│   └── server.js           # Backend application entrypoint
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI elements, modals, and layout
│   │   ├── context/        # Auth and global filter state
│   │   ├── pages/          # Application views and dashboard pages
│   │   ├── services/       # Frontend API communication layer
│   │   └── styles/         # Global stylesheets and design tokens
│   ├── index.html          # HTML entrypoint
│   └── vite.config.js      # Vite configuration
├── package.json            # Monorepo scripts and workspace configuration
└── README.md               # Product documentation
```

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance or MongoDB Atlas connection

### 1. Clone & Install
```bash
git clone https://github.com/kash0607/buildora-construction-management.git
cd buildora-construction-management
npm install
```

### 2. Configure Environment
Create a `.env` file in the root directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/buildora
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### 3. Seed Demo Data (Optional)
Populate the database with sample projects, tasks, materials, and users:
```bash
npm run seed
```

### 4. Run the Application
In one terminal, start the backend server:
```bash
npm run server
```

In a second terminal, start the frontend development server:
```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

---

## Testing

Run the automated backend test suite covering authentication, RBAC, project calculations, task dependencies, and stock rules:

```bash
npm run test:backend
```

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
