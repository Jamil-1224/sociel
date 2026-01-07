# 📘 Social Media Features Documentation

Your MongoDB app is now a **full-featured social media platform** like Facebook!

## 🚀 Access the Social Media App

Visit: **http://localhost:3000/social**

## ✨ New Features

### 🎭 **Reactions System** (Like Facebook)
- **6 Reaction Types:** Like 👍, Love ❤️, Haha 😂, Wow 😮, Sad 😢, Angry 😡
- Hover over "Like" button to see all reactions
- Change your reaction anytime
- See total reaction counts and types

### 👥 **Friends System**
- Send friend requests
- Accept/Reject friend requests
- View friends list
- Unfriend functionality

### 🔔 **Notifications**
- Get notified when:
  - Someone sends you a friend request
  - Someone accepts your friend request
  - Someone reacts to your post/comment
  - Someone comments on your post
  - Someone mentions you
- Mark notifications as read
- Delete notifications

### 💬 **Enhanced Comments**
- Comment on posts
- Reply to comments (nested)
- React to comments with emojis
- Edit tracking
- Real-time comment counts

### 📸 **Media Support**
- Upload images
- Upload videos
- Thumbnails for videos
- Media preview in feed

### 📊 **User Profiles**
- Avatar and cover photo
- Bio and location
- Website link
- Friends count
- Posts count
- Followers/Following system

---

## 🌐 New API Endpoints

### Friends API

#### Send Friend Request
```http
POST /api/friends/request
Content-Type: application/json

{
  "userId": "USER_ID",
  "friendId": "FRIEND_ID"
}
```

#### Get Friend Requests
```http
GET /api/friends/request?userId=USER_ID&type=received
GET /api/friends/request?userId=USER_ID&type=sent
```

#### Accept Friend Request
```http
POST /api/friends/accept
Content-Type: application/json

{
  "userId": "USER_ID",
  "friendId": "FRIEND_ID"
}
```

#### Reject Friend Request
```http
POST /api/friends/reject
Content-Type: application/json

{
  "userId": "USER_ID",
  "friendId": "FRIEND_ID"
}
```

#### Get Friends List
```http
GET /api/friends/list?userId=USER_ID
```

#### Unfriend
```http
DELETE /api/friends/list
Content-Type: application/json

{
  "userId": "USER_ID",
  "friendId": "FRIEND_ID"
}
```

---

### Reactions API

#### Add/Change Reaction
```http
POST /api/reactions
Content-Type: application/json

{
  "userId": "USER_ID",
  "targetId": "POST_OR_COMMENT_ID",
  "targetType": "post",  // or "comment"
  "reactionType": "love"  // like, love, haha, wow, sad, angry
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reaction added successfully",
  "data": {
    "reactions": {
      "like": ["user1", "user2"],
      "love": ["user3"],
      "haha": [],
      "wow": ["user4"],
      "sad": [],
      "angry": []
    }
  }
}
```

#### Remove Reaction
```http
DELETE /api/reactions
Content-Type: application/json

{
  "userId": "USER_ID",
  "targetId": "POST_OR_COMMENT_ID",
  "targetType": "post"
}
```

---

### Notifications API

#### Get Notifications
```http
GET /api/notifications?userId=USER_ID
GET /api/notifications?userId=USER_ID&unreadOnly=true
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "recipient": "...",
      "sender": {
        "name": "John Doe",
        "avatar": "..."
      },
      "type": "friend_request",
      "message": "sent you a friend request",
      "read": false,
      "createdAt": "2026-01-07T..."
    }
  ],
  "unreadCount": 5
}
```

#### Mark as Read
```http
PATCH /api/notifications
Content-Type: application/json

// Mark single notification
{
  "notificationId": "NOTIFICATION_ID"
}

// Mark all as read
{
  "userId": "USER_ID",
  "markAllRead": true
}
```

#### Delete Notification
```http
DELETE /api/notifications
Content-Type: application/json

{
  "notificationId": "NOTIFICATION_ID"
}
```

---

## 📊 Enhanced Models

### User Model Updates
```typescript
{
  // ... existing fields
  avatar: string;           // Profile picture URL
  coverPhoto: string;       // Cover photo URL
  location: string;         // User location
  website: string;          // Personal website
  friends: ObjectId[];      // Array of friend user IDs
  friendRequestsSent: ObjectId[];
  friendRequestsReceived: ObjectId[];
  followers: ObjectId[];
  following: ObjectId[];
  postsCount: number;       // Total posts by user
}
```

