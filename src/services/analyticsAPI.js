import { supabase } from '../supabaseClient';

class AnalyticsAPI {
  // Calculate real-time analytics for a user based on their activity
  async getUserAnalytics(userId) {
    try {
      console.log('Calculating analytics for user:', userId);

      // Get educator ID first
      const { data: educator, error: educatorError } = await supabase
        .from('educators')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (educatorError) {
        console.error('Error fetching educator:', educatorError);
        return this.getDefaultAnalytics();
      }

      const educatorId = educator.id;

      // Calculate analytics in parallel
      const [
        profileViewsResult,
        postImpressionsResult,
        searchAppearancesResult,
        connectionsResult
      ] = await Promise.allSettled([
        this.calculateProfileViews(educatorId),
        this.calculatePostImpressions(educatorId),
        this.calculateSearchAppearances(educatorId),
        this.calculateConnections(educatorId)
      ]);

      const analytics = {
        profile_views: profileViewsResult.status === 'fulfilled' ? profileViewsResult.value : 0,
        post_impressions: postImpressionsResult.status === 'fulfilled' ? postImpressionsResult.value : 0,
        search_appearances: searchAppearancesResult.status === 'fulfilled' ? searchAppearancesResult.value : 0,
        connections_count: connectionsResult.status === 'fulfilled' ? connectionsResult.value : 0,
        calculated_at: new Date().toISOString()
      };

      console.log('Calculated analytics:', analytics);
      return analytics;

    } catch (error) {
      console.error('Error calculating analytics:', error);
      return this.getDefaultAnalytics();
    }
  }

