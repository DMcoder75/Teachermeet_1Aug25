import React, { useState, useEffect } from 'react';
import commentsAPI from '../services/commentsAPI';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  ThumbsUp, 
  Send, 
  X,
  ChevronDown,
  ChevronUp,
  Smile,
  MoreHorizontal
} from 'lucide-react';

function PostInteractions({ post, user, onUpdatePost }) {
  const [showComments, setShowComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [userReaction, setUserReaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);

  useEffect(() => {
    // Load user's reaction when component mounts
    loadUserReaction();
    // Load initial data to get proper counts
    loadInitialData();
  }, [post.id, user?.id]);

  const loadInitialData = async () => {
    try {
      // Load reactions to get proper count
      const reactionsData = await commentsAPI.getPostReactions(post.id);
      setReactions(reactionsData || []);
      
      // Load comments count (don't load full comments until needed)
      const commentsCount = await commentsAPI.getCommentsCount(post.id);
      // Update post object with actual count if needed
      if (onUpdatePost && commentsCount !== undefined) {
        onUpdatePost({ ...post, comments_count: commentsCount });
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadUserReaction = async () => {
    if (!user?.id) return;
    
    try {
      const reaction = await commentsAPI.getUserReaction(post.id, user.id);
      setUserReaction(reaction);
    } catch (error) {
      console.error('Error loading user reaction:', error);
    }
  };

  const loadComments = async () => {
    if (commentsLoading) return;
    
    setCommentsLoading(true);
    try {
      const commentsData = await commentsAPI.getComments(post.id);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
      // Fallback to sample data
      setComments(getSampleComments());
    } finally {
      setCommentsLoading(false);
    }
  };

  const loadReactions = async () => {
    try {
      const reactionsData = await commentsAPI.getPostReactions(post.id);
      setReactions(reactionsData);
    } catch (error) {
      console.error('Error loading reactions:', error);
      // Fallback to sample data
      setReactions(getSampleReactions());
    }
  };

  const handleToggleComments = () => {
    const newShowComments = !showComments;
    setShowComments(newShowComments);
    
    if (newShowComments && comments.length === 0) {
      loadComments();
    }
  };

  const handleToggleReactions = () => {
    const newShowReactions = !showReactions;
    setShowReactions(newShowReactions);
    
    if (newShowReactions && reactions.length === 0) {
      loadReactions();
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user?.id || sendingComment) return;
    
    setSendingComment(true);
    try {
      const comment = await commentsAPI.addComment(post.id, user.id, newComment.trim());
      setComments(prev => [...prev, comment]);
      setNewComment('');
      
      // Update post comment count
      if (onUpdatePost) {
        onUpdatePost({
          ...post,
          comments_count: (post.comments_count || 0) + 1
        });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      // Fallback: add comment locally
      const fallbackComment = {
        id: Date.now(),
        author: {
          first_name: user?.email?.split('@')[0] || 'You',
          last_name: '',
          avatar_url: null
        },
        content: newComment.trim(),
        created_at: new Date().toISOString(),
        replies: []
      };
      setComments(prev => [...prev, fallbackComment]);
      setNewComment('');
    } finally {
      setSendingComment(false);
    }
  };

  const handleReaction = async (reactionType) => {
    if (!user?.id) return;
    
    try {
      const result = await commentsAPI.togglePostReaction(post.id, user.id, reactionType);
      setUserReaction(result.reacted ? result.type : null);
      
      // Reload reactions to get updated counts
      await loadReactions();
      
      // Update post like count
      if (onUpdatePost) {
        const newLikeCount = result.reacted 
          ? (post.likes_count || 0) + 1 
          : Math.max((post.likes_count || 0) - 1, 0);
        
        onUpdatePost({
          ...post,
          likes_count: newLikeCount
        });
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
      // Fallback: toggle locally
      if (userReaction === reactionType) {
        setUserReaction(null);
      } else {
        setUserReaction(reactionType);
      }
    }
  };

  const getReactionEmoji = (type) => {
    const emojis = {
      like: '👍',
      love: '❤️',
      insightful: '💡',
      celebrate: '🎉',
      support: '🙌',
      funny: '😄',
      angry: '😠',
      sad: '😢'
    };
    return emojis[type] || '👍';
  };

  const getTotalReactions = () => {
    return reactions.reduce((total, reaction) => total + reaction.count, 0);
  };

  const getTotalComments = () => {
    return comments.reduce((total, comment) => {
      return total + 1 + (comment.replies?.length || 0);
    }, 0);
  };

  const getAvatarInitials = (author) => {
    if (!author) return 'U';
    const firstName = author.first_name || '';
    const lastName = author.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'now';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  // Fallback sample data
  const getSampleComments = () => [
    {
      id: 1,
      author: {
        first_name: 'Sarah',
        last_name: 'Johnson',
        avatar_url: null
      },
      content: 'This is exactly what we need in our curriculum! Have you considered implementing this in online learning environments as well?',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      replies: []
    }
  ];

  const getSampleReactions = () => [
    {
      type: 'like',
      emoji: '👍',
      count: 12,
      users: [
        { name: 'Dr. Sarah Johnson', avatar: 'SJ' },
        { name: 'Prof. Michael Chen', avatar: 'MC' }
      ]
    }
  ];

  return (
    <div className="border-t border-gray-200 pt-3 group">{/* Added group class for hover effect */}
      {/* Reaction and Comment Counts */}
      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
        <div className="flex items-center space-x-4">
          {/* Reactions Count */}
          {(post.likes_count > 0 || getTotalReactions() > 0) && (
            <button
              onClick={handleToggleReactions}
              className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
            >
              <div className="flex -space-x-1">
                {reactions.slice(0, 3).map((reaction, index) => (
                  <span key={reaction.type} className="text-lg" style={{ zIndex: 3 - index }}>
                    {reaction.emoji}
                  </span>
                ))}
              </div>
              <span>{post.likes_count || getTotalReactions()} reactions</span>
            </button>
          )}
          
          {/* Comments Count */}
          {(post.comments_count > 0 || getTotalComments() > 0) && (
            <button
              onClick={handleToggleComments}
              className="hover:text-blue-600 transition-colors"
            >
              {post.comments_count || getTotalComments()} comments
            </button>
          )}
        </div>
        
        <div className="text-gray-500">
          {post.views_count || post.views || 0} views
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-2">
        <div className="flex items-center space-x-1">
          {/* Like Button */}
          <button
            onClick={() => handleReaction('like')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
              userReaction === 'like' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            }`}
          >
            <ThumbsUp className="h-4 w-4" />
            <span>Like</span>
          </button>

          {/* Comment Button */}
          <button
            onClick={handleToggleComments}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Comment</span>
          </button>

          {/* Share Button */}
          <button className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
            <Share className="h-4 w-4" />
            <span>Share</span>
          </button>
        </div>

        {/* Reaction Picker - Hidden by default, show on hover */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {['like', 'love', 'insightful', 'celebrate', 'support'].map((type) => (
            <button
              key={type}
              onClick={() => handleReaction(type)}
              className={`p-1 rounded-full hover:bg-gray-100 transition-colors ${
                userReaction === type ? 'bg-blue-50' : ''
              }`}
              title={type}
            >
              <span className="text-lg">{getReactionEmoji(type)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Reactions Modal */}
      {showReactions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Reactions</h3>
              <button
                onClick={handleToggleReactions}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {reactions.map((reaction) => (
                <div key={reaction.type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{reaction.emoji}</span>
                    <div>
                      <p className="font-medium capitalize">{reaction.type}</p>
                      <p className="text-sm text-gray-600">{reaction.count} people</p>
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    {reaction.users.slice(0, 3).map((user, index) => (
                      <div
                        key={index}
                        className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                        title={user.name}
                      >
                        {user.avatar}
                      </div>
                    ))}
                    {reaction.users.length > 3 && (
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white">
                        +{reaction.users.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">
              Comments ({getTotalComments()})
            </h4>
            <button
              onClick={handleToggleComments}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
          </div>

          {/* Add Comment */}
          <div className="mb-4">
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    <button className="p-1 hover:bg-gray-100 rounded-full">
                      <Smile className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments List */}
          {commentsLoading ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-500 mt-2">Loading comments...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                    {getAvatarInitials(comment.author)}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-medium text-sm text-gray-900">
                          {comment.author.first_name} {comment.author.last_name}
                        </h5>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800">
                        {comment.content}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-600">
                      <button className="hover:text-blue-600 transition-colors">
                        Like ({comment.like_count || 0})
                      </button>
                      <button className="hover:text-blue-600 transition-colors">
                        Reply
                      </button>
                    </div>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-3 ml-4 space-y-3">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex space-x-3">
                            <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                              {getAvatarInitials(reply.author)}
                            </div>
                            <div className="flex-1">
                              <div className="bg-white border border-gray-200 rounded-lg p-2">
                                <div className="flex items-center justify-between mb-1">
                                  <h6 className="font-medium text-xs text-gray-900">
                                    {reply.author.first_name} {reply.author.last_name}
                                  </h6>
                                  <span className="text-xs text-gray-500">
                                    {formatTimestamp(reply.created_at)}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-800">
                                  {reply.content}
                                </p>
                              </div>
                              <div className="flex items-center space-x-4 mt-1 text-xs text-gray-600">
                                <button className="hover:text-blue-600 transition-colors">
                                  Like ({reply.like_count || 0})
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PostInteractions;

