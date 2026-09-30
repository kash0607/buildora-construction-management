import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import { generateToken, authorizeRoles } from '../middleware/authMiddleware.js';

test('API Health: responds to /api/health with status 200 and expected payload', async () => {
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/api/health`, {
      headers: { Connection: 'close' },
    });
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.message, 'Buildora API is running');
  } finally {
    server.closeAllConnections?.();
    server.close();
  }
});

test('API Security & Errors: handles unknown routes with 404 and structured error envelope', async () => {
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/api/unknown-endpoint`, {
      headers: { Connection: 'close' },
    });
    assert.equal(res.status, 404);

    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.message, /not found/i);
  } finally {
    server.closeAllConnections?.();
    server.close();
  }
});

test('Auth JWT Middleware: generateToken generates verifiable token with user payload', () => {
  const mockUser = {
    _id: '60d0fe4f5311236168a109ca',
    email: 'kashish.pm@buildora.com',
    role: 'Project Manager',
  };

  const token = generateToken(mockUser);
  assert.ok(token);

  const secret = process.env.JWT_SECRET || 'buildora_default_jwt_secret_key_2026';
  const decoded = jwt.verify(token, secret);

  assert.equal(decoded.id, mockUser._id);
  assert.equal(decoded.email, mockUser.email);
  assert.equal(decoded.role, mockUser.role);
});

test('RBAC Matrix: enforces 403 for unauthorized roles across all 7 platform roles', () => {
  const allRoles = [
    'Admin',
    'Project Manager',
    'Site Supervisor',
    'Procurement Manager',
    'Finance',
    'Client',
    'Vendor',
  ];

  // Test 1: Admin-only resource (e.g. Audit Logs)
  const adminOnlyMiddleware = authorizeRoles('Admin');
  for (const r of allRoles) {
    let nextCalled = false;
    let statusCode = null;
    let errBody = null;

    const req = { user: { role: r } };
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        errBody = data;
      },
    };

    adminOnlyMiddleware(req, res, () => {
      nextCalled = true;
    });

    if (r === 'Admin') {
      assert.equal(nextCalled, true, 'Admin must be authorized');
    } else {
      assert.equal(statusCode, 403, `${r} must receive 403 Forbidden`);
      assert.equal(errBody.success, false);
    }
  }

  // Test 2: Procurement resource (Admin, PM, Procurement Manager allowed)
  const procurementMiddleware = authorizeRoles('Admin', 'Project Manager', 'Procurement Manager');
  const allowedInProcurement = ['Admin', 'Project Manager', 'Procurement Manager'];

  for (const r of allRoles) {
    let nextCalled = false;
    let statusCode = null;

    const req = { user: { role: r } };
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json() {},
    };

    procurementMiddleware(req, res, () => {
      nextCalled = true;
    });

    if (allowedInProcurement.includes(r)) {
      assert.equal(nextCalled, true, `${r} must be allowed`);
    } else {
      assert.equal(statusCode, 403, `${r} must receive 403 Forbidden`);
    }
  }
});

test('Auth API: rejects invalid registration request body with 400', async () => {
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Connection: 'close' },
      body: JSON.stringify({ name: '' }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.message, 'Validation failed');
    assert.ok(body.errors);
  } finally {
    server.closeAllConnections?.();
    server.close();
  }
});
