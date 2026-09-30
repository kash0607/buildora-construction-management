/**
 * BUILDORA — Role-Based Navigation Configuration
 * Defines workspace navigation items visible to each authenticated persona.
 */

export const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'dashboard',
    roles: ['Admin', 'Project Manager', 'Site Supervisor', 'Procurement Manager', 'Finance'],
    group: 'Core',
  },
  {
    id: 'client-dashboard',
    label: 'Client Portal',
    path: '/client-portal',
    icon: 'client',
    roles: ['Client'],
    group: 'Client Workspace',
  },
  {
    id: 'vendor-workspace',
    label: 'Vendor Portal',
    path: '/vendor-portal',
    icon: 'vendor',
    roles: ['Vendor'],
    group: 'Supplier Workspace',
  },
  {
    id: 'projects',
    label: 'Projects',
    path: '/projects',
    icon: 'projects',
    roles: ['Admin', 'Project Manager', 'Site Supervisor', 'Finance'],
    group: 'Core',
  },
  {
    id: 'tasks',
    label: 'Tasks & Milestones',
    path: '/tasks',
    icon: 'tasks',
    roles: ['Admin', 'Project Manager', 'Site Supervisor'],
    group: 'Core',
  },
  {
    id: 'site-reports',
    label: 'Site Reports',
    path: '/site-reports',
    icon: 'reports',
    roles: ['Admin', 'Project Manager', 'Site Supervisor'],
    group: 'Site Operations',
  },
  {
    id: 'issues',
    label: 'Issues & Quality',
    path: '/issues',
    icon: 'issues',
    roles: ['Admin', 'Project Manager', 'Site Supervisor'],
    group: 'Site Operations',
  },
  {
    id: 'procurement',
    label: 'Procurement',
    path: '/procurement',
    icon: 'procurement',
    roles: ['Admin', 'Project Manager', 'Procurement Manager'],
    group: 'Commercial & Supply',
  },
  {
    id: 'materials',
    label: 'Materials',
    path: '/materials',
    icon: 'materials',
    roles: ['Admin', 'Project Manager', 'Site Supervisor', 'Procurement Manager'],
    group: 'Commercial & Supply',
  },
  {
    id: 'inventory',
    label: 'Inventory & Receiving',
    path: '/inventory',
    icon: 'inventory',
    roles: ['Admin', 'Project Manager', 'Site Supervisor', 'Procurement Manager'],
    group: 'Commercial & Supply',
  },
  {
    id: 'finance',
    label: 'Finance & Budgets',
    path: '/finance',
    icon: 'finance',
    roles: ['Admin', 'Project Manager', 'Finance'],
    group: 'Commercial & Supply',
  },
  {
    id: 'approvals',
    label: 'Approvals Queue',
    path: '/approvals',
    icon: 'approvals',
    roles: ['Admin', 'Project Manager', 'Procurement Manager', 'Finance'],
    group: 'Governance & Insights',
  },
  {
    id: 'documents',
    label: 'Documents',
    path: '/documents',
    icon: 'documents',
    roles: ['Admin', 'Project Manager', 'Site Supervisor', 'Procurement Manager', 'Finance', 'Client', 'Vendor'],
    group: 'Governance & Insights',
  },
  {
    id: 'audit-logs',
    label: 'Audit Trail',
    path: '/audit-logs',
    icon: 'audit',
    roles: ['Admin'],
    group: 'Governance & Insights',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    path: '/notifications',
    icon: 'notifications',
    roles: ['Admin', 'Project Manager', 'Site Supervisor', 'Procurement Manager', 'Finance', 'Client', 'Vendor'],
    group: 'Governance & Insights',
  },
];

export function getNavigationForRole(role) {
  const currentRole = role || 'Project Manager';
  const allowed = NAV_ITEMS.filter((item) => item.roles.includes(currentRole));

  // Group items by group name
  const grouped = {};
  allowed.forEach((item) => {
    if (!grouped[item.group]) {
      grouped[item.group] = [];
    }
    grouped[item.group].push(item);
  });

  return grouped;
}
