import { inventoryService } from '../services/inventoryService.js';

/**
 * @desc    Get inventory transactions audit trail
 * @route   GET /api/inventory/transactions
 * @access  Private
 */
export async function getTransactions(req, res, next) {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const transactions = await inventoryService.getTransactions(limit);
    return res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Receive new stock into inventory (IN)
 * @route   POST /api/inventory/receive
 * @access  Private (Site Supervisor, Procurement, PM, Admin)
 */
export async function receiveStock(req, res, next) {
  try {
    const { materialId, quantity, unit, reference, notes } = req.body;

    if (!materialId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Material ID and positive quantity are required.',
      });
    }

    const result = await inventoryService.receiveStock({
      materialId,
      quantity,
      unit,
      reference,
      notes,
      user: req.user,
    });

    return res.status(201).json({
      success: true,
      message: `Successfully received ${quantity} ${unit || 'units'} into stock.`,
      data: result,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}

/**
 * @desc    Issue stock from inventory to site (OUT)
 * @route   POST /api/inventory/issue
 * @access  Private (Site Supervisor, PM, Admin)
 */
export async function issueStock(req, res, next) {
  try {
    const { materialId, quantity, unit, reference, notes } = req.body;

    if (!materialId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Material ID and quantity are required.',
      });
    }

    const result = await inventoryService.issueStock({
      materialId,
      quantity,
      unit,
      reference,
      notes,
      user: req.user,
    });

    return res.status(200).json({
      success: true,
      message: `Successfully issued ${quantity} ${unit || 'units'} to site.`,
      data: result,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}

/**
 * @desc    Perform stock audit adjustment (ADJUSTMENT)
 * @route   POST /api/inventory/adjust
 * @access  Private (Admin, PM, Procurement Manager)
 */
export async function adjustStock(req, res, next) {
  try {
    const { materialId, newStock, unit, reference, notes } = req.body;

    if (!materialId || newStock === undefined || newStock === null) {
      return res.status(400).json({
        success: false,
        message: 'Material ID and new stock count are required.',
      });
    }

    const result = await inventoryService.adjustStock({
      materialId,
      newStock,
      unit,
      reference,
      notes,
      user: req.user,
    });

    return res.status(200).json({
      success: true,
      message: `Inventory balance adjusted to ${newStock}.`,
      data: result,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}
