import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from '../app.js';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Material from '../models/Material.js';
import InventoryTransaction from '../models/InventoryTransaction.js';
import MaterialRequest from '../models/MaterialRequest.js';

dotenv.config();

async function runE2EVerification() {
  console.log('🚀 Starting BUILDORA Week 1 End-to-End Verification Suite...\n');

  // 1. Verify Database Connection
  const dbConnected = await connectDB();
  assert.equal(dbConnected, true, 'MongoDB must connect successfully');
  console.log('✅ 1. MongoDB Connected Successfully');

  // Start HTTP server on ephemeral port
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;
  console.log(`✅ 2. Test Express Server listening at ${baseUrl}\n`);

  try {
    // ----------------------------------------------------
    // TASK N.1: AUTHENTICATION FLOW
    // ----------------------------------------------------
    console.log('--- Testing Authentication Flow ---');
    const testEmail = `e2e.user.${Date.now()}@buildora.com`;
    const testPassword = 'Password123!';
    const testName = 'E2E Test Engineer';

    // A. Register
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: testName,
        email: testEmail,
        password: testPassword,
        role: 'Project Manager',
        phone: '+91 99999 88888',
      }),
    });
    assert.equal(regRes.status, 201, 'Registration must return 201 Created');
    const regData = await regRes.json();
    assert.equal(regData.success, true);
    assert.ok(regData.data?.token, 'Registration must return a JWT token');
    const token = regData.data.token;
    console.log('✅ Register: POST /api/auth/register returned 201 with JWT');

    // B. Verify user in MongoDB
    const mongoUser = await User.findOne({ email: testEmail });
    assert.ok(mongoUser, 'Registered user must exist in MongoDB');
    assert.equal(mongoUser.name, testName);
    console.log(`✅ MongoDB Record: User verified in database (${mongoUser._id})`);

    // C. Login
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });
    assert.equal(loginRes.status, 200, 'Login must return 200 OK');
    const loginData = await loginRes.json();
    assert.equal(loginData.success, true);
    assert.ok(loginData.data?.token);
    console.log('✅ Login: POST /api/auth/login returned 200 with JWT');

    // D. Current User / Session Restore (GET /api/auth/me)
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(meRes.status, 200, 'GET /api/auth/me must return 200 OK');
    const meData = await meRes.json();
    assert.equal(meData.success, true);
    assert.equal(meData.data.email, testEmail);
    console.log(`✅ Session Restore: GET /api/auth/me restored ${meData.data.email}`);

    // E. Invalid credentials handling
    const invalidLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'WrongPassword!' }),
    });
    assert.equal(invalidLoginRes.status, 401, 'Invalid password must return 401 Unauthorized');
    console.log('✅ Error Handling: Invalid credentials rejected with 401');

    // ----------------------------------------------------
    // TASK N.2: PROJECT FLOW
    // ----------------------------------------------------
    console.log('\n--- Testing Project Flow ---');
    // A. Create Project
    const projRes = await fetch(`${baseUrl}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'E2E Coastal Infrastructure',
        client: 'Port Authority Ltd',
        location: 'Colaba, Mumbai',
        manager: testName,
        budget: 450000000,
        status: 'Active',
        startDate: '2026-04-01',
        deadline: '2028-12-31',
        description: 'Deepwater container berth and approach jetties.',
      }),
    });
    assert.equal(projRes.status, 201, 'Create project must return 201 Created');
    const projData = await projRes.json();
    assert.equal(projData.success, true);
    const createdProject = projData.data;
    assert.ok(createdProject.projectId || createdProject._id);
    const projectId = createdProject.projectId || createdProject._id;
    console.log(`✅ Create Project: Created '${createdProject.name}' (${projectId})`);

    // B. Read Project via API
    const getProjRes = await fetch(`${baseUrl}/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(getProjRes.status, 200);
    const getProjData = await getProjRes.json();
    assert.equal(getProjData.data.name, 'E2E Coastal Infrastructure');
    console.log(`✅ Read Project: Verified GET /api/projects/${projectId}`);

    // C. Verify in MongoDB
    const mongoProject = await Project.findOne({ name: 'E2E Coastal Infrastructure' });
    assert.ok(mongoProject, 'Project must persist in MongoDB');
    console.log(`✅ MongoDB Persistence: Project confirmed in database`);

    // D. Edit Project
    const updateProjRes = await fetch(`${baseUrl}/projects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        location: 'Marine Lines, Mumbai',
        progress: 15,
      }),
    });
    assert.equal(updateProjRes.status, 200);
    const updatedProj = await updateProjRes.json();
    assert.equal(updatedProj.data.location, 'Marine Lines, Mumbai');
    console.log(`✅ Update Project: PUT /api/projects/${projectId} updated location`);

    // ----------------------------------------------------
    // TASK N.3: TASK FLOW
    // ----------------------------------------------------
    console.log('\n--- Testing Task Flow ---');
    // A. Create Task
    const taskRes = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: 'Bore Piling & Anchor Installation',
        description: 'Complete 48 heavy marine piles along northern quay.',
        project: projectId,
        assignee: 'Sanjay Verma',
        priority: 'High',
        status: 'To Do',
        startDate: '2026-04-05',
        dueDate: '2026-06-30',
        progress: 0,
      }),
    });
    assert.equal(taskRes.status, 201, 'Create task must return 201 Created');
    const taskData = await taskRes.json();
    assert.equal(taskData.success, true);
    const createdTask = taskData.data;
    const taskId = createdTask.taskId || createdTask._id;
    console.log(`✅ Create Task: Created '${createdTask.title}' (${taskId})`);

    // B. Read Task
    const getTaskRes = await fetch(`${baseUrl}/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(getTaskRes.status, 200);
    const getTaskData = await getTaskRes.json();
    assert.equal(getTaskData.data.title, 'Bore Piling & Anchor Installation');
    console.log(`✅ Read Task: Verified GET /api/tasks/${taskId}`);

    // C. Edit Task
    const updateTaskRes = await fetch(`${baseUrl}/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: 'In Progress',
        progress: 35,
      }),
    });
    assert.equal(updateTaskRes.status, 200);
    const updatedTask = await updateTaskRes.json();
    assert.equal(updatedTask.data.status, 'In Progress');
    assert.equal(updatedTask.data.progress, 35);
    console.log(`✅ Update Task: PUT /api/tasks/${taskId} status transitioned to In Progress (35%)`);

    // D. Task Summary Stats
    const statsRes = await fetch(`${baseUrl}/tasks/stats/summary?project=${projectId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(statsRes.status, 200);
    const statsData = await statsRes.json();
    assert.ok(statsData.data.total >= 1);
    console.log(`✅ Task Stats: Verified GET /api/tasks/stats/summary (Total: ${statsData.data.total})`);

    // ----------------------------------------------------
    // TASK N.4: MATERIAL FLOW
    // ----------------------------------------------------
    console.log('\n--- Testing Material & Inventory Flow ---');
    // A. Create Material
    const matRes = await fetch(`${baseUrl}/materials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Epoxy Grout Compound E-200',
        category: 'Waterproofing & Chemicals',
        unit: 'kg',
        projectId: projectId,
        projectName: 'E2E Coastal Infrastructure',
        currentStock: 50,
        minimumStock: 40,
        reorderLevel: 100, // stock (50) <= reorder (100) -> Low Stock
        unitCost: 450,
      }),
    });
    assert.equal(matRes.status, 201);
    const matData = await matRes.json();
    const createdMaterial = matData.data;
    const materialId = createdMaterial.materialId || createdMaterial._id;
    assert.equal(createdMaterial.status, 'Low Stock');
    console.log(`✅ Create Material: Created '${createdMaterial.name}' (${materialId}) with status 'Low Stock'`);

    // B. Confirm in MongoDB
    const mongoMaterial = await Material.findOne({ name: 'Epoxy Grout Compound E-200' });
    assert.ok(mongoMaterial);
    console.log(`✅ MongoDB Persistence: Material confirmed in database`);

    // C. Low-Stock Alerts
    const lowStockRes = await fetch(`${baseUrl}/materials/alerts/low-stock`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(lowStockRes.status, 200);
    const lowStockList = await lowStockRes.json();
    const foundAlert = lowStockList.data.some((m) => m.name === 'Epoxy Grout Compound E-200');
    assert.ok(foundAlert, 'New material must appear in low-stock alerts');
    console.log(`✅ Low Stock Logic: Verified in GET /api/materials/alerts/low-stock`);

    // ----------------------------------------------------
    // TASK N.5: INVENTORY FLOW
    // ----------------------------------------------------
    console.log('\n--- Testing Stock Movement Flow ---');
    // A. Receive Stock (IN)
    const receiveRes = await fetch(`${baseUrl}/inventory/receive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        materialId: materialId,
        quantity: 100,
        unit: 'kg',
        reference: 'PO-E2E-001',
        notes: 'Delivery received at harbor warehouse',
      }),
    });
    assert.equal(receiveRes.status, 201);
    const receiveData = await receiveRes.json();
    assert.equal(receiveData.data.material.currentStock, 150); // 50 + 100 = 150 -> In Stock
    assert.equal(receiveData.data.material.status, 'In Stock');
    console.log(`✅ Receive Stock: Received 100 kg. Balance: 150 kg (Status: In Stock)`);

    // B. Issue Stock (OUT)
    const issueRes = await fetch(`${baseUrl}/inventory/issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        materialId: materialId,
        quantity: 30,
        unit: 'kg',
        reference: 'ISS-PIER-01',
        notes: 'Issued for pile cap grouting',
      }),
    });
    assert.equal(issueRes.status, 200);
    const issueData = await issueRes.json();
    assert.equal(issueData.data.material.currentStock, 120); // 150 - 30 = 120
    console.log(`✅ Issue Stock: Issued 30 kg. Balance: 120 kg`);

    // C. Negative Stock Prevention Rule
    const invalidIssueRes = await fetch(`${baseUrl}/inventory/issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        materialId: materialId,
        quantity: 99999, // Exceeds 120
        unit: 'kg',
      }),
    });
    assert.equal(invalidIssueRes.status, 400, 'Negative stock attempt must be rejected with 400');
    console.log(`✅ Negative Stock Protection: Excessive issue rejected with 400 Bad Request`);

    // D. Check Transaction History
    const txnRes = await fetch(`${baseUrl}/inventory/transactions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(txnRes.status, 200);
    const txns = await txnRes.json();
    const hasTxn = txns.data.some((t) => t.reference === 'PO-E2E-001' || t.reference === 'ISS-PIER-01');
    assert.ok(hasTxn, 'Transaction history must contain newly logged inventory movements');
    console.log(`✅ Audit Trail: Transaction history verified via GET /api/inventory/transactions`);

    // ----------------------------------------------------
    // TASK N.6: MATERIAL REQUEST FLOW
    // ----------------------------------------------------
    console.log('\n--- Testing Material Request Flow ---');
    // A. Create Material Request
    const reqRes = await fetch(`${baseUrl}/material-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        materialName: 'Epoxy Grout Compound E-200',
        projectId: projectId,
        projectName: 'E2E Coastal Infrastructure',
        quantity: 200,
        unit: 'kg',
        requiredByDate: '2026-05-15',
        notes: 'Required for phase 2 pile anchoring',
      }),
    });
    assert.equal(reqRes.status, 201);
    const reqData = await reqRes.json();
    const createdReq = reqData.data;
    const reqId = createdReq.requestId || createdReq._id;
    assert.equal(createdReq.status, 'Pending');
    console.log(`✅ Create Request: Created material request '${reqId}' (Status: Pending)`);

    // B. Read Requests
    const getReqsRes = await fetch(`${baseUrl}/material-requests?project=${projectId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(getReqsRes.status, 200);
    const reqsList = await getReqsRes.json();
    const foundReq = reqsList.data.some((r) => (r.requestId || r._id) === reqId);
    assert.ok(foundReq);
    console.log(`✅ Read Requests: Verified GET /api/material-requests`);

    // C. Update Request Status (Approve)
    const updateReqRes = await fetch(`${baseUrl}/material-requests/${reqId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: 'Approved',
        reviewNotes: 'Verified against procurement allocation',
      }),
    });
    assert.equal(updateReqRes.status, 200);
    const updatedReq = await updateReqRes.json();
    assert.equal(updatedReq.data.status, 'Approved');
    console.log(`✅ Update Request: Material request status transitioned to 'Approved'`);

    // ----------------------------------------------------
    // TASK J: RBAC VERIFICATION
    // ----------------------------------------------------
    console.log('\n--- Testing RBAC Restrictions ---');
    // Register a Site Supervisor user
    const supervisorEmail = `supervisor.${Date.now()}@buildora.com`;
    const regSupRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Field Supervisor Test',
        email: supervisorEmail,
        password: testPassword,
        role: 'Site Supervisor',
      }),
    });
    const supervisorToken = (await regSupRes.json()).data.token;

    // Site Supervisor attempts to delete a project (Forbidden for Site Supervisor)
    const deleteRes = await fetch(`${baseUrl}/projects/${projectId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${supervisorToken}` },
    });
    assert.equal(deleteRes.status, 403, 'Site Supervisor must receive 403 Forbidden for DELETE /api/projects/:id');
    console.log('✅ RBAC Enforcement: Site Supervisor blocked from deleting project (403 Forbidden)');

    // Site Supervisor attempts to issue stock (Allowed for Site Supervisor)
    const allowedSupRes = await fetch(`${baseUrl}/inventory/issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supervisorToken}`,
      },
      body: JSON.stringify({
        materialId: materialId,
        quantity: 5,
        unit: 'kg',
        reference: 'ISS-SUPERVISOR-TEST',
      }),
    });
    assert.equal(allowedSupRes.status, 200, 'Site Supervisor must be permitted to issue stock');
    console.log('✅ RBAC Enforcement: Site Supervisor permitted to issue stock (200 OK)');

    // ----------------------------------------------------
    // TASK K: CORS RESTRICTION VERIFICATION
    // ----------------------------------------------------
    console.log('\n--- Testing CORS Configuration ---');
    // Disallowed origin should be rejected
    const corsDisallowedRes = await fetch(`${baseUrl}/health`, {
      headers: { Origin: 'https://malicious-third-party-website.com' },
    });
    const acaoHeader = corsDisallowedRes.headers.get('access-control-allow-origin');
    assert.notEqual(acaoHeader, 'https://malicious-third-party-website.com');
    console.log('✅ CORS Restriction: Unauthorized external origin blocked');

    console.log('\n=============================================================');
    console.log('🎉 ALL WEEK 1 END-TO-END VERIFICATION WORKFLOWS PASSED 100%!');
    console.log('=============================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ E2E VERIFICATION FAILED:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

runE2EVerification();
