#!/usr/bin/env node

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testServer() {
  console.log('🧪 Testing OmniVibe Server...\n');

  const tests = [
    {
      name: 'Server Health Check',
      method: 'GET',
      url: `${BASE_URL}/api/test`,
      expectedStatus: 200
    },
    {
      name: 'API Documentation',
      method: 'GET', 
      url: `${BASE_URL}/`,
      expectedStatus: 200
    },
    {
      name: 'Get Posts',
      method: 'GET',
      url: `${BASE_URL}/api/posts`,
      expectedStatus: 200
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`🔍 Testing: ${test.name}`);
      
      const response = await fetch(test.url, {
        method: test.method,
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.status === test.expectedStatus) {
        console.log(`✅ ${test.name} - PASSED (${response.status})`);
        passed++;
      } else {
        console.log(`❌ ${test.name} - FAILED (Expected: ${test.expectedStatus}, Got: ${response.status})`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} - ERROR: ${error.message}`);
      failed++;
    }
    
    console.log('');
  }

  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed > 0) {
    console.log('\n💡 Make sure the server is running with: npm run dev');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed! Server is working correctly.');
    process.exit(0);
  }
}

// Check if we can import node-fetch
try {
  testServer();
} catch (error) {
  console.error('❌ Error: node-fetch is required for testing');
  console.log('💡 Install it with: npm install node-fetch');
  process.exit(1);
}