// Utility to test server connectivity
export const testServerConnection = async () => {
  try {
    console.log('🧪 Testing server connection...');
    
    const response = await fetch('http://localhost:5000/api/test');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Server is connected:', data);
      return { success: true, data };
    } else {
      console.error('❌ Server responded with error:', response.status);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.error('❌ Failed to connect to server:', error.message);
    return { success: false, error: error.message };
  }
};

export const testDeleteEndpoint = async (postId) => {
  try {
    console.log(`🧪 Testing DELETE endpoint for post: ${postId}`);
    
    const response = await fetch(`http://localhost:5000/api/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📡 DELETE Response status:', response.status);
    console.log('📡 DELETE Response ok:', response.ok);
    
    const responseText = await response.text();
    console.log('📡 DELETE Response text:', responseText);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('✅ DELETE successful:', data);
      return { success: true, data };
    } else {
      console.error('❌ DELETE failed:', response.status, responseText);
      return { success: false, error: responseText };
    }
  } catch (error) {
    console.error('❌ DELETE request failed:', error.message);
    return { success: false, error: error.message };
  }
};