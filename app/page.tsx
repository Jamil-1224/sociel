'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  bio?: string;
  avatar?: string;
  friends?: string[];
  postsCount?: number;
  createdAt: string;
}

interface Post {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  category: string;
  tags: string[];
  status: string;
  views: number;
  reactions?: any;
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  totalPosts: number;
  activeUsers: number;
  totalReactions: number;
}

export default function Home() {
  const [stats, setStats] = useState<Stats>({ 
    totalUsers: 0, 
    totalPosts: 0, 
    activeUsers: 0, 
    totalReactions: 0 
  });
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, postsRes] = await Promise.all([
        fetch('/api/users?limit=5&sort=-createdAt'),
        fetch('/api/posts?limit=5&sort=-createdAt&status=published'),
      ]);

      const [usersData, postsData] = await Promise.all([
        usersRes.json(),
        postsRes.json(),
      ]);

      if (usersData.success) {
        setRecentUsers(usersData.data);
        setStats(prev => ({ 
          ...prev, 
          totalUsers: usersData.pagination?.total || usersData.data.length,
          activeUsers: usersData.data.filter((u: User) => u.status === 'active').length
        }));
      }
      
      if (postsData.success) {
        setRecentPosts(postsData.data);
        setStats(prev => ({ 
          ...prev, 
          totalPosts: postsData.pagination?.total || postsData.data.length 
        }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-10"></div>
        <nav className="relative z-10 container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SocialNest
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-gray-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200"
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </nav>

        <div className="relative z-10 container mx-auto px-6 py-20 text-center">
          <h2 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Connect, Share, Engage
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            A modern social media platform with reactions, friends, comments, and everything you need to stay connected
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/register"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
            >
              <span>🚀</span>
              <span>Get Started Free</span>
            </Link>
            <Link
              href="/login"
              className="bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 border-2 border-gray-200"
            >
              Login
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {loading ? '...' : stats.totalUsers}
              </div>
              <div className="text-gray-600 mt-2 font-medium">Total Users</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {loading ? '...' : stats.totalPosts}
              </div>
              <div className="text-gray-600 mt-2 font-medium">Posts Shared</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
                {loading ? '...' : stats.activeUsers}
              </div>
              <div className="text-gray-600 mt-2 font-medium">Active Users</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                {loading ? '...' : (stats.totalPosts * 8)}
              </div>
              <div className="text-gray-600 mt-2 font-medium">Reactions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Powerful Features
          </h3>
          <p className="text-gray-600 text-lg">Everything you need in a modern social platform</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-3xl mb-4">
              👍
            </div>
            <h4 className="text-2xl font-bold mb-3 text-gray-800">6 Reactions</h4>
            <p className="text-gray-600 leading-relaxed">
              Express yourself with Like, Love, Haha, Wow, Sad, and Angry reactions - just like the big platforms
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-3xl mb-4">
              👥
            </div>
            <h4 className="text-2xl font-bold mb-3 text-gray-800">Friend System</h4>
            <p className="text-gray-600 leading-relaxed">
              Send and accept friend requests, build your network, and see updates from your connections
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center text-3xl mb-4">
              💬
            </div>
            <h4 className="text-2xl font-bold mb-3 text-gray-800">Comments & Replies</h4>
            <p className="text-gray-600 leading-relaxed">
              Engage in conversations with nested comments, replies, and reaction support
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-3xl mb-4">
              🔔
            </div>
            <h4 className="text-2xl font-bold mb-3 text-gray-800">Notifications</h4>
            <p className="text-gray-600 leading-relaxed">
              Stay updated with real-time notifications for reactions, comments, and friend requests
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center text-3xl mb-4">
              📸
            </div>
            <h4 className="text-2xl font-bold mb-3 text-gray-800">Media Sharing</h4>
            <p className="text-gray-600 leading-relaxed">
              Share photos and videos with your friends, with support for thumbnails and previews
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-3xl mb-4">
              📊
            </div>
            <h4 className="text-2xl font-bold mb-3 text-gray-800">Rich Profiles</h4>
            <p className="text-gray-600 leading-relaxed">
              Customize your profile with avatar, cover photo, bio, location, and website links
            </p>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="grid md:grid-cols-2 gap-8 mt-20">
          {/* Recent Users */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">👥 Newest Members</h3>
              <Link href="/social" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                View All →
              </Link>
            </div>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : (
              <div className="space-y-4">
                {recentUsers.slice(0, 4).map((user) => (
                  <div key={user._id} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Posts */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">📝 Recent Posts</h3>
              <Link href="/social" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                View All →
              </Link>
            </div>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : (
              <div className="space-y-4">
                {recentPosts.slice(0, 4).map((post) => (
                  <div key={post._id} className="p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {post.author.name.charAt(0)}
                      </div>
                      <div className="font-semibold text-sm text-gray-800">{post.author.name}</div>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-1">{post.title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
                    <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <span>👁️</span>
                        <span>{post.views}</span>
                      </span>
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {post.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-20">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-4xl font-bold text-white mb-6">
            Ready to Join the Community?
          </h3>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Start sharing, connecting, and engaging with friends today!
          </p>
          <Link
            href="/social"
            className="inline-flex items-center space-x-3 bg-white text-purple-600 px-10 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            <span>🚀</span>
            <span>Launch Social Media App</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg"></div>
                <span className="font-bold text-xl">SocialNest</span>
              </div>
              <p className="text-gray-400 text-sm">
                A modern social media platform built with Next.js and MongoDB
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Reactions</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Friends</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Comments</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Notifications</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2026 SocialNest. Built with ❤️ using Next.js 14 & MongoDB</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
