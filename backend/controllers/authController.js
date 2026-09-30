import User from '../models/User.js';
import { generateToken } from '../middleware/authMiddleware.js';
import { validateRegisterInput, validateLoginInput } from '../validators/authValidator.js';
import { logAudit } from '../services/auditService.js';

// Roles that are safe to self-register via the public /register endpoint.
// Privileged roles (Admin, Finance, Procurement Manager, Client, Vendor)
// must be provisioned by an Admin through a separate admin-only endpoint.
const SELF_REGISTER_ROLES = ['Project Manager', 'Site Supervisor'];

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export async function register(req, res, next) {
  try {
    const validation = validateRegisterInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    const { name, email, password, role, phone } = req.body;

    // Enforce role restrictions
    const requestedRole = role || 'Project Manager';
    if (requestedRole === 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts cannot be self-registered.',
        errors: { role: 'Admin accounts require direct provisioning' },
      });
    }

    const isDevOrTest = process.env.NODE_ENV !== 'production';
    if (!isDevOrTest && !SELF_REGISTER_ROLES.includes(requestedRole)) {
      return res.status(403).json({
        success: false,
        message: `Role '${requestedRole}' cannot be self-registered in production. Contact your organization Admin.`,
        errors: { role: 'This role requires Admin provisioning' },
      });
    }

    // Check duplicate
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
        errors: { email: 'Email is already registered' },
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: requestedRole,
      phone: phone || '',
    });

    const token = generateToken(user);

    await logAudit({
      user: user._id,
      userName: user.name,
      userRole: user.role,
      action: 'REGISTER',
      entity: 'User',
      entityId: user._id.toString(),
      ipAddress: req.ip || '',
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: user.toJSON(),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Authenticate user & get JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
export async function login(req, res, next) {
  try {
    const validation = validateLoginInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact your site administrator.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const token = generateToken(user);

    await logAudit({
      user: user._id,
      userName: user.name,
      userRole: user.role,
      action: 'LOGIN',
      entity: 'User',
      entityId: user._id.toString(),
      ipAddress: req.ip || '',
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: user.toJSON(),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export async function getMe(req, res) {
  return res.status(200).json({
    success: true,
    data: req.user,
  });
}

/**
 * @desc    Get all active users with optional role filtering
 * @route   GET /api/auth/users
 * @access  Private
 */
export async function getUsers(req, res, next) {
  try {
    const { role } = req.query;
    const filter = { isActive: true };
    if (role && role !== 'All') {
      filter.role = role;
    }
    const users = await User.find(filter).select('_id name email role phone').sort({ name: 1 });
    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (err) {
    next(err);
  }
}
