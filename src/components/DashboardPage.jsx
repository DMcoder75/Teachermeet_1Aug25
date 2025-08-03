import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { postsAPI, likesAPI, commentsAPI, viewsAPI } from '../services/supabasePostsAPI';
import postsProxy from '../services/postsProxy';
import PostCreationModal from './PostCreationModal';
import PostInteractions from './PostInteractions';
import { 
  Home, 
  Users, 
  Briefcase, 
  MessageCircle, 
  Bell, 
  Search,
  ChevronDown,
  MoreHorizontal,
  X,
  Video,
  Image,
  FileText,
  BookOpen,
  Award,
  Calendar,
  MessageSquare,
  TrendingUp,
  UserPlus,
  Bookmark,
  Settings,
  LogOut,
  Heart,
  Share,
  Eye,
  Plus
} from 'lucide-react';

function DashboardPage({ user, onLogout, onNavigateToProfile, onNavigateToMessaging }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [educatorProfile, setEducatorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // CMS state variables
  const [posts, setPosts] = useState([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [postsLoading, setPostsLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [comments, setComments] = useState({});

  // Fetch educator profile data from database
  useEffect(() => {
    const fetchEducatorProfile = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('educators')
          .select('*')
          .eq('auth_uid', user.id)
          .single();

        if (error) {
          console.error('Error fetching educator profile:', error);
        } else {
          setEducatorProfile(data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEducatorProfile();
  }, [user?.id]);

  // Fetch posts from Supabase with CORS handling
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setPostsLoading(true);
        console.log('Fetching posts...');
        
        // Try the proxy service first
        const fetchedPosts = await postsProxy.getAllPosts();
        console.log('Posts fetched:', fetchedPosts);
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
        // Set empty array on error to show "No posts yet" message
        setPosts([]);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Handle post creation
  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  // Handle like toggle
  const handleLikeToggle = async (postId) => {
    if (!educatorProfile?.id) return;

    try {
      if (likedPosts.has(postId)) {
        await likesAPI.removeLike(postId, educatorProfile.id);
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      } else {
        await likesAPI.addLike(postId, educatorProfile.id);
        setLikedPosts(prev => new Set(prev).add(postId));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Record post view
  const recordPostView = async (postId) => {
    if (!educatorProfile?.id) return;
    
    try {
      await viewsAPI.recordView(postId, educatorProfile.id);
    } catch (error) {
      console.error('Error recording view:', error);
    }
  };

  // Handle comment toggle
  const handleCommentToggle = async (postId) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));

    // Load comments if not already loaded
    if (!comments[postId]) {
      try {
        const postComments = await commentsAPI.getComments(postId);
        setComments(prev => ({
          ...prev,
          [postId]: postComments
        }));
      } catch (error) {
        console.error('Error loading comments:', error);
      }
    }
  };

  // Handle add comment
  const handleAddComment = async (postId) => {
    const commentText = newComment[postId];
    if (!commentText?.trim() || !educatorProfile?.id) return;

    try {
      const comment = await commentsAPI.addComment(postId, educatorProfile.id, commentText.trim());
      
      // Update comments state
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), comment]
      }));

      // Clear input
      setNewComment(prev => ({
        ...prev,
        [postId]: ''
      }));

      // Update post comments count
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, comments_count: (post.comments_count || 0) + 1 }
          : post
      ));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Handle share
  const handleShare = async (postId) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Teacher-meet Post',
          text: 'Check out this post from Teacher-meet',
          url: window.location.href
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
      }
    }
  };

  // Helper function to format the professional title
  const formatProfessionalTitle = (profile) => {
    if (!profile) return 'Professional Educator';
    
    const parts = [];
    if (profile.title) parts.push(profile.title);
    if (profile.subjects && Array.isArray(profile.subjects)) {
      parts.push(`${profile.subjects.join(' & ')} Teacher`);
    }
    if (profile.institution) parts.push(profile.institution);
    
    return parts.length > 0 ? parts.join(' | ') : 'Professional Educator';
  };

  // Helper function to get display name
  const getDisplayName = (profile) => {
    if (!profile) {
      return user?.email?.split('@')[0]?.replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Educator';
    }
    return `${profile.first_name} ${profile.last_name}`;
  };

  // Helper function to get avatar initials
  const getAvatarInitials = (profile) => {
    if (!profile) {
      return user?.email?.charAt(0).toUpperCase() || 'U';
    }
    return `${profile.first_name?.charAt(0) || ''}${profile.last_name?.charAt(0) || ''}`.toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fff8f0' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Left side - Logo and Search */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <img src="/logo.png" alt="Teacher-meet" className="h-8 w-8" />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 w-80 bg-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Right side - Navigation */}
            <nav className="flex items-center space-x-8">
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              // Already on home/dashboard
            }}
            className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Home size={20} />
            <span className="text-xs mt-1">Home</span>
          </a>
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              onNavigateToConnects && onNavigateToConnects();
            }}
            className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Users size={20} />
            <span className="text-xs mt-1">My Connects</span>
          </a>
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              onNavigateToOpenings && onNavigateToOpenings();
            }}
            className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Briefcase size={20} />
            <span className="text-xs mt-1">Openings</span>
          </a>
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              onNavigateToMessaging();
            }}
            className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors relative"
          >
            <MessageCircle size={20} />
            <span className="text-xs mt-1">Messaging</span>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">2</span>
          </a>
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {getAvatarInitials(educatorProfile)}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-xs mt-1">Me</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </div>
            </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {/* Profile Section */}
                    <div className="px-4 py-4 border-b border-gray-100">
                      <div className="flex items-start space-x-3">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xl font-medium">
                            {getAvatarInitials(educatorProfile)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {getDisplayName(educatorProfile)}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {formatProfessionalTitle(educatorProfile)}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <button 
                          onClick={() => {
                            setShowProfileMenu(false);
                            onNavigateToProfile();
                          }}
                          className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors"
                        >
                          View Profile
                        </button>
                        <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors">
                          Verify
                        </button>
                      </div>
                    </div>

                    {/* Account Section */}
                    <div className="py-2">
                      <h4 className="px-4 py-2 text-sm font-semibold text-gray-900">Account</h4>
                      <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <div className="w-5 h-5 mr-3 flex items-center justify-center">
                          <span className="text-orange-500 text-lg">📦</span>
                        </div>
                        Premium features
                      </a>
                      <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <Settings className="h-4 w-4 mr-3 text-gray-500" />
                        Settings & Privacy
                      </a>
                      <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <span className="w-4 h-4 mr-3 text-gray-500">?</span>
                        Help
                      </a>
                      <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <span className="w-4 h-4 mr-3 text-gray-500">🌐</span>
                        Language
                      </a>
                    </div>

                    {/* Manage Section */}
                    <div className="py-2 border-t border-gray-100">
                      <h4 className="px-4 py-2 text-sm font-semibold text-gray-900">Manage</h4>
                      <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <FileText className="h-4 w-4 mr-3 text-gray-500" />
                        Posts & Activity
                      </a>
                      <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <Briefcase className="h-4 w-4 mr-3 text-gray-500" />
                        Job Posting Account
                      </a>
                    </div>

                    {/* Sign Out */}
                    <div className="py-2 border-t border-gray-100">
                      <button 
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3 text-gray-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="col-span-3 space-y-4">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="h-16 bg-gradient-to-r from-blue-500 to-purple-600"></div>
              <div className="px-4 pb-4 -mt-8">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center border-4 border-white">
                  <span className="text-white text-xl font-medium">
                    {getAvatarInitials(educatorProfile)}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mt-2">{getDisplayName(educatorProfile)}</h3>
                <p className="text-sm text-gray-600">{formatProfessionalTitle(educatorProfile)}</p>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Profile viewers</span>
                    <span className="text-blue-600 font-medium">42</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Post impressions</span>
                    <span className="text-blue-600 font-medium">1,234</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <a href="#" className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  <UserPlus className="h-4 w-4 mr-3" />
                  Find Colleagues
                </a>
                <a href="#" className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  <BookOpen className="h-4 w-4 mr-3" />
                  Share Resources
                </a>
                <a href="#" className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  <Calendar className="h-4 w-4 mr-3" />
                  Join Events
                </a>
                <a href="#" className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  <MessageSquare className="h-4 w-4 mr-3" />
                  Discussion Forums
                </a>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Recent Activity</h4>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="text-gray-600">You shared a teaching resource</p>
                  <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-600">Connected with Dr. Sarah Johnson</p>
                  <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-600">Joined "Mathematics Educators" group</p>
                  <p className="text-xs text-gray-400 mt-1">3 days ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Center Feed */}
          <div className="col-span-6 space-y-4">
            {/* Create Post */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {getAvatarInitials(educatorProfile)}
                  </span>
                </div>
                <button 
                  onClick={() => setShowPostModal(true)}
                  className="flex-1 text-left px-4 py-3 bg-gray-50 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Share your teaching experience...
                </button>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <button 
                  onClick={() => setShowPostModal(true)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Video className="h-5 w-5" />
                  <span className="text-sm font-medium">Video</span>
                </button>
                <button 
                  onClick={() => setShowPostModal(true)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Image className="h-5 w-5" />
                  <span className="text-sm font-medium">Photo</span>
                </button>
                <button 
                  onClick={() => setShowPostModal(true)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <FileText className="h-5 w-5" />
                  <span className="text-sm font-medium">Article</span>
                </button>
              </div>
            </div>

            {/* Dynamic Posts from CMS */}
            {postsLoading ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600 mb-4">Be the first to share something with the community!</p>
                <button
                  onClick={() => setShowPostModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Post
                </button>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {post.author ? 
                          `${post.author.first_name?.charAt(0) || ''}${post.author.last_name?.charAt(0) || ''}`.toUpperCase() :
                          getAvatarInitials(educatorProfile)
                        }
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900">
                          {post.author ? 
                            `${post.author.first_name} ${post.author.last_name}` :
                            getDisplayName(educatorProfile)
                          }
                        </h4>
                        <span className="text-sm text-gray-500">• 1st</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {post.author ? 
                          `${post.author.title || 'Professional Educator'} | ${post.author.institution || 'Educational Institution'}` :
                          formatProfessionalTitle(educatorProfile)
                        }
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Just now'}
                      </p>
                      
                      <div className="mt-3">
                        {/* Template Type Tag */}
                        {post.post_type && post.post_type !== 'custom' && (
                          <div className="mb-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {post.post_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </div>
                        )}
                        
                        {post.title && (
                          <h5 className="font-bold text-gray-900 mb-2 text-lg">{post.title}</h5>
                        )}
                        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                        
                        {post.media_url && (
                          <div className="mt-3">
                            <img 
                              src={post.media_url} 
                              alt="Post media" 
                              className="rounded-lg max-w-full h-auto"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* Post Interactions Component */}
                      <PostInteractions 
                        post={post} 
                        user={user} 
                        onUpdatePost={(updatedPost) => {
                          setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Sidebar */}
          <div className="col-span-3 space-y-4">
            {/* Teacher-meet News */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">Teacher-meet News</h4>
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
              </div>
              <div className="space-y-3">
                <div>
                  <h5 className="text-sm font-medium text-gray-900">New funding for STEM education</h5>
                  <p className="text-xs text-gray-500 mt-1">2h ago • 1,234 readers</p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-900">Remote learning best practices</h5>
                  <p className="text-xs text-gray-500 mt-1">5h ago • 892 readers</p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-900">Teacher wellness programs expand</h5>
                  <p className="text-xs text-gray-500 mt-1">8h ago • 567 readers</p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-900">AI tools in classroom settings</h5>
                  <p className="text-xs text-gray-500 mt-1">12h ago • 2,145 readers</p>
                </div>
                <button className="text-sm text-blue-600 hover:underline">Show more</button>
              </div>
            </div>

            {/* Professional Development */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Professional Development</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">Advanced Pedagogy Workshop</h5>
                    <p className="text-xs text-gray-500">March 15, 2025 • Online</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                    <Award className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">Educational Technology Certification</h5>
                    <p className="text-xs text-gray-500">March 22, 2025 • Hybrid</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">Collaborative Learning Summit</h5>
                    <p className="text-xs text-gray-500">April 5, 2025 • In-person</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trending Topics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Trending in Education</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">#DigitalLearning</span>
                  <TrendingUp className="h-3 w-3 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">#TeacherWellness</span>
                  <TrendingUp className="h-3 w-3 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">#STEMEducation</span>
                  <TrendingUp className="h-3 w-3 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">#InclusiveClassroom</span>
                  <TrendingUp className="h-3 w-3 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">#EdTech</span>
                  <TrendingUp className="h-3 w-3 text-green-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Post Creation Modal */}
      <PostCreationModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        currentUser={educatorProfile}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
}

export default DashboardPage;

