import Material from '../models/Material.js';
import { inventoryService } from '../services/inventoryService.js';
import { calculateStockStatus } from '../services/businessRules.js';

/**
 * @desc    Get all materials with filters
 * @route   GET /api/materials
 * @access  Private
 */
export async function getMaterials(req, res, next) {
  try {
    const { category, status, project, search } = req.query;
    const materials = await inventoryService.getMaterials({
      category,
      status,
      project,
      search,
    });

    return res.status(200).json({
      success: true,
      data: materials,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Get single material by ID
 * @route   GET /api/materials/:id
 * @access  Private
 */
export async function getMaterial(req, res, next) {
  try {
    const isObjectId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: req.params.id } : { materialId: req.params.id };

    const material = await Material.findOne(query);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: `Material '${req.params.id}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: material,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Create a new material
 * @route   POST /api/materials
 * @access  Private (Admin, Project Manager, Procurement Manager)
 */
export async function createMaterial(req, res, next) {
  try {
    const { name, category, unit, description, projectId, projectName, currentStock, minimumStock, reorderLevel, unitCost } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Material name is required',
        errors: { name: 'Name is required' },
      });
    }

    const count = await Material.countDocuments();
    const materialId = 'MAT-' + String(101 + count);
    const stock = Number(currentStock) || 0;
    const reorder = Number(reorderLevel) || 10;
    const status = calculateStockStatus(stock, reorder);

    const material = new Material({
      materialId,
      name: name.trim(),
      category: category || 'Structural & Civil',
      unit: unit || 'bag',
      description: description || '',
      projectId: projectId || 'PRJ-101',
      projectName: projectName || 'General Store',
      currentStock: stock,
      minimumStock: Number(minimumStock) || 0,
      reorderLevel: reorder,
      unitCost: Number(unitCost) || 0,
      status,
    });

    await material.save();

    return res.status(201).json({
      success: true,
      message: 'Material created successfully',
      data: material,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Update material details
 * @route   PUT /api/materials/:id
 * @access  Private (Admin, Project Manager, Procurement Manager)
 */
export async function updateMaterial(req, res, next) {
  try {
    const isObjectId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: req.params.id } : { materialId: req.params.id };

    const material = await Material.findOne(query);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: `Material '${req.params.id}' not found`,
      });
    }

    const allowedUpdates = ['name', 'category', 'unit', 'description', 'projectId', 'projectName', 'minimumStock', 'reorderLevel', 'unitCost'];
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        material[key] = req.body[key];
      }
    }

    // Recalculate status if reorderLevel changed
    material.status = calculateStockStatus(material.currentStock, material.reorderLevel);
    await material.save();

    return res.status(200).json({
      success: true,
      message: 'Material updated successfully',
      data: material,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Get low-stock alert items
 * @route   GET /api/materials/alerts/low-stock
 * @access  Private
 */
export async function getLowStockAlerts(req, res, next) {
  try {
    const items = await inventoryService.getLowStockMaterials();
    return res.status(200).json({
      success: true,
      data: items,
    });
  } catch (err) {
    next(err);
  }
}
