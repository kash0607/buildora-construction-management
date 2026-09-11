<USER_REQUEST>
# BUILDORA — WEEK 1 DEVELOPMENT TASK
# TASKS & MILESTONES MODULE

You are continuing development of the EXISTING BUILDORA project.

IMPORTANT:
DO NOT restart the project.
DO NOT rebuild the existing frontend from scratch.
DO NOT replace the current design system.
DO NOT delete existing working files or functionality.
DO NOT create a new project.
Modify and extend the current Buildora codebase only.

==================================================
1. CURRENT PROJECT
==================================================

Buildora is a Construction & Project Operations Management Platform.

The current project already contains a frontend foundation with:

- Login
- Registration
- Dashboard
- Shared sidebar/navbar
- Reusable UI components
- Projects page
- Project Details page
- Mock construction data
- API abstraction layer
- Responsive CSS
- Vanilla JavaScript frontend

Current frontend stack:

- HTML5
- CSS3
- Vanilla JavaScript
- Chart.js where already used

DO NOT introduce:

- React
- Tailwind CSS
- Bootstrap
- Angular
- Vue
- New frontend frameworks

Continue using the existing technology and architecture.

==================================================
2. MAIN TASK
==================================================

Build the complete FRONTEND FOUNDATION for:

# TASKS & MILESTONES

This module must integrate naturally with the existing Buildora Projects module.

The construction project specification requires:

- Project tasks
- Milestones
- Task dependencies
- Priorities
- Due dates
- Gantt-style timelines

Implement the Week 1 frontend foundation for these requirements.

==================================================
3. FILES TO CREATE
==================================================

Create:

pages/tasks.html
js/tasks.js
css/tasks.css

If an existing file already provides equivalent functionality, EXTEND it instead of creating a duplicate.

Update existing navigation/sidebar files only where necessary.

==================================================
4. DESIGN REQUIREMENT
==================================================

Use the EXISTING BUILDORA visual language.

Do not redesign the application.

Maintain the existing:

- Brown/beige construction-inspired color palette
- Dark sidebar
- White cards
- Typography
- Border radius
- Shadows
- Buttons
- Form styles
- Status badges
- Tables
- Modal styles
- Spacing
- Responsive behavior

The design should feel like an enterprise construction management SaaS application.

Do NOT make it look like a construction company marketing website.

==================================================
5. TASKS PAGE
==================================================

Create:

pages/tasks.html

Page heading:

Tasks & Milestones

Subtitle:

Manage project tasks, milestones, dependencies and progress.

Top action buttons:

[ + New Task ]
[ + New Milestone ]

Add view controls:

[ List ]
[ Kanban ]
[ Timeline ]

The List view is required for Week 1.

Kanban and Timeline should be implemented at a reasonable frontend level if possible, but do NOT sacrifice the core List functionality for them.

==================================================
6. TASK SUMMARY CARDS
==================================================

At the top of the page add summary cards:

- Total Tasks
- In Progress
- Completed
- Overdue
- Blocked

Calculate these from the current task data rather than hard-coding the displayed totals.

==================================================
7. SEARCH AND FILTERS
==================================================

Add:

Search Tasks input

Filters:

- Project
- Status
- Priority
- Assignee
- Due Date

Add:

[ Clear Filters ]

Filtering must actually change the displayed tasks.

Search should work against at least:

- Task name/title
- Project name
- Assignee

==================================================
8. TASK LIST
==================================================

Create a professional task table/list.

Columns:

- Task
- Project
- Assignee
- Priority
- Status
- Progress
- Start Date
- Due Date
- Dependencies
- Actions

Use status badges.

Statuses:

- Not Started
- In Progress
- Blocked
- Completed
- Overdue

Priorities:

- Low
- Medium
- High
- Critical

Actions:

- View
- Edit
- Delete/Archive

Do not use browser alert() for normal interactions.

Use the existing modal/toast/confirmation patterns if they exist.

==================================================
9. TASK CREATION MODAL
==================================================

Create a professional modal:

Create New Task

Fields:

Project
Task Name
Description
Assignee
Priority
Status
Start Date
Due Date
Progress
Dependencies

Buttons:

Cancel
Create Task

Validation:

- Task name required
- Project required
- Assignee required if required by existing architecture
- Due date cannot be earlier than start date
- Progress must be 0–100
- Required fields must show useful validation messages

After creating a task:

- Update the task list
- Update summary cards
- Preserve the current UI state where practical
- Persist using the existing API abstraction/localStorage mechanism

Do NOT directly put all persistence logic into the HTML page.

==================================================
10. EDIT TASK
==================================================

Allow users to edit an existing task.

The edit modal should reuse the create-task form where possible.

Allow editing:

- Task name
- Description
- Assignee
- Priority
- Status
- Start date
- Due date
- Progress
- Dependencies

After editing:

- Update UI immediately
- Update summary statistics
- Persist through the existing API abstraction

==================================================
11. DELETE / ARCHIVE TASK
==================================================

Provide a confirmation modal before deleting/archiving.

Example:

Archive this task?

This action will remove the task from the active task list.

Buttons:

