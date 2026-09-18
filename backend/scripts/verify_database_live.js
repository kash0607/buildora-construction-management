import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from '../app.js';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Milestone from '../models/Milestone.js';
import SiteReport from '../models/SiteReport.js';
import Issue from '../models/Issue.js';
import Approval from '../models/Approval.js';

dotenv.config();

async function runLiveDatabaseVerification() {
  console.log('🧪 Starting Buildora Full Live Database & API Verification...\n');

  const connected = await connectDB();
  assert.equal(connected, true, 'Database must be connected');

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;
  console.log(`🌐 Test server listening on ${baseUrl}\n`);

  try {
    // 1. Authenticate with seeded user
    console.log('--- 1. Testing Live Database Auth ---');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'kashish.pm@buildora.com',
        password: 'Password123!',
      }),
    });
    const loginData = await loginRes.json();
    assert.equal(loginRes.status, 200, 'Login must succeed');
    assert.ok(loginData.data?.token, 'Token must be returned');
    const token = loginData.data.token;
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    console.log('✅ Logged in successfully with seeded user kashish.pm@buildora.com');

    // 2. Dashboard Stats from Database
    console.log('\n--- 2. Testing Live Dashboard Telemetry ---');
    const statsRes = await fetch(`${baseUrl}/dashboard/stats`, { headers: authHeaders });
    const statsData = await statsRes.json();
    assert.equal(statsRes.status, 200);
    assert.equal(statsData.success, true);
    assert.ok(statsData.data.activeProjects >= 3, 'Must have at least 3 active projects');
    assert.ok(statsData.data.totalBudget > 0, 'Total budget must be greater than 0');
    assert.ok(statsData.data.pendingApprovals >= 1, 'Must have pending approvals');
    console.log(`✅ Dashboard stats loaded from MongoDB: ${statsData.data.activeProjects} active projects, ${statsData.data.totalBudgetFormatted} budget, ${statsData.data.pendingApprovals} pending approvals`);

    // 3. Analytics Summary from Database
    console.log('\n--- 3. Testing Live Analytics ---');
    const anaRes = await fetch(`${baseUrl}/dashboard/analytics`, { headers: authHeaders });
    const anaData = await anaRes.json();
    assert.equal(anaRes.status, 200);
    assert.equal(anaData.success, true);
    assert.ok(Array.isArray(anaData.data.projectHealth.counts));
    console.log('✅ Dashboard analytics loaded from MongoDB');

    // 4. Milestones from Database
    console.log('\n--- 4. Testing Milestones Database Persistence ---');
    const mlsRes = await fetch(`${baseUrl}/milestones`, { headers: authHeaders });
    const mlsData = await mlsRes.json();
    assert.equal(mlsRes.status, 200);
    assert.ok(mlsData.data.length >= 5, 'Must have seeded milestones in MongoDB');
    console.log(`✅ Retrieved ${mlsData.data.length} milestones from MongoDB`);

    // Create a new Milestone
    const newMlsRes = await fetch(`${baseUrl}/milestones`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Facade Air Tightness Inspection',
        dueDate: '2026-12-15',
        responsible: 'Kashish Patel',
        projectId: 'PRJ-101',
        progress: 0,
        status: 'Upcoming',
      }),
    });
    const newMlsData = await newMlsRes.json();
    assert.equal(newMlsRes.status, 201);
    assert.ok(newMlsData.data.milestoneId);
    console.log(`✅ Created new milestone ${newMlsData.data.milestoneId} in MongoDB`);

    // 5. Site Reports from Database
    console.log('\n--- 5. Testing Daily Site Reports Database Persistence ---');
    const repRes = await fetch(`${baseUrl}/site-reports`, { headers: authHeaders });
    const repData = await repRes.json();
    assert.equal(repRes.status, 200);
    assert.ok(repData.data.length >= 3, 'Must have seeded site reports in MongoDB');
    console.log(`✅ Retrieved ${repData.data.length} site reports from MongoDB`);

    // Create a new Site Report
    const newRepRes = await fetch(`${baseUrl}/site-reports`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        project: 'Skyline Heights',
        weather: 'Clear, 32°C',
        workersPresent: 145,
        workCompleted: 'Testing slab sensor wiring and conduit integrity.',
        issues: 'None reported.',
      }),
    });
    const newRepData = await newRepRes.json();
    assert.equal(newRepRes.status, 201);
    assert.ok(newRepData.data.reportId);
    console.log(`✅ Created new site report ${newRepData.data.reportId} in MongoDB`);

    // 6. Issues from Database
    console.log('\n--- 6. Testing Site Issues Database Persistence ---');
    const issRes = await fetch(`${baseUrl}/issues`, { headers: authHeaders });
    const issData = await issRes.json();
    assert.equal(issRes.status, 200);
    assert.ok(issData.data.length >= 3, 'Must have seeded issues in MongoDB');
    console.log(`✅ Retrieved ${issData.data.length} issues from MongoDB`);

    // Create a new Issue
    const newIssRes = await fetch(`${baseUrl}/issues`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Safety mesh torn on 12th floor perimeter',
        project: 'Skyline Heights',
        priority: 'High',
        assignee: 'Sanjay Verma',
        description: 'Wind gusts loosened anchor hooks on western face.',
      }),
    });
    const newIssData = await newIssRes.json();
    assert.equal(newIssRes.status, 201);
    assert.ok(newIssData.data.issueId);
    console.log(`✅ Created new issue ${newIssData.data.issueId} in MongoDB`);

    // 7. Approvals from Database
    console.log('\n--- 7. Testing Commercial Approvals Database Persistence ---');
    const appRes = await fetch(`${baseUrl}/approvals`, { headers: authHeaders });
    const appData = await appRes.json();
    assert.equal(appRes.status, 200);
    assert.ok(appData.data.length >= 4, 'Must have seeded approvals in MongoDB');
    console.log(`✅ Retrieved ${appData.data.length} approvals from MongoDB`);

    const pendingItem = appData.data.find((a) => a.status === 'Pending');
    assert.ok(pendingItem, 'Must have at least one pending approval');

    // Approve the pending item
    const actionRes = await fetch(`${baseUrl}/approvals/${pendingItem.id || pendingItem._id}/action`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        action: 'approve',
        notes: 'Signed off and approved for procurement dispatch.',
      }),
    });
    const actionData = await actionRes.json();
    assert.equal(actionRes.status, 200);
    assert.equal(actionData.data.status, 'Approved');
    console.log(`✅ Approved request ${pendingItem.id || pendingItem.approvalId} in MongoDB`);

    console.log('\n===============================================================');
    console.log('🎉 ALL LIVE DATABASE PERSISTENCE TESTS PASSED 100%!');
    console.log('===============================================================');
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Verification Error:', err);
    server.close();
    process.exit(1);
  }
}

runLiveDatabaseVerification();
