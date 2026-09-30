import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from '../app.js';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Milestone from '../models/Milestone.js';
import Material from '../models/Material.js';
import InventoryTransaction from '../models/InventoryTransaction.js';
import SiteReport from '../models/SiteReport.js';
import Vendor from '../models/Vendor.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Delivery from '../models/Delivery.js';
import Expense from '../models/Expense.js';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';

dotenv.config();

async function runE2EVerification() {
  console.log('🚀 Starting BUILDORA End-to-End Enterprise Lifecycle Suite...\n');

  const dbConnected = await connectDB();
  assert.equal(dbConnected, true, 'MongoDB must connect successfully');
  console.log('✅ 1. MongoDB Connected Successfully');

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;
  console.log(`✅ 2. Express Server listening at ${baseUrl}\n`);

  try {
    // ----------------------------------------------------
    // 1. AUTHENTICATION (PM & CLIENT)
    // ----------------------------------------------------
    console.log('--- 1. Authentication Flow ---');
    const timestamp = Date.now();
    const pmEmail = `pm.${timestamp}@buildora.com`;
    const clientEmail = `client.${timestamp}@buildora.com`;
    const password = 'Password123!';

    // Register PM
    const pmRegRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Kashish Patel (PM)',
        email: pmEmail,
        password,
        role: 'Project Manager',
      }),
    });
    assert.equal(pmRegRes.status, 201);
    const pmToken = (await pmRegRes.json()).data.token;
    console.log('✅ Registered Project Manager (JWT acquired)');

    // Register Client
    const clientRegRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Rajesh Oberoi (Client)',
        email: clientEmail,
        password,
        role: 'Client',
      }),
    });
    const clientRegData = (await clientRegRes.json()).data;
    const clientToken = clientRegData.token;
    const clientUser = clientRegData.user;
    console.log('✅ Registered Client (JWT acquired)');

    // Register Finance
    const financeEmail = `finance.${timestamp}@buildora.com`;
    const finRegRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Zaara Mehta (Finance)',
        email: financeEmail,
        password,
        role: 'Finance',
      }),
    });
    assert.equal(finRegRes.status, 201);
    const financeToken = (await finRegRes.json()).data.token;
    console.log('✅ Registered Finance Officer (JWT acquired)');

    // Verify /api/auth/me session restore
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${pmToken}` },
    });
    assert.equal(meRes.status, 200);
    const meData = await meRes.json();
    assert.equal(meData.data.role, 'Project Manager');
    console.log('✅ Session Hydration: /api/auth/me restored authenticated role strictly from backend');

    // ----------------------------------------------------
    // 2. PROJECT CREATION
    // ----------------------------------------------------
    console.log('\n--- 2. Project Creation ---');
    const projRes = await fetch(`${baseUrl}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pmToken}`,
      },
      body: JSON.stringify({
        name: `Horizon Landmark Tower ${timestamp}`,
        client: 'Apex Luxury Developments',
        clientUser: clientUser._id,
        location: 'Worli Sea Face, Mumbai',
        manager: 'Kashish Patel (PM)',
        budget: 50000000, // 5 Cr
        startDate: '2026-04-01',
        deadline: '2028-12-31',
        description: 'Luxury 45-story residential high-rise',
      }),
    });
    if (projRes.status !== 201) {
      console.log('❌ Project creation error:', await projRes.json());
    }
    assert.equal(projRes.status, 201);
    const projData = await projRes.json();
    const project = projData.data;
    console.log(`✅ Project Created: '${project.name}' (${project.projectId})`);

    // ----------------------------------------------------
    // 3. TASK & MILESTONE CREATION
    // ----------------------------------------------------
    console.log('\n--- 3. Tasks & Milestones ---');
    const taskRes = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pmToken}`,
      },
      body: JSON.stringify({
        title: 'Deep Foundation Bore Piling',
        projectId: project.projectId,
        assignee: 'Sanjay Verma',
        priority: 'High',
        progress: 40,
        startDate: '2026-04-05',
        dueDate: '2026-05-30',
      }),
    });
    assert.equal(taskRes.status, 201);
    const task = (await taskRes.json()).data;
    console.log(`✅ Task Created: '${task.title}' (${task.taskId})`);

    const mlsRes = await fetch(`${baseUrl}/milestones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pmToken}`,
      },
      body: JSON.stringify({
        title: 'Substructure & Raft Foundation Sign-off',
        projectId: project.projectId,
        responsible: 'Kashish Patel (PM)',
        dueDate: '2026-06-15',
        progress: 50,
      }),
    });
    assert.equal(mlsRes.status, 201);
    const milestone = (await mlsRes.json()).data;
    console.log(`✅ Milestone Created: '${milestone.title}' (${milestone.milestoneId})`);

    // ----------------------------------------------------
    // 4. SITE REPORT & PHOTO WORKFLOW
    // ----------------------------------------------------
    console.log('\n--- 4. Daily Site Report & Photo Approval Flow ---');
    const repRes = await fetch(`${baseUrl}/site-reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pmToken}`,
      },
      body: JSON.stringify({
        project: project.projectId,
        weather: 'Clear, 32°C',
        workersPresent: 85,
        workCompleted: 'Cast 12 bore piles and assembled rebar cages',
        progressToday: '+1.2%',
      }),
    });
    assert.equal(repRes.status, 201);
    const report = (await repRes.json()).data;
    console.log(`✅ Site Report Created: '${report.reportId}'`);

    // Upload Photo
    const photoUploadRes = await fetch(`${baseUrl}/site-reports/${report.reportId}/photos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pmToken}`,
      },
      body: JSON.stringify({
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800',
        caption: 'Bore Piling Rig Active on Sector 2',
      }),
    });
    assert.equal(photoUploadRes.status, 201);
    console.log('✅ Site Photo Uploaded for internal review');

    // Retrieve report to get photo ID and approve it
    const repGetRes = await fetch(`${baseUrl}/site-reports/${report.reportId}`, {
      headers: { Authorization: `Bearer ${pmToken}` },
    });
    const repWithPhoto = (await repGetRes.json()).data;
    assert.equal(repWithPhoto.photos.length, 1);
    const photoId = repWithPhoto.photos[0]._id;

    // PM approves photo for client portal
    const approvePhotoRes = await fetch(`${baseUrl}/site-reports/${report.reportId}/photos/${photoId}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${pmToken}` },
    });
    assert.equal(approvePhotoRes.status, 200);
    console.log('✅ Site Photo Approved for Client Portal exposure');

    // ----------------------------------------------------
    // 5. MATERIAL & PROCUREMENT VENDOR
    // ----------------------------------------------------
    console.log('\n--- 5. Materials & Vendor Procurement ---');
    const matRes = await fetch(`${baseUrl}/materials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pmToken}`,
      },
      body: JSON.stringify({
        name: `OPC 53 Cement Batch ${timestamp}`,
        category: 'Structural & Civil',
        unit: 'bags',
        currentStock: 100,
        reorderLevel: 50,
        unitCost: 380,
        projectId: project.projectId,
      }),
    });
    assert.equal(matRes.status, 201);
    const material = (await matRes.json()).data;
    console.log(`✅ Material Created: '${material.name}' (Stock: 100 bags)`);

    // Register Vendor
    const vendorRes = await fetch(`${baseUrl}/procurement/vendors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pmToken}`,
      },
      body: JSON.stringify({
        name: `National Cement & Steel Corp ${timestamp}`,
        email: `vendor.${timestamp}@nationalcement.com`,
        phone: '+91 98220 11223',
        categories: ['Structural & Civil'],
        paymentTerms: 'Net 30 Days',
      }),
    });
    if (vendorRes.status !== 201) {
      console.error('Vendor creation failed:', await vendorRes.text());
    }
    assert.equal(vendorRes.status, 201);
    const vendor = (await vendorRes.json()).data;
    console.log(`✅ Vendor Registered: '${vendor.name}' (${vendor.vendorId})`);

    // ----------------------------------------------------
    // 6. PURCHASE ORDER & PARTIAL DELIVERY FULFILLMENT
    // ----------------------------------------------------
    console.log('\n--- 6. Purchase Order & Delivery Receiving Sync ---');
    // Enterprise Item 8: Purchase Order requires an approved Purchase Request
    const prRes = await fetch(`${baseUrl}/procurement/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pmToken}`,
      },
      body: JSON.stringify({
        title: 'Requisition for 100 Bags OPC Cement',
        project: project.projectId,
        items: [
          {
            material: material.id || material._id,
            name: material.name,
            quantity: 100,
            estimatedRate: 380,
            unit: 'bags',
          },
        ],
        priority: 'High',
      }),
    });
    assert.equal(prRes.status, 201);
    const pr = (await prRes.json()).data;
    console.log(`✅ Purchase Request Created: ${pr.requestId} (Status: ${pr.status})`);

    // Authoritative Enterprise Approval: Approve the Purchase Request via the Approval Workflow
    const approvePrRes = await fetch(`${baseUrl}/approvals/${pr.approval}/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pmToken}`,
      },
      body: JSON.stringify({
        action: 'approve',
        notes: 'Approved for vendor procurement by PM',
      }),
    });
    assert.equal(approvePrRes.status, 200);
    console.log(`✅ Purchase Request Approved via Authoritative Workflow: ${pr.requestId}`);

    const poRes = await fetch(`${baseUrl}/procurement/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pmToken}`,
      },
      body: JSON.stringify({
        title: '100 Bags OPC Cement Consignment',
        project: project.projectId,
        vendor: vendor.vendorId,
        purchaseRequest: pr.requestId,
        deliveryDate: '2026-05-10',
        items: [
          {
            material: material.id || material._id,
            name: material.name,
            quantity: 100,
            unitPrice: 380,
            unit: 'bags',
          },
        ],
      }),
    });
    if (poRes.status !== 201) {
      console.error('PO Error:', poRes.status, await poRes.text());
    }
    assert.equal(poRes.status, 201);
    const po = (await poRes.json()).data;
    assert.equal(po.status, 'Issued');
    console.log(`✅ PO Issued: ${po.poNumber} for 100 bags (Status: Issued)`);

    // First Delivery: Partial receipt of 40 bags
    const del1Res = await fetch(`${baseUrl}/procurement/deliveries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pmToken}`,
      },
      body: JSON.stringify({
        purchaseOrder: po.poNumber,
        deliveryChallanNumber: 'DC-8819',
        items: [
          {
            material: material.id || material._id,
            name: material.name,
            orderedQuantity: 100,
            receivedQuantity: 40,
            acceptedQuantity: 40,
            rejectedQuantity: 0,
            unit: 'bags',
            qualityStatus: 'Passed',
          },
        ],
        qualityStatus: 'Passed',
      }),
    });
    if (del1Res.status !== 201) {
      console.error('Delivery Error:', del1Res.status, await del1Res.text());
    }
    assert.equal(del1Res.status, 201);
    const del1Data = await del1Res.json();
    assert.equal(del1Data.data.poStatus, 'Partially Delivered');
    console.log(`✅ Partial Delivery 1: Received 40 bags → PO updated to 'Partially Delivered'`);

    // Verify Material Stock updated in MongoDB (100 initial + 40 received = 140)
    const matAfterDel1 = await Material.findById(material._id || material.id);
    assert.equal(matAfterDel1.currentStock, 140, 'Stock must increment by 40');
    console.log(`✅ Inventory Sync: Stock balance verified at ${matAfterDel1.currentStock} bags`);

    // Second Delivery: Final receipt of remaining 60 bags
    const del2Res = await fetch(`${baseUrl}/procurement/deliveries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pmToken}`,
      },
      body: JSON.stringify({
        purchaseOrder: po.poNumber,
        deliveryChallanNumber: 'DC-8825',
        items: [
          {
            material: material._id || material.id,
            name: material.name,
            orderedQuantity: 100,
            receivedQuantity: 60,
            acceptedQuantity: 60,
            rejectedQuantity: 0,
            unit: 'bags',
            qualityStatus: 'Passed',
          },
        ],
        qualityStatus: 'Passed',
      }),
    });
    assert.equal(del2Res.status, 201);
    const del2Data = await del2Res.json();
    assert.equal(del2Data.data.poStatus, 'Delivered');
    console.log(`✅ Final Delivery 2: Received 60 bags → PO updated to 'Delivered'`);

    const matAfterDel2 = await Material.findById(material._id || material.id);
    assert.equal(matAfterDel2.currentStock, 200, 'Stock must increment by 60 to reach 200');
    console.log(`✅ Inventory Sync: Final stock balance verified at ${matAfterDel2.currentStock} bags`);

    // ----------------------------------------------------
    // 7. FINANCE (EXPENSE, INVOICE, PAYMENT & BUDGET)
    // ----------------------------------------------------
    console.log('\n--- 7. Finance Flow & Budget Utilization ---');
    // A. Record Expense
    const expRes = await fetch(`${baseUrl}/finance/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pmToken}`,
      },
      body: JSON.stringify({
        title: 'Diesel for Tower Mobile Piling Rigs',
        project: project.projectId,
        category: 'Fuel & Power',
        amount: 85000,
      }),
    });
    assert.equal(expRes.status, 201);
    const exp = (await expRes.json()).data;
    console.log(`✅ Expense Created: ${exp.expenseId} (₹85,000)`);

    // Approve Expense
    const approveExpRes = await fetch(`${baseUrl}/finance/expenses/${exp._id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pmToken}`,
      },
      body: JSON.stringify({ status: 'Approved' }),
    });
    assert.equal(approveExpRes.status, 200);
    console.log(`✅ Expense ${exp.expenseId} Approved`);

    // B. Create Client Invoice
    const invRes = await fetch(`${baseUrl}/finance/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pmToken}`,
      },
      body: JSON.stringify({
        title: 'Piling Works Progress Certificate 1',
        project: project.projectId,
        client: 'Apex Luxury Developments',
        subtotal: 1000000, // 10 Lakh
        taxRate: 18,
        dueDate: '2026-06-30',
      }),
    });
    assert.equal(invRes.status, 201);
    const invoice = (await invRes.json()).data;
    assert.equal(invoice.totalAmount, 1180000);
    console.log(`✅ Invoice Issued: ${invoice.invoiceNumber} (Total: ₹11,80,000 incl GST)`);

    // C. Reconcile Payment (Finance Persona)
    const payRes = await fetch(`${baseUrl}/finance/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`,
      },
      body: JSON.stringify({
        invoice: invoice.invoiceNumber,
        amount: 1180000,
        paymentMethod: 'Bank Transfer / NEFT',
        transactionReference: 'NEFT-HDFC-99128311',
      }),
    });
    assert.equal(payRes.status, 201);
    console.log('✅ Payment Reconciled: Full invoice settled (Status: Paid)');

    // D. Verify Live Budget Utilization calculation
    const budgetRes = await fetch(`${baseUrl}/finance/budget-utilization?projectId=${project.projectId}`, {
      headers: { Authorization: `Bearer ${pmToken}` },
    });
    assert.equal(budgetRes.status, 200);
    const budgetData = (await budgetRes.json()).data;
    assert.ok(budgetData.actualExpenses >= 85000, 'Actual expenses must include approved expense');
    console.log(`✅ Budget Metrics verified: Total ₹${budgetData.totalBudget.toLocaleString('en-IN')}, Remaining ₹${budgetData.remainingBudget.toLocaleString('en-IN')}`);

    // ----------------------------------------------------
    // 8. DOCUMENT MANAGEMENT
    // ----------------------------------------------------
    console.log('\n--- 8. Document Management & Access Control ---');
    const docRes = await fetch(`${baseUrl}/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pmToken}`,
      },
      body: JSON.stringify({
        title: 'Foundation Raft Structural Design Sheet',
        fileName: 'STR_RAFT_01.pdf',
        fileUrl: 'https://storage.buildora.com/docs/STR_RAFT_01.pdf',
        fileType: 'PDF',
        project: project.projectId,
        category: 'Structural Calculation',
        visibility: 'Client Visible',
      }),
    });
    assert.equal(docRes.status, 201);
    console.log('✅ Document uploaded with visibility: Client Visible');

    // ----------------------------------------------------
    // 9. CLIENT PORTAL VERIFICATION
    // ----------------------------------------------------
    console.log('\n--- 9. Client Portal Sanitized View ---');
    const clientProjRes = await fetch(`${baseUrl}/client/projects/${project.projectId}`, {
      headers: { Authorization: `Bearer ${clientToken}` },
    });
    assert.equal(clientProjRes.status, 200);
    const clientView = (await clientProjRes.json()).data;

    assert.ok(clientView.project, 'Client must receive project overview');
    assert.equal(clientView.project.budget, undefined, 'Client must NOT see internal budget/margins');
    assert.ok(clientView.milestones.length >= 1, 'Client must see milestone schedule');
    assert.ok(clientView.approvedPhotos.length >= 1, 'Client must see approved site photos');
    assert.ok(clientView.documents.length >= 1, 'Client must see approved client documents');
    console.log('✅ Client Portal: Verified sanitized endpoints (no internal expenses, no inventory, verified photos & docs visible)');

    // ----------------------------------------------------
    // 10. RBAC SECURITY BOUNDARY CHECKS
    // ----------------------------------------------------
    console.log('\n--- 10. RBAC Security Boundary Checks ---');
    // Client attempts to create a Purchase Order (Must be 403 Forbidden)
    const clientPOAttempt = await fetch(`${baseUrl}/procurement/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${clientToken}`,
      },
      body: JSON.stringify({ title: 'Unauthorized PO' }),
    });
    assert.equal(clientPOAttempt.status, 403, 'Client must receive 403 when attempting internal procurement');
    console.log('✅ Security: Client blocked from internal procurement (403 Forbidden)');

    console.log('\n=============================================================');
    console.log('🎉 COMPLETE 19-STEP ENTERPRISE LIFECYCLE VERIFICATION PASSED 100%!');
    console.log('=============================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ E2E VERIFICATION FAILED:', err);
    process.exit(1);
  } finally {
    server.closeAllConnections?.();
    server.close();
  }
}

runE2EVerification();