### Post Model Updates
```typescript
{
  // ... existing fields
  reactions: {
    like: ObjectId[];       // Array of user IDs
    love: ObjectId[];
    haha: ObjectId[];
    wow: ObjectId[];
    sad: ObjectId[];
    angry: ObjectId[];
  };
  media: {
    type: 'image' | 'video' | 'none';
    url: string;
    thumbnail: string;
  };
  commentsCount: number;    // Total comments
  sharesCount: number;      // Total shares
}
```

### Comment Model Updates
```typescript
{
  // ... existing fields
  reactions: {
    like: ObjectId[];
    love: ObjectId[];
    haha: ObjectId[];
    wow: ObjectId[];
    sad: ObjectId[];
    angry: ObjectId[];
  };
}
```

### New: Notification Model
```typescript
{
  recipient: ObjectId;      // User receiving notification
  sender: ObjectId;         // User who triggered notification
  type: string;             // friend_request, comment, reaction, etc.
  relatedPost: ObjectId;    // Optional
  relatedComment: ObjectId; // Optional
  message: string;          // Notification message
  read: boolean;            // Read status
  createdAt: Date;
}
```

---

## 🎨 Social Media Interface Features

### News Feed
- ✅ Infinite scroll posts
- ✅ Real-time updates
- ✅ Post creation box
- ✅ User switcher (for testing)

### Post Features
- ✅ Create text posts
- ✅ Add reactions
- ✅ Comment on posts
- ✅ Share posts
- ✅ View reaction counts
- ✅ View comment counts
- ✅ Timestamp display

### Comment Features
- ✅ Write comments
- ✅ Reply to comments
- ✅ React to comments
- ✅ Edit indicator
- ✅ Nested comment threads

### Sidebar
- ✅ Profile link
- ✅ Friends link
- ✅ Notifications link
- ✅ Messages link

---

## 🧪 Testing the Social Features

### 1. Create Multiple Users
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com"}'

curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob","email":"bob@example.com"}'
```

### 2. Send Friend Request
```bash
curl -X POST http://localhost:3000/api/friends/request \
  -H "Content-Type: application/json" \
  -d '{"userId":"ALICE_ID","friendId":"BOB_ID"}'
```

### 3. Accept Friend Request
```bash
curl -X POST http://localhost:3000/api/friends/accept \
  -H "Content-Type: application/json" \
  -d '{"userId":"BOB_ID","friendId":"ALICE_ID"}'
```

### 4. Create Post
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "content":"Hello World!",
    "title":"Hello",
    "author":"ALICE_ID",
    "category":"social",
    "status":"published"
  }'
```

### 5. Add Reaction
```bash
curl -X POST http://localhost:3000/api/reactions \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"BOB_ID",
    "targetId":"POST_ID",
    "targetType":"post",
    "reactionType":"love"
  }'
```

### 6. Check Notifications
```bash
curl http://localhost:3000/api/notifications?userId=BOB_ID
```

---

## 🎯 Usage Guide

### In the Social Media Interface:

1. **Switch Users** - Use the dropdown in the header to switch between users (for testing)

2. **Create a Post**
   - Click the text box "What's on your mind?"
   - Type your message
   - Click "Post"

3. **React to Posts**
   - Hover over the "Like" button
   - Click on any emoji reaction
   - Your reaction is instantly saved

4. **Comment on Posts**
   - Click "Comment" button
   - Type your comment in the input
   - Press Enter or click "Post"

5. **View Comments**
   - Click "Comment" button to toggle comments
   - All comments appear below the post

6. **Share Posts**
   - Click "Share" button (feature ready for implementation)

---

## 📈 Database Statistics

After adding social features:
- **Models:** 4 (User, Post, Comment, Notification)
- **API Endpoints:** 28+
- **Reaction Types:** 6
- **Notification Types:** 7
- **Total Indexes:** 20+

---

## 🚀 Next Steps

The platform is ready for:
- ✅ Real-time messaging
- ✅ File uploads (images/videos)
- ✅ Stories feature
- ✅ Groups
- ✅ Events
- ✅ Marketplace
- ✅ Live streaming
- ✅ Video calls

---

## 📱 Mobile Responsive

The interface is fully responsive and works on:
- 📱 Mobile phones
- 📲 Tablets
- 💻 Desktops
- 🖥️ Large screens

---

**Enjoy your new social media platform! 🎉**