Cancel
Archive Task

Do not permanently destroy data if the existing project architecture supports archive/status-based removal.

==================================================
12. TASK DETAILS
==================================================

Provide a task details modal or panel.

Show:

- Task title
- Project
- Description
- Assignee
- Status
- Priority
- Progress
- Start date
- Due date
- Dependencies
- Created date
- Updated date

Show a clear progress bar.

If the task is overdue, visually indicate it.

==================================================
13. MILESTONES
==================================================

Create a Milestones section on the same page or through a dedicated view.

Show:

- Milestone name
- Project
- Due date
- Progress
- Status
- Related tasks
- Actions

Milestone statuses:

- Upcoming
- In Progress
- Completed
- Delayed

Add:

[ + New Milestone ]

Milestone form:

Project
Milestone Name
Description
Due Date
Status
Progress

Validation should be included.

==================================================
14. PROJECT RELATIONSHIP
==================================================

Tasks and milestones MUST belong to a project.

Use the existing Buildora projects/mock data.

Example structure:

Project
  ↓
Tasks
  ↓
Milestones

Do not create unrelated standalone tasks.

When a project is selected in the filter, display only tasks belonging to that project.

==================================================
15. PROJECT DETAILS INTEGRATION
==================================================

Inspect the existing:

pages/project-details.html

If there is already a Tasks tab:

MAKE IT WORK.

Clicking the Tasks tab should show tasks belonging to the current project.

If necessary, add a button:

[ View All Tasks ]

which navigates to:

pages/tasks.html

with the project filter applied.

For example:

project-details.html?id=PRJ-001

can lead to:

tasks.html?project=PRJ-001

Read the existing URL/query parameter conventions before implementing this.

Do not break the existing Project Details page.

==================================================
16. TASK DEPENDENCIES
==================================================

Implement frontend support for task dependencies.

Example:

Foundation Work
      ↓
Structure Work
      ↓
Electrical
      ↓
Finishing

A task can have zero or multiple dependencies.

In the UI show:

Depends on:
Foundation Work

or:

No dependencies

Prevent obvious invalid dependency selection such as:

- Task depending on itself
- Duplicate dependency
- Invalid task IDs

Prepare the structure so backend validation can later enforce the rules.

IMPORTANT:

Do not pretend frontend validation is sufficient security.

The backend will eventually validate dependency rules.

==================================================
17. GANTT / TIMELINE FOUNDATION
==================================================

Create a Timeline view.

Display:

Task
Start Date
Due Date
Progress

Use a simple Gantt-style horizontal timeline.

It does NOT need to be an advanced commercial Gantt library.

The purpose is to establish the frontend foundation for the required Gantt-style timeline.

Use the existing task dates.

Tasks should visually show:

- Start
- Duration
- Progress

Do not hard-code bars independently of task data.

==================================================
18. KANBAN VIEW
==================================================

Create a basic Kanban view using the existing task data.

Columns:

Not Started
In Progress
Blocked
Completed

Cards should show:

- Task
- Project
- Assignee
- Priority
- Due date
- Progress

If drag-and-drop is implemented, update the task status through the existing API abstraction.

If drag-and-drop would make the implementation unstable, provide a clean status-based Kanban view first.

Do not introduce unnecessary dependencies.

==================================================
19. DATA STRUCTURE
==================================================

Follow the existing mock-data.js conventions.

If no suitable task structure exists, create one similar to:

{
    id: "TASK-001",
    projectId: "PRJ-001",
    title: "Complete Foundation Work",
    description: "Complete RCC foundation work for Block A",
    assignee: "Rajesh Sharma",
    status: "In Progress",
    priority: "High",
    startDate: "2026-09-03",
    dueDate: "2026-09-15",
    progress: 65,
    dependencies: [],
    createdAt: "...",
    updatedAt: "..."
}

Milestone structure:

{
    id: "MS-001",
    projectId: "PRJ-001",
    title: "Foundation Complete",
    description: "Complete foundation work",
    dueDate: "2026-09-15",
    status: "In Progress",
    progress: 80,
    relatedTaskIds: []
}

IMPORTANT:

Use the EXISTING project IDs and data conventions wherever possible.

Do not create duplicate project datasets.

==================================================
20. API ABSTRACTION
==================================================

The existing project has:

js/api.js

USE IT.

Add methods if necessary:

getTasks()
getTask(id)
createTask(data)
updateTask(id, data)
deleteTask(id)

getMilestones()
getMilestone(id)
createMilestone(data)
updateMilestone(id, data)
deleteMilestone(id)

If api.js currently uses localStorage/mock data, continue using it.

DO NOT connect directly to MongoDB from the frontend.

The future architecture is:

tasks.js
   ↓
api.js
   ↓
Node.js + Express
   ↓
Mongoose
   ↓
MongoDB

The backend team will later replace the mock/localStorage implementation with real REST APIs.

==================================================
21. REALISTIC MOCK DATA
==================================================

Use realistic Indian construction/project data.

Use existing projects such as:

- Skyline Heights
- Green Valley Residency
- Metro Commercial Complex
- Riverside Villas

Do not invent dozens of unnecessary records.

