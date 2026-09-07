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

  tasks: [
    {
      id: "TASK-101",
      projectId: "PRJ-101",
      title: "Raft Foundation Concrete Pour - Tower A",
      description: "Cast M40 Grade ready-mix concrete for main subterranean raft footing of Tower A with vibrating screed.",
      assignee: "Sanjay Verma",
      status: "Completed",
      priority: "Critical",
      startDate: "2026-08-01",
      dueDate: "2026-08-14",
      progress: 100,
      dependencies: [],
      createdAt: "2026-07-28T09:00:00.000Z",
      updatedAt: "2026-08-14T18:30:00.000Z"
    },
    {
      id: "TASK-102",
      projectId: "PRJ-101",
      title: "Structural Columns Reinforcement (Floors 1-17)",
      description: "Install vertical Fe 500D TMT rebar cages and link ties for core structural load-bearing columns.",
      assignee: "Sanjay Verma",
      status: "Completed",
      priority: "High",
      startDate: "2026-08-15",
      dueDate: "2026-08-28",
      progress: 100,
      dependencies: ["TASK-101"],
      createdAt: "2026-08-10T10:00:00.000Z",
      updatedAt: "2026-08-28T17:00:00.000Z"
    },
    {
      id: "TASK-103",
      projectId: "PRJ-101",
      title: "18th Floor Slab Shuttering & Casting",
      description: "Aluminum formwork staging, rebar mesh layout, and pumping 45m³ high-strength concrete for 18th floor.",
      assignee: "Sanjay Verma",
      status: "In Progress",
      priority: "Critical",
      startDate: "2026-08-29",
      dueDate: "2026-09-03",
      progress: 90,
      dependencies: ["TASK-102"],
      createdAt: "2026-08-25T11:00:00.000Z",
      updatedAt: "2026-09-02T09:30:00.000Z"
    },
    {
      id: "TASK-104",
      projectId: "PRJ-101",
      title: "HVAC Shaft Conduiting - Floor 12 to 16",
      description: "Route galvanized sheet metal air handling ducts and electrical wiring conduits through main service shafts.",
      assignee: "Arun Mehra",
      status: "In Progress",
      priority: "High",
      startDate: "2026-08-20",
      dueDate: "2026-09-08",
      progress: 65,
      dependencies: ["TASK-102"],
      createdAt: "2026-08-18T08:30:00.000Z",
      updatedAt: "2026-09-01T14:15:00.000Z"
    },
    {
      id: "TASK-105",
      projectId: "PRJ-101",
      title: "Secondary Rebar Grid Installation - Tower B",
      description: "High-tensile reinforcement placement for podium ramp and vehicle circulation zone. Blocked due to material shipment delay.",
      assignee: "Sanjay Verma",
      status: "Blocked",
      priority: "High",
      startDate: "2026-08-26",
      dueDate: "2026-08-31",
      progress: 25,
      dependencies: ["TASK-101"],
      createdAt: "2026-08-22T10:00:00.000Z",
      updatedAt: "2026-09-01T16:00:00.000Z"
    },
    {
      id: "TASK-106",
      projectId: "PRJ-101",
      title: "Exterior Curtain Wall Bracket Torquing",
      description: "Fixing extruded aluminum bracket anchors for double-glazed unitized facade panels on western elevation.",
      assignee: "Arun Mehra",
      status: "Not Started",
      priority: "Medium",
      startDate: "2026-09-10",
      dueDate: "2026-09-25",
      progress: 0,
      dependencies: ["TASK-103"],
      createdAt: "2026-08-30T12:00:00.000Z",
      updatedAt: "2026-08-30T12:00:00.000Z"
    },
    {
      id: "TASK-107",
      projectId: "PRJ-101",
      title: "Fire Protection Wet Riser Piping Check",
      description: "Hydrostatic pressure testing at 15 bar across all vertical fire fighting standpipes in Tower A.",
      assignee: "Pooja Hegde",
      status: "Not Started",
      priority: "Critical",
      startDate: "2026-09-15",
      dueDate: "2026-09-22",
      progress: 0,
      dependencies: ["TASK-104"],
      createdAt: "2026-08-30T14:00:00.000Z",
      updatedAt: "2026-08-30T14:00:00.000Z"
    },
    {
      id: "TASK-201",
      projectId: "PRJ-102",
      title: "Cluster A Substructure & Piling Sign-off",
      description: "Bored cast-in-situ concrete piles load testing and municipal structural integrity sign-off.",
      assignee: "Kashish Patel",
      status: "Completed",
      priority: "Critical",
      startDate: "2026-07-15",
      dueDate: "2026-08-28",
      progress: 100,
      dependencies: [],
      createdAt: "2026-07-10T09:00:00.000Z",
      updatedAt: "2026-08-28T16:00:00.000Z"
    },
    {
      id: "TASK-202",
      projectId: "PRJ-102",
      title: "Foundation Pour for Cluster B Smart Villas",
      description: "Excavation, anti-termite chemical barrier treatment, and grade beam concrete casting for 16 luxury villas.",
      assignee: "Ramesh Naik",
      status: "In Progress",
      priority: "High",
      startDate: "2026-08-22",
      dueDate: "2026-09-05",
      progress: 80,
      dependencies: ["TASK-201"],
      createdAt: "2026-08-18T11:00:00.000Z",
      updatedAt: "2026-09-01T17:00:00.000Z"
    },
    {
      id: "TASK-203",
      projectId: "PRJ-102",
      title: "Solar Rooftop Conduit Pre-Embedment",
      description: "Laying heavy-duty PVC conduits in slab decks for DC cabling from rooftop solar arrays to central inverters.",
      assignee: "Divya Nambiar",
      status: "In Progress",
      priority: "Medium",
      startDate: "2026-08-28",
      dueDate: "2026-09-10",
      progress: 40,
      dependencies: ["TASK-202"],
      createdAt: "2026-08-25T14:30:00.000Z",
      updatedAt: "2026-09-02T10:00:00.000Z"
    },
    {
      id: "TASK-204",
      projectId: "PRJ-102",
      title: "Stormwater Drainage Gradient Rectification (Villa 24)",
      description: "Re-level storm runoff culverts near plot boundary to prevent monsoon water logging.",
      assignee: "Ramesh Naik",
      status: "In Progress",
      priority: "Low",
      startDate: "2026-08-25",
      dueDate: "2026-08-30", // Overdue!
      progress: 50,
      dependencies: [],
      createdAt: "2026-08-24T09:00:00.000Z",
      updatedAt: "2026-09-02T08:00:00.000Z"
    },
    {
      id: "TASK-301",
      projectId: "PRJ-103",
      title: "Main Electrical Riser Cable Pull",
      description: "Pull 4-core 400 sq.mm XLPE armored power feeder cables from basement sub-station to floor distribution panels.",
      assignee: "Deepak Joshi",
      status: "Completed",
      priority: "High",
      startDate: "2026-08-18",
      dueDate: "2026-09-02",
      progress: 100,
      dependencies: [],
      createdAt: "2026-08-15T10:00:00.000Z",
      updatedAt: "2026-09-02T11:00:00.000Z"
    },
    {
      id: "TASK-302",
      projectId: "PRJ-103",
      title: "HVAC Central Chiller Plant Testing & Balancing",
      description: "Commissioning variable frequency water-cooled chillers, cooling towers, and chilled water circulation pumps.",
      assignee: "Vikram Malhotra",
      status: "In Progress",
      priority: "Critical",
      startDate: "2026-08-25",
      dueDate: "2026-09-12",
      progress: 75,
      dependencies: ["TASK-301"],
      createdAt: "2026-08-20T09:00:00.000Z",
      updatedAt: "2026-09-01T15:00:00.000Z"
    },
    {
      id: "TASK-303",
      projectId: "PRJ-103",
      title: "Curtain Glazing Structural Sealant Inspection",
      description: "Perform adhesion & structural silicone joint bead quality audits on northern atrium facade.",
      assignee: "Deepak Joshi",
      status: "Blocked",
      priority: "High",
      startDate: "2026-08-27",
      dueDate: "2026-08-31", // Overdue & Blocked
      progress: 30,
      dependencies: [],
      createdAt: "2026-08-24T10:00:00.000Z",
      updatedAt: "2026-09-01T12:00:00.000Z"
    },
    {
      id: "TASK-401",
      projectId: "PRJ-104",
      title: "Site Boundary Piling & Geotechnical Survey",
      description: "Execute perimeter contiguous boundary piles and deep soil strata bearing capacity verification.",
      assignee: "Siddharth Rao",
      status: "Completed",
      priority: "Critical",
      startDate: "2026-08-01",
      dueDate: "2026-08-29",
      progress: 100,
      dependencies: [],
      createdAt: "2026-07-28T09:00:00.000Z",
      updatedAt: "2026-08-29T17:00:00.000Z"
    },
    {
      id: "TASK-402",
      projectId: "PRJ-104",
      title: "Basement Waterproofing & Retaining Wall",
      description: "Dual-layer elastomeric bituminous membrane application and RCC retaining wall pour along riverfront edge.",
      assignee: "Kashish Patel",
      status: "In Progress",
      priority: "Critical",
      startDate: "2026-08-28",
      dueDate: "2026-09-06",
      progress: 45,
      dependencies: ["TASK-401"],
      createdAt: "2026-08-25T11:00:00.000Z",
      updatedAt: "2026-09-02T13:00:00.000Z"
    },
    {
      id: "TASK-501",
      projectId: "PRJ-105",
      title: "Mechanical Floor Heavy Chiller Base Foundation",
      description: "Vibration isolation inertia concrete pads for rooftop refrigeration chillers. Delayed awaiting equipment shipment.",
      assignee: "Rahul Sharma",
      status: "Blocked",
      priority: "Critical",
      startDate: "2026-08-15",
      dueDate: "2026-08-29", // Overdue & Blocked
      progress: 35,
      dependencies: [],
      createdAt: "2026-08-10T10:00:00.000Z",
      updatedAt: "2026-09-01T14:00:00.000Z"
    },
    {
      id: "TASK-502",
      projectId: "PRJ-105",
      title: "Regional Data Center Raised Flooring Installation",
      description: "Installing anti-static heavy load pedestal raised flooring tiles and airflow damper grilles on Floor 7.",
      assignee: "Rahul Sharma",
      status: "Not Started",
      priority: "Medium",
      startDate: "2026-09-08",
      dueDate: "2026-09-20",
      progress: 0,
      dependencies: ["TASK-501"],
      createdAt: "2026-08-28T15:00:00.000Z",
      updatedAt: "2026-08-28T15:00:00.000Z"
    },
    {
      id: "TASK-601",
      projectId: "PRJ-106",
      title: "Final Occupancy Certificate & Client Handover",
      description: "Municipal completion certificate receipt, final snagging list rectification, and unit key handover.",
      assignee: "Kashish Patel",
      status: "Completed",
      priority: "High",
      startDate: "2026-06-01",
      dueDate: "2026-06-30",
      progress: 100,
      dependencies: [],
      createdAt: "2026-05-25T09:00:00.000Z",
      updatedAt: "2026-06-30T18:00:00.000Z"
    }
  ],

  milestones: [
    {
      id: "MLS-01",
      projectId: "PRJ-101",
      title: "Tower A - 18th Floor Slab Casting",
      description: "Complete structural slab pour and curing for 18th floor framing on Tower A.",
      dueDate: "2026-09-03",
      dateFormatted: "03 Sep 2026",
      progress: 92,
      status: "In Progress",
      responsible: "Sanjay Verma",
      relatedTaskIds: ["TASK-101", "TASK-102", "TASK-103"]
    },
    {
      id: "MLS-02",
      projectId: "PRJ-104",
      title: "Basement Waterproofing & Retaining Wall",
      description: "Subterranean barrier protection against groundwater seepage along the riverfront.",
      dueDate: "2026-09-06",
      dateFormatted: "06 Sep 2026",
      progress: 45,
      status: "In Progress",
      responsible: "Kashish Patel",
      relatedTaskIds: ["TASK-401", "TASK-402"]
    },
    {
      id: "MLS-03",
      projectId: "PRJ-103",
      title: "HVAC Central Chiller Plant Testing",
      description: "Full load operational testing and commissioning of central building climate system.",
      dueDate: "2026-09-12",
      dateFormatted: "12 Sep 2026",
      progress: 80,
      status: "Upcoming",
      responsible: "Vikram Malhotra",
      relatedTaskIds: ["TASK-301", "TASK-302"]
    },
    {
      id: "MLS-04",
      projectId: "PRJ-102",
      title: "Substructure & Piling Sign-off",
      description: "Engineering verification and structural load sign-off for Cluster A foundation.",
      dueDate: "2026-08-28",
      dateFormatted: "28 Aug 2026",
      progress: 100,
      status: "Completed",
      responsible: "Kashish Patel",
      relatedTaskIds: ["TASK-201"]
    },
    {
      id: "MLS-05",
      projectId: "PRJ-105",
      title: "Mechanical Plant Room Commissioning",
      description: "High-capacity chiller and electrical switchgear energization for Data Center tower.",
      dueDate: "2026-08-30",
      dateFormatted: "30 Aug 2026",
      progress: 35,
      status: "Delayed",
      responsible: "Rahul Sharma",
      relatedTaskIds: ["TASK-501"]
    },
    {
      id: "MLS-06",
      projectId: "PRJ-106",
      title: "Final Municipal Handover Sign-off",
      description: "Receipt of Occupancy Certificate and complete estate handover to owners.",
      dueDate: "2026-06-30",
      dateFormatted: "30 Jun 2026",
      progress: 100,
      status: "Completed",
      responsible: "Kashish Patel",
      relatedTaskIds: ["TASK-601"]
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
