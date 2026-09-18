import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect routes: Authenticate JWT token and attach user to req.user
 */
export async function protect(req, res, next) {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Authentication token required',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'buildora_default_jwt_secret_key_2026';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User account no longer exists',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account deactivated. Please contact your administrator.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired token',
    });
  }
}

/**
 * Authorize roles: Enforce RBAC on the backend
 * @param  {...string} roles - Allowed roles
 */
export function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' is not authorized to access this resource`,
      });
    }

    next();
  };
}

/**
 * Helper to generate JWT token for a user
 */
export function generateToken(user) {
  const secret = process.env.JWT_SECRET || 'buildora_default_jwt_secret_key_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn }
  );
}
