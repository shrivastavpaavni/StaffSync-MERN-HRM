const assert = require('assert');
const http = require('http');
const mongoose = require('mongoose');
const app = require('../server');

let server;
let baseUrl;

const request = async (method, path, body = null, token = null) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
};

const runTests = async () => {
  console.log('\n======================================================');
  console.log('  StaffSync HRM - Automated Backend API Test Suite   ');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(`    Error: ${err.message}`);
      failed++;
    }
  };

  // Start test server on random port
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`[Test Server] Running on ${baseUrl}\n`);
      resolve();
    });
  });

  // Ensure database is connected
  if (mongoose.connection.readyState !== 1) {
    console.log('[Test Suite] Waiting for MongoDB connection...');
    await new Promise((resolve) => mongoose.connection.once('open', resolve));
    console.log('[Test Suite] MongoDB ready!\n');
  }

  try {
    let hrToken = '';
    let managerToken = '';
    let employeeToken = '';
    let employeeId = '';

    // SECTION 1: HEALTH CHECK
    console.log('[1. Health Check]');
    await test('GET /api/health returns online status', async () => {
      const res = await request('GET', '/api/health');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.status, 'online');
    });

    // SECTION 2: AUTHENTICATION TESTING
    console.log('\n[2. Authentication & RBAC Testing]');
    await test('POST /api/auth/login succeeds for HR Director', async () => {
      const res = await request('POST', '/api/auth/login', {
        email: 'hr@staffsync.com',
        password: 'password123',
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.user.role, 'hr');
      assert(res.data.token, 'Token should be returned');
      hrToken = res.data.token;
    });

    await test('POST /api/auth/login succeeds for Manager', async () => {
      const res = await request('POST', '/api/auth/login', {
        email: 'manager@staffsync.com',
        password: 'password123',
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.user.role, 'manager');
      managerToken = res.data.token;
    });

    await test('POST /api/auth/login succeeds for Employee', async () => {
      const res = await request('POST', '/api/auth/login', {
        email: 'employee@staffsync.com',
        password: 'password123',
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.user.role, 'employee');
      assert(res.data.employee, 'Linked employee should be returned');
      employeeToken = res.data.token;
      employeeId = res.data.employee._id;
    });

    await test('POST /api/auth/login rejects wrong password with 401', async () => {
      const res = await request('POST', '/api/auth/login', {
        email: 'employee@staffsync.com',
        password: 'wrong_password',
      });
      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.data.success, false);
    });

    await test('GET /api/auth/me returns current user profile with token', async () => {
      const res = await request('GET', '/api/auth/me', null, employeeToken);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.user.email, 'employee@staffsync.com');
    });

    // SECTION 3: EMPLOYEE MANAGEMENT TESTING
    console.log('\n[3. Employee Management Testing]');
    await test('GET /api/employees returns list for HR', async () => {
      const res = await request('GET', '/api/employees', null, hrToken);
      assert.strictEqual(res.status, 200);
      assert(res.data.data.length > 0, 'Should return employees');
    });

    await test('GET /api/employees is forbidden for standard Employee (RBAC)', async () => {
      const res = await request('GET', '/api/employees', null, employeeToken);
      assert.strictEqual(res.status, 403);
    });

    await test('GET /api/employees/managers/list returns manager users', async () => {
      const res = await request('GET', '/api/employees/managers/list', null, hrToken);
      assert.strictEqual(res.status, 200);
      assert(Array.isArray(res.data.data));
    });

    await test('PUT /api/employees/profile updates employee personal info', async () => {
      const res = await request('PUT', '/api/employees/profile', {
        phone: '+1 (555) 999-0000',
        bio: 'Updated bio from automated test suite',
      }, employeeToken);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.phone, '+1 (555) 999-0000');
    });

    // SECTION 4: ATTENDANCE MANAGEMENT TESTING
    console.log('\n[4. Attendance Management Testing]');
    await test('GET /api/attendance/today returns current day check-in status', async () => {
      const res = await request('GET', '/api/attendance/today', null, employeeToken);
      assert.strictEqual(res.status, 200);
    });

    await test('POST /api/attendance/check-in allows employee check-in', async () => {
      const res = await request('POST', '/api/attendance/check-in', { notes: 'Automated test checkin' }, employeeToken);
      // Either checked in (201) or already checked in (400)
      assert([201, 400].includes(res.status));
    });

    await test('POST /api/attendance/check-out allows employee check-out', async () => {
      const res = await request('POST', '/api/attendance/check-out', {}, employeeToken);
      // Either checked out (200) or already checked out (400)
      assert([200, 400].includes(res.status));
    });

    await test('GET /api/attendance/my-history returns employee attendance records', async () => {
      const res = await request('GET', '/api/attendance/my-history', null, employeeToken);
      assert.strictEqual(res.status, 200);
      assert(res.data.stats, 'Stats should be present');
    });

    // SECTION 5: LEAVE MANAGEMENT TESTING
    console.log('\n[5. Leave Management Testing]');
    let createdLeaveId = null;
    await test('POST /api/leaves/apply creates a leave request', async () => {
      const res = await request('POST', '/api/leaves/apply', {
        leaveType: 'Casual',
        startDate: '2026-11-20',
        endDate: '2026-11-20',
        reason: 'Personal urgent work',
      }, employeeToken);
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.data.data.status, 'Pending');
      createdLeaveId = res.data.data._id;
    });

    await test('GET /api/leaves/my-leaves returns employee leaves and balance', async () => {
      const res = await request('GET', '/api/leaves/my-leaves', null, employeeToken);
      assert.strictEqual(res.status, 200);
      assert(Array.isArray(res.data.data));
      assert(res.data.balances, 'Leave balances should be returned');
    });

    await test('PUT /api/leaves/:id/review allows Manager to review request', async () => {
      if (!createdLeaveId) return;
      const res = await request('PUT', `/api/leaves/${createdLeaveId}/review`, {
        status: 'Approved',
        reviewRemarks: 'Approved for test verification',
      }, managerToken);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.status, 'Approved');
    });

    // SECTION 6: ANNOUNCEMENTS & TRAINING TESTING
    console.log('\n[6. Announcements & Training Programs Testing]');
    await test('GET /api/announcements returns announcements list', async () => {
      const res = await request('GET', '/api/announcements', null, employeeToken);
      assert.strictEqual(res.status, 200);
      assert(Array.isArray(res.data.data));
    });

    await test('GET /api/trainings returns training programs catalog', async () => {
      const res = await request('GET', '/api/trainings', null, employeeToken);
      assert.strictEqual(res.status, 200);
      assert(Array.isArray(res.data.data));
    });

    // SECTION 7: REPORTS & ANALYTICS TESTING
    console.log('\n[7. Reports & Analytics Testing]');
    await test('GET /api/reports/analytics generates metrics for HR', async () => {
      const res = await request('GET', '/api/reports/analytics', null, hrToken);
      assert.strictEqual(res.status, 200);
      assert(res.data.data.workforce, 'Workforce data present');
      assert(res.data.data.attendance, 'Attendance rate data present');
      assert(res.data.data.leaves, 'Leaves data present');
    });

  } finally {
    if (server) {
      server.close();
    }
    await mongoose.disconnect();
  }

  console.log('\n======================================================');
  console.log(`  Tests Passed: ${passed} | Tests Failed: ${failed}`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runTests();