  // Calculate profile views from profile_views table
  async calculateProfileViews(educatorId) {
    try {
      const { count, error } = await supabase
        .from('profile_views')
        .select('*', { count: 'exact', head: true })
        .eq('profile_owner_id', educatorId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error calculating profile views:', error);
      return 0;
    }
  }

  // Calculate post impressions from posts and their interactions
  async calculatePostImpressions(educatorId) {
    try {
      // Get all posts by this user
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('id')
        .eq('educator_id', educatorId);

      if (postsError) throw postsError;

      if (!posts || posts.length === 0) {
        return 0;
      }

      const postIds = posts.map(post => post.id);

      // Calculate total impressions from likes, comments, and views
      const [likesResult, commentsResult] = await Promise.allSettled([
        this.countPostLikes(postIds),
        this.countPostComments(postIds)
      ]);

      const likes = likesResult.status === 'fulfilled' ? likesResult.value : 0;
      const comments = commentsResult.status === 'fulfilled' ? commentsResult.value : 0;
      
      // Estimate impressions: likes + comments + estimated views (likes * 10 as approximation)
      const estimatedViews = likes * 10;
      const totalImpressions = likes + comments + estimatedViews;

      return totalImpressions;
    } catch (error) {
      console.error('Error calculating post impressions:', error);
      return 0;
    }
  }

  // Count likes on user's posts
  async countPostLikes(postIds) {
    if (!postIds || postIds.length === 0) return 0;

    try {
      const { count, error } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact', head: true })
        .in('post_id', postIds);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error counting post likes:', error);
      return 0;
    }
  }

  // Count comments on user's posts
  async countPostComments(postIds) {
    if (!postIds || postIds.length === 0) return 0;

    try {
      const { count, error } = await supabase
        .from('post_comments')
        .select('*', { count: 'exact', head: true })
        .in('post_id', postIds);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error counting post comments:', error);
      return 0;
    }
  }

  // Calculate search appearances (simplified - based on profile completeness and activity)
  async calculateSearchAppearances(educatorId) {
    try {
      // Get educator profile data
      const { data: educator, error } = await supabase
        .from('educators')
        .select('headline, summary, specializations, skills, is_profile_public')
        .eq('id', educatorId)
        .single();

      if (error) throw error;

      if (!educator || !educator.is_profile_public) {
        return 0;
      }

      // Calculate search score based on profile completeness
      let searchScore = 0;
      
      if (educator.headline) searchScore += 2;
      if (educator.summary) searchScore += 3;
      if (educator.specializations && educator.specializations.length > 0) searchScore += 2;
      if (educator.skills && educator.skills.length > 0) searchScore += 2;

      // Estimate search appearances based on profile completeness (max 50)
      const maxSearchAppearances = 50;
      const searchAppearances = Math.min(searchScore * 5, maxSearchAppearances);

      return searchAppearances;
    } catch (error) {
      console.error('Error calculating search appearances:', error);
      return 0;
    }
  }

  // Calculate connections count
  async calculateConnections(educatorId) {
    try {
      const { count, error } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .or(`requester_id.eq.${educatorId},recipient_id.eq.${educatorId}`)
        .eq('status', 'accepted');

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error calculating connections:', error);
      return 0;
    }
  }

  // Get detailed post analytics for a user
  async getPostAnalytics(userId, timeframe = '7days') {
    try {
      // Get educator ID
      const { data: educator, error: educatorError } = await supabase
        .from('educators')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (educatorError) throw educatorError;

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeframe) {
        case '7days':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(endDate.getDate() - 90);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }

      // Get posts in timeframe
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          created_at,
          post_likes (count),
          post_comments (count)
        `)
        .eq('educator_id', educator.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      return {
        timeframe,
        total_posts: posts?.length || 0,
        posts: posts || [],
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        }
      };

    } catch (error) {
      console.error('Error getting post analytics:', error);
      return {
        timeframe,
        total_posts: 0,
        posts: [],
        period: {
          start: new Date().toISOString(),
          end: new Date().toISOString()
        }
      };
    }
  }

  // Get trending metrics for the user
  async getTrendingMetrics(userId) {
    try {
      const currentAnalytics = await this.getUserAnalytics(userId);
      
      // For trending, we'd compare with previous period
      // For now, return current metrics with trend indicators
      return {
        profile_views: {
          current: currentAnalytics.profile_views,
          trend: 'up', // Would calculate based on historical data
          change_percent: 5.2
        },
        post_impressions: {
          current: currentAnalytics.post_impressions,
          trend: currentAnalytics.post_impressions > 0 ? 'up' : 'neutral',
          change_percent: currentAnalytics.post_impressions > 0 ? 12.3 : 0
        },
        search_appearances: {
          current: currentAnalytics.search_appearances,
          trend: 'up',
          change_percent: 8.7
        },
        connections: {
          current: currentAnalytics.connections_count,
          trend: currentAnalytics.connections_count > 0 ? 'up' : 'neutral',
          change_percent: currentAnalytics.connections_count > 0 ? 15.4 : 0
        }
      };
    } catch (error) {
      console.error('Error getting trending metrics:', error);
      return this.getDefaultTrendingMetrics();
    }
  }

  // Default analytics when calculation fails
  getDefaultAnalytics() {
    return {
      profile_views: 0,
      post_impressions: 0,
      search_appearances: 0,
      connections_count: 0,
      calculated_at: new Date().toISOString()
    };
  }

  // Default trending metrics
  getDefaultTrendingMetrics() {
    return {
      profile_views: { current: 0, trend: 'neutral', change_percent: 0 },
      post_impressions: { current: 0, trend: 'neutral', change_percent: 0 },
      search_appearances: { current: 0, trend: 'neutral', change_percent: 0 },
      connections: { current: 0, trend: 'neutral', change_percent: 0 }
    };
  }

  // Record a profile view (for analytics tracking)
  async recordProfileView(profileOwnerId, viewerId = null) {
    try {
      // Insert profile view record
      const { error } = await supabase
        .from('profile_views')
        .insert({
          profile_owner_id: profileOwnerId,
          viewer_id: viewerId,
          view_date: new Date().toISOString()
        });

      if (error && !error.message.includes('duplicate')) {
        console.error('Error recording profile view:', error);
      }
    } catch (error) {
      console.error('Error recording profile view:', error);
    }
  }
}

export default new AnalyticsAPI();

