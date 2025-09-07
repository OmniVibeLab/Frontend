// Test script to verify server endpoints
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testEndpoints() {
  console.log('🧪 Testing server endpoints...\n');

  try {
    // Test 1: Server health check
    console.log('1. Testing server health...');
    const healthResponse = await fetch(`${BASE_URL}/api/test`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Server is running:', healthData.message);
    } else {
      console.log('❌ Server health check failed:', healthResponse.status);
    }

    // Test 2: Get posts
    console.log('\n2. Testing GET /api/posts...');
    const postsResponse = await fetch(`${BASE_URL}/api/posts`);
    if (postsResponse.ok) {
      const posts = await postsResponse.json();
      console.log(`✅ GET posts successful. Found ${posts.length} posts`);
      
      // Test 3: Delete a post (if posts exist)
      if (posts.length > 0) {
        const postId = posts[0]._id;
        console.log(`\n3. Testing DELETE /api/posts/${postId}...`);
        
        const deleteResponse = await fetch(`${BASE_URL}/api/posts/${postId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (deleteResponse.ok) {
          const deleteData = await deleteResponse.json();
          console.log('✅ DELETE successful:', deleteData.message);
        } else {
          const errorText = await deleteResponse.text();
          console.log('❌ DELETE failed:', deleteResponse.status, errorText);
        }
      } else {
        console.log('⚠️ No posts found to test delete');
      }
    } else {
      console.log('❌ GET posts failed:', postsResponse.status);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running with: npm run dev');
  }
}

testEndpoints();