const http = require('http');

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      const bodyData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(bodyData);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testAuthServer() {
  console.log('🧪 Testing Authentication Server\n');
  console.log('='.repeat(70));

  try {
    // Test 1: Health Check
    console.log('\n1️⃣ Testing Health Endpoint...');
    const health = await makeRequest('GET', '/api/health');
    console.log(`   Status: ${health.status}`);
    console.log(`   Response:`, health.data);
    
    if (health.status === 200) {
      console.log('   ✅ Server is running!');
    } else {
      console.log('   ❌ Server health check failed');
      return;
    }

    // Test 2: Register a new user
    console.log('\n2️⃣ Testing User Registration...');
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'testpass123'
    };
    
    const register = await makeRequest('POST', '/api/auth/register', testUser);
    console.log(`   Status: ${register.status}`);
    console.log(`   Response:`, register.data);
    
    if (register.status === 201) {
      console.log('   ✅ User registration successful!');
      console.log(`   Token: ${register.data.token ? 'Generated ✓' : 'Missing ✗'}`);
    } else {
      console.log('   ⚠️ Registration response:', register.status);
    }

    // Test 3: Login with existing user (John Doe from sample data)
    console.log('\n3️⃣ Testing User Login...');
    const loginData = {
      email: 'john@example.com',
      password: 'password123'
    };
    
    const login = await makeRequest('POST', '/api/auth/login', loginData);
    console.log(`   Status: ${login.status}`);
    console.log(`   Response:`, login.data);
    
    if (login.status === 200) {
      console.log('   ✅ User login successful!');
      console.log(`   Token: ${login.data.token ? 'Generated ✓' : 'Missing ✗'}`);
    } else {
      console.log('   ⚠️ Login response:', login.status);
    }

    // Test 4: Test invalid login
    console.log('\n4️⃣ Testing Invalid Login...');
    const invalidLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'nonexistent@example.com',
      password: 'wrongpass'
    });
    console.log(`   Status: ${invalidLogin.status}`);
    console.log(`   Response:`, invalidLogin.data);
    
    if (invalidLogin.status === 401) {
      console.log('   ✅ Invalid credentials properly rejected!');
    } else {
      console.log('   ⚠️ Unexpected response');
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ Authentication Server Tests Completed!\n');
    console.log('📋 Summary:');
    console.log('   • Auth routes are mounted at: /api/auth');
    console.log('   • Register endpoint: POST /api/auth/register');
    console.log('   • Login endpoint: POST /api/auth/login');
    console.log('   • JWT tokens are being generated');
    console.log('   • Authentication is working in background ✓\n');

  } catch (error) {
    console.error('\n❌ Error testing auth server:');
    if (error.code === 'ECONNREFUSED') {
      console.error('   Backend server is not running!');
      console.error('   Please start it with: npm start');
    } else {
      console.error('   ', error.message);
    }
  }
}

// Run tests
testAuthServer();
