import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import { generateToken, authorizeRoles } from '../middleware/authMiddleware.js';

test('API Health: responds to /api/health with status 200 and expected payload', async () => {
  // Use Node.js native fetch with test server
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/api/health`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.message, 'Buildora API is running');
  } finally {
    server.close();
  }
});

test('API Security & Errors: handles unknown routes with 404 and structured error envelope', async () => {
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/api/unknown-endpoint`);
    assert.equal(res.status, 404);

    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.message, /not found/i);
  } finally {
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

test('RBAC Middleware: authorizeRoles allows permitted role and blocks unauthorized', () => {
  const middleware = authorizeRoles('Admin', 'Project Manager');

  // Test authorized user
  let nextCalled = false;
  const reqAuth = { user: { role: 'Project Manager' } };
  const resAuth = {};
  middleware(reqAuth, resAuth, () => {
    nextCalled = true;
  });
  assert.equal(nextCalled, true);

  // Test unauthorized user
  let errorStatus = null;
  let errorJson = null;
  const reqUnauth = { user: { role: 'Site Supervisor' } };
  const resUnauth = {
    status(code) {
      errorStatus = code;
      return this;
    },
    json(data) {
      errorJson = data;
    },
  };
  middleware(reqUnauth, resUnauth, () => {});
  assert.equal(errorStatus, 403);
  assert.equal(errorJson.success, false);
  assert.match(errorJson.message, /insufficient privileges|not authorized/i);
});

test('Auth API: rejects invalid registration request body with 400', async () => {
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '' }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.message, 'Validation failed');
    assert.ok(body.errors);
  } finally {
    server.close();
  }
});
