import React, { useState, useEffect, useRef } from 'react';
import profileAPI from '../services/profileAPI';
import { 
  Camera, 
  Edit3, 
  MapPin, 
  Calendar, 
  Users, 
  Eye, 
  TrendingUp, 
  Search,
  Plus,
  MoreHorizontal,
  ExternalLink,
  Award,
  Briefcase,
  GraduationCap,
  MessageCircle,
  Share,
  Heart,
  ChevronDown,
  X,
  Save,
  Upload,
  Loader
} from 'lucide-react';

function ProfilePage({ user, onBack }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [profileSections, setProfileSections] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const profilePhotoRef = useRef(null);
  const coverPhotoRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
      fetchProfileSections();
      fetchAnalytics();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      console.log('Fetching profile for user:', user.id);
      const profileData = await profileAPI.getUserProfile(user.id);
      setProfile(profileData);
      setEditData(profileData);
      console.log('Profile loaded:', profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to basic user data
      setProfile({
        first_name: user.email?.split('@')[0] || 'User',
        last_name: '',
        email: user.email,
        headline: 'Professional Educator',
        summary: 'Experienced education professional.',
        location: 'Location not specified',
        profile_views: 55,
        profile_analytics: [{
          profile_views: 55,
          post_impressions: 1234,
          search_appearances: 9,
          connections_count: 42
        }]
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileSections = async () => {
    if (!user?.id) return;
    
    try {
      const sections = await profileAPI.getProfileSections(user.id);
      setProfileSections(sections);
    } catch (error) {
      console.error('Error fetching profile sections:', error);
      setProfileSections([]);
    }
  };

  const fetchAnalytics = async () => {
    if (!user?.id) return;
    
    try {
      const analyticsData = await profileAPI.getProfileAnalytics(user.id);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleProfilePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      console.log('Uploading profile photo:', file.name);
      const photoUrl = await profileAPI.uploadProfilePhoto(user.id, file);
      
      // Update local state
      setProfile(prev => ({
        ...prev,
        profile_photo_url: photoUrl
      }));
      
      console.log('Profile photo uploaded successfully');
      alert('Profile photo updated successfully!');
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      alert('Failed to upload profile photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCoverPhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    try {
      setUploading(true);
      console.log('Uploading cover photo:', file.name);
      const photoUrl = await profileAPI.uploadCoverPhoto(user.id, file);
      
      // Update local state
      setProfile(prev => ({
        ...prev,
        cover_photo_url: photoUrl
      }));
      
      console.log('Cover photo uploaded successfully');
      alert('Cover photo updated successfully!');
    } catch (error) {
      console.error('Error uploading cover photo:', error);
      alert('Failed to upload cover photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await profileAPI.updateProfile(user.id, editData);
      setProfile(editData);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = () => {
    if (!profile) return 'Loading...';
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    return `${firstName} ${lastName}`.trim() || profile.email?.split('@')[0] || 'User';
  };

  const getProfileInitials = () => {
    const name = getDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAnalyticsData = () => {
    if (profile?.profile_analytics && profile.profile_analytics.length > 0) {
      return profile.profile_analytics[0];
    }
    return {
      profile_views: profile?.profile_views || 0,
      post_impressions: 0,
      search_appearances: 0,
      connections_count: 0
    };
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fff8f0' }}>
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const analyticsData = getAnalyticsData();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fff8f0' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <button
              onClick={onBack}
              className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Dashboard
            </button>
            
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50">
                Resources
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Add profile section
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Open to
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Profile Info */}
          <div className="col-span-8 space-y-6">
            {/* Profile Header Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Cover Photo */}
              <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
                {profile?.cover_photo_url && (
                  <img 
                    src={profile.cover_photo_url} 
                    alt="Cover" 
                    className="w-full h-full object-cover"
                  />
                )}
                <button
                  onClick={() => coverPhotoRef.current?.click()}
                  disabled={uploading}
                  className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 disabled:opacity-50"
                >
                  {uploading ? <Loader className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                </button>
                <input
                  ref={coverPhotoRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverPhotoUpload}
                  className="hidden"
                />
              </div>

              {/* Profile Info */}
              <div className="px-6 pb-6 -mt-16 relative">
                {/* Profile Photo */}
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-blue-600 flex items-center justify-center overflow-hidden">
                    {profile?.profile_photo_url ? (
                      <img 
                        src={profile.profile_photo_url} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-3xl font-medium">
                        {getProfileInitials()}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => profilePhotoRef.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    {uploading ? <Loader className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  </button>
                  <input
                    ref={profilePhotoRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoUpload}
                    className="hidden"
                  />
                </div>

                {/* Profile Details */}
                <div className="mt-4 flex justify-between items-start">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {getDisplayName()}
                    </h1>
                    <p className="text-lg text-gray-600 mt-1">
                      {profile?.headline || 'Professional Educator | Educational Institution'}
                    </p>
                    <div className="flex items-center text-gray-500 mt-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{profile?.location || 'Location not specified'}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                </div>
              </div>
            </div>

            {/* Analytics Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>
                <span className="text-sm text-gray-500">Private to you</span>
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Eye className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-2xl font-bold text-gray-900">
                      {analyticsData.profile_views}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">profile views</p>
                  <p className="text-xs text-gray-500 mt-1">Discover who's viewed your profile.</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-2xl font-bold text-gray-900">
                      {analyticsData.post_impressions}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">post impressions</p>
                  <p className="text-xs text-gray-500 mt-1">Start a post to increase engagement.</p>
                  <p className="text-xs text-gray-500">Past 7 days</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Search className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-2xl font-bold text-gray-900">
                      {analyticsData.search_appearances}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">search appearances</p>
                  <p className="text-xs text-gray-500 mt-1">See how often you appear in search results.</p>
                </div>
              </div>
              
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-4">
                Show all analytics →
              </button>
            </div>

            {/* About Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">About</h2>
                <button className="text-blue-600 hover:text-blue-700">
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>
              
              {isEditing ? (
                <div className="space-y-4">
                  <textarea
                    value={editData.summary || ''}
                    onChange={(e) => setEditData({...editData, summary: e.target.value})}
                    placeholder="Write about yourself..."
                    className="w-full p-3 border border-gray-300 rounded-md resize-none"
                    rows={4}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? <Loader className="h-4 w-4 animate-spin" /> : 'Save'}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 leading-relaxed">
                  {profile?.summary || 'Experienced education professional specializing in curriculum development and student engagement for K-12 education. Demonstrated success in implementing innovative teaching methodologies, optimizing learning outcomes, and enhancing student achievement. Adept at leading cross-functional teams to deliver exceptional educational experiences that align with institutional objectives. Known for strategic leadership, effective communication, and fostering collaborative environments to achieve educational success.'}
                </p>
              )}
              
              {!isEditing && (
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-3">
                  ...see more
                </button>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="col-span-4 space-y-6">
            {/* People you may know */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">People you may know</h3>
                <span className="text-sm text-gray-500">From your school</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium">SJ</span>
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">Dr. Sarah Johnson</p>
                      <p className="text-sm text-gray-600">Mathematics Department Head</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 border border-blue-600 text-blue-600 rounded text-sm hover:bg-blue-50">
                    + Connect
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium">MC</span>
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">Prof. Michael Chen</p>
                      <p className="text-sm text-gray-600">Science Education Specialist</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 border border-blue-600 text-blue-600 rounded text-sm hover:bg-blue-50">
                    + Connect
                  </button>
                </div>
              </div>
              
              <button className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium mt-4 py-2 border border-gray-200 rounded">
                Show all
              </button>
            </div>

            {/* You might like */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">You might like</h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-medium">ED</span>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">EdTech Innovations</p>
                    <p className="text-sm text-gray-600">Educational Technology Solutions</p>
                    <p className="text-xs text-gray-500">25,892 followers</p>
                  </div>
                </div>
                <button className="px-3 py-1 border border-blue-600 text-blue-600 rounded text-sm hover:bg-blue-50">
                  + Follow
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      setProfile(data);
      setEditData(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from('educators')
        .update(editData)
        .eq('id', user.id);

      if (error) throw error;
      
      setProfile(editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleAddExperience = () => {
    // For now, just close the modal - in a real app, this would save to database
    setShowAddExperience(false);
    setNewExperience({
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fff8f0' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fff8f0' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Dashboard
              </button>
              <div className="flex items-center">
                <img src="/logo.png" alt="Teacher-meet" className="h-8 w-8" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors">
                Resources
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Add profile section
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Open to
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Profile Content */}
          <div className="col-span-8 space-y-6">
            {/* Profile Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Cover Image */}
              <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600 relative">
                <button className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
                  <Camera size={16} />
                </button>
              </div>
              
              {/* Profile Info */}
              <div className="px-6 pb-6">
                <div className="flex items-end -mt-16 mb-4">
                  <div className="relative">
                    <div className="w-32 h-32 bg-blue-600 rounded-full border-4 border-white flex items-center justify-center">
                      <span className="text-white text-3xl font-bold">
                        {profile?.first_name?.charAt(0)}{profile?.last_name?.charAt(0)}
                      </span>
                    </div>
                    <button className="absolute bottom-2 right-2 p-2 bg-white rounded-full border border-gray-300 hover:bg-gray-100 transition-colors">
                      <Camera size={14} />
                    </button>
                  </div>
                  <div className="ml-6 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                          {profile?.first_name} {profile?.last_name}
                        </h1>
                        <p className="text-lg text-gray-600 mt-1">
                          {profile?.title || 'Professional Educator'} | {profile?.institution || 'Educational Institution'}
                        </p>
                        <div className="flex items-center text-gray-500 mt-2">
                          <MapPin size={16} className="mr-1" />
                          <span>{profile?.location || 'Location not specified'}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center space-x-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        <Edit3 size={16} />
                        <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Edit Mode */}
                {isEditing && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-4">Edit Profile</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input
                          type="text"
                          value={editData.first_name || ''}
                          onChange={(e) => setEditData({...editData, first_name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input
                          type="text"
                          value={editData.last_name || ''}
                          onChange={(e) => setEditData({...editData, last_name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                          type="text"
                          value={editData.title || ''}
                          onChange={(e) => setEditData({...editData, title: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                        <input
                          type="text"
                          value={editData.institution || ''}
                          onChange={(e) => setEditData({...editData, institution: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input
                          type="text"
                          value={editData.location || ''}
                          onChange={(e) => setEditData({...editData, location: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-4">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <Save size={16} />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Analytics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
                <span className="text-sm text-gray-500">Private to you</span>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-100 rounded">
                    <Users size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">55</p>
                    <p className="text-sm text-gray-600">profile views</p>
                    <p className="text-xs text-gray-500 mt-1">Discover who's viewed your profile.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-100 rounded">
                    <TrendingUp size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                    <p className="text-sm text-gray-600">post impressions</p>
                    <p className="text-xs text-gray-500 mt-1">Start a post to increase engagement.</p>
                    <p className="text-xs text-gray-400">Past 7 days</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-100 rounded">
                    <Search size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">9</p>
                    <p className="text-sm text-gray-600">search appearances</p>
                    <p className="text-xs text-gray-500 mt-1">See how often you appear in search results.</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Show all analytics →
                </button>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">About</h3>
                <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                  <Edit3 size={16} className="text-gray-600" />
                </button>
              </div>
              <p className="text-gray-800 leading-relaxed">
                Experienced education professional specializing in curriculum development and student engagement for K-12 education. 
                Demonstrated success in implementing innovative teaching methodologies, optimizing learning outcomes, and enhancing 
                student achievement. Adept at leading cross-functional teams to deliver exceptional educational experiences that align 
                with institutional objectives. Known for strategic leadership, effective communication, and fostering collaborative 
                environments to achieve educational success.
              </p>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2">
                ...see more
              </button>
            </div>

            {/* Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Activity</h3>
                  <p className="text-blue-600 text-sm">133 followers</p>
                </div>
                <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors">
                  Create a post
                </button>
              </div>
              
              {/* Activity Tabs */}
              <div className="flex space-x-6 mb-6">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeTab === 'posts' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Posts
                </button>
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeTab === 'comments' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Comments
                </button>
                <button
                  onClick={() => setActiveTab('images')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeTab === 'images' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Images
                </button>
              </div>

              {/* Activity Content */}
              <div className="space-y-4">
                <div className="text-center py-8">
                  <p className="text-gray-500">No activity to show</p>
                </div>
              </div>
            </div>

            {/* Experience */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Experience</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowAddExperience(true)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Plus size={16} className="text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                    <Edit3 size={16} className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Experience Items */}
              <div className="space-y-6">
                <div className="flex space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
                    <Briefcase size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Senior Education Specialist</h4>
                    <p className="text-gray-600">Educational Excellence Institute</p>
                    <p className="text-sm text-gray-500">Jun 2022 - Present • 3 yrs 3 mos</p>
                    <p className="text-sm text-gray-500">Remote • Full-time</p>
                    <p className="text-gray-800 mt-2">
                      Leading curriculum development initiatives and teacher training programs. 
                      Orchestrated educational projects in a dynamic learning environment, ensuring 
                      high-quality outcomes and student success.
                    </p>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded flex items-center justify-center">
                    <GraduationCap size={20} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Mathematics Teacher</h4>
                    <p className="text-gray-600">Lincoln High School</p>
                    <p className="text-sm text-gray-500">Mar 2018 - May 2022 • 4 yrs 3 mos</p>
                    <p className="text-sm text-gray-500">Chicago, Illinois • Full-time</p>
                    <p className="text-gray-800 mt-2">
                      Taught advanced mathematics courses to high school students. 
                      Developed innovative teaching methods that improved student engagement and test scores by 25%.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Licenses & Certifications */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Licenses & certifications</h3>
                <div className="flex space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                    <Plus size={16} className="text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                    <Edit3 size={16} className="text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
                    <Award size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Educational Technology Certification</h4>
                    <p className="text-gray-600">Teacher-meet Learning</p>
                    <p className="text-sm text-gray-500">Issued May 2024</p>
                    <button className="mt-2 px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors">
                      Show credential ↗
                    </button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
                    <Award size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Advanced Pedagogy Certification</h4>
                    <p className="text-gray-600">Teacher-meet Learning</p>
                    <p className="text-sm text-gray-500">Issued May 2024</p>
                    <button className="mt-2 px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors">
                      Show credential ↗
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
                <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                  <Edit3 size={16} className="text-gray-600" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                You've added the maximum number of skills
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900">Curriculum Development</h4>
                  <p className="text-sm text-gray-600 mt-1">15+ endorsements</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900">Educational Technology</h4>
                  <p className="text-sm text-gray-600 mt-1">12+ endorsements</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900">Student Assessment</h4>
                  <p className="text-sm text-gray-600 mt-1">8+ endorsements</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900">Classroom Management</h4>
                  <p className="text-sm text-gray-600 mt-1">10+ endorsements</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-4 space-y-4">
            {/* People you may know */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">People you may know</h4>
                <span className="text-sm text-gray-500">From your school</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">Dr. Sarah Johnson</h5>
                    <p className="text-sm text-gray-600">Mathematics Department Head</p>
                    <button className="mt-1 px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors">
                      + Connect
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">Prof. Michael Chen</h5>
                    <p className="text-sm text-gray-600">Science Education Specialist</p>
                    <button className="mt-1 px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors">
                      + Connect
                    </button>
                  </div>
                </div>
              </div>
              <button className="w-full mt-4 text-center text-blue-600 hover:text-blue-700 text-sm font-medium">
                Show all
              </button>
            </div>

            {/* You might like */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-900 mb-4">You might like</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded flex items-center justify-center">
                    <span className="text-purple-600 font-bold">ED</span>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">EdTech Innovations</h5>
                    <p className="text-sm text-gray-600">Educational Technology Solutions</p>
                    <p className="text-xs text-gray-500">25,892 followers</p>
                    <button className="mt-2 px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors">
                      + Follow
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Experience Modal */}
      {showAddExperience && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Experience</h3>
              <button
                onClick={() => setShowAddExperience(false)}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={newExperience.title}
                  onChange={(e) => setNewExperience({...newExperience, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Mathematics Teacher"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                <input
                  type="text"
                  value={newExperience.company}
                  onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Lincoln High School"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={newExperience.location}
                  onChange={(e) => setNewExperience({...newExperience, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Chicago, Illinois"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="current"
                  checked={newExperience.current}
                  onChange={(e) => setNewExperience({...newExperience, current: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="current" className="text-sm text-gray-700">
                  I am currently working in this role
                </label>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="month"
                    value={newExperience.startDate}
                    onChange={(e) => setNewExperience({...newExperience, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="month"
                    value={newExperience.endDate}
                    onChange={(e) => setNewExperience({...newExperience, endDate: e.target.value})}
                    disabled={newExperience.current}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newExperience.description}
                  onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your role and achievements..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddExperience(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddExperience}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;

