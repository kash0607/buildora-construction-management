import Material from '../models/Material.js';
import InventoryTransaction from '../models/InventoryTransaction.js';
import MaterialRequest from '../models/MaterialRequest.js';
import { calculateStockStatus, validateStockIssue } from './businessRules.js';

export class InventoryService {
  /**
   * Receive stock (IN): Increment stock, recalculate status, record transaction
   */
  async receiveStock({ materialId, quantity, unit, reference, notes, user }) {
    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      throw new Error('Received quantity must be a positive number greater than zero.');
    }

    const isObjectId = String(materialId).match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: materialId } : { materialId };

    const material = await Material.findOne(query);
    if (!material) {
      throw new Error(`Material '${materialId}' not found.`);
    }

    material.currentStock = (material.currentStock || 0) + qty;
    material.status = calculateStockStatus(material.currentStock, material.reorderLevel);
    await material.save();

    const count = await InventoryTransaction.countDocuments();
    const transactionId = 'TXN-' + String(1001 + count);

    const transaction = new InventoryTransaction({
      transactionId,
      material: material._id,
      materialName: material.name,
      project: material.project,
      projectId: material.projectId,
      projectName: material.projectName,
      type: 'IN',
      quantity: qty,
      unit: unit || material.unit,
      balanceAfter: material.currentStock,
      reference: reference || 'GRN-' + Date.now().toString().slice(-6),
      notes: notes || 'Stock received at site store.',
      performedBy: user ? user.name : 'Procurement Officer',
      createdBy: user?._id,
    });

    await transaction.save();

    return {
      material,
      transaction,
    };
  }

  /**
   * Issue stock to site (OUT): Enforce non-negative stock, decrement, record transaction
   */
  async issueStock({ materialId, quantity, unit, reference, notes, user }) {
    const isObjectId = String(materialId).match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: materialId } : { materialId };

    const material = await Material.findOne(query);
    if (!material) {
      throw new Error(`Material '${materialId}' not found.`);
    }

    const validation = validateStockIssue(material.currentStock, quantity);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    material.currentStock = validation.balanceAfter;
    material.status = calculateStockStatus(material.currentStock, material.reorderLevel);
    await material.save();

    const count = await InventoryTransaction.countDocuments();
    const transactionId = 'TXN-' + String(1001 + count);

    const transaction = new InventoryTransaction({
      transactionId,
      material: material._id,
      materialName: material.name,
      project: material.project,
      projectId: material.projectId,
      projectName: material.projectName,
      type: 'OUT',
      quantity: Number(quantity),
      unit: unit || material.unit,
      balanceAfter: material.currentStock,
      reference: reference || 'ISS-' + Date.now().toString().slice(-6),
      notes: notes || 'Stock issued for construction activities.',
      performedBy: user ? user.name : 'Site Supervisor',
      createdBy: user?._id,
    });

    await transaction.save();

    return {
      material,
      transaction,
    };
  }

  /**
   * Audit adjustment (ADJUSTMENT): Correct stock level, record transaction
   */
  async adjustStock({ materialId, newStock, unit, reference, notes, user }) {
    const targetStock = Number(newStock);
    if (isNaN(targetStock) || targetStock < 0) {
      throw new Error('New stock count cannot be negative.');
    }

    const isObjectId = String(materialId).match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: materialId } : { materialId };

    const material = await Material.findOne(query);
    if (!material) {
      throw new Error(`Material '${materialId}' not found.`);
    }

    const delta = targetStock - material.currentStock;
    material.currentStock = targetStock;
    material.status = calculateStockStatus(material.currentStock, material.reorderLevel);
    await material.save();

    const count = await InventoryTransaction.countDocuments();
    const transactionId = 'TXN-' + String(1001 + count);

    const transaction = new InventoryTransaction({
      transactionId,
      material: material._id,
      materialName: material.name,
      project: material.project,
      projectId: material.projectId,
      projectName: material.projectName,
      type: 'ADJUSTMENT',
      quantity: Math.abs(delta),
      unit: unit || material.unit,
      balanceAfter: targetStock,
      reference: reference || 'AUDIT-' + Date.now().toString().slice(-6),
      notes: notes || `Stock audit adjustment: from ${material.currentStock - delta} to ${targetStock}`,
      performedBy: user ? user.name : 'Store Auditor',
      createdBy: user?._id,
    });

    await transaction.save();

    return {
      material,
      transaction,
    };
  }

  /**
   * Get all materials with optional category/status/project filters
   */
  async getMaterials(filters = {}) {
    const query = {};

    if (filters.category && filters.category !== 'All') {
      query.category = filters.category;
    }

    if (filters.status && filters.status !== 'All') {
      query.status = filters.status;
    }

    if (filters.project && filters.project !== 'All') {
      const isObjectId = filters.project.match(/^[0-9a-fA-F]{24}$/);
      if (isObjectId) {
        query.project = filters.project;
      } else {
        query.projectId = filters.project;
      }
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { description: searchRegex }, { projectName: searchRegex }];
    }

    return await Material.find(query).sort({ name: 1 });
  }

  /**
   * Get low-stock and critical stock materials
   */
  async getLowStockMaterials() {
    return await Material.find({
      status: { $in: ['Low Stock', 'Out of Stock'] },
    }).sort({ currentStock: 1 });
  }

  /**
   * Get recent transactions
   */
  async getTransactions(limit = 50) {
    return await InventoryTransaction.find().sort({ createdAt: -1 }).limit(limit);
  }

  /**
   * Create a material request
   */
  async createMaterialRequest(data, user) {
    const count = await MaterialRequest.countDocuments();
    const requestId = 'MRQ-' + String(501 + count);

    const request = new MaterialRequest({
      requestId,
      ...data,
      requestedBy: user ? `${user.name} (${user.role})` : data.requestedBy || 'Site Supervisor',
      createdBy: user?._id,
    });

    return await request.save();
  }

  /**
   * Get material requests
   */
  async getMaterialRequests(filters = {}) {
    const query = {};
    if (filters.status && filters.status !== 'All') {
      query.status = filters.status;
    }
    if (filters.project && filters.project !== 'All') {
      query.projectId = filters.project;
    }
    return await MaterialRequest.find(query).sort({ createdAt: -1 });
  }
}

export const inventoryService = new InventoryService();
