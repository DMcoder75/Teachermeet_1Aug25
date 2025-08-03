import { supabase } from '../supabaseClient';

class MessagingAPI {
  // Get conversations for a user
  async getUserConversations(userId) {
    try {
      console.log('Fetching conversations for user:', userId);

      // Get educator ID first
      const { data: educator, error: educatorError } = await supabase
        .from('educators')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (educatorError) {
        console.error('Error fetching educator:', educatorError);
        return [];
      }

      const educatorId = educator.id;

      // Get conversations where user is a participant
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`
          id,
          title,
          is_group,
          created_at,
          updated_at,
          conversation_participants!inner (
            educator_id,
            joined_at,
            educators (
              id,
              first_name,
              last_name,
              profile_photo_url
            )
          ),
          messages (
            id,
            content,
            created_at,
            sender_id,
            educators!messages_sender_id_fkey (
              first_name,
              last_name
            )
          )
        `)
        .eq('conversation_participants.educator_id', educatorId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Process conversations to get the latest message and participant info
      const processedConversations = conversations.map(conv => {
        const participants = conv.conversation_participants
          .filter(p => p.educator_id !== educatorId)
          .map(p => p.educators);

        const latestMessage = conv.messages
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

        const unreadCount = conv.messages.filter(msg => 
          msg.sender_id !== educatorId && 
          new Date(msg.created_at) > new Date(conv.conversation_participants.find(p => p.educator_id === educatorId)?.last_read_at || 0)
        ).length;

        return {
          id: conv.id,
          title: conv.title,
          isGroup: conv.is_group,
          participants,
          lastMessage: latestMessage ? {
            content: latestMessage.content,
            timestamp: latestMessage.created_at,
            senderName: latestMessage.educators?.first_name || 'Unknown'
          } : null,
          unreadCount,
          updatedAt: conv.updated_at
        };
      });

      console.log('Processed conversations:', processedConversations);
      return processedConversations;

    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  }

  // Get messages for a specific conversation
  async getConversationMessages(conversationId, userId) {
    try {
      console.log('Fetching messages for conversation:', conversationId);

      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          message_type,
          attachment_url,
          educators!messages_sender_id_fkey (
            id,
            first_name,
            last_name,
            profile_photo_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get current user's educator ID
      const { data: educator } = await supabase
        .from('educators')
        .select('id')
        .eq('user_id', userId)
        .single();

      const currentEducatorId = educator?.id;

      // Process messages
      const processedMessages = messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        timestamp: new Date(msg.created_at).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        senderId: msg.sender_id,
        senderName: `${msg.educators.first_name} ${msg.educators.last_name}`.trim(),
        senderAvatar: msg.educators.profile_photo_url,
        isOwn: msg.sender_id === currentEducatorId,
        messageType: msg.message_type || 'text',
        attachmentUrl: msg.attachment_url
      }));

      console.log('Processed messages:', processedMessages);
      return processedMessages;

    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  // Send a message
  async sendMessage(conversationId, userId, content, messageType = 'text', attachmentUrl = null) {
    try {
      console.log('Sending message:', { conversationId, userId, content });

      // Get educator ID
      const { data: educator, error: educatorError } = await supabase
        .from('educators')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (educatorError) throw educatorError;

      // Insert message
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: educator.id,
          content: content.trim(),
          message_type: messageType,
          attachment_url: attachmentUrl
        })
        .select(`
          id,
          content,
          created_at,
          sender_id,
          message_type,
          attachment_url,
          educators!messages_sender_id_fkey (
            first_name,
            last_name,
            profile_photo_url
          )
        `)
        .single();

      if (error) throw error;

      // Update conversation's updated_at timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      // Process the sent message
      const processedMessage = {
        id: message.id,
        content: message.content,
        timestamp: new Date(message.created_at).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        senderId: message.sender_id,
        senderName: `${message.educators.first_name} ${message.educators.last_name}`.trim(),
        senderAvatar: message.educators.profile_photo_url,
        isOwn: true,
        messageType: message.message_type,
        attachmentUrl: message.attachment_url
      };

      console.log('Message sent successfully:', processedMessage);
      return processedMessage;

    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Create a new conversation
  async createConversation(userId, participantIds, title = null, isGroup = false) {
    try {
      console.log('Creating conversation:', { userId, participantIds, title, isGroup });

      // Get current user's educator ID
      const { data: educator, error: educatorError } = await supabase
        .from('educators')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (educatorError) throw educatorError;

      // Create conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          title: title || (isGroup ? 'Group Chat' : null),
          is_group: isGroup,
          created_by: educator.id
        })
        .select()
        .single();

      if (convError) throw convError;

      // Add participants (including creator)
      const allParticipants = [educator.id, ...participantIds];
      const participantInserts = allParticipants.map(educatorId => ({
        conversation_id: conversation.id,
        educator_id: educatorId,
        joined_at: new Date().toISOString()
      }));

      const { error: participantError } = await supabase
        .from('conversation_participants')
        .insert(participantInserts);

      if (participantError) throw participantError;

      console.log('Conversation created successfully:', conversation);
      return conversation;

    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  // Search for users to start a conversation with
  async searchUsers(query, currentUserId) {
    try {
      console.log('Searching users:', query);

      const { data: users, error } = await supabase
        .from('educators')
        .select(`
          id,
          user_id,
          first_name,
          last_name,
          email,
          headline,
          profile_photo_url,
          institution
        `)
        .neq('user_id', currentUserId)
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;

      const processedUsers = users.map(user => ({
        id: user.id,
        userId: user.user_id,
        name: `${user.first_name} ${user.last_name}`.trim(),
        email: user.email,
        headline: user.headline,
        avatar: user.profile_photo_url,
        institution: user.institution
      }));

      console.log('Found users:', processedUsers);
      return processedUsers;

    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  // Mark conversation as read
  async markConversationAsRead(conversationId, userId) {
    try {
      // Get educator ID
      const { data: educator, error: educatorError } = await supabase
        .from('educators')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (educatorError) throw educatorError;

      // Update last_read_at timestamp
      const { error } = await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('educator_id', educator.id);

      if (error) throw error;

      console.log('Conversation marked as read:', conversationId);

    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  }

  // Get online status of users
  async getUsersOnlineStatus(userIds) {
    try {
      // This would typically integrate with a real-time presence system
      // For now, return mock data
      const onlineStatus = {};
      userIds.forEach(id => {
        onlineStatus[id] = Math.random() > 0.5; // Random online status
      });
      return onlineStatus;
    } catch (error) {
      console.error('Error getting online status:', error);
      return {};
    }
  }

  // Subscribe to real-time message updates
  subscribeToMessages(conversationId, callback) {
    console.log('Subscribing to messages for conversation:', conversationId);

    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('New message received:', payload);
          callback(payload.new);
        }
      )
      .subscribe();

    return subscription;
  }

  // Unsubscribe from real-time updates
  unsubscribeFromMessages(subscription) {
    if (subscription) {
      supabase.removeChannel(subscription);
      console.log('Unsubscribed from messages');
    }
  }
}

export default new MessagingAPI();

