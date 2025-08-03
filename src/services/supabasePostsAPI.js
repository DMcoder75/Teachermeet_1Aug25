import { supabase } from '../supabaseClient';

// Posts API functions using Supabase directly
export const postsAPI = {
  // Get all posts with author information
  async getAllPosts() {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:educators(id, first_name, last_name, title, institution, subjects)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  },

  // Create a new post
  async createPost(postData) {
    try {
      // Remove any id field to let the database auto-generate it
      const { id, ...cleanPostData } = postData;
      
      const { data, error } = await supabase
        .from('posts')
        .insert([{
          ...cleanPostData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating post:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  // Update a post
  async updatePost(postId, postData) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .update({
          ...postData,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .select()
        .single();

      if (error) {
        console.error('Error updating post:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  },

  // Delete a post
  async deletePost(postId) {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) {
        console.error('Error deleting post:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }
};

// Likes API functions using Supabase
export const likesAPI = {
  // Get likes for a post
  async getPostLikes(postId) {
    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', postId);

      if (error) {
        console.error('Error fetching likes:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching likes:', error);
      return [];
    }
  },

  // Add a like
  async addLike(postId, userId) {
    try {
      const { data, error } = await supabase
        .from('post_likes')
        .insert([{
          post_id: postId,
          user_id: userId,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding like:', error);
        throw error;
      }

      // Update likes count in posts table
      await this.updateLikesCount(postId);

      return data;
    } catch (error) {
      console.error('Error adding like:', error);
      throw error;
    }
  },

  // Remove a like
  async removeLike(postId, userId) {
    try {
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error removing like:', error);
        throw error;
      }

      // Update likes count in posts table
      await this.updateLikesCount(postId);

      return true;
    } catch (error) {
      console.error('Error removing like:', error);
      throw error;
    }
  },

  // Update likes count in posts table
  async updateLikesCount(postId) {
    try {
      const { count } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      await supabase
        .from('posts')
        .update({ likes_count: count || 0 })
        .eq('id', postId);
    } catch (error) {
      console.error('Error updating likes count:', error);
    }
  },

  // Check if user has liked a post
  async hasUserLiked(postId, userId) {
    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking like status:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking like status:', error);
      return false;
    }
  }
};

// Comments API functions using Supabase
export const commentsAPI = {
  // Get comments for a post
  async getPostComments(postId) {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          user:educators(id, first_name, last_name)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  },

  // Add a comment
  async addComment(postId, userId, content) {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .insert([{
          post_id: postId,
          user_id: userId,
          content: content,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding comment:', error);
        throw error;
      }

      // Update comments count in posts table
      await this.updateCommentsCount(postId);

      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  // Update a comment
  async updateComment(commentId, content) {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .update({
          content: content,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .select()
        .single();

      if (error) {
        console.error('Error updating comment:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  },

  // Delete a comment
  async deleteComment(commentId, postId) {
    try {
      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        console.error('Error deleting comment:', error);
        throw error;
      }

      // Update comments count in posts table
      await this.updateCommentsCount(postId);

      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },

  // Update comments count in posts table
  async updateCommentsCount(postId) {
    try {
      const { count } = await supabase
        .from('post_comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      await supabase
        .from('posts')
        .update({ comments_count: count || 0 })
        .eq('id', postId);
    } catch (error) {
      console.error('Error updating comments count:', error);
    }
  }
};

// Views API functions using Supabase
export const viewsAPI = {
  // Record a view
  async recordView(postId, userId) {
    try {
      // Check if view already exists
      const { data: existingView } = await supabase
        .from('post_views')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (!existingView) {
        const { data, error } = await supabase
          .from('post_views')
          .insert([{
            post_id: postId,
            user_id: userId,
            viewed_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) {
          console.error('Error recording view:', error);
          throw error;
        }

        // Update views count in posts table
        await this.updateViewsCount(postId);

        return data;
      }

      return existingView;
    } catch (error) {
      console.error('Error recording view:', error);
      throw error;
    }
  },

  // Get view count for a post
  async getViewCount(postId) {
    try {
      const { count, error } = await supabase
        .from('post_views')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (error) {
        console.error('Error fetching view count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error fetching view count:', error);
      return 0;
    }
  },

  // Update views count in posts table
  async updateViewsCount(postId) {
    try {
      const { count } = await supabase
        .from('post_views')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      await supabase
        .from('posts')
        .update({ views_count: count || 0 })
        .eq('id', postId);
    } catch (error) {
      console.error('Error updating views count:', error);
    }
  }
};

