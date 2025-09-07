// Simple test script to verify server endpoints
const testEndpoints = async () => {
  const baseUrl = 'http://localhost:5000';
  
  console.log('🧪 Testing OmniVibe Server Endpoints...\n');
  
  try {
    // Test health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${baseUrl}/`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.message);
    
    // Test posts endpoint
    console.log('\n2. Testing posts endpoint...');
    const postsResponse = await fetch(`${baseUrl}/api/posts`);
    if (postsResponse.ok) {
      const posts = await postsResponse.json();
      console.log('✅ Posts endpoint working, found', posts.length, 'posts');
    } else {
      console.log('❌ Posts endpoint failed:', postsResponse.status);
    }
    
    // Test users endpoint
    console.log('\n3. Testing users endpoint...');
    const usersResponse = await fetch(`${baseUrl}/api/users/abhaya`);
    if (usersResponse.ok) {
      const user = await usersResponse.json();
      console.log('✅ Users endpoint working, found user:', user.username);
    } else {
      console.log('❌ Users endpoint failed:', usersResponse.status);
    }
    
    console.log('\n🎉 Server test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testEndpoints();
