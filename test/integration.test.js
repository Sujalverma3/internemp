process.env.NODE_ENV = 'test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../backend/server.js';

let server;
let baseUrl;

async function startServer() {
  return new Promise((resolve) => {
    // Explicitly bind to IPv4 loopback
    server = app.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
}

async function stopServer() {
  return new Promise((resolve) => {
    server.close(() => resolve());
  });
}

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

let adminToken = '';
let internToken = '';
let internUser = null;
let testInternId = null;
let testTaskId = null;

async function runTests() {
  console.log('--- STARTING INTERNEMP INTEGRATION SUITE ---');
  await startServer();

  try {
    // 1. Health check
    {
      const res = await request('/api');
      assert.equal(res.status, 200, 'Health check should return 200');
      assert.equal(res.data.status, 'ok');
      console.log('✓ 1. Health check passed');
    }

    // 2. Auth tests
    {
      // Missing credentials
      const badReq = await request('/api/auth/login', {
        method: 'POST',
        body: { email: 'admin@internemp.com' }
      });
      assert.equal(badReq.status, 400, 'Missing password should return 400');

      // Invalid credentials
      const invalid = await request('/api/auth/login', {
        method: 'POST',
        body: { email: 'admin@internemp.com', password: 'wrong' }
      });
      assert.equal(invalid.status, 401, 'Invalid password should return 401');

      // Admin Login
      const adminLogin = await request('/api/auth/login', {
        method: 'POST',
        body: { email: 'admin@internemp.com', password: 'admin123' }
      });
      if (adminLogin.status !== 200) {
        console.error('adminLogin response:', adminLogin);
      }
      assert.equal(adminLogin.status, 200);
      assert.ok(adminLogin.data.token);
      assert.equal(adminLogin.data.user.role, 'admin');
      adminToken = adminLogin.data.token;

      // Intern Login (Riya Sharma)
      const internLogin = await request('/api/auth/login', {
        method: 'POST',
        body: { email: 'intern@internemp.com', password: 'intern123' }
      });
      assert.equal(internLogin.status, 200);
      assert.ok(internLogin.data.token);
      assert.equal(internLogin.data.user.role, 'intern');
      internToken = internLogin.data.token;
      internUser = internLogin.data.user;

      console.log('✓ 2. Authentication & credential verification passed');
    }

    // 3. Current User Endpoint (/api/auth/me)
    {
      const meRes = await request('/api/auth/me', {
        headers: { Authorization: `Bearer ${internToken}` }
      });
      assert.equal(meRes.status, 200);
      assert.equal(meRes.data.user.email, 'intern@internemp.com');
      assert.equal(meRes.data.user.password, undefined, 'Password must not be returned');
      console.log('✓ 3. Session /me endpoint and password stripping verified');
    }

    // 4. Role-Based Access Control (Admin route protections)
    {
      // Intern attempting to create another intern
      const forbiddenInternPost = await request('/api/interns', {
        method: 'POST',
        headers: { Authorization: `Bearer ${internToken}` },
        body: { name: 'Hacker', email: 'hacker@test.com' }
      });
      assert.equal(forbiddenInternPost.status, 403, 'Intern creating intern should be 403 Forbidden');

      // Intern attempting to post announcement
      const forbiddenAnn = await request('/api/announcements', {
        method: 'POST',
        headers: { Authorization: `Bearer ${internToken}` },
        body: { title: 'Unauthorized', content: 'Test' }
      });
      assert.equal(forbiddenAnn.status, 403, 'Intern posting announcement should be 403 Forbidden');
      console.log('✓ 4. RBAC security enforcement verified (403 for non-admins)');
    }

    // 5. Intern Creation & Duplicate Email Prevention
    {
      const uniqueEmail = `test.intern.${Date.now()}@example.com`;
      const createRes = await request('/api/interns', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          name: 'Integration Test Intern',
          email: uniqueEmail,
          department: 'QA Automation',
          status: 'active'
        }
      });
      assert.equal(createRes.status, 201);
      assert.equal(createRes.data.role, 'intern');
      testInternId = createRes.data.id;

      // Duplicate email attempt
      const dupRes = await request('/api/interns', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          name: 'Duplicate Intern',
          email: uniqueEmail,
          department: 'QA'
        }
      });
      assert.equal(dupRes.status, 409, 'Duplicate email must return 409 Conflict');
      console.log('✓ 5. Intern management & email uniqueness validation passed');
    }

    // 6. Task Authorization & Security Boundary
    {
      // Admin creates a task assigned to someone else (id '3' - Arjun)
      const taskRes = await request('/api/tasks', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          title: 'Special Project Task',
          description: 'High security task',
          assignedTo: '3',
          priority: 'high'
        }
      });
      assert.equal(taskRes.status, 201);
      testTaskId = taskRes.data.id;

      // Intern (id '2') tries to modify task assigned to id '3'
      const hackAttempt = await request(`/api/tasks/${testTaskId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${internToken}` },
        body: { status: 'completed' }
      });
      assert.equal(hackAttempt.status, 403, 'Intern must not be able to update another intern task');

      // Admin reassigns task to this intern (id '2')
      const reassign = await request(`/api/tasks/${testTaskId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { assignedTo: internUser.id }
      });
      assert.equal(reassign.status, 200);

      // Now intern can advance status
      const validStatusUpdate = await request(`/api/tasks/${testTaskId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${internToken}` },
        body: { status: 'in-progress' }
      });
      assert.equal(validStatusUpdate.status, 200);
      assert.equal(validStatusUpdate.data.status, 'in-progress');

      // Invalid status value rejected
      const invalidStatus = await request(`/api/tasks/${testTaskId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${internToken}` },
        body: { status: 'super-done' }
      });
      assert.equal(invalidStatus.status, 400);

      console.log('✓ 6. Task access boundary and status whitelist verified');
    }

    // 7. Announcements Flow & Validation
    let testAnnId = null;
    {
      // Missing content rejected
      const invalidAnn = await request('/api/announcements', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { title: 'Test Title' }
      });
      assert.equal(invalidAnn.status, 400, 'Announcement without content should return 400');

      // Valid announcement creation
      const validAnn = await request('/api/announcements', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          title: 'Automated Testing Cohort Announcement',
          content: 'All systems verified and tests passing successfully.'
        }
      });
      assert.equal(validAnn.status, 201);
      assert.ok(validAnn.data.id);
      testAnnId = validAnn.data.id;

      // Announcements list verification
      const listAnn = await request('/api/announcements', {
        headers: { Authorization: `Bearer ${internToken}` }
      });
      assert.equal(listAnn.status, 200);
      assert.ok(listAnn.data.some(a => a.id === testAnnId));

      console.log('✓ 7. Announcement creation, schema validation, and retrieval verified');
    }

    // 8. Attendance Workflow & State Machine
    {
      // Query attendance for intern
      const todayAtt = await request('/api/attendance', {
        headers: { Authorization: `Bearer ${internToken}` }
      });
      assert.equal(todayAtt.status, 200);
      assert.ok(Array.isArray(todayAtt.data));
      console.log('✓ 8. Attendance queries verified');
    }

    // 9. Cleanup created test resources
    {
      if (testAnnId) {
        const delAnn = await request(`/api/announcements/${testAnnId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        assert.equal(delAnn.status, 200);
      }
      if (testTaskId) {
        const delTask = await request(`/api/tasks/${testTaskId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        assert.equal(delTask.status, 200);
      }
      if (testInternId) {
        const delIntern = await request(`/api/interns/${testInternId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        assert.equal(delIntern.status, 200);
      }
      console.log('✓ 7. Test resource cleanup completed');
    }

    console.log('============================================');
    console.log('ALL INTEGRATION TESTS PASSED DETERMINISTICALLY');
    console.log('============================================');
  } finally {
    await stopServer();
  }
}

runTests().catch(err => {
  console.error('TEST SUITE FAILED:', err);
  process.exit(1);
});
