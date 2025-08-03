import React, { useState, useEffect, useRef } from 'react';
import messagingAPI from '../services/messagingAPI';
import { 
  MessageCircle, 
  X, 
  Minus, 
  Send, 
  Search,
  MoreHorizontal,
  Phone,
  Video,
  Info,
  Paperclip,
  Smile,
  ChevronUp,
  ChevronDown,
  Loader
} from 'lucide-react';

function MessengerPopover({ isOpen, onToggle, user }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const messagesEndRef = useRef(null);
  const popoverRef = useRef(null);
  const messageSubscription = useRef(null);

  // Load conversations when messenger opens
  useEffect(() => {
    if (isOpen && user?.id) {
      loadConversations();
    }
  }, [isOpen, user]);

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChat?.id && user?.id) {
      loadMessages(activeChat.id);
      // Subscribe to real-time messages
      subscribeToMessages(activeChat.id);
    }
    return () => {
      if (messageSubscription.current) {
        messagingAPI.unsubscribeFromMessages(messageSubscription.current);
      }
    };
  }, [activeChat, user]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      console.log('Loading conversations for user:', user.id);
      const convs = await messagingAPI.getUserConversations(user.id);
      
      // Process conversations to match our UI format
      const processedConversations = convs.map(conv => ({
        id: conv.id,
        name: conv.isGroup ? conv.title : getConversationName(conv),
        avatar: conv.isGroup ? 'GR' : getConversationAvatar(conv),
        lastMessage: conv.lastMessage?.content || 'No messages yet',
        timestamp: conv.lastMessage ? formatTimestamp(conv.lastMessage.timestamp) : '',
        unread: conv.unreadCount || 0,
        online: false, // Would be determined by real-time presence
        isGroup: conv.isGroup,
        participants: conv.participants
      }));
      
      setConversations(processedConversations);
      console.log('Conversations loaded:', processedConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      // Fallback to sample data
      setConversations(getSampleConversations());
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      setMessagesLoading(true);
      console.log('Loading messages for conversation:', conversationId);
      const msgs = await messagingAPI.getConversationMessages(conversationId, user.id);
      setMessages(msgs);
      console.log('Messages loaded:', msgs);
      
      // Mark conversation as read
      await messagingAPI.markConversationAsRead(conversationId, user.id);
    } catch (error) {
      console.error('Error loading messages:', error);
      // Fallback to sample messages
      setMessages(getSampleMessages());
    } finally {
      setMessagesLoading(false);
    }
  };

  const subscribeToMessages = (conversationId) => {
    messageSubscription.current = messagingAPI.subscribeToMessages(
      conversationId,
      (newMessage) => {
        // Add new message to the list
        setMessages(prev => [...prev, {
          id: newMessage.id,
          content: newMessage.content,
          timestamp: new Date(newMessage.created_at).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          senderId: newMessage.sender_id,
          senderName: 'Unknown', // Would be populated from the message data
          isOwn: newMessage.sender_id === user.id
        }]);
      }
    );
  };

  const getConversationName = (conversation) => {
    if (conversation.participants && conversation.participants.length > 0) {
      const participant = conversation.participants[0];
      return `${participant.first_name} ${participant.last_name}`.trim();
    }
    return 'Unknown User';
  };

  const getConversationAvatar = (conversation) => {
    if (conversation.participants && conversation.participants.length > 0) {
      const participant = conversation.participants[0];
      const firstName = participant.first_name || '';
      const lastName = participant.last_name || '';
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return 'U';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  };

  const getSampleConversations = () => [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      avatar: 'SJ',
      lastMessage: 'Thanks for sharing that resource!',
      timestamp: '2m ago',
      unread: 2,
      online: true
    },
    {
      id: 2,
      name: 'Prof. Michael Chen',
      avatar: 'MC',
      lastMessage: 'The workshop was amazing',
      timestamp: '1h ago',
      unread: 0,
      online: false
    }
  ];

  const getSampleMessages = () => [
    {
      id: 1,
      senderId: 1,
      senderName: 'Dr. Sarah Johnson',
      content: 'Hi! I saw your post about innovative teaching methods.',
      timestamp: '10:30 AM',
      isOwn: false
    },
    {
      id: 2,
      senderId: 'current',
      senderName: 'You',
      content: 'Hi! Thanks for reaching out. Which method caught your attention?',
      timestamp: '10:32 AM',
      isOwn: true
    }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (message.trim() && activeChat && !sendingMessage) {
      try {
        setSendingMessage(true);
        console.log('Sending message:', message.trim());
        
        const sentMessage = await messagingAPI.sendMessage(
          activeChat.id,
          user.id,
          message.trim()
        );
        
        // Add the sent message to the local state
        setMessages(prev => [...prev, sentMessage]);
        setMessage('');
        
        // Update the conversation list with the new message
        setConversations(prev => prev.map(conv => 
          conv.id === activeChat.id 
            ? { ...conv, lastMessage: message.trim(), timestamp: 'now' }
            : conv
        ));
        
        console.log('Message sent successfully:', sentMessage);
      } catch (error) {
        console.error('Error sending message:', error);
        // Fallback: add message locally anyway
        const fallbackMessage = {
          id: Date.now(),
          senderId: 'current',
          senderName: 'You',
          content: message.trim(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOwn: true
        };
        setMessages(prev => [...prev, fallbackMessage]);
        setMessage('');
      } finally {
        setSendingMessage(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleChatSelect = (conversation) => {
    setActiveChat(conversation);
    setIsMinimized(false);
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('.messenger-header')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={onToggle}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 select-none"
      style={{
        left: `${position.x}px`,
        bottom: `${position.y}px`,
        width: '380px',
        height: isMinimized ? '60px' : '500px',
        transition: isDragging ? 'none' : 'height 0.3s ease-in-out'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="messenger-header bg-blue-600 text-white p-3 rounded-t-lg flex items-center justify-between cursor-move">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5" />
          <span className="font-medium">
            {activeChat ? activeChat.name : 'Messenger'}
          </span>
          {activeChat && !activeChat.isGroup && (
            <div className={`w-2 h-2 rounded-full ${activeChat.online ? 'bg-green-400' : 'bg-gray-400'}`} />
          )}
        </div>
        <div className="flex items-center space-x-1">
          {activeChat && (
            <>
              <button className="p-1 hover:bg-blue-700 rounded">
                <Phone className="h-4 w-4" />
              </button>
              <button className="p-1 hover:bg-blue-700 rounded">
                <Video className="h-4 w-4" />
              </button>
              <button className="p-1 hover:bg-blue-700 rounded">
                <Info className="h-4 w-4" />
              </button>
            </>
          )}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-blue-700 rounded"
          >
            {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-blue-700 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="flex h-full">
          {/* Chat List */}
          {!activeChat && (
            <div className="w-full flex flex-col">
              {/* Search */}
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => handleChatSelect(conversation)}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                          conversation.isGroup ? 'bg-purple-500' : 'bg-blue-500'
                        }`}>
                          {conversation.avatar}
                        </div>
                        {conversation.online && !conversation.isGroup && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 truncate">
                            {conversation.name}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {conversation.timestamp}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.lastMessage}
                          </p>
                          {conversation.unread > 0 && (
                            <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {conversation.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat Window */}
          {activeChat && (
            <div className="w-full flex flex-col">
              {/* Chat Header */}
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setActiveChat(null)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    ← Back
                  </button>
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                      activeChat.isGroup ? 'bg-purple-500' : 'bg-blue-500'
                    }`}>
                      {activeChat.avatar}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        {activeChat.name}
                      </h4>
                      {!activeChat.isGroup && (
                        <p className="text-xs text-gray-500">
                          {activeChat.online ? 'Online' : 'Offline'}
                        </p>
                      )}
                    </div>
                  </div>
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <MoreHorizontal className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                      msg.isOwn
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${
                        msg.isOwn ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-3 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <Paperclip className="h-4 w-4 text-gray-600" />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <Smile className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MessengerPopover;

