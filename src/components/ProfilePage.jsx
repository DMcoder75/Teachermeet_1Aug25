import React, { useState, useEffect, useRef } from 'react';
import profileAPI from '../services/profileAPI';
import analyticsAPI from '../services/analyticsAPI';
import ImageUploadModal from './ImageUploadModal';
import { 
  Camera, 
  Edit3, 
  MapPin, 
  Eye, 
  TrendingUp, 
  Search,
  Loader
} from 'lucide-react';

function ProfilePage({ user, onBack }) {
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showProfileUpload, setShowProfileUpload] = useState(false);
  const [showCoverUpload, setShowCoverUpload] = useState(false);
  const profilePhotoRef = useRef(null);
  const coverPhotoRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
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
        location: 'Location not specified'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    if (!user?.id) return;
    
    try {
      setAnalyticsLoading(true);
      console.log('Fetching real-time analytics for user:', user.id);
      const analyticsData = await analyticsAPI.getUserAnalytics(user.id);
      setAnalytics(analyticsData);
      console.log('Analytics loaded:', analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Fallback analytics
      setAnalytics({
        profile_views: 0,
        post_impressions: 0,
        search_appearances: 0,
        connections_count: 0
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleProfilePhotoUpload = async (file) => {
    try {
      setUploading(true);
      console.log('Uploading profile photo:', file.name || 'edited-image.jpg');
      const photoUrl = await profileAPI.uploadProfilePhoto(user.id, file);
      
      // Update local state
      setProfile(prev => ({
        ...prev,
        profile_photo_url: photoUrl
      }));
      
      console.log('Profile photo uploaded successfully');
      return { url: photoUrl, success: true };
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleCoverPhotoUpload = async (file) => {
    try {
      setUploading(true);
      console.log('Uploading cover photo:', file.name || 'edited-image.jpg');
      const photoUrl = await profileAPI.uploadCoverPhoto(user.id, file);
      
      // Update local state
      setProfile(prev => ({
        ...prev,
        cover_photo_url: photoUrl
      }));
      
      console.log('Cover photo uploaded successfully');
      return { url: photoUrl, success: true };
    } catch (error) {
      console.error('Error uploading cover photo:', error);
      throw error;
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
    if (analytics) {
      return analytics;
    }
    return {
      profile_views: 0,
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
                  onClick={() => setShowCoverUpload(true)}
                  disabled={uploading}
                  className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 disabled:opacity-50"
                >
                  {uploading ? <Loader className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                </button>
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
                    onClick={() => setShowProfileUpload(true)}
                    disabled={uploading}
                    className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    {uploading ? <Loader className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  </button>
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
                    {analyticsLoading ? (
                      <Loader className="h-5 w-5 animate-spin text-gray-400" />
                    ) : (
                      <span className="text-2xl font-bold text-gray-900">
                        {analyticsData.profile_views}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">profile views</p>
                  <p className="text-xs text-gray-500 mt-1">Discover who's viewed your profile.</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="h-5 w-5 text-gray-400 mr-2" />
                    {analyticsLoading ? (
                      <Loader className="h-5 w-5 animate-spin text-gray-400" />
                    ) : (
                      <span className="text-2xl font-bold text-gray-900">
                        {analyticsData.post_impressions}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">post impressions</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {analyticsData.post_impressions > 0 
                      ? "Based on likes, comments, and estimated views." 
                      : "Start a post to increase engagement."
                    }
                  </p>
                  <p className="text-xs text-gray-500">Past 7 days</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Search className="h-5 w-5 text-gray-400 mr-2" />
                    {analyticsLoading ? (
                      <Loader className="h-5 w-5 animate-spin text-gray-400" />
                    ) : (
                      <span className="text-2xl font-bold text-gray-900">
                        {analyticsData.search_appearances}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">search appearances</p>
                  <p className="text-xs text-gray-500 mt-1">Based on profile completeness and activity.</p>
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

      {/* Image Upload Modals */}
      <ImageUploadModal
        isOpen={showProfileUpload}
        onClose={() => setShowProfileUpload(false)}
        onUpload={handleProfilePhotoUpload}
        uploadType="profile"
        currentImage={profile?.profile_photo_url}
        title="Upload Profile Photo"
      />

      <ImageUploadModal
        isOpen={showCoverUpload}
        onClose={() => setShowCoverUpload(false)}
        onUpload={handleCoverPhotoUpload}
        uploadType="cover"
        currentImage={profile?.cover_photo_url}
        title="Upload Cover Photo"
      />
    </div>
  );
}

export default ProfilePage;

