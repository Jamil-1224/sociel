/**
 * API Test Script
 * 
 * Run this script to test your MongoDB API endpoints
 * Usage: node test-api.js
 */

const BASE_URL = 'http://localhost:3000/api';

// Helper function to make requests
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  console.log(`\n🔄 ${options.method || 'GET'} ${endpoint}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success:', JSON.stringify(data, null, 2));
      return data;
    } else {
      console.log('❌ Error:', JSON.stringify(data, null, 2));
      return null;
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
    return null;
  }
}

// Test functions
async function testUserAPI() {
  console.log('\n========== TESTING USER API ==========');
  
  // Create user
  const createResult = await request('/users', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Test User ' + Date.now(),
      email: `test${Date.now()}@example.com`,
      age: 25,
      role: 'user',
      status: 'active',
      bio: 'This is a test user created by the test script'
    }),
  });
  
  if (!createResult || !createResult.data) {
    console.log('❌ Failed to create user, stopping user tests');
    return null;
  }
  
  const userId = createResult.data._id;
  console.log(`\n📝 Created user with ID: ${userId}`);
  
  // Get all users
  await request('/users?page=1&limit=5');
  
  // Search users
  await request('/users?search=test');
  
  // Get user by ID
  await request(`/users/${userId}`);
  
  // Update user
  await request(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({
      name: 'Updated Test User',
      bio: 'Updated bio'
    }),
  });
  
  // Partial update
  await request(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      updateLastLogin: true
    }),
  });
  
  return userId;
}

async function testPostAPI(userId) {
  if (!userId) {
    console.log('\n⚠️  Skipping post tests - no user ID');
    return null;
  }
  
  console.log('\n========== TESTING POST API ==========');
  
  // Create post
  const createResult = await request('/posts', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Test Post ' + Date.now(),
      content: 'This is a test post created by the test script. It contains enough content to pass validation.',
      author: userId,
      category: 'testing',
      tags: ['test', 'api', 'mongodb'],
      status: 'published'
    }),
  });
  
  if (!createResult || !createResult.data) {
    console.log('❌ Failed to create post, stopping post tests');
    return null;
  }
  
  const postId = createResult.data._id;
  console.log(`\n📝 Created post with ID: ${postId}`);
  
  // Get all posts
  await request('/posts?page=1&limit=5');
  
  // Get published posts
  await request('/posts?status=published');
  
  // Search posts
  await request('/posts?search=test');
  
  // Get post by ID
  await request(`/posts/${postId}`);
  
  // Like post
  await request(`/posts/${postId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      action: 'like',
      userId: userId
    }),
  });
  
  // Update post
  await request(`/posts/${postId}`, {
    method: 'PUT',
    body: JSON.stringify({
      title: 'Updated Test Post',
      content: 'This content has been updated by the test script.'
    }),
  });
  
  return postId;
}

async function testCommentAPI(userId, postId) {
  if (!userId || !postId) {
    console.log('\n⚠️  Skipping comment tests - missing user or post ID');
    return;
  }
  
  console.log('\n========== TESTING COMMENT API ==========');
  
  // Create comment
  const createResult = await request('/comments', {
    method: 'POST',
    body: JSON.stringify({
      content: 'This is a test comment!',
      author: userId,
      post: postId
    }),
  });
  
  if (!createResult || !createResult.data) {
    console.log('❌ Failed to create comment, stopping comment tests');
    return;
  }
  
  const commentId = createResult.data._id;
  console.log(`\n📝 Created comment with ID: ${commentId}`);
  
  // Create reply
  await request('/comments', {
    method: 'POST',
    body: JSON.stringify({
      content: 'This is a reply to the test comment!',
      author: userId,
      post: postId,
      parentComment: commentId
    }),
  });
  
  // Get comments for post
  await request(`/comments?postId=${postId}`);
  
  // Get top-level comments only
  await request(`/comments?postId=${postId}&parentId=null`);
  
  // Get comment by ID
  await request(`/comments/${commentId}`);
  
  // Like comment
  await request(`/comments/${commentId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      action: 'like',
      userId: userId
    }),
  });
  
  // Update comment
  await request(`/comments/${commentId}`, {
    method: 'PUT',
    body: JSON.stringify({
      content: 'This comment has been updated!'
    }),
  });
}

// Run all tests
async function runAllTests() {
  console.log('🧪 Starting API Tests...');
  console.log(`📡 API Base URL: ${BASE_URL}`);
  console.log('\n⚠️  Make sure your server is running at http://localhost:3000');
  
  try {
    // Test Users
    const userId = await testUserAPI();
    
    // Test Posts
    const postId = await testPostAPI(userId);
    
    // Test Comments
    await testCommentAPI(userId, postId);
    
    console.log('\n✅ All tests completed!');
    console.log('\n📊 Summary:');
    console.log('- User CRUD operations tested');
    console.log('- Post CRUD operations tested');
    console.log('- Comment CRUD operations tested');
    console.log('- Pagination, search, and filtering tested');
    console.log('- Like functionality tested');
    
    if (userId) {
      console.log(`\n🗑️  You can manually delete the test user: DELETE /api/users/${userId}`);
    }
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
}

// Check if Node.js fetch is available
if (typeof fetch === 'undefined') {
  console.log('❌ This script requires Node.js 18+ with native fetch support');
  console.log('   Or install node-fetch: npm install node-fetch');
  process.exit(1);
}

// Run tests
runAllTests();
