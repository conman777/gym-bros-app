'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, TrendingUp, UserPlus, Activity, LogOut } from 'lucide-react';
import { PageNav } from '@/components/PageNav';
import BottomNav from '@/components/BottomNav';
import { useQuery } from '@tanstack/react-query';

type TabType = 'feed' | 'stats' | 'add';

interface Friend {
  id: string;
  name: string;
  stats: {
    totalSetsCompleted: number;
    totalExercises: number;
    lastWorkoutDate: string | null;
  };
  friendshipId: string;
  since: string;
}

interface FriendActivity {
  id: string;
  activityType: string;
  data: {
    exerciseCount: number;
    setsCompleted: number;
    exercises?: string[];
    timestamp: string;
  };
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

export default function FriendsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [user, setUser] = useState<{ name: string } | null>(null);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/dashboard');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

  // Fetch friends list
  const { data: friendsData, refetch: refetchFriends } = useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      const res = await fetch('/api/friends');
      if (!res.ok) throw new Error('Failed to fetch friends');
      return res.json();
    },
    refetchInterval: 60000, // Refetch every minute
  });

  // Fetch activity feed
  const { data: feedData, refetch: refetchFeed } = useQuery({
    queryKey: ['friendsFeed'],
    queryFn: async () => {
      const res = await fetch('/api/friends/feed?limit=20');
      if (!res.ok) throw new Error('Failed to fetch feed');
      return res.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    enabled: activeTab === 'feed',
  });

  // Fetch friend requests
  const { data: requestsData, refetch: refetchRequests } = useQuery({
    queryKey: ['friendRequests'],
    queryFn: async () => {
      const res = await fetch('/api/friends/requests');
      if (!res.ok) throw new Error('Failed to fetch requests');
      return res.json();
    },
    refetchInterval: 60000,
  });

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const friends: Friend[] = friendsData?.friends || [];
  const activities: FriendActivity[] = feedData?.activities || [];
  const pendingRequests = requestsData?.received || [];

  const tabs = [
    { id: 'feed' as TabType, label: 'Activity', icon: Activity },
    { id: 'stats' as TabType, label: 'Stats', icon: TrendingUp },
    { id: 'add' as TabType, label: 'Add Friends', icon: UserPlus },
  ];

  return (
    <>
      <div className="min-h-screen relative">
        {/* Global Header */}
        <header className="bg-gray-500/[0.02] backdrop-blur-[4.6px] border-b border-white/20 shadow-sm sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Hey, {user?.name || 'Loading...'}! 💪
                  </h1>
                  <p className="text-xs text-white/85">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="hidden md:flex">
                  <PageNav />
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5 text-white/85" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 pb-24">
          {/* Friends Section Header with Request Badge */}
          {pendingRequests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex justify-end"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold text-sm"
              >
                {pendingRequests.length} pending{' '}
                {pendingRequests.length === 1 ? 'request' : 'requests'}
              </motion.div>
            </motion.div>
          )}

          {/* Tabs */}
          <div className="mb-6">
            <div className="flex gap-2 bg-gray-500/[0.02] backdrop-blur-[4.6px] rounded-2xl p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 relative px-6 py-3 rounded-xl font-semibold transition-all ${
                      isActive ? 'text-white' : 'text-white/85 hover:text-white/85'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-white/20 rounded-xl"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'feed' && (
              <motion.div
                key="feed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <ActivityFeedTab activities={activities} />
              </motion.div>
            )}

            {activeTab === 'stats' && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <StatsComparisonTab friends={friends} />
              </motion.div>
            )}

            {activeTab === 'add' && (
              <motion.div
                key="add"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <AddFriendsTab
                  pendingRequests={pendingRequests}
                  onRequestHandled={() => {
                    refetchRequests();
                    refetchFriends();
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <BottomNav />
      </div>
    </>
  );
}

// Activity Feed Tab Component
function ActivityFeedTab({ activities }: { activities: FriendActivity[] }) {
  if (activities.length === 0) {
    return (
      <div className="bg-gray-500/[0.02] backdrop-blur-[4.6px] rounded-2xl p-12 text-center">
        <Activity className="w-16 h-16 mx-auto mb-4 text-white/75" />
        <p className="text-white/85 text-lg">No recent activity from friends</p>
        <p className="text-white/75 text-sm mt-2">
          Activity will appear here when friends complete workouts
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-500/[0.02] backdrop-blur-[4.6px] rounded-2xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-white font-bold text-xl">
              {activity.user.name[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-white font-semibold">{activity.user.name}</span>
                <span className="text-white/85 text-sm">completed a workout</span>
              </div>
              <div className="flex flex-wrap gap-4 text-white/85 text-sm">
                <span>🔥 {activity.data.setsCompleted} sets</span>
                <span>💪 {activity.data.exerciseCount} exercises</span>
                {activity.data.exercises && activity.data.exercises.length > 0 && (
                  <span className="text-white/85">{activity.data.exercises.join(', ')}</span>
                )}
              </div>
              <p className="text-white/75 text-xs mt-2">
                {new Date(activity.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Stats Comparison Tab Component
function StatsComparisonTab({ friends }: { friends: Friend[] }) {
  if (friends.length === 0) {
    return (
      <div className="bg-gray-500/[0.02] backdrop-blur-[4.6px] rounded-2xl p-12 text-center">
        <Users className="w-16 h-16 mx-auto mb-4 text-white/75" />
        <p className="text-white/85 text-lg">No friends to compare stats with</p>
        <p className="text-white/75 text-sm mt-2">Add friends to see how you stack up!</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-500/[0.02] backdrop-blur-[4.6px] rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/10">
            <tr>
              <th className="px-6 py-4 text-left text-white font-semibold">Friend</th>
              <th className="px-6 py-4 text-center text-white font-semibold">Total Sets</th>
              <th className="px-6 py-4 text-center text-white font-semibold">Total Exercises</th>
              <th className="px-6 py-4 text-center text-white font-semibold">Last Workout</th>
            </tr>
          </thead>
          <tbody>
            {friends.map((friend, index) => (
              <motion.tr
                key={friend.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-t border-white/10 hover:bg-white/5 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-blue-700 flex items-center justify-center text-white font-bold">
                      {friend.name[0].toUpperCase()}
                    </div>
                    <span className="text-white font-medium">{friend.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center text-white font-semibold text-lg">
                  {friend.stats.totalSetsCompleted}
                </td>
                <td className="px-6 py-4 text-center text-white font-semibold text-lg">
                  {friend.stats.totalExercises}
                </td>
                <td className="px-6 py-4 text-center text-white/85">
                  {friend.stats.lastWorkoutDate
                    ? new Date(friend.stats.lastWorkoutDate).toLocaleDateString()
                    : 'Never'}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Add Friends Tab Component (placeholder - will be expanded)
function AddFriendsTab({
  pendingRequests,
  onRequestHandled,
}: {
  pendingRequests: any[];
  onRequestHandled: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (searchQuery.length < 2) return;

    setSearching(true);
    try {
      const res = await fetch(`/api/friends/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.users || []);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (friendIdentifier: string) => {
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendIdentifier }),
      });

      if (res.ok) {
        alert('Friend request sent!');
        handleSearch(); // Refresh search results
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to send friend request');
      }
    } catch (error) {
      alert('Failed to send friend request');
    }
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    try {
      const res = await fetch(`/api/friends/${friendshipId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      });

      if (res.ok) {
        onRequestHandled();
      }
    } catch (error) {
      console.error('Accept error:', error);
    }
  };

  const handleDeclineRequest = async (friendshipId: string) => {
    try {
      const res = await fetch(`/api/friends/${friendshipId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decline' }),
      });

      if (res.ok) {
        onRequestHandled();
      }
    } catch (error) {
      console.error('Decline error:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="bg-gray-500/[0.02] backdrop-blur-[4.6px] rounded-2xl p-6">
          <h3 className="text-white font-semibold text-lg mb-4">Pending Requests</h3>
          <div className="space-y-3">
            {pendingRequests.map((request: any) => (
              <div
                key={request.id}
                className="flex items-center justify-between bg-white/5 rounded-xl p-4"
              >
                <span className="text-white font-medium">{request.friend.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptRequest(request.id)}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDeclineRequest(request.id)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-gray-500/[0.02] backdrop-blur-[4.6px] rounded-2xl p-6">
        <h3 className="text-white font-semibold text-lg mb-4">Find Friends</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by username or email..."
            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <button
            onClick={handleSearch}
            disabled={searching || searchQuery.length < 2}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white rounded-xl font-semibold transition-colors"
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-2">
            {searchResults.map((user: any) => (
              <div
                key={user.id}
                className="flex items-center justify-between bg-white/5 rounded-xl p-4"
              >
                <div>
                  <span className="text-white font-medium block">{user.name}</span>
                  {user.email && <span className="text-white/85 text-sm">{user.email}</span>}
                </div>
                <button
                  onClick={() => handleSendRequest(user.name)}
                  disabled={user.friendshipStatus !== null}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 text-white rounded-lg font-medium transition-colors"
                >
                  {user.friendshipStatus === 'ACCEPTED'
                    ? 'Friends'
                    : user.friendshipStatus === 'PENDING'
                      ? 'Pending'
                      : 'Add Friend'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
