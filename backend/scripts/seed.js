import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Milestone from '../models/Milestone.js';
import Material from '../models/Material.js';
import InventoryTransaction from '../models/InventoryTransaction.js';
import MaterialRequest from '../models/MaterialRequest.js';
import SiteReport from '../models/SiteReport.js';
import Issue from '../models/Issue.js';
import Approval from '../models/Approval.js';
import { connectDB } from '../config/db.js';

dotenv.config();

async function seedDatabase() {
  console.log('🌱 Starting BUILDORA Database Seed...');
  const connected = await connectDB();
  if (!connected) {
    console.error('❌ Cannot seed database: MongoDB connection failed.');
    process.exit(1);
  }

  try {
    // Clear all collections
    console.log('🧹 Clearing existing collections...');
    await User.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();
    await Milestone.deleteMany();
    await Material.deleteMany();
    await InventoryTransaction.deleteMany();
    await MaterialRequest.deleteMany();
    await SiteReport.deleteMany();
    await Issue.deleteMany();
    await Approval.deleteMany();

    // 1. Seed Users
    console.log('👤 Seeding Users...');
    const users = await User.create([
      {
        name: 'Kashish Patel',
        email: 'kashish.pm@buildora.com',
        password: 'Password123!',
        role: 'Project Manager',
        phone: '+91 98765 43210',
      },
      {
        name: 'Vikram Malhotra',
        email: 'admin@buildora.com',
        password: 'Password123!',
        role: 'Admin',
        phone: '+91 98765 43211',
      },
      {
        name: 'Sanjay Verma',
        email: 'sanjay.site@buildora.com',
        password: 'Password123!',
        role: 'Site Supervisor',
        phone: '+91 98765 43212',
      },
      {
        name: 'Rohan Gupta',
        email: 'procurement@buildora.com',
        password: 'Password123!',
        role: 'Procurement Manager',
        phone: '+91 98765 43214',
      },
      {
        name: 'Ananya Iyer',
        email: 'finance@buildora.com',
        password: 'Password123!',
        role: 'Finance',
        phone: '+91 98765 43213',
      },
      {
        name: 'Rajesh Oberoi',
        email: 'client.rep@lodha.com',
        password: 'Password123!',
        role: 'Client',
        phone: '+91 98765 43215',
      },
    ]);

    const pm = users[0];

    // 2. Seed Projects
    console.log('🏗️ Seeding Projects...');
    const projects = await Project.create([
      {
        projectId: 'PRJ-101',
        name: 'Skyline Heights',
        client: 'Apex Developers',
        location: 'Worli, Mumbai',
        manager: 'Kashish Patel',
        progress: 68,
        budget: 185000000,
        committedCost: 35000000,
        actualCost: 124000000,
        startDate: new Date('2025-04-01'),
        deadline: new Date('2027-03-31'),
        status: 'Active',
        description: 'Twin 32-story residential towers with premium clubhouse and subterranean parking.',
        image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
        workersOnSite: 142,
        createdBy: pm._id,
      },
      {
        projectId: 'PRJ-102',
        name: 'Green Valley Residency',
        client: 'Godrej Properties Ltd',
        location: 'Whitefield, Bengaluru',
        manager: 'Kashish Patel',
        progress: 42,
        budget: 120000000,
        committedCost: 28000000,
        actualCost: 54000000,
        startDate: new Date('2025-08-15'),
        deadline: new Date('2027-08-15'),
        status: 'Active',
        description: 'Gated luxury villa community comprising 64 eco-friendly smart homes.',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        workersOnSite: 98,
        createdBy: pm._id,
      },
      {
        projectId: 'PRJ-103',
        name: 'Metro Commercial Complex',
        client: 'Prestige Group',
        location: 'BKC, Mumbai',
        manager: 'Vikram Malhotra',
        progress: 89,
        budget: 240000000,
        committedCost: 18000000,
        actualCost: 215000000,
        startDate: new Date('2024-11-01'),
        deadline: new Date('2026-11-30'),
        status: 'Active',
        description: 'Grade-A corporate office hub with LEED Platinum certified curtain glass facade.',
        image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
        workersOnSite: 210,
        createdBy: pm._id,
      },
    ]);

    const p1 = projects[0];
    const p2 = projects[1];
    const p3 = projects[2];

    // 3. Seed Tasks
    console.log('📋 Seeding Tasks...');
    const tasks = await Task.create([
      {
        taskId: 'TSK-101',
        title: 'Bore Piling & Deep Excavation Shoring',
        description: 'Cast-in-situ bored piles (1200mm dia) down to hard basalt stratum with anchoring.',
        project: p1._id,
        projectId: p1.projectId,
        projectName: p1.name,
        assignee: 'Sanjay Verma',
        priority: 'Critical',
        status: 'Completed',
        startDate: new Date('2025-04-10'),
        dueDate: new Date('2025-06-30'),
        progress: 100,
        createdBy: pm._id,
      },
      {
        taskId: 'TSK-102',
        title: 'Substructure Raft Foundation Pour (3500m³)',
        description: 'Mass concrete pour using M40 self-compacting mix with continuous chilling plant.',
        project: p1._id,
        projectId: p1.projectId,
        projectName: p1.name,
        assignee: 'Sanjay Verma',
        priority: 'Critical',
        status: 'Completed',
        startDate: new Date('2025-07-01'),
        dueDate: new Date('2025-08-31'),
        progress: 100,
        createdBy: pm._id,
      },
      {
        taskId: 'TSK-103',
        title: 'Podium Levels (P1–P3) Post-Tensioned Slabs',
        description: 'Multi-level car park structure with bonded tendon stressing and edge protection.',
        project: p1._id,
        projectId: p1.projectId,
        projectName: p1.name,
        assignee: 'Kashish Patel',
        priority: 'High',
        status: 'Completed',
        startDate: new Date('2025-09-01'),
        dueDate: new Date('2025-11-15'),
        progress: 100,
        createdBy: pm._id,
      },
      {
        taskId: 'TSK-104',
        title: 'Tower A: 18th Floor Slab Casting & Shuttering',
        description: 'Aluminium formwork (Mivan) cycle for 18th residential floor including MEP sleeves.',
        project: p1._id,
        projectId: p1.projectId,
        projectName: p1.name,
        assignee: 'Sanjay Verma',
        priority: 'High',
        status: 'In Progress',
        startDate: new Date('2026-09-01'),
        dueDate: new Date('2026-09-28'),
        progress: 65,
        createdBy: pm._id,
      },
      {
        taskId: 'TSK-105',
        title: 'Tower B: Passenger Elevator Shaft Structural Rail Alignment',
        description: 'Laser plumb calibration of high-speed elevator guide rails (Floors 1–15).',
        project: p1._id,
        projectId: p1.projectId,
        projectName: p1.name,
        assignee: 'Sanjay Verma',
        priority: 'Medium',
        status: 'To Do',
        startDate: new Date('2026-09-20'),
        dueDate: new Date('2026-10-15'),
        progress: 10,
        createdBy: pm._id,
      },
      {
        taskId: 'TSK-106',
        title: 'Fire Suppression Ring Main Hydro-Testing',
        description: 'Pressure testing of 150mm carbon steel riser to 1.5x working head for 4 hours.',
        project: p1._id,
        projectId: p1.projectId,
        projectName: p1.name,
        assignee: 'Rohan Gupta',
        priority: 'Critical',
        status: 'Review',
        startDate: new Date('2026-09-10'),
        dueDate: new Date('2026-09-25'),
        progress: 90,
        createdBy: pm._id,
      },
      {
        taskId: 'TSK-107',
        title: 'Villa 12–20: Brick Masonry & AAC Blockwork',
        description: 'Exterior cavity wall construction with thermal insulation and lintel tie beams.',
        project: p2._id,
        projectId: p2.projectId,
        projectName: p2.name,
        assignee: 'Kashish Patel',
        priority: 'Medium',
        status: 'In Progress',
        startDate: new Date('2026-08-01'),
        dueDate: new Date('2026-10-10'),
        progress: 55,
        createdBy: pm._id,
      },
      {
        taskId: 'TSK-108',
        title: 'Curtain Wall Double-Glazed Facade Installation',
        description: 'Unitized DGU panel lifting via crane and structural silicone seal application.',
        project: p3._id,
        projectId: p3.projectId,
        projectName: p3.name,
        assignee: 'Vikram Malhotra',
        priority: 'Critical',
        status: 'In Progress',
        startDate: new Date('2026-07-15'),
        dueDate: new Date('2026-10-30'),
        progress: 75,
        createdBy: pm._id,
      },
    ]);

    // 4. Seed Milestones
    console.log('🚩 Seeding Milestones...');
    await Milestone.create([
      {
        milestoneId: 'MLS-101',
        project: p1._id,
        projectId: p1.projectId,
        title: 'Substructure & Raft Foundation Sign-Off',
        dueDate: new Date('2025-08-31'),
        progress: 100,
        status: 'Completed',
        responsible: 'Kashish Patel',
        description: 'Third-party structural engineering verification and occupancy NOC for basement excavation.',
      },
      {
        milestoneId: 'MLS-102',
        project: p1._id,
        projectId: p1.projectId,
        title: '18th Floor Slab Concrete Casting & Curing',
        dueDate: new Date('2026-09-30'),
        progress: 65,
        status: 'In Progress',
        responsible: 'Sanjay Verma',
        description: 'Cube strength testing at 7 and 28 days for tower main column load transfer.',
      },
      {
        milestoneId: 'MLS-103',
        project: p1._id,
        projectId: p1.projectId,
        title: 'Roof Terrace Heli-pad Structural Completion',
        dueDate: new Date('2027-01-15'),
        progress: 0,
        status: 'Upcoming',
        responsible: 'Kashish Patel',
        description: 'Reinforced landing deck casting with aviation safety marking approvals.',
      },
      {
        milestoneId: 'MLS-104',
        project: p2._id,
        projectId: p2.projectId,
        title: 'Villa Phase 1 Structural Superstructure Complete',
        dueDate: new Date('2026-11-20'),
        progress: 40,
        status: 'Upcoming',
        responsible: 'Kashish Patel',
        description: 'All 32 initial villa unit frames, roofing tiles and septic grid integration.',
      },
      {
        milestoneId: 'MLS-105',
        project: p3._id,
        projectId: p3.projectId,
        title: 'Curtain Glazing Wind Load Lab Certification',
        dueDate: new Date('2026-10-30'),
        progress: 80,
        status: 'In Progress',
        responsible: 'Vikram Malhotra',
        description: 'Acoustic attenuation and seismic movement compliance tests by Façade India Lab.',
      },
    ]);

    // 5. Seed Materials
    console.log('📦 Seeding Construction Materials...');
    const materials = await Material.create([
      {
        materialId: 'MAT-101',
        name: 'UltraTech OPC 53 Grade Cement',
        category: 'Cement & Binders',
        unit: 'bag',
        description: 'High strength Ordinary Portland Cement for structural concrete casting.',
        projectId: 'PRJ-101',
        projectName: 'Skyline Heights',
        currentStock: 450,
        minimumStock: 800,
        reorderLevel: 1200,
        unitCost: 390,
        status: 'Low Stock',
      },
      {
        materialId: 'MAT-102',
        name: 'Tata Tiscon Fe 500D TMT Rebar (16mm)',
        category: 'Structural & Civil',
        unit: 'ton',
        description: 'High-ductility seismic grade thermo-mechanically treated reinforcement bars.',
        projectId: 'PRJ-101',
        projectName: 'Skyline Heights',
        currentStock: 8.5,
        minimumStock: 15,
        reorderLevel: 25,
        unitCost: 62000,
        status: 'Low Stock',
      },
      {
        materialId: 'MAT-103',
        name: 'Manufactured M-Sand (Washed)',
        category: 'Aggregates & Sand',
        unit: 'ton',
        description: 'Crushed granite zone-II aggregate for concrete work and plastering.',
        projectId: 'PRJ-101',
        projectName: 'Skyline Heights',
        currentStock: 0,
        minimumStock: 150,
        reorderLevel: 400,
        unitCost: 1650,
        status: 'Out of Stock',
      },
      {
        materialId: 'MAT-104',
        name: '20mm Crushed Blue Metal Aggregate',
        category: 'Aggregates & Sand',
        unit: 'ton',
        description: 'Graded stone aggregate for RCC column and slab pours.',
        projectId: 'PRJ-101',
        projectName: 'Skyline Heights',
        currentStock: 320,
        minimumStock: 100,
        reorderLevel: 200,
        unitCost: 1450,
        status: 'In Stock',
      },
      {
        materialId: 'MAT-105',
        name: 'AAC Blocks (600x200x150mm)',
        category: 'Masonry & Precast',
        unit: 'piece',
        description: 'Precision autoclaved aerated lightweight masonry wall blocks.',
        projectId: 'PRJ-102',
        projectName: 'Green Valley Residency',
        currentStock: 3200,
        minimumStock: 1000,
        reorderLevel: 1500,
        unitCost: 68,
        status: 'In Stock',
      },
      {
        materialId: 'MAT-106',
        name: 'Dr. Fixit Fastflex Waterproofing Compound',
        category: 'Waterproofing & Chemicals',
        unit: 'kg',
        description: 'Two-component polymer modified elastomeric waterproof coating.',
        projectId: 'PRJ-101',
        projectName: 'Skyline Heights',
        currentStock: 180,
        minimumStock: 50,
        reorderLevel: 100,
        unitCost: 280,
        status: 'In Stock',
      },
    ]);

    // 6. Seed Inventory Transactions
    console.log('🔄 Seeding Inventory Transactions...');
    await InventoryTransaction.create([
      {
        transactionId: 'TXN-1001',
        material: materials[0]._id,
        materialName: materials[0].name,
        projectId: 'PRJ-101',
        projectName: 'Skyline Heights',
        type: 'IN',
        quantity: 500,
        unit: 'bag',
        balanceAfter: 950,
        reference: 'PO-8821',
        notes: 'Bulk delivery batch from UltraTech cement plant.',
        performedBy: 'Rohan Gupta',
      },
      {
        transactionId: 'TXN-1002',
        material: materials[0]._id,
        materialName: materials[0].name,
        projectId: 'PRJ-101',
        projectName: 'Skyline Heights',
        type: 'OUT',
        quantity: 500,
        unit: 'bag',
        balanceAfter: 450,
        reference: 'ISS-18TH-SLAB',
        notes: 'Issued to batching plant for 18th floor slab RCC pour.',
        performedBy: 'Sanjay Verma',
      },
      {
        transactionId: 'TXN-1003',
        material: materials[1]._id,
        materialName: materials[1].name,
        projectId: 'PRJ-101',
        projectName: 'Skyline Heights',
        type: 'OUT',
        quantity: 12.5,
        unit: 'ton',
        balanceAfter: 8.5,
        reference: 'ISS-REBAR-BEAMS',
        notes: 'Issued for edge beam and shear wall cage binding.',
        performedBy: 'Sanjay Verma',
      },
    ]);

    // 7. Seed Material Requests
    console.log('📋 Seeding Material Requests...');
    await MaterialRequest.create([
      {
        requestId: 'MRQ-501',
        material: materials[0]._id,
        materialName: 'UltraTech OPC 53 Grade Cement',
        projectId: 'PRJ-101',
        projectName: 'Skyline Heights',
        quantity: 800,
        unit: 'bag',
        requestedBy: 'Sanjay Verma (Site Supervisor)',
        status: 'Pending',
        notes: 'Urgent stock needed for upcoming 19th floor column pour.',
      },
      {
        requestId: 'MRQ-502',
        material: materials[1]._id,
        materialName: 'Tata Tiscon Fe 500D TMT Rebar (16mm)',
        projectId: 'PRJ-101',
        projectName: 'Skyline Heights',
        quantity: 25,
        unit: 'ton',
        requestedBy: 'Sanjay Verma (Site Supervisor)',
        status: 'Approved',
        notes: 'Procurement PO raised with Tata Steel distributor.',
      },
    ]);

    // 8. Seed Daily Site Reports
    console.log('📝 Seeding Daily Site Reports...');
    await SiteReport.create([
      {
        reportId: 'REP-901',
        project: p1._id,
        projectId: p1.projectId,
        projectName: p1.name,
        supervisor: 'Sanjay Verma',
        weather: 'Clear, 31°C',
        workersPresent: 142,
        workCompleted: 'Reinforcement bar tying for 18th floor edge beams. Poured 4 columns on North Wing.',
        progressToday: '+0.8%',
        issues: 'None reported.',
        status: 'Submitted',
        date: 'Today, 16 Sep 2026',
        createdBy: pm._id,
      },
      {
        reportId: 'REP-902',
        project: p1._id,
        projectId: p1.projectId,
        projectName: p1.name,
        supervisor: 'Sanjay Verma',
        weather: 'Partly Cloudy, 29°C',
        workersPresent: 138,
        workCompleted: 'Mechanical plumbing line pressure test on floor 14. Completed conduit routing.',
        progressToday: '+1.2%',
        issues: 'Minor delay in aggregate delivery due to traffic checkpoint.',
        status: 'Approved',
        date: 'Yesterday, 15 Sep 2026',
        createdBy: pm._id,
      },
      {
        reportId: 'REP-903',
        project: p2._id,
        projectId: p2.projectId,
        projectName: p2.name,
        supervisor: 'Sanjay Verma',
        weather: 'Sunny, 28°C',
        workersPresent: 98,
        workCompleted: 'Completed exterior boundary wall foundation casting for villas 14 through 18.',
        progressToday: '+1.0%',
        issues: 'None reported.',
        status: 'Approved',
        date: '14 Sep 2026',
        createdBy: pm._id,
      },
    ]);

    // 9. Seed Site Issues
    console.log('⚠️ Seeding Site QA & Safety Issues...');
    await Issue.create([
      {
        issueId: 'ISS-101',
        title: 'Tower Crane 2 hydraulic pressure variation',
        project: p1._id,
        projectId: p1.projectId,
        projectName: p1.name,
        priority: 'High',
        status: 'In Progress',
        assignee: 'Sanjay Verma',
        description: 'Hydraulic line pressure dropped 15% during morning lift operation. OEM technician scheduled.',
        date: 'Today',
        createdBy: pm._id,
      },
      {
        issueId: 'ISS-102',
        title: 'M-Sand delivery delayed by 48 hours',
        project: p1._id,
        projectId: p1.projectId,
        projectName: p1.name,
        priority: 'Medium',
        status: 'Open',
        assignee: 'Sanjay Verma',
        description: 'Quarry transport strike delaying bulk sand trucks across Panvel corridor.',
        date: 'Yesterday',
        createdBy: pm._id,
      },
      {
        issueId: 'ISS-103',
        title: 'Waterproofing membrane pinhole detected on terrace deck',
        project: p3._id,
        projectId: p3.projectId,
        projectName: p3.name,
        priority: 'Critical',
        status: 'Open',
        assignee: 'Vikram Malhotra',
        description: 'Water retention test showed 5mm drop over 24h near parapet scupper.',
        date: '14 Sep 2026',
        createdBy: pm._id,
      },
    ]);

    // 10. Seed Commercial Approvals
    console.log('💰 Seeding Commercial Approvals & Purchase Requests...');
    await Approval.create([
      {
        approvalId: 'APP-401',
        type: 'Purchase Request',
        title: 'UltraTech OPC 53 Grade Cement (800 Bags)',
        project: p1._id,
        projectId: p1.projectId,
        projectName: p1.name,
        requestedBy: 'Sanjay Verma (Site Supervisor)',
        amount: '₹3,12,000',
        amountNum: 312000,
        vendor: 'UltraTech Cement Authorized Dealer',
        priority: 'High',
        status: 'Pending',
        notes: 'Required for 19th floor RCC slab pour schedule.',
        createdBy: pm._id,
      },
      {
        approvalId: 'APP-402',
        type: 'Material Requisition',
        title: 'Tata Tiscon Fe 500D TMT Rebar (25 Tons)',
        project: p1._id,
        projectId: p1.projectId,
        projectName: p1.name,
        requestedBy: 'Sanjay Verma (Site Supervisor)',
        amount: '₹15,50,000',
        amountNum: 1550000,
        vendor: 'Tata Steel Distributor',
        priority: 'Critical',
        status: 'Approved',
        notes: 'Approved by Project Manager for immediate dispatch.',
        reviewedBy: 'Kashish Patel (Project Manager)',
        reviewedAt: new Date(),
        createdBy: pm._id,
      },
      {
        approvalId: 'APP-403',
        type: 'Purchase Request',
        title: 'Kirloskar 125 kVA Silent DG Set Fuel Top-Up (1200 Litres)',
        project: p1._id,
        projectId: p1.projectId,
        projectName: p1.name,
        requestedBy: 'Sanjay Verma (Site Supervisor)',
        amount: '₹1,08,000',
        amountNum: 108000,
        vendor: 'Indian Oil Commercial Outlets',
        priority: 'Normal',
        status: 'Pending',
        notes: 'Backup power generator fuel replenishment for tower hoist.',
        createdBy: pm._id,
      },
      {
        approvalId: 'APP-404',
        type: 'Site Variance Claim',
        title: 'Basement Dewatering High-Capacity Submersible Pump Replacement',
        project: p2._id,
        projectId: p2.projectId,
        projectName: p2.name,
        requestedBy: 'Sanjay Verma (Site Supervisor)',
        amount: '₹85,000',
        amountNum: 85000,
        vendor: 'Crompton Industrial Solutions',
        priority: 'Normal',
        status: 'Pending',
        notes: 'Unexpected groundwater ingress during pre-monsoon shower.',
        createdBy: pm._id,
      },
    ]);

    console.log('✅ BUILDORA Database Seed completed successfully with full relational collections!');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Seed error: ${error.message}`);
    process.exit(1);
  }
}

seedDatabase();
