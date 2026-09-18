/**
 * Centralized Error Handling Middleware for Buildora API
 * Enforces unified response envelope:
 * Success: { success: true, data: ... }
 * Error:   { success: false, message: '...' }
 * Valid.:  { success: false, message: 'Validation failed', errors: { ... } }
 */

export function notFound(req, res, next) {
  const error = new Error(`Resource not found: ${req.method} ${req.originalUrl}`);
  res.status(404);
  next(error);
}

export function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Handle Mongoose CastError (bad ObjectId)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(404).json({
      success: false,
      message: `Resource with identifier '${err.value}' not found`,
    });
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({
      success: false,
      message: `A record with this ${field} already exists.`,
      errors: { [field]: `${field} must be unique` },
    });
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const errors = {};
    for (const key of Object.keys(err.errors)) {
      errors[key] = err.errors[key].message;
    }
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid authentication token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Authentication token has expired',
    });
  }

  // General server error
  const response = {
    success: false,
    message: err.message || 'Internal Server Error',
  };

  if (err.errors) {
    response.errors = err.errors;
  }

  if (process.env.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}
