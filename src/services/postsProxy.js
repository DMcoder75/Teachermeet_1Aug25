// Posts Proxy Service - Alternative API to handle CORS issues
import { supabase } from '../supabaseClient';

// Create a proxy service that handles API calls with better error handling
export const postsProxy = {
  async getAllPosts() {
    try {
      console.log('Fetching posts through proxy...');
      
      // Try direct Supabase call first
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:educators(id, first_name, last_name, title, institution, subjects)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        
        // If CORS error, try alternative approach
        if (error.message && error.message.includes('CORS')) {
          console.log('CORS error detected, trying alternative approach...');
          return await this.getPostsAlternative();
        }
        
        throw error;
      }

      console.log('Posts fetched successfully:', data?.length || 0, 'posts');
      return data || [];
    } catch (error) {
      console.error('Error in postsProxy.getAllPosts:', error);
      
      // Try alternative approach on any error
      try {
        return await this.getPostsAlternative();
      } catch (altError) {
        console.error('Alternative approach also failed:', altError);
        return [];
      }
    }
  },

  async getPostsAlternative() {
    try {
      console.log('Trying alternative posts fetch...');
      
      // Try a simpler query first
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) {
        throw postsError;
      }

      // Then get authors separately
      const { data: educators, error: educatorsError } = await supabase
        .from('educators')
        .select('id, first_name, last_name, title, institution, subjects');

      if (educatorsError) {
        console.warn('Could not fetch educators:', educatorsError);
        // Return posts without author info
        return posts?.map(post => ({
          ...post,
          author: null
        })) || [];
      }

      // Manually join the data
      const postsWithAuthors = posts?.map(post => {
        const author = educators?.find(edu => edu.id === post.educator_id);
        return {
          ...post,
          author: author || null
        };
      }) || [];

      console.log('Alternative fetch successful:', postsWithAuthors.length, 'posts');
      return postsWithAuthors;
    } catch (error) {
      console.error('Alternative approach failed:', error);
      throw error;
    }
  },

  async createPost(postData) {
    try {
      console.log('Creating post through proxy...', postData);
      
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

      console.log('Post created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in postsProxy.createPost:', error);
      throw error;
    }
  }
};

// Export as default for easy importing
export default postsProxy;

