# MongoDB Next.js REST API

A full-featured REST API built with Next.js 14, TypeScript, and MongoDB with advanced features including pagination, filtering, search, and relationship management.

## 🚀 Features

- ✅ **User Management** - Complete CRUD operations with enhanced fields
- ✅ **Post System** - Create, read, update, delete posts with author relationships
- ✅ **Comment System** - Nested comments with likes and reply support
- ✅ **Advanced Queries** - Pagination, filtering, sorting, and search
- ✅ **Database Optimization** - Indexes, connection pooling, and caching
- ✅ **Data Validation** - Schema validation with Mongoose
- ✅ **Error Handling** - Comprehensive error responses
- ✅ **TypeScript** - Full type safety

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB Atlas account or local MongoDB instance
- npm or yarn

## 🛠️ Setup

1. **Install dependencies**
```bash
npm install
```

2. **Create `.env.local` file**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

3. **Run development server**
```bash
npm run dev
```

Server will start at `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

---

## 👥 Users API

### Get All Users
```http
GET /api/users
```

**Query Parameters:**
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 10)
- `search` (string) - Search by name or email
- `role` (string) - Filter by role: `user`, `admin`, `moderator`
- `status` (string) - Filter by status: `active`, `inactive`, `suspended`
- `sortBy` (string) - Sort field (default: `createdAt`)
- `sortOrder` (string) - Sort order: `asc` or `desc` (default: `desc`)

**Example:**
```bash
GET /api/users?page=1&limit=10&role=admin&search=john&sortBy=name&sortOrder=asc
```

**Response:**
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

### Create User
```http
POST /api/users
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "age": 30,
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "zipCode": "10001"
  },
  "role": "user",
  "status": "active",
  "bio": "Software developer"
}
```

**Required fields:** `name`, `email`

### Get User by ID
```http
GET /api/users/[id]
```

### Update User
```http
PUT /api/users/[id]
```

**Body:** (all fields optional)
```json
{
  "name": "John Updated",
  "status": "inactive",
  "bio": "Updated bio"
}
```

### Partial Update User
```http
PATCH /api/users/[id]
```

**Body:**
```json
{
  "updateLastLogin": true
}
```

### Delete User
```http
DELETE /api/users/[id]
```

---

## 📝 Posts API

### Get All Posts
```http
GET /api/posts
```

**Query Parameters:**
- `page` (number) - Page number
- `limit` (number) - Items per page
- `search` (string) - Full-text search in title and content
- `author` (string) - Filter by author ID
- `status` (string) - Filter: `draft`, `published`, `archived`
- `category` (string) - Filter by category
- `tag` (string) - Filter by tag
- `sortBy` (string) - Sort field
- `sortOrder` (string) - `asc` or `desc`

**Example:**
```bash
GET /api/posts?status=published&category=technology&sortBy=views&sortOrder=desc
```

### Create Post
```http
POST /api/posts
```

**Body:**
```json
{
  "title": "My First Post",
  "content": "This is the content of my post...",
  "author": "USER_ID_HERE",
  "category": "technology",
  "tags": ["javascript", "nodejs", "mongodb"],
  "status": "published",
  "featuredImage": "https://example.com/image.jpg"
}
```

**Required:** `title`, `content`, `author`

### Get Post by ID
```http
GET /api/posts/[id]
```

### Update Post
```http
PUT /api/posts/[id]
```

### Like/Unlike Post
```http
PATCH /api/posts/[id]
```

**Body:**
```json
{
  "action": "like",
  "userId": "USER_ID_HERE"
}
```

Or:
```json
{
  "action": "unlike",
  "userId": "USER_ID_HERE"
}
```

### Delete Post
```http
DELETE /api/posts/[id]
```

---

## 💬 Comments API

### Get Comments
```http
GET /api/comments
```

**Query Parameters:**
- `postId` (string) - Filter by post ID
- `parentId` (string) - Filter by parent comment (use `null` for top-level comments)
- `page` (number) - Page number
- `limit` (number) - Items per page

**Example:**
```bash
GET /api/comments?postId=POST_ID&parentId=null
```

### Create Comment
```http
POST /api/comments
```

**Body:**
```json
{
  "content": "Great post!",
  "author": "USER_ID",
  "post": "POST_ID",
  "parentComment": "PARENT_COMMENT_ID" // Optional, for replies
}
```

### Get Comment by ID
```http
GET /api/comments/[id]
```

### Update Comment
```http
PUT /api/comments/[id]
```

**Body:**
```json
{
  "content": "Updated comment text"
}
```

### Like/Unlike Comment
```http
PATCH /api/comments/[id]
```

**Body:**
```json
{
  "action": "like",
  "userId": "USER_ID"
}
```

### Delete Comment
```http
DELETE /api/comments/[id]
```

---

## 📊 Database Schema

### User Schema
```typescript
{
  name: string;           // 2-60 characters
  email: string;          // Unique, validated
  password?: string;      // Min 6 characters (not returned in responses)
  age?: number;           // 1-150
  phone?: string;
  address?: {
    street, city, state, country, zipCode
  };
  role: 'user' | 'admin' | 'moderator';
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
  bio?: string;           // Max 500 characters
  lastLogin?: Date;
  createdAt: Date;        // Auto-generated
  updatedAt: Date;        // Auto-updated
}
```

**Indexes:** email, status, role, createdAt

### Post Schema
```typescript
{
  title: string;          // 3-200 characters
  content: string;        // Min 10 characters
  author: ObjectId;       // Reference to User
  tags: string[];         // Max 10 tags
  category: string;
  status: 'draft' | 'published' | 'archived';
  views: number;
  likes: ObjectId[];      // Array of User IDs
  featuredImage?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:** author + createdAt, status, category, tags, text search (title, content)

### Comment Schema
```typescript
{
  content: string;        // 1-1000 characters
  author: ObjectId;       // Reference to User
  post: ObjectId;         // Reference to Post
  parentComment?: ObjectId; // For nested replies
  likes: ObjectId[];
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:** post + createdAt, author, parentComment

---

## 🎯 Usage Examples

### Create a User and Post

```javascript
// 1. Create a user
const userResponse = await fetch('http://localhost:3000/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'mypassword'
  })
});
const { data: user } = await userResponse.json();

