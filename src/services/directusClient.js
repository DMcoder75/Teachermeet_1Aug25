import { createDirectus, rest, authentication, readItems, createItem, updateItem, deleteItem } from '@directus/sdk';

// Create Directus client
const directus = createDirectus('https://8055-id16b8d8bsignydfu76eb-539e7d3b.manusvm.computer')
  .with(authentication())
  .with(rest());

// Authentication credentials
const DIRECTUS_EMAIL = 'admin@example.com';
const DIRECTUS_PASSWORD = 'adminpassword';

// Login to Directus
let isAuthenticated = false;

const authenticateDirectus = async () => {
  if (isAuthenticated) return;
  
  try {
    await directus.login(DIRECTUS_EMAIL, DIRECTUS_PASSWORD);
    isAuthenticated = true;
    console.log('Directus authenticated successfully');
  } catch (error) {
    console.error('Directus authentication failed:', error);
    throw error;
  }
};

// Posts API functions
export const postsAPI = {
  // Get all posts
  async getAllPosts() {
    await authenticateDirectus();
    try {
      const posts = await directus.request(readItems('posts', {
        fields: ['*'],
        sort: ['-created_at']
      }));
      return posts;
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  },

  // Create a new post
  async createPost(postData) {
    await authenticateDirectus();
    try {
      const post = await directus.request(createItem('posts', postData));
      return post;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  // Update a post
  async updatePost(postId, postData) {
    await authenticateDirectus();
    try {
      const post = await directus.request(updateItem('posts', postId, postData));
      return post;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  },

  // Delete a post
  async deletePost(postId) {
    await authenticateDirectus();
    try {
      await directus.request(deleteItem('posts', postId));
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }
};

// Likes API functions
export const likesAPI = {
  // Get likes for a post
  async getPostLikes(postId) {
    await authenticateDirectus();
    try {
      const likes = await directus.request(readItems('post_likes', {
        filter: { post_id: { _eq: postId } },
        fields: ['*']
      }));
      return likes;
    } catch (error) {
      console.error('Error fetching likes:', error);
      return [];
    }
  },

  // Add a like
  async addLike(postId, userId) {
    await authenticateDirectus();
    try {
      const like = await directus.request(createItem('post_likes', {
        post_id: postId,
        user_id: userId
      }));
      return like;
    } catch (error) {
      console.error('Error adding like:', error);
      throw error;
    }
  },

  // Remove a like
  async removeLike(postId, userId) {
    await authenticateDirectus();
    try {
      // First find the like record
      const likes = await directus.request(readItems('post_likes', {
        filter: { 
          post_id: { _eq: postId },
          user_id: { _eq: userId }
        }
      }));
      
      if (likes.length > 0) {
        await directus.request(deleteItem('post_likes', likes[0].id));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing like:', error);
      throw error;
    }
  }
};

// Comments API functions
export const commentsAPI = {
  // Get comments for a post
  async getPostComments(postId) {
    await authenticateDirectus();
    try {
      const comments = await directus.request(readItems('post_comments', {
        filter: { post_id: { _eq: postId } },
        fields: ['*'],
        sort: ['created_at']
      }));
      return comments;
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  },

  // Add a comment
  async addComment(postId, userId, content) {
    await authenticateDirectus();
    try {
      const comment = await directus.request(createItem('post_comments', {
        post_id: postId,
        user_id: userId,
        content: content
      }));
      return comment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  // Update a comment
  async updateComment(commentId, content) {
    await authenticateDirectus();
    try {
      const comment = await directus.request(updateItem('post_comments', commentId, {
        content: content,
        updated_at: new Date().toISOString()
      }));
      return comment;
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  },

  // Delete a comment
  async deleteComment(commentId) {
    await authenticateDirectus();
    try {
      await directus.request(deleteItem('post_comments', commentId));
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }
};

// Views API functions
export const viewsAPI = {
  // Record a view
  async recordView(postId, userId) {
    await authenticateDirectus();
    try {
      // Check if view already exists
      const existingViews = await directus.request(readItems('post_views', {
        filter: { 
          post_id: { _eq: postId },
          user_id: { _eq: userId }
        }
      }));

      if (existingViews.length === 0) {
        const view = await directus.request(createItem('post_views', {
          post_id: postId,
          user_id: userId
        }));
        return view;
      }
      return existingViews[0];
    } catch (error) {
      console.error('Error recording view:', error);
      throw error;
    }
  },

  // Get view count for a post
  async getViewCount(postId) {
    await authenticateDirectus();
    try {
      const views = await directus.request(readItems('post_views', {
        filter: { post_id: { _eq: postId } },
        aggregate: { count: 'id' }
      }));
      return views[0]?.count || 0;
    } catch (error) {
      console.error('Error fetching view count:', error);
      return 0;
    }
  }
};

export default directus;

