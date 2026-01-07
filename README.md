# Next.js + MongoDB REST API

A full-featured REST API built with Next.js 14, TypeScript, and MongoDB with advanced features including pagination, filtering, search, and relationship management.

## ✨ Features

- ✅ Next.js 14 with App Router
- ✅ TypeScript with full type safety
- ✅ MongoDB with Mongoose ODM
- ✅ **3 Complete Models:** Users, Posts, Comments
- ✅ **16 API Endpoints** with full CRUD operations
- ✅ **Advanced Querying:** Pagination, search, filtering, sorting
- ✅ **Database Optimization:** Indexes, connection pooling, caching
- ✅ **Relationship Management:** User-Post-Comment relationships
- ✅ **Like System** for posts and comments
- ✅ **Nested Comments** with parent-child relationships
- ✅ **Comprehensive Validation** with detailed error messages
- ✅ Tailwind CSS for styling
- ✅ Production-ready error handling

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- MongoDB instance (local or MongoDB Atlas)

### Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Setup environment variables:**

```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local with your MongoDB URI
```

For MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

For local MongoDB:
```env
MONGODB_URI=mongodb://localhost:27017/your_database_name
```

3. **Run the development server:**

```bash
npm run dev
```

4. **Test the API:**

```bash
# Option 1: Use the test script
node test-api.js

# Option 2: Manual testing with curl
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
A_nest/
├── app/
│   ├── api/
│   │   ├── users/              # User CRUD operations
│   │   │   ├── route.ts        # GET all, POST new
│   │   │   └── [id]/route.ts   # GET, PUT, PATCH, DELETE by ID
│   │   ├── posts/              # Post management
│   │   │   ├── route.ts        # GET all, POST new
│   │   │   └── [id]/route.ts   # GET, PUT, PATCH, DELETE by ID
│   │   └── comments/           # Comment system
│   │       ├── route.ts        # GET all, POST new
│   │       └── [id]/route.ts   # GET, PUT, PATCH, DELETE by ID
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── mongodb.ts              # Enhanced MongoDB connection
│   └── utils.ts                # Utility functions
├── models/
│   ├── User.ts                 # User model (enhanced with 12+ fields)
│   ├── Post.ts                 # Post model with relationships
│   └── Comment.ts              # Comment model with nesting
├── .env.local.example          # Environment template
├── API_DOCUMENTATION.md        # Complete API documentation
├── IMPROVEMENTS_SUMMARY.md     # List of all improvements
├── QUICK_REFERENCE.md          # Quick API reference
├── test-api.js                 # API testing script
└── package.json
```

## 🌐 API Endpoints

### Users (6 endpoints)
- `GET /api/users` - Get all users (pagination, search, filter, sort)
- `POST /api/users` - Create a new user
- `GET /api/users/[id]` - Get a user by ID
- `PUT /api/users/[id]` - Update a user
- `PATCH /api/users/[id]` - Partial update (e.g., last login)
- `DELETE /api/users/[id]` - Delete a user

### Posts (6 endpoints)
- `GET /api/posts` - Get all posts (pagination, search, filter, sort)
- `POST /api/posts` - Create a new post
- `GET /api/posts/[id]` - Get a post by ID
- `PUT /api/posts/[id]` - Update a post
- `PATCH /api/posts/[id]` - Like/unlike a post
- `DELETE /api/posts/[id]` - Delete a post

### Comments (4 endpoints)
- `GET /api/comments` - Get comments (filter by post/parent)
- `POST /api/comments` - Create a comment or reply
- `GET /api/comments/[id]` - Get a comment by ID
- `PUT /api/comments/[id]` - Update a comment
- `PATCH /api/comments/[id]` - Like/unlike a comment
- `DELETE /api/comments/[id]` - Delete a comment

### Query Parameters Examples

```bash
# Pagination
GET /api/users?page=1&limit=10

# Search
GET /api/users?search=john

# Filter
GET /api/users?role=admin&status=active
GET /api/posts?status=published&category=tech

# Sort
GET /api/posts?sortBy=views&sortOrder=desc

# Combined
GET /api/posts?status=published&search=mongodb&page=1&limit=10&sortBy=createdAt
```

## 📊 Data Models

### User Model
- **Fields:** name, email, password, age, phone, address, role, status, avatar, bio, lastLogin
- **Features:** Email validation, password hashing ready, role-based access, status management
- **Indexes:** email, status, role, createdAt

### Post Model
- **Fields:** title, content, author (ref: User), tags, category, status, views, likes, featuredImage
- **Features:** View counter, like system, tag management, full-text search
- **Indexes:** author+createdAt, status, category, tags, text search

### Comment Model
- **Fields:** content, author (ref: User), post (ref: Post), parentComment (ref: Comment), likes, isEdited
- **Features:** Nested replies, like system, edit tracking
- **Indexes:** post+createdAt, author, parentComment

## 🎯 Usage Examples

### Create and Interact with Data

```bash
# 1. Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","role":"user"}'

# Response: {"success":true,"data":{"_id":"USER_ID",...}}

# 2. Create a post
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"My First Post","content":"Hello world!","author":"USER_ID","category":"general","status":"published"}'

# 3. Add a comment
curl -X POST http://localhost:3000/api/comments \
  -H "Content-Type: application/json" \
  -d '{"content":"Great post!","author":"USER_ID","post":"POST_ID"}'

# 4. Like a post
curl -X PATCH http://localhost:3000/api/posts/POST_ID \
  -H "Content-Type: application/json" \
  -d '{"action":"like","userId":"USER_ID"}'

# 5. Get published posts sorted by views
curl "http://localhost:3000/api/posts?status=published&sortBy=views&sortOrder=desc&limit=10"
```

## 📚 Documentation

- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Complete API reference with all endpoints, parameters, and examples
- **[IMPROVEMENTS_SUMMARY.md](IMPROVEMENTS_SUMMARY.md)** - Detailed list of all enhancements and features
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick lookup guide for common operations
- **[test-api.js](test-api.js)** - Automated testing script for all endpoints

## 🧪 Testing

Run the automated test script to verify all endpoints:

```bash
node test-api.js
```

This will test:
- ✅ User CRUD operations
- ✅ Post CRUD operations  
- ✅ Comment CRUD operations
- ✅ Pagination and filtering
- ✅ Like functionality
- ✅ Search capabilities

## 🔧 Key Features Explained

### Pagination
```javascript
GET /api/users?page=2&limit=20  // Get page 2 with 20 items
```

### Search
```javascript
GET /api/users?search=john      // Search users by name or email
GET /api/posts?search=mongodb   // Full-text search in posts
```

### Filtering
```javascript
GET /api/users?role=admin&status=active
GET /api/posts?author=USER_ID&category=tech
GET /api/comments?postId=POST_ID&parentId=null  // Top-level comments only
```

### Sorting
```javascript
GET /api/posts?sortBy=views&sortOrder=desc      // Most viewed posts
GET /api/users?sortBy=createdAt&sortOrder=asc   // Oldest users first
```

### Relationships
- Posts have authors (User references)
- Comments belong to posts and authors
- Comments can have parent comments (nested replies)
- Users can like posts and comments

## 🚀 Building for Production

```bash
# Build the production version
npm run build

# Start production server
npm start
```

## 🛠️ Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose ODM
- **Styling:** Tailwind CSS
- **API:** RESTful API with Next.js API Routes

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT

---

**Made with ❤️ using Next.js and MongoDB**
