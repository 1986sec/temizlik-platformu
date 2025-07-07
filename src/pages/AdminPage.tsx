import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  X,
  Eye,
  Ban,
  Settings,
  TrendingUp,
  DollarSign,
  Clock,
  Search,
  Filter,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/supabase';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    pendingJobs: [],
    recentUsers: [],
    pendingReports: []
  });

  const { user, profile } = useAuth();

  useEffect(() => {
    if (user && profile?.user_type === 'admin') {
      loadAdminDashboard();
    }
  }, [user, profile]);

  const loadAdminDashboard = async () => {
    try {
      setLoading(true);
      const { data } = await db.getAdminDashboard();
      if (data) {
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error loading admin dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { 
      label: 'Toplam Kullanıcı', 
      value: dashboardData.recentUsers.length.toString(), 
      icon: Users, 
      change: '+12%' 
    },
    { 
      label: 'Aktif İşverenler', 
      value: dashboardData.recentUsers.filter((user: any) => user.user_type === 'employer').length.toString(), 
      icon: Building2, 
      change: '+8%' 
    },
    { 
      label: 'Bekleyen İlanlar', 
      value: dashboardData.pendingJobs.length.toString(), 
      icon: FileText, 
      change: '+5' 
    },
    { 
      label: 'Aylık Gelir', 
      value: '₺127,500', 
      icon: DollarSign, 
      change: '+15%' 
    },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-success-100 text-success-700',
      banned: 'bg-error-100 text-error-700',
      pending: 'bg-warning-100 text-warning-700',
      approved: 'bg-success-100 text-success-700',
      rejected: 'bg-error-100 text-error-700',
      flagged: 'bg-warning-100 text-warning-700',
      resolved: 'bg-success-100 text-success-700'
    };
    
    const labels = {
      active: 'Aktif',
      banned: 'Banlandı',
      pending: 'Bekliyor',
      approved: 'Onaylandı',
      rejected: 'Reddedildi',
      flagged: 'İşaretlendi',
      resolved: 'Çözüldü'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (!user || profile?.user_type !== 'admin') {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-error-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erişim Reddedildi</h2>
          <p className="text-gray-600">Bu sayfaya sadece yöneticiler erişebilir.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Yönetici Paneli</h1>
              <p className="text-gray-600">Hoş geldiniz, {profile?.first_name} {profile?.last_name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="btn-outline flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Sistem Ayarları</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map(({ label, value, icon: Icon, change }, index) => (
            <div key={index} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{label}</p>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-600 rounded-lg">
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-sm font-medium text-success-600">{change}</span>
                <span className="text-sm text-gray-500 ml-1">geçen aya göre</span>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'dashboard'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'jobs'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                İş İlanları
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Kullanıcılar
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reports'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Şikayetler
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'payments'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Bekleyen Ödemeler
              </button>
              <button
                onClick={() => setActiveTab('approvals')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'payments'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Onay Bekleyenler
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pending Jobs */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Bekleyen İş İlanları</h3>
                    {loading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, index) => (
                          <div key={index} className="bg-white rounded p-3 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        ))}
                      </div>
                    ) : dashboardData.pendingJobs.length > 0 ? (
                      <div className="space-y-3">
                        {dashboardData.pendingJobs.slice(0, 3).map((job: any) => (
                          <div key={job.id} className="bg-white rounded p-3 border">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">{job.title}</h4>
                                <p className="text-sm text-gray-600">
                                  {job.employer?.first_name} {job.employer?.last_name}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button className="p-1 text-success-600 hover:text-success-700">
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button className="p-1 text-error-600 hover:text-error-700">
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Bekleyen ilan yok</p>
                      </div>
                    )}
                  </div>

                  {/* Recent Users */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Kayıt Olan Kullanıcılar</h3>
                    {loading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, index) => (
                          <div key={index} className="bg-white rounded p-3 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        ))}
                      </div>
                    ) : dashboardData.recentUsers.length > 0 ? (
                      <div className="space-y-3">
                        {dashboardData.recentUsers.slice(0, 3).map((user: any) => (
                          <div key={user.id} className="bg-white rounded p-3 border">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {user.first_name} {user.last_name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {user.user_type === 'job_seeker' ? 'İş Arayan' : 'İşveren'}
                                </p>
                              </div>
                              {getStatusBadge(user.is_active ? 'active' : 'banned')}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Henüz kullanıcı yok</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pending Reports */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Bekleyen Şikayetler</h3>
                  {loading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 animate-pulse">
                          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                          <div className="flex space-x-2">
                            <div className="h-6 bg-gray-200 rounded w-20"></div>
                            <div className="h-6 bg-gray-200 rounded w-24"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : dashboardData.pendingReports.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.pendingReports.slice(0, 3).map((report: any) => (
                        <div key={report.id} className="bg-white rounded-lg p-4 border">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-1">
                                {report.reporter?.first_name} {report.reporter?.last_name}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">{report.reason}</p>
                              <div className="flex items-center space-x-4">
                                <span className="text-xs text-gray-500">
                                  {new Date(report.created_at).toLocaleDateString('tr-TR')}
                                </span>
                                {getStatusBadge(report.status)}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button className="p-2 text-gray-400 hover:text-gray-600">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="p-2 text-success-400 hover:text-success-600">
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button className="p-2 text-error-400 hover:text-error-600">
                                <Ban className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-white rounded-lg border">
                      <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Bekleyen Şikayet Yok</h3>
                      <p className="text-gray-600">Tüm şikayetler çözülmüş durumda.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Jobs Tab */}
            {activeTab === 'jobs' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">İş İlanları Yönetimi</h3>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="İlan ara..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                      <option>Tüm Durumlar</option>
                      <option>Aktif</option>
                      <option>Beklemede</option>
                      <option>Reddedildi</option>
                    </select>
                  </div>
                </div>

                <div className="text-center py-12 bg-white rounded-lg border">
                  <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">İş İlanları Yönetimi</h3>
                  <p className="text-gray-600">Bu özellik yakında eklenecek.</p>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Kullanıcı Yönetimi</h3>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Kullanıcı ara..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                      <option>Tüm Kullanıcılar</option>
                      <option>İş Arayanlar</option>
                      <option>İşverenler</option>
                      <option>Banlı Kullanıcılar</option>
                    </select>
                  </div>
                </div>

                <div className="text-center py-12 bg-white rounded-lg border">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Kullanıcı Yönetimi</h3>
                  <p className="text-gray-600">Bu özellik yakında eklenecek.</p>
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Şikayet Yönetimi</h3>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Şikayet ara..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                      <option>Tüm Şikayetler</option>
                      <option>Bekleyen</option>
                      <option>İncelenen</option>
                      <option>Çözülen</option>
                    </select>
                  </div>
                </div>

                <div className="text-center py-12 bg-white rounded-lg border">
                  <AlertTriangle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Şikayet Yönetimi</h3>
                  <p className="text-gray-600">Bu özellik yakında eklenecek.</p>
                </div>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Bekleyen Ödemeler</h3>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Ödeme ara..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                      <option>Tüm Ödemeler</option>
                      <option>Bekleyen</option>
                      <option>Onaylanan</option>
                      <option>Reddedilen</option>
                    </select>
                  </div>
                </div>

                <div className="text-center py-12 bg-white rounded-lg border">
                  <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Bekleyen Ödemeler</h3>
                  <p className="text-gray-600">İşveren ödemeleri burada listelenecek.</p>
                </div>
              </div>
            )}

            {/* Approvals Tab */}
            {activeTab === 'approvals' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Onay Bekleyen Kullanıcılar</h3>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Kullanıcı ara..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                      <option>Tüm Kullanıcılar</option>
                      <option>İş Arayanlar</option>
                      <option>İşverenler</option>
                    </select>
                  </div>
                </div>

                <div className="text-center py-12 bg-white rounded-lg border">
                  <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Onay Bekleyen Kullanıcılar</h3>
                  <p className="text-gray-600">Onay bekleyen kullanıcılar burada listelenecek.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;