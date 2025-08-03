import { supabase } from '../supabaseClient';

class CommentsAPI {
  // Get comments for a specific post
  async getComments(postId) {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          author:profiles(
            id,
            first_name,
            last_name,
            email,
            avatar_url
          ),
          replies:post_comments!parent_comment_id(
            *,
            author:profiles(
              id,
              first_name,
              last_name,
              email,
              avatar_url
            )
          )
        `)
        .eq('post_id', postId)
        .is('parent_comment_id', null)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getComments:', error);
      return [];
    }
  }

  // Add a new comment
  async addComment(postId, userId, content, parentCommentId = null) {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .insert([
          {
            post_id: postId,
            user_id: userId,
            content: content.trim(),
            parent_comment_id: parentCommentId
          }
        ])
        .select(`
          *,
          author:profiles(
            id,
            first_name,
            last_name,
            email,
            avatar_url
          )
        `)
        .single();

      if (error) {
        console.error('Error adding comment:', error);
        throw error;
      }

      // Update post comment count
      await this.updatePostCommentCount(postId);

      return data;
    } catch (error) {
      console.error('Error in addComment:', error);
      throw error;
    }
  }

  // Update post comment count
  async updatePostCommentCount(postId) {
    try {
      const { count } = await supabase
        .from('post_comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      await supabase
        .from('posts')
        .update({ comments_count: count })
        .eq('id', postId);
    } catch (error) {
      console.error('Error updating comment count:', error);
    }
  }

  // Get comments count for a post
  async getCommentsCount(postId) {
    try {
      const { count, error } = await supabase
        .from('post_comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting comments count:', error);
      return 0;
    }
  }

  // Like/unlike a comment
  async toggleCommentLike(commentId, userId) {
    try {
      // Check if user already liked this comment
      const { data: existingLike } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', userId)
        .single();

      if (existingLike) {
        // Unlike the comment
        await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', userId);
        
        return { liked: false };
      } else {
        // Like the comment
        await supabase
          .from('comment_likes')
          .insert([
            {
              comment_id: commentId,
              user_id: userId
            }
          ]);
        
        return { liked: true };
      }
    } catch (error) {
      console.error('Error toggling comment like:', error);
      throw error;
    }
  }

  // Get reactions for a specific post
  async getPostReactions(postId) {
    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select(`
          *,
          user:profiles(
            id,
            first_name,
            last_name,
            email,
            avatar_url
          )
        `)
        .eq('post_id', postId);

      if (error) {
        console.error('Error fetching reactions:', error);
        return [];
      }

      // Group reactions by type
      const reactionGroups = {};
      data.forEach(reaction => {
        const type = reaction.reaction_type || 'like';
        if (!reactionGroups[type]) {
          reactionGroups[type] = {
            type,
            emoji: this.getReactionEmoji(type),
            count: 0,
            users: []
          };
        }
        reactionGroups[type].count++;
        reactionGroups[type].users.push({
          name: `${reaction.user.first_name} ${reaction.user.last_name}`,
          avatar: this.getAvatarInitials(reaction.user),
          email: reaction.user.email
        });
      });

      return Object.values(reactionGroups);
    } catch (error) {
      console.error('Error in getPostReactions:', error);
      return [];
    }
  }

  // Add or update a post reaction
  async togglePostReaction(postId, userId, reactionType = 'like') {
    try {
      // Check if user already reacted to this post
      const { data: existingReaction } = await supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (existingReaction) {
        if (existingReaction.reaction_type === reactionType) {
          // Remove reaction if it's the same type
          await supabase
            .from('post_likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', userId);
          
          await this.updatePostLikeCount(postId);
          return { reacted: false, type: null };
        } else {
          // Update reaction type
          await supabase
            .from('post_likes')
            .update({ reaction_type: reactionType })
            .eq('post_id', postId)
            .eq('user_id', userId);
          
          return { reacted: true, type: reactionType };
        }
      } else {
        // Add new reaction
        await supabase
          .from('post_likes')
          .insert([
            {
              post_id: postId,
              user_id: userId,
              reaction_type: reactionType
            }
          ]);
        
        await this.updatePostLikeCount(postId);
        return { reacted: true, type: reactionType };
      }
    } catch (error) {
      console.error('Error toggling post reaction:', error);
      throw error;
    }
  }

  // Update post like count
  async updatePostLikeCount(postId) {
    try {
      const { count } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      await supabase
        .from('posts')
        .update({ likes_count: count })
        .eq('id', postId);
    } catch (error) {
      console.error('Error updating like count:', error);
    }
  }

  // Get user's reaction to a post
  async getUserReaction(postId, userId) {
    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select('reaction_type')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error getting user reaction:', error);
        return null;
      }

      return data?.reaction_type || null;
    } catch (error) {
      console.error('Error in getUserReaction:', error);
      return null;
    }
  }

  // Utility functions
  getReactionEmoji(type) {
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
  }

  getAvatarInitials(user) {
    if (!user) return 'U';
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  }

  // Subscribe to real-time comment updates
  subscribeToComments(postId, callback) {
    const subscription = supabase
      .channel(`comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_comments',
          filter: `post_id=eq.${postId}`
        },
        (payload) => {
          console.log('Comment update:', payload);
          callback(payload);
        }
      )
      .subscribe();

    return subscription;
  }

  // Subscribe to real-time reaction updates
  subscribeToReactions(postId, callback) {
    const subscription = supabase
      .channel(`reactions-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_likes',
          filter: `post_id=eq.${postId}`
        },
        (payload) => {
          console.log('Reaction update:', payload);
          callback(payload);
        }
      )
      .subscribe();

    return subscription;
  }

  // Unsubscribe from real-time updates
  unsubscribe(subscription) {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  }
}

export default new CommentsAPI();

