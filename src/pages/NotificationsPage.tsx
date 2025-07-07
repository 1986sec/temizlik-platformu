import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/supabase';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare, 
  FileText,
  Building2,
  DollarSign,
  Shield,
  Settings,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  X,
  Clock,
  Star,
  User,
  Briefcase
} from 'lucide-react';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: string;
  related_job_id?: string;
  related_application_id?: string;
  related_conversation_id?: string;
  is_read: boolean;
  is_email_sent: boolean;
  created_at: string;
}

interface NotificationPreferences {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  application_updates: boolean;
  new_messages: boolean;
  job_updates: boolean;
  system_announcements: boolean;
}

const NotificationsPage = () => {
  const { user, profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  useEffect(() => {
    if (profile) {
      loadNotifications();
      loadPreferences();
    }
  }, [profile, filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await db.getNotifications(profile!.id, 50);
      
      if (error) {
        console.error('Error loading notifications:', error);
      } else if (data) {
        let filteredData = data;
        
        if (filter === 'unread') {
          filteredData = data.filter(n => !n.is_read);
        } else if (filter === 'read') {
          filteredData = data.filter(n => n.is_read);
        }
        
        setNotifications(filteredData);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      const { data, error } = await db.getNotificationPreferences(profile!.id);
      
      if (error) {
        console.error('Error loading preferences:', error);
      } else if (data) {
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const { error } = await db.markNotificationsAsRead(profile!.id, notificationIds);
      
      if (error) {
        console.error('Error marking notifications as read:', error);
      } else {
        setNotifications(prev => 
          prev.map(n => 
            notificationIds.includes(n.id) ? { ...n, is_read: true } : n
          )
        );
        setSelectedNotifications([]);
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      if (unreadIds.length > 0) {
        await markAsRead(unreadIds);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    if (!preferences) return;

    try {
      setSaving(true);
      const { data, error } = await db.updateNotificationPreferences(profile!.id, {
        ...preferences,
        ...newPreferences
      });
      
      if (error) {
        console.error('Error updating preferences:', error);
      } else if (data) {
        setPreferences(data);
        setShowPreferences(false);
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'application_received':
      case 'application_status_changed':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'new_message':
        return <MessageSquare className="h-5 w-5 text-green-600" />;
      case 'job_approved':
      case 'job_rejected':
        return <Briefcase className="h-5 w-5 text-purple-600" />;
      case 'payment_approved':
      case 'payment_rejected':
        return <DollarSign className="h-5 w-5 text-yellow-600" />;
      case 'profile_approved':
      case 'profile_rejected':
        return <User className="h-5 w-5 text-indigo-600" />;
      case 'system_announcement':
        return <Shield className="h-5 w-5 text-gray-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'application_received':
      case 'application_status_changed':
        return 'bg-blue-50 border-blue-200';
      case 'new_message':
        return 'bg-green-50 border-green-200';
      case 'job_approved':
      case 'payment_approved':
      case 'profile_approved':
        return 'bg-success-50 border-success-200';
      case 'job_rejected':
      case 'payment_rejected':
      case 'profile_rejected':
        return 'bg-error-50 border-error-200';
      case 'system_announcement':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'Az önce';
    if (diffMinutes < 60) return `${diffMinutes} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead([notification.id]);
    }
    
    // Navigate based on notification type
    if (notification.related_job_id) {
      // Navigate to job detail
      window.open(`/is/${notification.related_job_id}`, '_blank');
    } else if (notification.related_conversation_id) {
      // Navigate to messages
      window.open('/mesajlar', '_blank');
    }
  };

  const toggleNotificationSelection = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const selectAll = () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    setSelectedNotifications(unreadIds);
  };

  const clearSelection = () => {
    setSelectedNotifications([]);
  };

  if (!profile) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Giriş Gerekli</h2>
          <p className="text-gray-600">Bildirimleri görüntülemek için giriş yapın.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bildirimler</h1>
              <p className="text-gray-600">
                {notifications.length} bildirim
                {filter === 'unread' && ` (${notifications.filter(n => !n.is_read).length} okunmamış)`}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPreferences(!showPreferences)}
                className="btn-outline flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Tercihler</span>
              </button>
              
              {notifications.filter(n => !n.is_read).length > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="btn-primary"
                >
                  Tümünü Okundu İşaretle
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filtre:</span>
            </div>
            
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'all'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Tümü
            </button>
            
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'unread'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Okunmamış
            </button>
            
            <button
              onClick={() => setFilter('read')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'read'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Okunmuş
            </button>
          </div>
        </div>

        {/* Notification Preferences */}
        {showPreferences && preferences && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bildirim Tercihleri</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Genel Ayarlar</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">E-posta Bildirimleri</p>
                    <p className="text-sm text-gray-600">Önemli güncellemeler e-posta ile gönderilsin</p>
                  </div>
                  <button
                    onClick={() => updatePreferences({ email_notifications: !preferences.email_notifications })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.email_notifications ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.email_notifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Push Bildirimleri</p>
                    <p className="text-sm text-gray-600">Tarayıcı bildirimleri gösterilsin</p>
                  </div>
                  <button
                    onClick={() => updatePreferences({ push_notifications: !preferences.push_notifications })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.push_notifications ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.push_notifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Bildirim Türleri</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Başvuru Güncellemeleri</span>
                    <button
                      onClick={() => updatePreferences({ application_updates: !preferences.application_updates })}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        preferences.application_updates ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          preferences.application_updates ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Yeni Mesajlar</span>
                    <button
                      onClick={() => updatePreferences({ new_messages: !preferences.new_messages })}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        preferences.new_messages ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          preferences.new_messages ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">İş İlanı Güncellemeleri</span>
                    <button
                      onClick={() => updatePreferences({ job_updates: !preferences.job_updates })}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        preferences.job_updates ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          preferences.job_updates ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Sistem Duyuruları</span>
                    <button
                      onClick={() => updatePreferences({ system_announcements: !preferences.system_announcements })}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        preferences.system_announcements ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          preferences.system_announcements ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowPreferences(false)}
                className="btn-outline"
              >
                Kapat
              </button>
              <button
                onClick={() => setShowPreferences(false)}
                className="btn-primary"
                disabled={saving}
              >
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg border p-4 animate-pulse">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white rounded-lg border p-8 text-center">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'all' ? 'Henüz Bildirim Yok' : 'Bildirim Bulunamadı'}
              </h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'Yeni bildirimler burada görünecek.'
                  : `Bu filtrede bildirim bulunamadı.`
                }
              </p>
            </div>
          ) : (
            <>
              {/* Bulk Actions */}
              {selectedNotifications.length > 0 && (
                <div className="bg-white rounded-lg border p-4 flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {selectedNotifications.length} bildirim seçildi
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={clearSelection}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Seçimi Temizle
                    </button>
                    <button
                      onClick={() => markAsRead(selectedNotifications)}
                      className="btn-primary text-sm"
                    >
                      Okundu İşaretle
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications */}
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`bg-white rounded-lg border p-4 transition-all hover:shadow-sm ${
                      getNotificationColor(notification.notification_type)
                    } ${!notification.is_read ? 'border-l-4 border-l-primary-600' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.notification_type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">
                              {notification.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatTime(notification.created_at)}</span>
                              </span>
                              {!notification.is_read && (
                                <span className="text-primary-600 font-medium">Yeni</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleNotificationSelection(notification.id)}
                              className={`p-1 rounded ${
                                selectedNotifications.includes(notification.id)
                                  ? 'bg-primary-100 text-primary-600'
                                  : 'text-gray-400 hover:text-gray-600'
                              }`}
                            >
                              {selectedNotifications.includes(notification.id) ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                            
                            {!notification.is_read && (
                              <button
                                onClick={() => markAsRead([notification.id])}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        {(notification.related_job_id || notification.related_conversation_id) && (
                          <div className="mt-3 flex items-center space-x-2">
                            <button
                              onClick={() => handleNotificationClick(notification)}
                              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                              Detayları Gör
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage; 