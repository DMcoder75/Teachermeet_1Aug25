import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Search, 
  Send, 
  MoreHorizontal, 
  Phone, 
  Video, 
  Info, 
  Paperclip, 
  Smile, 
  Users, 
  Plus,
  X,
  ArrowLeft,
  Edit3,
  UserPlus
} from 'lucide-react';

function MessagingPage({ user, onBack }) {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [educators, setEducators] = useState([]);
  const [selectedEducators, setSelectedEducators] = useState([]);
  const [groupName, setGroupName] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    fetchEducators();
  }, [user]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      // Mock conversations for demo
      const mockConversations = [
        {
          id: 1,
          name: 'Dr. Sarah Johnson',
          lastMessage: 'Thanks for sharing that resource!',
          timestamp: '2 min ago',
          unread: 2,
          type: 'direct',
          avatar: 'SJ'
        },
        {
          id: 2,
          name: 'Mathematics Department',
          lastMessage: 'Meeting tomorrow at 3 PM',
          timestamp: '1 hour ago',
          unread: 0,
          type: 'group',
          avatar: 'MD',
          members: 8
        },
        {
          id: 3,
          name: 'Prof. Michael Chen',
          lastMessage: 'Great presentation today!',
          timestamp: '3 hours ago',
          unread: 0,
          type: 'direct',
          avatar: 'MC'
        },
        {
          id: 4,
          name: 'Science Teachers Network',
          lastMessage: 'New curriculum guidelines available',
          timestamp: '1 day ago',
          unread: 5,
          type: 'group',
          avatar: 'ST',
          members: 15
        }
      ];
      
      setConversations(mockConversations);
      if (mockConversations.length > 0) {
        setActiveConversation(mockConversations[0]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEducators = async () => {
    try {
      const { data, error } = await supabase
        .from('educators')
        .select('id, first_name, last_name, title, institution')
        .neq('id', user.id)
        .limit(20);

      if (error) throw error;
      setEducators(data || []);
    } catch (error) {
      console.error('Error fetching educators:', error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      // Mock messages for demo
      const mockMessages = {
        1: [
          {
            id: 1,
            content: 'Hi! I saw your post about interactive learning strategies. Very insightful!',
            sender: 'Dr. Sarah Johnson',
            senderId: 2,
            timestamp: '10:30 AM',
            isOwn: false
          },
          {
            id: 2,
            content: 'Thank you! I\'ve been experimenting with these techniques for the past semester.',
            sender: 'You',
            senderId: user.id,
            timestamp: '10:32 AM',
            isOwn: true
          },
          {
            id: 3,
            content: 'Would you mind sharing some specific examples? I\'d love to try them in my classes.',
            sender: 'Dr. Sarah Johnson',
            senderId: 2,
            timestamp: '10:35 AM',
            isOwn: false
          },
          {
            id: 4,
            content: 'Of course! I\'ll send you a document with detailed examples and implementation tips.',
            sender: 'You',
            senderId: user.id,
            timestamp: '10:37 AM',
            isOwn: true
          },
          {
            id: 5,
            content: 'Thanks for sharing that resource!',
            sender: 'Dr. Sarah Johnson',
            senderId: 2,
            timestamp: '2 min ago',
            isOwn: false
          }
        ],
        2: [
          {
            id: 1,
            content: 'Good morning everyone! Don\'t forget about our department meeting tomorrow.',
            sender: 'Department Head',
            senderId: 3,
            timestamp: '9:00 AM',
            isOwn: false
          },
          {
            id: 2,
            content: 'What time is the meeting?',
            sender: 'Prof. Anderson',
            senderId: 4,
            timestamp: '9:15 AM',
            isOwn: false
          },
          {
            id: 3,
            content: 'Meeting tomorrow at 3 PM',
            sender: 'Department Head',
            senderId: 3,
            timestamp: '1 hour ago',
            isOwn: false
          }
        ]
      };

      setMessages(mockMessages[conversationId] || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    const message = {
      id: Date.now(),
      content: newMessage.trim(),
      sender: 'You',
      senderId: user.id,
      timestamp: 'Just now',
      isOwn: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Update conversation last message
    setConversations(prev => prev.map(conv => 
      conv.id === activeConversation.id 
        ? { ...conv, lastMessage: newMessage.trim(), timestamp: 'Just now' }
        : conv
    ));
  };

  const startNewChat = () => {
    setShowNewChat(true);
    setSelectedEducators([]);
    setGroupName('');
  };

  const toggleEducatorSelection = (educator) => {
    setSelectedEducators(prev => {
      const isSelected = prev.find(e => e.id === educator.id);
      if (isSelected) {
        return prev.filter(e => e.id !== educator.id);
      } else {
        return [...prev, educator];
      }
    });
  };

  const createNewConversation = () => {
    if (selectedEducators.length === 0) return;

    const isGroup = selectedEducators.length > 1;
    const newConversation = {
      id: Date.now(),
      name: isGroup 
        ? (groupName || `Group with ${selectedEducators.map(e => e.first_name).join(', ')}`)
        : `${selectedEducators[0].first_name} ${selectedEducators[0].last_name}`,
      lastMessage: 'Start a conversation...',
      timestamp: 'Just now',
      unread: 0,
      type: isGroup ? 'group' : 'direct',
      avatar: isGroup 
        ? 'GR'
        : `${selectedEducators[0].first_name.charAt(0)}${selectedEducators[0].last_name.charAt(0)}`,
      members: isGroup ? selectedEducators.length + 1 : 2
    };

    setConversations(prev => [newConversation, ...prev]);
    setActiveConversation(newConversation);
    setShowNewChat(false);
    setMessages([]);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fff8f0' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fff8f0' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Dashboard
              </button>
              <div className="flex items-center">
                <img src="/logo.png" alt="Teacher-meet" className="h-8 w-8" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Messaging</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto h-[calc(100vh-3.5rem)]">
        <div className="flex h-full">
          {/* Conversations Sidebar */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            {/* Search and New Chat */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                <button
                  onClick={startNewChat}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                >
                  <Edit3 size={18} />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setActiveConversation(conversation)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    activeConversation?.id === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        conversation.type === 'group' ? 'bg-green-600' : 'bg-blue-600'
                      }`}>
                        <span className="text-white font-medium">
                          {conversation.avatar}
                        </span>
                      </div>
                      {conversation.type === 'group' && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center">
                          <Users size={10} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 truncate">
                          {conversation.name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {conversation.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {conversation.lastMessage}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        {conversation.type === 'group' && (
                          <span className="text-xs text-gray-500">
                            {conversation.members} members
                          </span>
                        )}
                        {conversation.unread > 0 && (
                          <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 ml-auto">
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

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-white">
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activeConversation.type === 'group' ? 'bg-green-600' : 'bg-blue-600'
                    }`}>
                      <span className="text-white font-medium">
                        {activeConversation.avatar}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {activeConversation.name}
                      </h3>
                      {activeConversation.type === 'group' && (
                        <p className="text-sm text-gray-500">
                          {activeConversation.members} members
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                      <Phone size={18} />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                      <Video size={18} />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                      <Info size={18} />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md ${
                        message.isOwn 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      } rounded-lg px-4 py-2`}>
                        {!message.isOwn && activeConversation.type === 'group' && (
                          <p className="text-xs font-medium mb-1 opacity-75">
                            {message.sender}
                          </p>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.isOwn ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                      <Paperclip size={18} />
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <Smile size={16} />
                      </button>
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-600">
                    Choose a conversation from the sidebar to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">New Message</h3>
              <button
                onClick={() => setShowNewChat(false)}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Selected Educators */}
            {selectedEducators.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedEducators.map((educator) => (
                    <div
                      key={educator.id}
                      className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{educator.first_name} {educator.last_name}</span>
                      <button
                        onClick={() => toggleEducatorSelection(educator)}
                        className="hover:bg-blue-200 rounded-full p-1"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Group Name Input */}
                {selectedEducators.length > 1 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Group Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Enter group name..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Search Educators */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search educators..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Educators List */}
            <div className="max-h-60 overflow-y-auto mb-4">
              {educators.map((educator) => {
                const isSelected = selectedEducators.find(e => e.id === educator.id);
                return (
                  <div
                    key={educator.id}
                    onClick={() => toggleEducatorSelection(educator)}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {educator.first_name?.charAt(0)}{educator.last_name?.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {educator.first_name} {educator.last_name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {educator.title} | {educator.institution}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowNewChat(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createNewConversation}
                disabled={selectedEducators.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Start Conversation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessagingPage;

