'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { reactionEmojis, ReactionType } from './types';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
}

interface Post {
  _id: string;
  title?: string;
  content: string;
  author: User;
  reactions: {
    like: string[];
    love: string[];
    haha: string[];
    wow: string[];
    sad: string[];
    angry: string[];
  };
  media?: {
    type: string;
    url?: string;
  };
  commentsCount: number;
  createdAt: string;
}

interface Comment {
  _id: string;
  content: string;
  author: User;
  reactions: any;
  createdAt: string;
}

export default function SocialApp() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [postContent, setPostContent] = useState('');
  const [showComments, setShowComments] = useState<{[key: string]: boolean}>({});
  const [comments, setComments] = useState<{[key: string]: Comment[]}>({});
  const [commentText, setCommentText] = useState<{[key: string]: string}>({});
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const loggedIn = localStorage.getItem('isLoggedIn');
    const savedUser = localStorage.getItem('user');
    
    if (loggedIn === 'true' && savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [postsRes, usersRes] = await Promise.all([
        fetch('/api/posts?limit=20&sortBy=createdAt&sortOrder=desc'),
        fetch('/api/users?limit=10'),
      ]);

      const [postsData, usersData] = await Promise.all([
        postsRes.json(),
        usersRes.json(),
      ]);

      if (postsData.success) setPosts(postsData.data);
      if (usersData.success) {
        setUsers(usersData.data);
        if (usersData.data.length > 0 && !currentUser) {
          setCurrentUser(usersData.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !postContent.trim()) return;

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: postContent,
          title: postContent.substring(0, 50),
          author: currentUser._id,
          category: 'social',
          status: 'published',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPostContent('');
        fetchData();
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleReaction = async (postId: string, reactionType: ReactionType) => {
    if (!currentUser) return;

    try {
      await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser._id,
          targetId: postId,
          targetType: 'post',
          reactionType,
        }),
      });
      setShowReactionPicker(null);
      fetchData();
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const loadComments = async (postId: string) => {
    try {
      const response = await fetch(`/api/comments?postId=${postId}`);
      const data = await response.json();
      if (data.success) {
        setComments(prev => ({ ...prev, [postId]: data.data }));
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleComment = async (postId: string) => {
    if (!currentUser || !commentText[postId]?.trim()) return;

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: commentText[postId],
          author: currentUser._id,
          post: postId,
        }),
      });

      if (response.ok) {
        setCommentText(prev => ({ ...prev, [postId]: '' }));
        loadComments(postId);
        fetchData();
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const toggleComments = (postId: string) => {
    const newShowState = !showComments[postId];
    setShowComments(prev => ({ ...prev, [postId]: newShowState }));
    if (newShowState && !comments[postId]) {
      loadComments(postId);
    }
  };

  const getTotalReactions = (reactions: any) => {
    return Object.values(reactions).reduce((sum: number, arr: any) => sum + arr.length, 0);
  };

  const getUserReaction = (reactions: any) => {
    if (!currentUser) return null;
    for (const [type, users] of Object.entries(reactions)) {
      if ((users as string[]).includes(currentUser._id)) {
        return type;
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50 border-b-2 border-blue-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">SocialNest</h1>
          </Link>
          
          {currentUser && (
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-blue-50 rounded-lg relative transition-colors">
                <span className="text-2xl">🔔</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>
              
              <div className="flex items-center space-x-3">
                <img
                  src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}`}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full border-2 border-blue-300"
                />
                <span className="font-semibold text-gray-700">{currentUser.name}</span>
              </div>

              <button
                onClick={() => {
                  localStorage.removeItem('user');
                  localStorage.removeItem('isLoggedIn');
                  window.location.href = '/login';
                }}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          )}

          {!currentUser && (
            <div className="flex items-center space-x-2">
              <Link
                href="/login"
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-20 border border-gray-100">
              <h2 className="font-bold text-xl mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Menu</h2>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 flex items-center space-x-3 font-medium text-gray-700 hover:text-gray-900 transition-all">
                  <span className="text-xl">👤</span>
                  <span>Profile</span>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 flex items-center space-x-3 font-medium text-gray-700 hover:text-gray-900 transition-all">
                  <span className="text-xl">👥</span>
                  <span>Friends</span>
                </button>
                <Link href="/communities" className="w-full text-left px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 flex items-center space-x-3 font-medium text-gray-700 hover:text-gray-900 transition-all">
                  <span className="text-xl">🌐</span>
                  <span>Communities</span>
                </Link>
                <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 flex items-center space-x-3 font-medium text-gray-700 hover:text-gray-900 transition-all">
                  <span className="text-xl">🔔</span>
                  <span>Notifications</span>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 flex items-center space-x-3 font-medium text-gray-700 hover:text-gray-900 transition-all">
                  <span className="text-xl">💬</span>
                  <span>Messages</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-4">
            {/* Create Post */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                {currentUser && (
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
                <input
                  type="text"
                  placeholder={`What's on your mind, ${currentUser?.name}?`}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="flex-1 px-5 py-3 bg-gray-50 rounded-full focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-400 hover:bg-gray-100 transition-all"
                  onFocus={(e) => {
                    e.target.type = 'text';
                  }}
                />
              </div>
              
              {postContent && (
                <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setPostContent('')}
                    className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePost}
                    className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-semibold"
                  >
                    Post
                  </button>
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-200">
                <button className="flex items-center justify-center space-x-2 py-3 rounded-lg hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all group">
                  <span className="text-2xl group-hover:scale-110 transition-transform">📸</span>
                  <span className="text-sm font-semibold text-gray-700">Photo</span>
                </button>
                <button className="flex items-center justify-center space-x-2 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all group">
                  <span className="text-2xl group-hover:scale-110 transition-transform">🎥</span>
                  <span className="text-sm font-semibold text-gray-700">Video</span>
                </button>
                <button className="flex items-center justify-center space-x-2 py-3 rounded-lg hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-all group">
                  <span className="text-2xl group-hover:scale-110 transition-transform">😊</span>
                  <span className="text-sm font-semibold text-gray-700">Feeling</span>
                </button>
              </div>
            </div>

            {/* Posts Feed */}
            {posts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No posts yet</h3>
                <p className="text-gray-500">Be the first to share something!</p>
              </div>
            ) : (
              posts.map((post) => {
                const totalReactions = getTotalReactions(post.reactions);
                const userReaction = getUserReaction(post.reactions);

                return (
                  <div key={post._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                    {/* Post Header */}
                    <div className="p-5 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                          {post.author.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{post.author.name}</h3>
                          <p className="text-xs text-gray-500">
                            {new Date(post.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:bg-gray-100 rounded-full p-2.5 transition-colors">⋯</button>
                    </div>

                    {/* Post Content */}
                    <div className="px-5 pb-4">
                      <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                    </div>

                    {/* Post Media */}
                    {post.media?.url && (
                      <div className="bg-gray-100">
                        <img src={post.media.url} alt="Post media" className="w-full" />
                      </div>
                    )}

                    {/* Reactions Count */}
                    {totalReactions > 0 && (
                      <div className="px-5 py-3 flex items-center justify-between text-sm border-t border-gray-100">
                        <div className="flex items-center space-x-1">
                          {Object.entries(post.reactions).map(([type, users]) => 
                            users.length > 0 ? (
                              <span key={type} className="text-lg">
                                {reactionEmojis[type as ReactionType]}
                              </span>
                            ) : null
                          )}
                          <span>{totalReactions}</span>
                        </div>
                        <span>{post.commentsCount} comments</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="px-2 py-1 grid grid-cols-3 gap-1">
                      <div className="relative">
                        <button
                          onClick={() => setShowReactionPicker(showReactionPicker === post._id ? null : post._id)}
                          className={`w-full py-2 rounded hover:bg-gray-100 font-medium flex items-center justify-center space-x-2 ${
                            userReaction ? 'text-blue-600' : 'text-gray-600'
                          }`}
                        >
                          <span className="text-xl">
                            {userReaction ? reactionEmojis[userReaction as ReactionType] : '👍'}
                          </span>
                          <span className="text-sm">
                            {userReaction ? userReaction.charAt(0).toUpperCase() + userReaction.slice(1) : 'Like'}
                          </span>
                        </button>
                        
                        {showReactionPicker === post._id && (
                          <div className="absolute bottom-full mb-2 left-0 bg-white shadow-lg rounded-full px-2 py-2 flex space-x-1 z-10">
                            {Object.entries(reactionEmojis).map(([type, emoji]) => (
                              <button
                                key={type}
                                onClick={() => handleReaction(post._id, type as ReactionType)}
                                className="text-2xl hover:scale-125 transition-transform"
                                title={type}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => toggleComments(post._id)}
                        className="py-2 rounded hover:bg-gray-100 text-gray-600 font-medium flex items-center justify-center space-x-2"
                      >
                        <span className="text-xl">💬</span>
                        <span className="text-sm">Comment</span>
                      </button>

                      <button className="py-2 rounded hover:bg-gray-100 text-gray-600 font-medium flex items-center justify-center space-x-2">
                        <span className="text-xl">🔄</span>
                        <span className="text-sm">Share</span>
                      </button>
                    </div>

                    {/* Comments Section */}
                    {showComments[post._id] && (
                      <div className="border-t px-4 py-3 bg-gray-50">
                        {/* Comment Input */}
                        <div className="flex items-center space-x-2 mb-3">
                          {currentUser && (
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                              {currentUser.name.charAt(0)}
                            </div>
                          )}
                          <div className="flex-1 flex items-center bg-gray-100 rounded-full">
                            <input
                              type="text"
                              placeholder="Write a comment..."
                              value={commentText[post._id] || ''}
                              onChange={(e) => setCommentText(prev => ({ ...prev, [post._id]: e.target.value }))}
                              onKeyPress={(e) => e.key === 'Enter' && handleComment(post._id)}
                              className="flex-1 px-4 py-2 bg-transparent focus:outline-none"
                            />
                            {commentText[post._id] && (
                              <button
                                onClick={() => handleComment(post._id)}
                                className="px-3 text-blue-600 hover:text-blue-700 font-medium"
                              >
                                Post
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Comments List */}
                        {comments[post._id]?.map((comment) => (
                          <div key={comment._id} className="flex items-start space-x-2 mb-3">
                            <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                              {comment.author.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="bg-gray-200 rounded-2xl px-4 py-2 inline-block">
                                <p className="font-semibold text-sm">{comment.author.name}</p>
                                <p className="text-sm">{comment.content}</p>
                              </div>
                              <div className="flex items-center space-x-4 mt-1 px-2 text-xs text-gray-600">
                                <button className="hover:underline font-medium">Like</button>
                                <button className="hover:underline font-medium">Reply</button>
                                <span>{new Date(comment.createdAt).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