// 2. Create a post
const postResponse = await fetch('http://localhost:3000/api/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'My Amazing Post',
    content: 'This is a great post about MongoDB and Next.js',
    author: user._id,
    category: 'technology',
    tags: ['mongodb', 'nextjs'],
    status: 'published'
  })
});
const { data: post } = await postResponse.json();

// 3. Add a comment
const commentResponse = await fetch('http://localhost:3000/api/comments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: 'Great post!',
    author: user._id,
    post: post._id
  })
});
```

### Search and Filter

```javascript
// Search users
const users = await fetch(
  'http://localhost:3000/api/users?search=john&role=admin&page=1&limit=20'
).then(res => res.json());

// Get published posts by category
const posts = await fetch(
  'http://localhost:3000/api/posts?status=published&category=technology&sortBy=views&sortOrder=desc'
).then(res => res.json());

// Get comments for a post
const comments = await fetch(
  `http://localhost:3000/api/comments?postId=${postId}&parentId=null`
).then(res => res.json());
```

---

## 🔧 Development Features

### Connection Pooling
- Min pool size: 5
- Max pool size: 10
- Automatic reconnection
- Graceful shutdown handling

### Error Handling
- All endpoints return consistent error format
- Validation errors with detailed messages
- MongoDB ObjectId validation
- Duplicate entry detection

### Performance Optimization
- Database indexes for common queries
- Connection caching in development
- Selective field projection
- Efficient population of references

---

## 🚀 Next Steps

1. **Authentication** - Add JWT authentication
2. **File Upload** - Implement image upload for avatars
3. **Rate Limiting** - Add API rate limiting
4. **Caching** - Implement Redis caching
5. **Search** - Add Elasticsearch for advanced search
6. **WebSockets** - Real-time notifications
7. **Tests** - Add unit and integration tests

---

## 📄 License

MIT

## 👨‍💻 Author

Your Name

---

## 🐛 Troubleshooting

### MongoDB Connection Error
- Check your `MONGODB_URI` in `.env.local`
- Ensure your IP is whitelisted in MongoDB Atlas
- Verify database user credentials

### Module Not Found
```bash
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
# Or use different port
PORT=3001 npm run dev
```
