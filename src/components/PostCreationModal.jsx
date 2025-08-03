import React, { useState } from 'react';
import { X, FileText, Share2, HelpCircle, Award, Calendar, Image, Video, Link } from 'lucide-react';
import { postsAPI } from '../services/supabasePostsAPI';

const PostCreationModal = ({ isOpen, onClose, currentUser, onPostCreated }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('custom');
  const [postData, setPostData] = useState({
    title: '',
    content: '',
    post_type: 'custom',
    media_url: '',
    tags: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const templates = [
    {
      id: 'custom',
      name: 'Custom Post',
      icon: FileText,
      description: 'Share your thoughts, experiences, or updates',
      placeholder: "What's on your mind?",
      color: 'bg-blue-500'
    },
    {
      id: 'teaching_tip',
      name: 'Teaching Tip',
      icon: Share2,
      description: 'Share a valuable teaching strategy or technique',
      placeholder: 'Share a teaching tip that has worked well in your classroom...',
      color: 'bg-green-500'
    },
    {
      id: 'question',
      name: 'Ask Question',
      icon: HelpCircle,
      description: 'Ask the community for advice or solutions',
      placeholder: 'I need help with... What are your suggestions?',
      color: 'bg-purple-500'
    },
    {
      id: 'achievement',
      name: 'Achievement',
      icon: Award,
      description: 'Celebrate your professional milestones',
      placeholder: 'Excited to share that I recently achieved...',
      color: 'bg-yellow-500'
    },
    {
      id: 'event',
      name: 'Event',
      icon: Calendar,
      description: 'Share upcoming educational events or conferences',
      placeholder: 'Join us for an upcoming educational event...',
      color: 'bg-red-500'
    },
    {
      id: 'resource_share',
      name: 'Resource Share',
      icon: Share2,
      description: 'Share educational resources, tools, or materials',
      placeholder: 'I found this amazing resource that might help...',
      color: 'bg-indigo-500'
    }
  ];

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template.id);
    setPostData(prev => ({
      ...prev,
      post_type: template.id,
      content: template.placeholder
    }));
  };

  const handleInputChange = (field, value) => {
    setPostData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!postData.content.trim()) return;

    setIsSubmitting(true);
    try {
      const newPost = await postsAPI.createPost({
        ...postData,
        educator_id: currentUser.id, // Use educator_id instead of author_id
        // Remove status field as it's not in the database schema
        created_at: new Date().toISOString()
      });

      onPostCreated(newPost);
      onClose();
      
      // Reset form
      setPostData({
        title: '',
        content: '',
        post_type: 'custom',
        media_url: '',
        tags: []
      });
      setSelectedTemplate('custom');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMediaButtonClick = (mediaType) => {
    // For now, focus on the media URL input field
    const mediaInput = document.querySelector('input[placeholder*="example.com"]');
    if (mediaInput) {
      mediaInput.focus();
      
      // Set placeholder based on media type
      switch (mediaType) {
        case 'photo':
          mediaInput.placeholder = 'https://example.com/image.jpg';
          break;
        case 'video':
          mediaInput.placeholder = 'https://example.com/video.mp4';
          break;
        case 'link':
          mediaInput.placeholder = 'https://example.com/article';
          break;
        default:
          mediaInput.placeholder = 'https://example.com/media';
      }
    }
  };

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  // Don't render if modal is not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Create a Post</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Template Selection */}
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Choose a Template</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {templates.map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedTemplate === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full ${template.color} flex items-center justify-center mb-2`}>
                    <Icon size={16} className="text-white" />
                  </div>
                  <h4 className="font-medium text-sm text-gray-900">{template.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Post Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Title Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title (Optional)
            </label>
            <input
              type="text"
              value={postData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Give your post a title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Content Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              value={postData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder={selectedTemplateData?.placeholder || "What's on your mind?"}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Media URL Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Media URL (Optional)
            </label>
            <input
              type="url"
              value={postData.media_url}
              onChange={(e) => handleInputChange('media_url', e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Media Options */}
          <div className="mb-6">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <button
                type="button"
                onClick={() => handleMediaButtonClick('photo')}
                className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Image size={16} />
                <span>Photo</span>
              </button>
              <button
                type="button"
                onClick={() => handleMediaButtonClick('video')}
                className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Video size={16} />
                <span>Video</span>
              </button>
              <button
                type="button"
                onClick={() => handleMediaButtonClick('link')}
                className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Link size={16} />
                <span>Link</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !postData.content.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostCreationModal;

