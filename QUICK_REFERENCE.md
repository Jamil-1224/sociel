# Quick API Reference Guide

## 🚀 Server
```bash
npm run dev  # http://localhost:3000
```

## 📍 Endpoints Overview

### Users
```
GET    /api/users              # List users (pagination, search, filter)
POST   /api/users              # Create user
GET    /api/users/[id]         # Get user by ID
PUT    /api/users/[id]         # Update user
PATCH  /api/users/[id]         # Partial update
DELETE /api/users/[id]         # Delete user
```

### Posts
```
GET    /api/posts              # List posts (pagination, search, filter)
POST   /api/posts              # Create post
GET    /api/posts/[id]         # Get post by ID (increments view)
PUT    /api/posts/[id]         # Update post
PATCH  /api/posts/[id]         # Like/unlike post
DELETE /api/posts/[id]         # Delete post
```

### Comments
```
GET    /api/comments           # List comments (filter by post/parent)
POST   /api/comments           # Create comment
GET    /api/comments/[id]      # Get comment by ID
PUT    /api/comments/[id]      # Update comment
PATCH  /api/comments/[id]      # Like/unlike comment
DELETE /api/comments/[id]      # Delete comment
```

## 🔍 Common Query Examples

### Users
```bash
# Pagination
GET /api/users?page=1&limit=10

# Search
GET /api/users?search=john

# Filter
GET /api/users?role=admin&status=active

# Sort
GET /api/users?sortBy=name&sortOrder=asc

# Combined
GET /api/users?page=1&limit=20&role=user&search=smith&sortBy=createdAt&sortOrder=desc
```

### Posts
```bash
# By status
GET /api/posts?status=published

# By author
GET /api/posts?author=USER_ID

# By category
GET /api/posts?category=technology

# By tag
GET /api/posts?tag=javascript

# Search
GET /api/posts?search=mongodb

# Most viewed
GET /api/posts?sortBy=views&sortOrder=desc

# Combined
GET /api/posts?status=published&category=tech&sortBy=createdAt&sortOrder=desc&page=1&limit=10
```

### Comments
```bash
# By post
GET /api/comments?postId=POST_ID

# Top-level only
GET /api/comments?postId=POST_ID&parentId=null

# Replies
GET /api/comments?parentId=COMMENT_ID

# Paginated
GET /api/comments?postId=POST_ID&page=1&limit=20
```

## 📝 Request Body Examples

### Create User
```json
POST /api/users
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepass",
  "age": 28,
  "role": "user",
  "status": "active"
}
```

### Create Post
```json
POST /api/posts
{
  "title": "Getting Started with MongoDB",
  "content": "MongoDB is a popular NoSQL database...",
  "author": "USER_ID",
  "category": "database",
  "tags": ["mongodb", "nosql", "database"],
  "status": "published"
}
```

### Create Comment
```json
POST /api/comments
{
  "content": "Great article!",
  "author": "USER_ID",
  "post": "POST_ID"
}
```

### Create Reply
```json
POST /api/comments
{
  "content": "Thanks for the feedback!",
  "author": "USER_ID",
  "post": "POST_ID",
  "parentComment": "PARENT_COMMENT_ID"
}
```

### Like Post
```json
PATCH /api/posts/POST_ID
{
  "action": "like",
  "userId": "USER_ID"
}
```

### Update User Last Login
```json
PATCH /api/users/USER_ID
{
  "updateLastLogin": true
}
```

## 📊 Response Format

### Success
```json
{
  "success": true,
  "data": {...}
}
```

### Success with Pagination
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### Error
```json
{
  "success": false,
  "error": "Error message here"
}
```

## 🔑 Field Reference

### User Fields
- `name` (required, 2-60 chars)
- `email` (required, unique, validated)
- `password` (optional, min 6 chars, not returned)
- `age` (optional, 1-150)
- `phone` (optional, validated format)
- `address` (optional object: street, city, state, country, zipCode)
- `role` (enum: user, admin, moderator)
- `status` (enum: active, inactive, suspended)
- `avatar` (optional URL)
- `bio` (optional, max 500 chars)
- `lastLogin` (auto-managed)

### Post Fields
- `title` (required, 3-200 chars)
- `content` (required, min 10 chars)
- `author` (required, User ID)
- `category` (required)
- `tags` (optional array, max 10)
- `status` (enum: draft, published, archived)
- `views` (auto-managed)
- `likes` (array of User IDs)
- `featuredImage` (optional URL)

### Comment Fields
- `content` (required, 1-1000 chars)
- `author` (required, User ID)
- `post` (required, Post ID)
- `parentComment` (optional, for replies)
- `likes` (array of User IDs)
- `isEdited` (auto-managed)

## 🛠️ Testing with curl

```bash
# Create user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'

# Get users
curl http://localhost:3000/api/users?page=1&limit=5

# Update user
curl -X PUT http://localhost:3000/api/users/USER_ID \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}'

# Delete user
curl -X DELETE http://localhost:3000/api/users/USER_ID
```

## 📖 Documentation Files
- Full API Docs: `API_DOCUMENTATION.md`
- Improvements Summary: `IMPROVEMENTS_SUMMARY.md`
- This Quick Reference: `QUICK_REFERENCE.md`
