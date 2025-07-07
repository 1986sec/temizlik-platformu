import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Users, 
  Eye, 
  Edit3, 
  Trash2, 
  Crown,
  CheckCircle,
  Clock,
  MapPin,
  DollarSign,
  Star,
  TrendingUp,
  Search,
  Filter,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/supabase';

const EmployerPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    jobPostings: [],
    totalApplications: 0,
    activeJobs: 0,
    totalJobs: 0
  });

  const { user, profile } = useAuth();

  useEffect(() => {
    if (user && profile?.user_type === 'employer') {
      loadEmployerDashboard();
    }
  }, [user, profile]);

  const loadEmployerDashboard = async () => {
    try {
      setLoading(true);
      const { data } = await db.getEmployerDashboard(user?.id || '');
      if (data) {
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error loading employer dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { 
      label: 'Aktif İlanlar', 
      value: dashboardData.activeJobs.toString(), 
      icon: Users, 
      change: '+2' 
    },
    { 
      label: 'Toplam Başvuru', 
      value: dashboardData.totalApplications.toString(), 
      icon: Eye, 
      change: '+24' 
    },
    { 
      label: 'Bu Ay Görüntülenme', 
      value: '2,340', 
      icon: TrendingUp, 
      change: '+15%' 
    },
    { 
      label: 'Başarılı İşe Alım', 
      value: '8', 
      icon: CheckCircle, 
      change: '+3' 
    },
  ];

  const formatSalary = (min: number, max: number) => {
    if (min && max) {
      return `${min.toLocaleString()} - ${max.toLocaleString()} TL`;
    } else if (min) {
      return `${min.toLocaleString()} TL`;
    }
    return 'Müzakere edilebilir';
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-success-100 text-success-700',
      pending: 'bg-warning-100 text-warning-700',
      expired: 'bg-error-100 text-error-700',
      draft: 'bg-gray-100 text-gray-700'
    };
    
    const labels = {
      active: 'Aktif',
      pending: 'Onay Bekliyor',
      expired: 'Süresi Dolmuş',
      draft: 'Taslak'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getApplicationStatusBadge = (status: string) => {
    const styles = {
      new: 'bg-primary-100 text-primary-700',
      reviewed: 'bg-warning-100 text-warning-700',
      shortlisted: 'bg-success-100 text-success-700',
      rejected: 'bg-error-100 text-error-700'
    };
    
    const labels = {
      new: 'Yeni',
      reviewed: 'İncelendi',
      shortlisted: 'Kısa Liste',
      rejected: 'Reddedildi'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (!user || profile?.user_type !== 'employer') {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-error-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erişim Reddedildi</h2>
          <p className="text-gray-600">Bu sayfaya sadece işverenler erişebilir.</p>
        </div>
      </div>
    );
  }

  // Onaylanmamış işverenler için kısıtlama
  if (!profile.is_approved || !profile.is_premium) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Crown className="h-10 w-10 text-warning-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Premium Hesap Gerekli</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              İş ilanı oluşturmak ve işveren panelini kullanmak için premium hesap onayınız gereklidir.
            </p>
            
            {!profile.is_premium && (
              <div className="bg-warning-50 border border-warning-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-warning-800 mb-2">Ödeme Bekleniyor</h3>
                <p className="text-warning-700 mb-4">
                  Premium hesap için ödeme yapmanız gerekmektedir. Ödeme onaylandıktan sonra panelinizi kullanabileceksiniz.
                </p>
                <button className="btn-primary">
                  Ödeme Durumu Kontrol Et
                </button>
              </div>
            )}
            
            {!profile.is_approved && (
              <div className="bg-info-50 border border-info-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-info-800 mb-2">Hesap Onayı Bekleniyor</h3>
                <p className="text-info-700">
                  Hesabınız admin tarafından onaylanmayı bekliyor. Onay sonrası premium özellikleri kullanabileceksiniz.
                </p>
              </div>
            )}
          </div>
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
              <h1 className="text-2xl font-bold text-gray-900">İşveren Paneli</h1>
              <p className="text-gray-600">Hoş geldiniz, {profile?.first_name} {profile?.last_name}</p>
            </div>
            <button className="btn-primary flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Yeni İlan Ekle</span>
            </button>
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
                onClick={() => setActiveTab('applications')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'applications'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Başvurular
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Ayarlar
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Activities */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Aktiviteler</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Yeni başvuru alındı</span>
                        <span className="text-xs text-gray-400">2 saat önce</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">İlan onaylandı</span>
                        <span className="text-xs text-gray-400">5 saat önce</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Premium üyelik uyarısı</span>
                        <span className="text-xs text-gray-400">1 gün önce</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h3>
                    <div className="space-y-3">
                      <button className="w-full btn-primary text-left flex items-center space-x-3">
                        <Plus className="h-4 w-4" />
                        <span>Yeni İş İlanı Ekle</span>
                      </button>
                      <button className="w-full btn-outline text-left flex items-center space-x-3">
                        <Eye className="h-4 w-4" />
                        <span>Başvuruları İncele</span>
                      </button>
                      <button className="w-full btn-outline text-left flex items-center space-x-3">
                        <Crown className="h-4 w-4" />
                        <span>Premium'a Geç</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Job Postings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Son İş İlanlarınız</h3>
                  {loading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, index) => (
                        <div key={index} className="bg-white rounded-lg p-6 animate-pulse">
                          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                          <div className="flex space-x-2">
                            <div className="h-6 bg-gray-200 rounded w-20"></div>
                            <div className="h-6 bg-gray-200 rounded w-24"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : dashboardData.jobPostings.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.jobPostings.slice(0, 3).map((job: any) => (
                        <div key={job.id} className="bg-white rounded-lg p-6 border">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{job.city}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Briefcase className="h-4 w-4" />
                                  <span>{job.job_type}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <DollarSign className="h-4 w-4" />
                                  <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                {getStatusBadge(job.status)}
                                {job.is_premium && (
                                  <div className="flex items-center space-x-1 text-yellow-600">
                                    <Star className="h-4 w-4 fill-current" />
                                    <span className="text-xs font-medium">Premium</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button className="p-2 text-gray-400 hover:text-gray-600">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-gray-600">
                                <Edit3 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-lg border">
                      <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz İş İlanınız Yok</h3>
                      <p className="text-gray-600 mb-4">İlk iş ilanınızı ekleyerek başlayın.</p>
                      <button className="btn-primary">
                        <Plus className="h-4 w-4 mr-2" />
                        İlk İlanınızı Ekleyin
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Jobs Tab */}
            {activeTab === 'jobs' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">İş İlanlarınız</h3>
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
                      <option>Tüm İlanlar</option>
                      <option>Aktif İlanlar</option>
                      <option>Bekleyen İlanlar</option>
                      <option>Süresi Dolmuş İlanlar</option>
                    </select>
                  </div>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, index) => (
                      <div key={index} className="bg-white rounded-lg p-6 animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="flex space-x-2">
                          <div className="h-6 bg-gray-200 rounded w-20"></div>
                          <div className="h-6 bg-gray-200 rounded w-24"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : dashboardData.jobPostings.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.jobPostings.map((job: any) => (
                      <div key={job.id} className="bg-white rounded-lg p-6 border">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{job.city}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Briefcase className="h-4 w-4" />
                                <span>{job.job_type}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <DollarSign className="h-4 w-4" />
                                <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              {getStatusBadge(job.status)}
                              {job.is_premium && (
                                <div className="flex items-center space-x-1 text-yellow-600">
                                  <Star className="h-4 w-4 fill-current" />
                                  <span className="text-xs font-medium">Premium</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-gray-400 hover:text-gray-600">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600">
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-red-400 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg border">
                    <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz İş İlanınız Yok</h3>
                    <p className="text-gray-600 mb-4">İlk iş ilanınızı ekleyerek başlayın.</p>
                    <button className="btn-primary">
                      <Plus className="h-4 w-4 mr-2" />
                      İlk İlanınızı Ekleyin
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Applications Tab */}
            {activeTab === 'applications' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Başvurular</h3>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Başvuru ara..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                      <option>Tüm Başvurular</option>
                      <option>Yeni Başvurular</option>
                      <option>İncelenen Başvurular</option>
                      <option>Kısa Liste</option>
                    </select>
                  </div>
                </div>

                <div className="text-center py-12 bg-white rounded-lg border">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz Başvuru Yok</h3>
                  <p className="text-gray-600">İş ilanlarınız için başvuru bekleniyor.</p>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Hesap Ayarları</h3>
                <div className="bg-white rounded-lg p-6 border">
                  <p className="text-gray-600">Ayarlar sayfası yakında eklenecek.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerPage;