/**
 * BUILDORA — Mock Data Layer
 * Comprehensive, realistic construction project operations data (Indian context, INR)
 */

const BUILDORA_MOCK_DATA = {
  currentUser: {
    id: "usr-01",
    name: "Kashish Patel",
    email: "kashish.patel@buildora.com",
    role: "Project Manager", // Admin, Project Manager, Site Supervisor, Procurement Manager, Finance, Client, Vendor
    avatar: "KP",
    phone: "+91 98765 43210",
    assignedProjects: ["PRJ-101", "PRJ-102", "PRJ-104"]
  },

  roles: [
    { id: "admin", name: "Admin", description: "Full enterprise access & governance" },
    { id: "project-manager", name: "Project Manager", description: "Manage projects, schedules, budgets & approvals" },
    { id: "site-supervisor", name: "Site Supervisor", description: "Daily site logs, worker counts & material receipts" },
    { id: "procurement-manager", name: "Procurement Manager", description: "Vendors, RFQs, Purchase Orders & deliveries" },
    { id: "finance", name: "Finance Manager", description: "Budget allocation, disbursements & invoice audits" },
    { id: "client", name: "Client", description: "Executive milestones, approved photos & progress" },
    { id: "vendor", name: "Vendor", description: "Purchase orders & dispatch confirmations" }
  ],

  stats: {
    activeProjects: 12,
    activeProjectsTrend: "+2 this month",
    totalBudget: 480000000, // ₹48.0 Cr
    totalBudgetFormatted: "₹48.0 Cr",
    budgetUsed: 290000000, // ₹29.0 Cr
    budgetUsedFormatted: "₹29.0 Cr",
    budgetPercentage: 60.4,
    pendingApprovals: 18,
    pendingApprovalsUrgent: 5,
    overdueTasks: 7,
    lowStockItems: 9
  },

  projects: [
    {
      id: "PRJ-101",
      name: "Skyline Heights",
      client: "Apex Developers",
      location: "Worli, Mumbai",
      manager: "Kashish Patel",
      progress: 68,
      budget: 185000000, // ₹18.5 Cr
      committedCost: 35000000, // ₹3.5 Cr (POs issued/pending delivery)
      actualCost: 124000000, // ₹12.4 Cr (Paid/incurred)
      startDate: "2025-04-01",
      deadline: "2027-03-31",
      status: "Active", // Planning, Active, On Hold, Completed, Delayed
      image: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80",
      description: "Twin 32-story residential towers with premium clubhouse, rooftop infinity pool, and subterranean three-level car parking.",
      workersOnSite: 142,
      tasksTotal: 128,
      tasksCompleted: 87,
      milestonesTotal: 12,
      milestonesCompleted: 8,
      team: [
        { name: "Kashish Patel", role: "Project Manager", email: "kashish.patel@buildora.com", phone: "+91 98765 43210" },
        { name: "Sanjay Verma", role: "Site Supervisor", email: "sanjay.verma@buildora.com", phone: "+91 98765 43211" },
        { name: "Arun Mehra", role: "Lead MEP Engineer", email: "arun.mehra@buildora.com", phone: "+91 98765 43212" },
        { name: "Pooja Hegde", role: "Safety Officer", email: "pooja.h@buildora.com", phone: "+91 98765 43213" }
      ],
      issues: [
        { id: "ISS-101", title: "Secondary Rebar delivery delayed by 48 hours", priority: "Medium", status: "Open", assignee: "Sanjay Verma", date: "01 Sep 2026" },
        { id: "ISS-102", title: "Tower Crane 2 hydraulic pressure fluctuation", priority: "High", status: "In Progress", assignee: "Arun Mehra", date: "31 Aug 2026" }
      ],
      recentActivities: [
        { user: "Sanjay Verma", action: "Submitted Daily Site Report for 18th Floor Slab", time: "Today, 09:30 AM" },
        { user: "Kashish Patel", action: "Approved Purchase Order #PO-8821 for UltraTech Cement", time: "Yesterday, 04:15 PM" },
        { user: "Arun Mehra", action: "Marked task 'HVAC Shaft Conduiting - Floor 12' as Completed", time: "31 Aug 2026" },
        { user: "Finance Team", action: "Processed Vendor Disbursement ₹45,00,000 to Tata Steel", time: "30 Aug 2026" }
      ]
    },
    {
      id: "PRJ-102",
      name: "Green Valley Residency",
      client: "Godrej Properties Ltd",
      location: "Whitefield, Bengaluru",
      manager: "Kashish Patel",
      progress: 42,
      budget: 120000000, // ₹12.0 Cr
      committedCost: 28000000,
      actualCost: 54000000,
      startDate: "2025-08-15",
      deadline: "2027-08-15",
      status: "Active",
      image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
      description: "Gated luxury villa community comprising 64 eco-friendly smart homes with solar integration and central sewage treatment.",
      workersOnSite: 98,
      tasksTotal: 96,
      tasksCompleted: 40,
      milestonesTotal: 10,
      milestonesCompleted: 4,
      team: [
        { name: "Kashish Patel", role: "Project Manager", email: "kashish.patel@buildora.com", phone: "+91 98765 43210" },
        { name: "Ramesh Naik", role: "Site Supervisor", email: "ramesh.naik@buildora.com", phone: "+91 98765 43214" },
        { name: "Divya Nambiar", role: "Quality Engineer", email: "divya.n@buildora.com", phone: "+91 98765 43215" }
      ],
      issues: [
        { id: "ISS-201", title: "Drainage slope adjustment needed near Villa 24", priority: "Low", status: "Open", assignee: "Ramesh Naik", date: "02 Sep 2026" }
      ],
      recentActivities: [
        { user: "Ramesh Naik", action: "Completed Foundation pour for Cluster B", time: "Yesterday, 05:00 PM" },
        { user: "Kashish Patel", action: "Approved Material Requisition for AAC Blocks", time: "31 Aug 2026" }
      ]
    },
    {
      id: "PRJ-103",
      name: "Metro Commercial Complex",
      client: "Prestige Group",
      location: "BKC, Mumbai",
      manager: "Vikram Malhotra",
      progress: 89,
      budget: 240000000, // ₹24.0 Cr
      committedCost: 18000000,
      actualCost: 215000000,
      startDate: "2024-11-01",
      deadline: "2026-11-30",
      status: "Active",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
      description: "Grade-A corporate office hub with LEED Platinum certified sustainable curtain glass facade and multi-tier atrium.",
      workersOnSite: 210,
      tasksTotal: 180,
      tasksCompleted: 160,
      milestonesTotal: 15,
      milestonesCompleted: 13,
      team: [
        { name: "Vikram Malhotra", role: "Project Manager", email: "vikram.m@buildora.com", phone: "+91 98765 43216" },
        { name: "Deepak Joshi", role: "Senior Supervisor", email: "deepak.j@buildora.com", phone: "+91 98765 43217" }
      ],
      issues: [
        { id: "ISS-301", title: "Facade glazing bracket inspection required", priority: "Medium", status: "In Progress", assignee: "Deepak Joshi", date: "01 Sep 2026" }
      ],
      recentActivities: [
        { user: "Deepak Joshi", action: "Finished electrical main riser cable pull", time: "Today, 11:00 AM" }
      ]
    },
    {
      id: "PRJ-104",
      name: "Riverside Villas & Club",
      client: "Brigade Enterprises",
      location: "Kalyani Nagar, Pune",
      manager: "Kashish Patel",
      progress: 15,
      budget: 65000000, // ₹6.5 Cr
      committedCost: 12000000,
      actualCost: 9800000,
      startDate: "2026-06-01",
      deadline: "2027-12-20",
      status: "Planning",
      image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
      description: "Exclusive waterfront community with recreational amenities, clubhouse, private boating docks, and landscaped promenades.",
      workersOnSite: 35,
      tasksTotal: 45,
      tasksCompleted: 7,
      milestonesTotal: 8,
      milestonesCompleted: 1,
      team: [
        { name: "Kashish Patel", role: "Project Manager", email: "kashish.patel@buildora.com", phone: "+91 98765 43210" },
        { name: "Siddharth Rao", role: "Civil Engineer", email: "siddharth.r@buildora.com", phone: "+91 98765 43218" }
      ],
      issues: [
        { id: "ISS-401", title: "Environmental clearance addendum pending from municipal body", priority: "High", status: "Open", assignee: "Kashish Patel", date: "28 Aug 2026" }
      ],
      recentActivities: [
        { user: "Siddharth Rao", action: "Site boundary piling completed", time: "29 Aug 2026" }
      ]
    },
    {
      id: "PRJ-105",
      name: "Horizon Tech Park - Tower C",
      client: "Embassy REIT",
      location: "Gachibowli, Hyderabad",
      manager: "Rahul Sharma",
      progress: 55,
      budget: 150000000, // ₹15.0 Cr
      committedCost: 32000000,
      actualCost: 92000000,
      startDate: "2025-01-10",
      deadline: "2026-09-30",
      status: "Delayed",
      image: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80",
      description: "14-floor IT/ITES commercial facility with heavy mechanical floor and regional data center sub-hub.",
      workersOnSite: 115,
      tasksTotal: 110,
      tasksCompleted: 60,
      milestonesTotal: 10,
      milestonesCompleted: 5,
      team: [
        { name: "Rahul Sharma", role: "Project Manager", email: "rahul.s@buildora.com", phone: "+91 98765 43219" }
      ],
      issues: [
        { id: "ISS-501", title: "Chiller unit shipping delay from manufacturer (10 days)", priority: "Critical", status: "Open", assignee: "Rahul Sharma", date: "29 Aug 2026" }
      ],
      recentActivities: [
        { user: "Rahul Sharma", action: "Escalated MEP delivery timeline with vendor", time: "01 Sep 2026" }
      ]
    },
    {
      id: "PRJ-106",
      name: "Palm Grove Estates",
      client: "Sobha Developers",
      location: "Kochi, Kerala",
      manager: "Kashish Patel",
      progress: 100,
      budget: 85000000, // ₹8.5 Cr
      committedCost: 0,
      actualCost: 83200000,
      startDate: "2024-03-01",
      deadline: "2026-06-30",
      status: "Completed",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      description: "Completed coastal residential estate with 32 tropical villas, club amenities, and full municipal occupancy certificate.",
      workersOnSite: 0,
      tasksTotal: 84,
      tasksCompleted: 84,
      milestonesTotal: 8,
      milestonesCompleted: 8,
      team: [
        { name: "Kashish Patel", role: "Project Manager", email: "kashish.patel@buildora.com", phone: "+91 98765 43210" }
      ],
      issues: [],
      recentActivities: [
        { user: "Kashish Patel", action: "Handover certificates issued to clients", time: "15 Jul 2026" }
      ]
    }
  ],

  milestones: [
    {
      id: "MLS-01",
      title: "Tower A - 18th Floor Slab Casting",
      project: "Skyline Heights",
      dueDate: "Tomorrow",
      dateFormatted: "03 Sep 2026",
      progress: 92,
      responsible: "Sanjay Verma (Site Sup.)",
      status: "In Progress"
    },
    {
      id: "MLS-02",
      title: "Basement Waterproofing & Retaining Wall",
      project: "Riverside Villas & Club",
      dueDate: "In 4 days",
      dateFormatted: "06 Sep 2026",
      progress: 45,
      responsible: "Kashish Patel",
      status: "In Progress"
    },
    {
      id: "MLS-03",
      title: "HVAC Central Chiller Plant Testing",
      project: "Metro Commercial Complex",
      dueDate: "12 Sep 2026",
      dateFormatted: "12 Sep 2026",
      progress: 80,
      responsible: "Arun Mehra (MEP Lead)",
      status: "Upcoming"
    },
    {
      id: "MLS-04",
      title: "Substructure & Piling Sign-off",
      project: "Green Valley Residency",
      dueDate: "Completed",
      dateFormatted: "28 Aug 2026",
      progress: 100,
      responsible: "Kashish Patel",
      status: "Completed"
    }
  ],

  approvals: [
    {
      id: "APP-401",
      type: "Purchase Request",
      title: "120 Metric Tons Fe 500D TMT Rebars",
      project: "Skyline Heights",
      requestedBy: "Sanjay Verma (Supervisor)",
      amount: "₹74,50,000",
      date: "Today, 09:30 AM",
      status: "Pending",
      vendor: "Tata Steel Structurals Ltd."
    },
    {
      id: "APP-402",
      type: "Expense Claim",
      title: "Emergency Tower Crane Hydraulic Repair",
      project: "Metro Commercial Complex",
      requestedBy: "Vikram Malhotra (PM)",
      amount: "₹1,85,000",
      date: "Today, 11:15 AM",
      status: "Pending",
      vendor: "Liebherr India Services"
    },
    {
      id: "APP-403",
      type: "Purchase Request",
      title: "800 Bags Grade 53 OPC Cement",
      project: "Green Valley Residency",
      requestedBy: "Ramesh Naik",
      amount: "₹3,12,000",
      date: "Yesterday",
      status: "Pending",
      vendor: "UltraTech Cement"
    },
    {
      id: "APP-404",
      type: "Budget Variance",
      title: "Sub-grade Soil Stabilization Variation",
      project: "Riverside Villas & Club",
      requestedBy: "Kashish Patel",
      amount: "₹12,40,000",
      date: "01 Sep 2026",
      status: "Pending",
      vendor: "GeoTech Foundations"
    }
  ],

  siteReports: [
    {
      id: "REP-901",
      date: "Today, 02 Sep 2026",
      project: "Skyline Heights",
      supervisor: "Sanjay Verma",
      weather: "Sunny, 31°C",
      workersPresent: 142,
      workCompleted: "Completed shuttering for 18th floor beam grid; pumped 45m³ RMC concrete.",
      progressToday: "+1.2%",
      issues: "Minor delay in secondary rebar delivery (resolved).",
      status: "Submitted"
    },
    {
      id: "REP-902",
      date: "Today, 02 Sep 2026",
      project: "Metro Commercial Complex",
      supervisor: "Deepak Joshi",
      weather: "Clear, 29°C",
      workersPresent: 210,
      workCompleted: "Electrical conduit pull on 8th floor; curtain wall bracket torquing.",
      progressToday: "+0.8%",
      issues: "Zero safety incidents.",
      status: "Approved"
    }
  ],

  lowStockMaterials: [
    { id: "MAT-01", name: "OPC 53 Cement", stock: "450 Bags", min: "1,200 Bags", status: "Low Stock" },
    { id: "MAT-02", name: "Fe 500D 16mm Rebar", stock: "8.5 MT", min: "25.0 MT", status: "Low Stock" },
    { id: "MAT-03", name: "M-Sand (Manufactured)", stock: "140 MT", min: "400 MT", status: "Critical" },
    { id: "MAT-04", name: "20mm Aggregate", stock: "90 MT", min: "250 MT", status: "Low Stock" }
  ],

  monthlyExpenseData: {
    labels: ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep (Proj)"],
    budgeted: [4.2, 4.5, 5.0, 4.8, 5.2, 4.9, 5.5], // Cr
    actual: [3.8, 4.1, 4.9, 4.6, 5.4, 4.7, 5.1]
  },

  projectProgressData: {
    labels: ["Completed", "Active On-Track", "Under Review / Delayed", "Planning"],
    counts: [4, 8, 3, 2],
    colors: ["#2E7D32", "#6B4F3A", "#D97706", "#8A684C"]
  }
};

window.BUILDORA_MOCK_DATA = BUILDORA_MOCK_DATA;
