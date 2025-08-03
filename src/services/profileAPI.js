import { supabase } from '../supabaseClient';

class ProfileAPI {
  // Get user profile data
  async getUserProfile(userId) {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('educators')
        .select(`
          *,
          profile_analytics (
            profile_views,
            post_impressions,
            search_appearances,
            connections_count
          )
        `)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      console.log('Profile data fetched:', data);
      return data;
    } catch (error) {
      console.error('Profile API error:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(userId, profileData) {
    try {
      console.log('Updating profile for user:', userId, profileData);

      const { data, error } = await supabase
        .from('educators')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      console.log('Profile updated successfully:', data);
      return data;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  // Upload profile photo
  async uploadProfilePhoto(userId, file) {
    try {
      console.log('Uploading profile photo for user:', userId);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/profile-${Date.now()}.${fileExt}`;

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Error uploading photo:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      console.log('Photo uploaded, public URL:', publicUrl);

      // Update profile with photo URL
      const { data: profileData, error: updateError } = await supabase
        .from('educators')
        .update({
          profile_photo_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating profile with photo URL:', updateError);
        throw updateError;
      }

      // Record photo in profile_photos table
      await supabase
        .from('profile_photos')
        .insert({
          educator_id: profileData.id,
          photo_type: 'profile',
          file_name: fileName,
          file_path: publicUrl,
          file_size: file.size,
          mime_type: file.type,
          is_active: true
        });

      console.log('Profile photo updated successfully');
      return publicUrl;
    } catch (error) {
      console.error('Photo upload error:', error);
      throw error;
    }
  }

  // Upload cover photo
  async uploadCoverPhoto(userId, file) {
    try {
      console.log('Uploading cover photo for user:', userId);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/cover-${Date.now()}.${fileExt}`;

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cover-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Error uploading cover photo:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('cover-photos')
        .getPublicUrl(fileName);

      console.log('Cover photo uploaded, public URL:', publicUrl);

      // Update profile with cover photo URL
      const { data: profileData, error: updateError } = await supabase
        .from('educators')
        .update({
          cover_photo_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating profile with cover photo URL:', updateError);
        throw updateError;
      }

      // Record photo in profile_photos table
      await supabase
        .from('profile_photos')
        .insert({
          educator_id: profileData.id,
          photo_type: 'cover',
          file_name: fileName,
          file_path: publicUrl,
          file_size: file.size,
          mime_type: file.type,
          is_active: true
        });

      console.log('Cover photo updated successfully');
      return publicUrl;
    } catch (error) {
      console.error('Cover photo upload error:', error);
      throw error;
    }
  }

  // Get profile sections (experience, education, etc.)
  async getProfileSections(userId) {
    try {
      // First get educator ID
      const { data: educator, error: educatorError } = await supabase
        .from('educators')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (educatorError) throw educatorError;

      const { data, error } = await supabase
        .from('profile_sections')
        .select('*')
        .eq('educator_id', educator.id)
        .eq('is_visible', true)
        .order('section_type', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching profile sections:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Profile sections error:', error);
      throw error;
    }
  }

  // Add profile section
  async addProfileSection(userId, sectionData) {
    try {
      // First get educator ID
      const { data: educator, error: educatorError } = await supabase
        .from('educators')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (educatorError) throw educatorError;

      const { data, error } = await supabase
        .from('profile_sections')
        .insert({
          educator_id: educator.id,
          ...sectionData
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding profile section:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Add profile section error:', error);
      throw error;
    }
  }

  // Update profile section
  async updateProfileSection(sectionId, sectionData) {
    try {
      const { data, error } = await supabase
        .from('profile_sections')
        .update({
          ...sectionData,
          updated_at: new Date().toISOString()
        })
        .eq('id', sectionId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile section:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Update profile section error:', error);
      throw error;
    }
  }

  // Delete profile section
  async deleteProfileSection(sectionId) {
    try {
      const { error } = await supabase
        .from('profile_sections')
        .delete()
        .eq('id', sectionId);

      if (error) {
        console.error('Error deleting profile section:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Delete profile section error:', error);
      throw error;
    }
  }

  // Increment profile view
  async incrementProfileView(profileOwnerId, viewerId = null) {
    try {
      // Insert profile view record
      await supabase
        .from('profile_views')
        .insert({
          profile_owner_id: profileOwnerId,
          viewer_id: viewerId
        });

      // Update profile views count
      await supabase
        .from('educators')
        .update({
          profile_views: supabase.raw('profile_views + 1')
        })
        .eq('id', profileOwnerId);

      console.log('Profile view incremented');
    } catch (error) {
      console.error('Error incrementing profile view:', error);
      // Don't throw error for view tracking
    }
  }

  // Get profile analytics
  async getProfileAnalytics(userId) {
    try {
      // First get educator ID
      const { data: educator, error: educatorError } = await supabase
        .from('educators')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (educatorError) throw educatorError;

      const { data, error } = await supabase
        .from('profile_analytics')
        .select('*')
        .eq('educator_id', educator.id)
        .order('date', { ascending: false })
        .limit(30); // Last 30 days

      if (error) {
        console.error('Error fetching profile analytics:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Profile analytics error:', error);
      throw error;
    }
  }
}

export default new ProfileAPI();

