'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Community {
  _id: string;
  name: string;
  description: string;
  coverImage?: string;
  category: string;
  privacy: 'public' | 'private';
  admin: {
    _id: string;
    name: string;
    avatar?: string;
  };
  memberCount: number;
  postCount: number;
  members: string[];
  createdAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Create form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');

  const categories = [
    { value: 'all', label: 'All Categories', icon: '🌐' },
    { value: 'technology', label: 'Technology', icon: '💻' },
    { value: 'sports', label: 'Sports', icon: '⚽' },
    { value: 'gaming', label: 'Gaming', icon: '🎮' },
    { value: 'music', label: 'Music', icon: '🎵' },
    { value: 'art', label: 'Art', icon: '🎨' },
    { value: 'education', label: 'Education', icon: '📚' },
    { value: 'business', label: 'Business', icon: '💼' },
    { value: 'lifestyle', label: 'Lifestyle', icon: '🌟' },
    { value: 'other', label: 'Other', icon: '📌' },
  ];

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, communitiesRes] = await Promise.all([
        fetch('/api/users?limit=50'),
        fetch(`/api/communities?limit=50${selectedCategory !== 'all' ? `&category=${selectedCategory}` : ''}`),
      ]);

      const [usersData, communitiesData] = await Promise.all([
        usersRes.json(),
        communitiesRes.json(),
      ]);

      if (usersData.success) {
        setUsers(usersData.data);
        if (!currentUser && usersData.data.length > 0) {
          setCurrentUser(usersData.data[0]);
        }
      }

      if (communitiesData.success) {
        setCommunities(communitiesData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please select a user first');
      return;
    }

    try {
      const response = await fetch('/api/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          category,
          privacy,
          admin: currentUser._id,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setName('');
        setDescription('');
        setCategory('other');
        setPrivacy('public');
        setShowCreateModal(false);
        fetchData();
        alert('Community created successfully!');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating community:', error);
      alert('Error creating community');
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    if (!currentUser) {
      alert('Please select a user first');
      return;
    }

    try {
      const response = await fetch(`/api/communities/${communityId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser._id }),
      });

      const data = await response.json();
      if (data.success) {
        fetchData();
        alert('Joined community successfully!');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error joining community:', error);
    }
  };

  const handleLeaveCommunity = async (communityId: string) => {
    if (!currentUser) return;

    try {
      const response = await fetch(`/api/communities/${communityId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser._id }),
      });

      const data = await response.json();
      if (data.success) {
        fetchData();
        alert('Left community successfully!');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error leaving community:', error);
    }
  };

  const isMember = (community: Community) => {
    return currentUser && community.members?.includes(currentUser._id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50 border-b-2 border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Communities
                </h1>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link 
                href="/social"
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Feed
              </Link>
              
              {currentUser && (
                <select
                  value={currentUser._id}
                  onChange={(e) => setCurrentUser(users.find(u => u._id === e.target.value) || null)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg bg-white font-medium hover:border-blue-400 focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {users.map(user => (
                    <option key={user._id} value={user._id}>{user.name}</option>
                  ))}
                </select>
              )}

              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
              >
                + Create Community
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Browse by Category</h2>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    selectedCategory === cat.value
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-2">{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Communities Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-gray-600 text-lg">Loading communities...</p>
          </div>
        ) : communities.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-20 text-center">
            <div className="text-6xl mb-6">🌐</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-3">No communities yet</h3>
            <p className="text-gray-600 mb-6">Be the first to create a community!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
            >
              Create Community
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community) => {
              const categoryData = categories.find(c => c.value === community.category);
              const memberStatus = isMember(community);
              
              return (
                <div
                  key={community._id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 overflow-hidden"
                >
                  {/* Cover Image */}
                  <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-6xl">{categoryData?.icon || '🌐'}</span>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{community.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        community.privacy === 'public' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {community.privacy === 'public' ? '🌐 Public' : '🔒 Private'}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {community.description}
                    </p>

                    <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <span>👥</span>
                        <span>{community.memberCount} members</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span>📝</span>
                        <span>{community.postCount} posts</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {community.admin.name.charAt(0)}
                      </div>
                      <span className="text-xs text-gray-500">
                        Admin: {community.admin.name}
                      </span>
                    </div>

                    {currentUser && (
                      <button
                        onClick={() => memberStatus ? handleLeaveCommunity(community._id) : handleJoinCommunity(community._id)}
                        className={`w-full py-3 rounded-lg font-semibold transition-all ${
                          memberStatus
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transform hover:scale-105'
                        }`}
                      >
                        {memberStatus ? '✓ Joined' : '+ Join Community'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Create Community
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-3xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateCommunity} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Community Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    required
                    placeholder="e.g., JavaScript Developers"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    rows={4}
                    required
                    placeholder="What is your community about?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    {categories.filter(c => c.value !== 'all').map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Privacy
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPrivacy('public')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        privacy === 'public'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">🌐</div>
                      <div className="font-semibold">Public</div>
                      <div className="text-xs text-gray-600">Anyone can join</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrivacy('private')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        privacy === 'private'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">🔒</div>
                      <div className="font-semibold">Private</div>
                      <div className="text-xs text-gray-600">Invite only</div>
                    </button>
                  </div>
                </div>

                <div className="flex space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                  >
                    Create Community
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
