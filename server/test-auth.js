/**
 * Automated Verification Script for Authentication & Authorization MVC Backend
 */
const http = require('http');

const BASE_URL = 'http://localhost:3001';

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const postData = body ? JSON.stringify(body) : '';

    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(url, {
      method,
      headers
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('🚀 Starting Backend Authentication & Authorization Test Suite...\n');
  let passed = 0;
  let total = 0;

  const assert = (condition, description) => {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${description}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${description}`);
    }
  };

  try {
    // 1. Health Check
    const health = await request('GET', '/api/health');
    assert(
      health.status === 200 && health.body.success === true && health.body.data.status === 'UP',
      'GET /api/health returns standard success response format'
    );

    // 2. Registration Validation Failure: Missing Confirm Password / Mismatch
    const regFail1 = await request('POST', '/api/auth/register', {
      username: 'john_doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'differentPassword'
    });
    assert(
      regFail1.status === 400 &&
      regFail1.body.success === false &&
      Array.isArray(regFail1.body.errors) &&
      regFail1.body.errors.some(e => e.includes('do not match')),
      'POST /api/auth/register rejects mismatched confirmPassword (400)'
    );

    // 3. Registration Validation Failure: Invalid Email
    const regFail2 = await request('POST', '/api/auth/register', {
      username: 'john_doe',
      email: 'invalid-email',
      password: 'password123',
      confirmPassword: 'password123'
    });
    assert(
      regFail2.status === 400 &&
      regFail2.body.success === false &&
      regFail2.body.errors.some(e => e.includes('valid email')),
      'POST /api/auth/register rejects invalid email format (400)'
    );

    // 4. Successful Registration
    const regSuccess = await request('POST', '/api/auth/register', {
      username: 'test_player',
      email: 'player@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });
    assert(
      regSuccess.status === 201 &&
      regSuccess.body.success === true &&
      regSuccess.body.data.user.username === 'test_player' &&
      regSuccess.body.data.user.role === 'user' &&
      !regSuccess.body.data.user.password &&
      typeof regSuccess.body.data.token === 'string',
      'POST /api/auth/register creates user and returns token with sanitized user data (201)'
    );

    const userToken = regSuccess.body.data?.token;
    const userId = regSuccess.body.data?.user?.id;

    // 5. Duplicate Email Registration Conflict
    const regDuplicate = await request('POST', '/api/auth/register', {
      username: 'another_user',
      email: 'player@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });
    assert(
      regDuplicate.status === 409 &&
      regDuplicate.body.success === false &&
      regDuplicate.body.message.includes('already registered'),
      'POST /api/auth/register prevents duplicate email registration (409)'
    );

    // 6. Login Validation Failure: Missing Password
    const loginFail = await request('POST', '/api/auth/login', {
      email: 'player@example.com'
    });
    assert(
      loginFail.status === 400 &&
      loginFail.body.success === false &&
      loginFail.body.errors.some(e => e.includes('Password is required')),
      'POST /api/auth/login rejects missing password (400)'
    );

    // 7. Login with Invalid Credentials
    const loginWrongPass = await request('POST', '/api/auth/login', {
      email: 'player@example.com',
      password: 'wrongpassword'
    });
    assert(
      loginWrongPass.status === 401 &&
      loginWrongPass.body.success === false &&
      loginWrongPass.body.message.includes('Password incorrect'),
      'POST /api/auth/login rejects wrong password (401)'
    );

    // 8. Successful Login via Email
    const loginSuccessEmail = await request('POST', '/api/auth/login', {
      email: 'player@example.com',
      password: 'password123'
    });
    assert(
      loginSuccessEmail.status === 200 &&
      loginSuccessEmail.body.success === true &&
      typeof loginSuccessEmail.body.data.token === 'string',
      'POST /api/auth/login succeeds with email (200)'
    );

    // 9. Successful Login via Username
    const loginSuccessUsername = await request('POST', '/api/auth/login', {
      username: 'test_player',
      password: 'password123'
    });
    assert(
      loginSuccessUsername.status === 200 &&
      loginSuccessUsername.body.success === true &&
      loginSuccessUsername.body.data.user.username === 'test_player',
      'POST /api/auth/login succeeds with username identifier (200)'
    );

    // 10. Access Protected Route Without Token
    const unauthenticated = await request('GET', '/api/auth/me');
    assert(
      unauthenticated.status === 401 &&
      unauthenticated.body.success === false,
      'GET /api/auth/me rejects unauthenticated request (401)'
    );

    // 11. Access Protected Route With Invalid Token
    const invalidAuth = await request('GET', '/api/auth/me', null, 'invalid.jwt.token');
    assert(
      invalidAuth.status === 401 &&
      invalidAuth.body.success === false,
      'GET /api/auth/me rejects malformed/invalid JWT token (401)'
    );

    // 12. Access Protected Route With Valid Token
    const validMe = await request('GET', '/api/auth/me', null, userToken);
    assert(
      validMe.status === 200 &&
      validMe.body.success === true &&
      validMe.body.data.user.username === 'test_player',
      'GET /api/auth/me returns authenticated user profile (200)'
    );

    // 13. Regular User Forbidden From Admin Route
    const userAccessAdmin = await request('GET', '/api/users', null, userToken);
    assert(
      userAccessAdmin.status === 403 &&
      userAccessAdmin.body.success === false &&
      userAccessAdmin.body.message.includes('Required role: [admin]'),
      'GET /api/users denies regular user (403 Forbidden)'
    );

    // 14. Admin Login
    const adminLogin = await request('POST', '/api/auth/login', {
      identifier: 'admin',
      password: 'Admin@123'
    });
    assert(
      adminLogin.status === 200 &&
      adminLogin.body.data.user.role === 'admin',
      'POST /api/auth/login authenticates pre-seeded admin user'
    );
    const adminToken = adminLogin.body.data?.token;

    // 15. Admin Access to User List
    const adminUserList = await request('GET', '/api/users', null, adminToken);
    assert(
      adminUserList.status === 200 &&
      adminUserList.body.success === true &&
      Array.isArray(adminUserList.body.data.users) &&
      adminUserList.body.data.users.length >= 2,
      'GET /api/users permits admin and returns user list (200)'
    );

    // 16. Admin Promotes User Role
    const updateRoleRes = await request('PATCH', `/api/users/${userId}/role`, { role: 'admin' }, adminToken);
    assert(
      updateRoleRes.status === 200 &&
      updateRoleRes.body.success === true &&
      updateRoleRes.body.data.user.role === 'admin',
      'PATCH /api/users/:id/role updates user role (200)'
    );

    // 17. 404 Route Handling with Uniform Format
    const notFoundRes = await request('GET', '/api/non-existent-endpoint');
    assert(
      notFoundRes.status === 404 &&
      notFoundRes.body.success === false &&
      notFoundRes.body.message.includes('not found') &&
      typeof notFoundRes.body.timestamp === 'string',
      'Undefined route returns uniform 404 error response format'
    );

    console.log(`\n================================`);
    console.log(`Test Suite Finished: ${passed}/${total} Passed.`);
    console.log(`================================\n`);

    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
};

runTests();
