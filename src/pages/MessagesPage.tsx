import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/supabase';
import { 
  Send, 
  Paperclip, 
  MoreVertical, 
  Search, 
  User,
  Clock,
  Check,
  CheckCheck,
  Image as ImageIcon,
  File,
  Download,
  Eye,
  Trash2,
  Phone,
  Video
} from 'lucide-react';

interface Conversation {
  conversation_id: string;
  job_id: string;
  conversation_created_at: string;
  conversation_updated_at: string;
  participant1_id: string;
  participant1_first_name: string;
  participant1_last_name: string;
  participant1_photo: string;
  participant2_id: string;
  participant2_first_name: string;
  participant2_last_name: string;
  participant2_photo: string;
  job_title: string;
  company_name: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  is_read: boolean;
  created_at: string;
  sender: {
    first_name: string;
    last_name: string;
    profile_photo_url: string;
  };
}

const MessagesPage = () => {
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCounts, setUnreadCounts] = useState<{[key: string]: number}>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      loadConversations();
    }
  }, [profile]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.conversation_id);
      markMessagesAsRead(selectedConversation.conversation_id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const { data, error } = await db.getConversations(profile!.id);
      
      if (error) {
        console.error('Error loading conversations:', error);
      } else if (data) {
        setConversations(data);
        
        // Load unread counts for each conversation
        const counts: {[key: string]: number} = {};
        for (const conv of data) {
          const { data: unreadCount } = await db.getUnreadMessageCount(profile!.id);
          counts[conv.conversation_id] = unreadCount || 0;
        }
        setUnreadCounts(counts);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await db.getMessages(conversationId);
      
      if (error) {
        console.error('Error loading messages:', error);
      } else if (data) {
        setMessages(data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const markMessagesAsRead = async (conversationId: string) => {
    try {
      await db.markMessagesAsRead(conversationId, profile!.id);
      
      // Update unread count
      setUnreadCounts(prev => ({
        ...prev,
        [conversationId]: 0
      }));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      
      const { data, error } = await db.sendMessage(
        selectedConversation.conversation_id,
        profile!.id,
        newMessage.trim()
      );
      
      if (error) {
        console.error('Error sending message:', error);
      } else if (data) {
        setMessages(prev => [...prev, data]);
        setNewMessage('');
        
        // Update conversation timestamp
        setConversations(prev => 
          prev.map(conv => 
            conv.conversation_id === selectedConversation.conversation_id
              ? { ...conv, conversation_updated_at: new Date().toISOString() }
              : conv
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !selectedConversation) return;

    const file = e.target.files[0];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (file.size > maxSize) {
      alert('Dosya boyutu 10MB\'dan küçük olmalıdır.');
      return;
    }

    try {
      setSending(true);
      
      // Upload file
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `messages/${fileName}`;

      const { error: uploadError } = await db.uploadFile(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }

      // Get file URL
      const { data: fileUrl } = await db.getFileUrl(filePath);
      
      if (!fileUrl) {
        throw new Error('File URL could not be generated');
      }

      // Send message with file
      const { data, error } = await db.sendMessage(
        selectedConversation.conversation_id,
        profile!.id,
        file.name,
        file.type.startsWith('image/') ? 'image' : 'file',
        fileUrl,
        file.name,
        file.size
      );
      
      if (error) {
        console.error('Error sending file message:', error);
      } else if (data) {
        setMessages(prev => [...prev, data]);
        
        // Update conversation timestamp
        setConversations(prev => 
          prev.map(conv => 
            conv.conversation_id === selectedConversation.conversation_id
              ? { ...conv, conversation_updated_at: new Date().toISOString() }
              : conv
          )
        );
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Dosya yüklenirken hata oluştu.');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participant1_id === profile!.id
      ? {
          id: conversation.participant2_id,
          name: `${conversation.participant2_first_name} ${conversation.participant2_last_name}`,
          photo: conversation.participant2_photo
        }
      : {
          id: conversation.participant1_id,
          name: `${conversation.participant1_first_name} ${conversation.participant1_last_name}`,
          photo: conversation.participant1_photo
        };
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString('tr-TR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = getOtherParticipant(conv);
    return otherParticipant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           conv.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           conv.company_name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (!profile) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Giriş Gerekli</h2>
          <p className="text-gray-600">Mesajları görüntülemek için giriş yapın.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto h-[calc(100vh-4rem)]">
        <div className="bg-white rounded-lg shadow-sm border h-full flex">
          {/* Conversations Sidebar */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <h1 className="text-xl font-semibold text-gray-900 mb-4">Mesajlar</h1>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Konuşma ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-4">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz Mesaj Yok</h3>
                  <p className="text-gray-600">İş ilanlarına başvuru yaparak mesajlaşmaya başlayın.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredConversations.map((conversation) => {
                    const otherParticipant = getOtherParticipant(conversation);
                    const isSelected = selectedConversation?.conversation_id === conversation.conversation_id;
                    const unreadCount = unreadCounts[conversation.conversation_id] || 0;
                    
                    return (
                      <div
                        key={conversation.conversation_id}
                        onClick={() => setSelectedConversation(conversation)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-primary-50 border-r-2 border-primary-600' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                              {otherParticipant.photo ? (
                                <img 
                                  src={otherParticipant.photo} 
                                  alt={otherParticipant.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            {unreadCount > 0 && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-error-600 text-white text-xs rounded-full flex items-center justify-center">
                                {unreadCount > 9 ? '9+' : unreadCount}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-gray-900 truncate">
                                {otherParticipant.name}
                              </h3>
                              <span className="text-xs text-gray-500">
                                {formatTime(conversation.conversation_updated_at)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.job_title}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {conversation.company_name}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      {getOtherParticipant(selectedConversation).photo ? (
                        <img 
                          src={getOtherParticipant(selectedConversation).photo} 
                          alt={getOtherParticipant(selectedConversation).name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {getOtherParticipant(selectedConversation).name}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {selectedConversation.job_title} • {selectedConversation.company_name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <Phone className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <Video className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => {
                    const isOwnMessage = message.sender_id === profile.id;
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                          {!isOwnMessage && (
                            <div className="flex items-center space-x-2 mb-1">
                              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                {message.sender.profile_photo_url ? (
                                  <img 
                                    src={message.sender.profile_photo_url} 
                                    alt={`${message.sender.first_name} ${message.sender.last_name}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="h-3 w-3 text-gray-400" />
                                )}
                              </div>
                              <span className="text-xs text-gray-500">
                                {message.sender.first_name} {message.sender.last_name}
                              </span>
                            </div>
                          )}
                          
                          <div
                            className={`p-3 rounded-lg ${
                              isOwnMessage
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            {message.message_type === 'text' ? (
                              <p className="text-sm">{message.content}</p>
                            ) : message.message_type === 'image' ? (
                              <div>
                                <img 
                                  src={message.file_url} 
                                  alt="Image" 
                                  className="max-w-full rounded"
                                />
                                <p className="text-xs mt-1 opacity-75">{message.file_name}</p>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <File className="h-4 w-4" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{message.file_name}</p>
                                  <p className="text-xs opacity-75">
                                    {(message.file_size! / 1024 / 1024).toFixed(1)} MB
                                  </p>
                                </div>
                                <button
                                  onClick={() => window.open(message.file_url, '_blank')}
                                  className="p-1 hover:bg-black hover:bg-opacity-10 rounded"
                                >
                                  <Download className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                          
                          <div className={`flex items-center space-x-1 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-xs text-gray-500">
                              {formatTime(message.created_at)}
                            </span>
                            {isOwnMessage && (
                              <div className="flex items-center">
                                {message.is_read ? (
                                  <CheckCheck className="h-3 w-3 text-blue-500" />
                                ) : (
                                  <Check className="h-3 w-3 text-gray-400" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={sendMessage} className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <Paperclip className="h-5 w-5" />
                    </button>
                    
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Mesajınızı yazın..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      disabled={sending}
                    />
                    
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </form>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Mesaj Seçin</h3>
                  <p className="text-gray-600">Sohbet etmek istediğiniz kişiyi seçin.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage; 