Create enough tasks and milestones to properly demonstrate:

- Different statuses
- Different priorities
- Overdue tasks
- Dependencies
- Different assignees
- Different projects
- Different progress values

==================================================
22. RESPONSIVE DESIGN
==================================================

The page must work on:

Desktop
Tablet
Mobile

On smaller screens:

- Tables should become horizontally scrollable or transform appropriately
- Filters should stack
- Cards should resize
- Modals should fit the viewport
- Kanban should remain usable
- Timeline should remain horizontally scrollable

Reuse existing:

responsive.css

Do not break existing responsive behavior.

==================================================
23. NAVIGATION
==================================================

Update the sidebar so:

Tasks & Milestones

appears under the Core section, immediately after Projects.

Recommended:

CORE
- Dashboard
- Projects
- Tasks & Milestones

SITE OPERATIONS
- Site Reports
- Issues

RESOURCES
- Materials
- Inventory
- Vendors

PROCUREMENT
- Purchase Requests
- Approvals
- Purchase Orders
- Deliveries

FINANCE
- Budget
- Expenses
- Invoices

DOCUMENTS
- Documents

CLIENT
- Client Portal

REPORTING
- Analytics
- Notifications
- Audit Logs

SYSTEM
- Settings
- Logout

Do NOT create empty pages for all of these just to make links work.

Only update the navigation structure.

==================================================
24. TERMINOLOGY
==================================================

Use simple enterprise terminology.

Prefer:

"Recent Site Reports"

instead of:

"Daily Site Telemetry & Log Ticker"

Prefer:

"Project Progress"

instead of:

"Real-Time Completion Telemetry"

Prefer:

"Upcoming Milestones"

instead of:

"Critical Path Deadlines within Next 14 Days"

Keep the UI professional and understandable.

==================================================
25. CODE QUALITY
==================================================

Follow the existing code style.

Use:

- Reusable functions
- Clear naming
- Small functions
- Event delegation where appropriate
- No duplicated logic
- No inline JavaScript where avoidable
- No unnecessary libraries
- No console errors
- No broken links
- No unused code

Do not rewrite existing components unless required.

==================================================
26. IMPORTANT SECURITY LIMITATION
==================================================

The current authentication is a frontend demo.

Do NOT present localStorage authentication as secure production authentication.

Do not add fake JWT strings.

Do not add fake MongoDB connections.

The backend team will implement:

- Real authentication
- Password hashing
- JWT/session strategy
- RBAC
- Protected APIs

==================================================
27. TESTING BEFORE FINISHING
==================================================

Before declaring the module complete, manually test:

1. Open Tasks page
2. Create task
3. Edit task
4. Search task
5. Filter by project
6. Filter by status
7. Filter by priority
8. Filter by assignee
9. Clear filters
10. View task details
11. Archive task
12. Create milestone
13. Edit milestone
14. Filter project
15. Test dependencies
16. Test overdue task display
17. Test List view
18. Test Kanban view
19. Test Timeline view
20. Refresh browser and confirm mock/localStorage persistence if supported
21. Test desktop
22. Test tablet
23. Test mobile
24. Confirm no console errors
25. Confirm existing Dashboard still works
26. Confirm Projects page still works
27. Confirm Project Details still works

==================================================
28. DO NOT BREAK EXISTING WORK
==================================================

After implementation verify:

- index.html still works
- login.html still works
- register.html still works
- dashboard still works
- projects.html still works
- project-details.html still works
- existing sidebar works
- existing navbar works
- existing charts still work
- existing styles are not unintentionally changed

==================================================
29. GIT PREPARATION
==================================================

Do not run git push automatically.

At the end, report:

Files created
Files modified
Features implemented
Known limitations
Testing performed

The expected branch is:

feature/tasks-milestones

==================================================
30. FINAL REQUIREMENT
==================================================

DO NOT stop after creating a static HTML mockup.

The module must have working frontend interactions:

- Search
- Filters
- Create
- Edit
- Archive
- View details
- Milestones
- Dependencies
- Status
- Priority
- Progress
- List view
- Kanban view
- Timeline/Gantt-style view

Use the existing Buildora architecture and API abstraction.

Do not rebuild the project.

START NOW.

First inspect the existing Buildora files and understand their current structure.

Then implement the Tasks & Milestones module directly into the existing project.

After implementation, test the module and provide a concise completion report.
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-09-02T19:30:54+05:30.

The user's current state is as follows:
Active Document: c:\Users\Kashish Birju\OneDrive\Desktop\Internship\Buildora\js\api.js (LANGUAGE_JAVASCRIPT)
Cursor is on line: 29
Other open documents:
- c:\Users\Kashish Birju\OneDrive\Desktop\Internship\Buildora\js\api.js (LANGUAGE_JAVASCRIPT)
</ADDITIONAL_METADATA>
<USER_SETTINGS_CHANGE>
The user changed setting `Model Selection` from None to Gemini 3.7 Flash (Medium). No need to comment on this change if the user doesn't ask about it. If reporting what model you are, please use a human readable name instead of the exact string.
</USER_SETTINGS_CHANGE>