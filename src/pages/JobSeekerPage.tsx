import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Filter, 
  Clock, 
  DollarSign, 
  BookmarkPlus,
  Bookmark,
  Eye,
  Star,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { db } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface JobPosting {
  id: string;
  title: string;
  description: string;
  requirements: string[] | null;
  benefits: string[] | null;
  job_type: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  city: string;
  address: string | null;
  is_remote: boolean | null;
  is_urgent: boolean | null;
  is_premium: boolean | null;
  view_count: number | null;
  application_count: number | null;
  created_at: string | null;
  company?: {
    name: string;
    logo_url: string | null;
  } | null;
  category?: {
    name: string;
    icon: string | null;
  } | null;
  employer?: {
    first_name: string;
    last_name: string;
  } | null;
}

interface JobCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
}

const JobSeekerPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('');
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());

  const { user } = useAuth();
  const jobsPerPage = 10;

  useEffect(() => {
    loadJobCategories();
    loadJobs();
    if (user) {
      loadSavedJobs();
      loadAppliedJobs();
    }
  }, [user, currentPage, selectedLocation, selectedCategory, selectedJobType]);

  const loadJobCategories = async () => {
    try {
      const { data, error } = await db.getJobCategories();
      if (error) {
        console.error('Error loading categories:', error);
      } else {
        setCategories(data || []);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        ...(selectedLocation && { city: selectedLocation }),
        ...(selectedCategory && { category_id: selectedCategory }),
        ...(searchQuery && { search: searchQuery }),
        limit: jobsPerPage,
        offset: (currentPage - 1) * jobsPerPage
      };

      const { data, error } = await db.getJobPostings(filters);
      
      if (error) {
        console.error('Error loading jobs:', error);
        setError('İş ilanları yüklenirken hata oluştu');
      } else {
        setJobs(data || []);
        setTotalJobs(data?.length || 0);
      }
    } catch (err) {
      console.error('Error loading jobs:', err);
      setError('İş ilanları yüklenirken beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedJobs = async () => {
    if (!user) return;

    try {
      const { data, error } = await db.getSavedJobs(user.id);
      if (error) {
        console.error('Error loading saved jobs:', error);
      } else {
        const savedJobIds = new Set(data?.map(item => item.job_id).filter(Boolean) || []);
        setSavedJobs(savedJobIds);
      }
    } catch (err) {
      console.error('Error loading saved jobs:', err);
    }
  };

  const loadAppliedJobs = async () => {
    if (!user) return;

    try {
      const { data, error } = await db.getApplications(user.id, 'job_seeker');
      if (error) {
        console.error('Error loading applications:', error);
      } else {
        const appliedJobIds = new Set(data?.map(app => app.job_id).filter(Boolean) || []);
        setAppliedJobs(appliedJobIds);
      }
    } catch (err) {
      console.error('Error loading applications:', err);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadJobs();
  };

  const handleSaveJob = async (jobId: string) => {
    if (!user) {
      alert('İş kaydetmek için giriş yapmanız gerekiyor');
      return;
    }

    try {
      if (savedJobs.has(jobId)) {
        const { error } = await db.unsaveJob(user.id, jobId);
        if (error) {
          console.error('Error unsaving job:', error);
          alert('İş kaydedilmekten çıkarılırken hata oluştu');
        } else {
          setSavedJobs(prev => {
            const newSet = new Set(prev);
            newSet.delete(jobId);
            return newSet;
          });
        }
      } else {
        const { error } = await db.saveJob(user.id, jobId);
        if (error) {
          console.error('Error saving job:', error);
          alert('İş kaydedilirken hata oluştu');
        } else {
          setSavedJobs(prev => new Set(prev).add(jobId));
        }
      }
    } catch (err) {
      console.error('Error handling save job:', err);
      alert('İşlem sırasında hata oluştu');
    }
  };

  const handleApplyJob = async (jobId: string) => {
    if (!user) {
      alert('Başvuru yapmak için giriş yapmanız gerekiyor');
      return;
    }

    if (appliedJobs.has(jobId)) {
      alert('Bu işe zaten başvuru yaptınız');
      return;
    }

    try {
      const { error } = await db.createApplication({
        job_id: jobId,
        applicant_id: user.id,
        status: 'pending'
      });

      if (error) {
        console.error('Error applying to job:', error);
        alert('Başvuru gönderilirken hata oluştu');
      } else {
        setAppliedJobs(prev => new Set(prev).add(jobId));
        alert('Başvurunuz başarıyla gönderildi!');
      }
    } catch (err) {
      console.error('Error applying to job:', err);
      alert('Başvuru gönderilirken hata oluştu');
    }
  };

  const formatSalary = (min: number | null, max: number | null, currency: string | null) => {
    if (!min && !max) return 'Maaş belirtilmemiş';
    
    const curr = currency || 'TL';
    if (min && max) {
      return `${min.toLocaleString()} - ${max.toLocaleString()} ${curr}`;
    } else if (min) {
      return `${min.toLocaleString()}+ ${curr}`;
    } else if (max) {
      return `${max.toLocaleString()} ${curr}'ye kadar`;
    }
    return 'Maaş belirtilmemiş';
  };

  const formatJobType = (type: string) => {
    const types: Record<string, string> = {
      'full_time': 'Tam Zamanlı',
      'part_time': 'Yarı Zamanlı',
      'contract': 'Sözleşmeli',
      'temporary': 'Geçici'
    };
    return types[type] || type;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 gün önce';
    if (diffDays < 7) return `${diffDays} gün önce`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} hafta önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const cities = [
    'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep', 
    'Şanlıurfa', 'Kocaeli', 'Mersin', 'Diyarbakır', 'Hatay', 'Manisa', 'Kayseri'
  ];

  const jobTypes = [
    { value: 'full_time', label: 'Tam Zamanlı' },
    { value: 'part_time', label: 'Yarı Zamanlı' },
    { value: 'contract', label: 'Sözleşmeli' },
    { value: 'temporary', label: 'Geçici' }
  ];

  const totalPages = Math.ceil(totalJobs / jobsPerPage);

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            İş Arayanlar
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Temizlik sektöründeki en iyi fırsatları keşfedin ve kariyerinizi yükseltin.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="İş pozisyonu ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 input-field"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="pl-10 input-field appearance-none"
              >
                <option value="">Tüm Şehirler</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 input-field appearance-none"
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={handleSearch}
              className="btn-primary flex items-center justify-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span>Ara</span>
            </button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            {jobTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedJobType(selectedJobType === type.value ? '' : type.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  selectedJobType === type.value
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.label}
              </button>
            ))}
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors duration-200">
              Yüksek Maaş
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors duration-200">
              Acil
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors duration-200">
              Uzaktan
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Profil Tamamlama</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Genel Bilgiler</span>
                  <CheckCircle className="h-5 w-5 text-success-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Özgeçmiş</span>
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Fotoğraf</span>
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Referanslar</span>
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                </div>
              </div>
              <div className="mt-4">
                <div className="bg-gray-200 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full" style={{width: '25%'}}></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">%25 tamamlandı</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">İş Kategorileri</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      className="rounded text-primary-600"
                      checked={selectedCategory === category.id}
                      onChange={(e) => setSelectedCategory(e.target.checked ? category.id : '')}
                    />
                    <span className="text-sm text-gray-600">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Job Listings */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {loading ? 'Yükleniyor...' : `${totalJobs} İş İlanı Bulundu`}
              </h3>
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option>En Yeni</option>
                <option>En Popüler</option>
                <option>Maaş (Yüksek-Düşük)</option>
                <option>Maaş (Düşük-Yüksek)</option>
              </select>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-error-600" />
                <span className="text-error-700 text-sm">{error}</span>
              </div>
            )}

            {loading ? (
              <div className="space-y-6">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-lg p-8 animate-pulse">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                      <div className="h-6 w-6 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                    <div className="flex space-x-2 mb-4">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-6 bg-gray-200 rounded w-24"></div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex space-x-4">
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </div>
                      <div className="flex space-x-3">
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                        <div className="h-8 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">İş İlanı Bulunamadı</h3>
                <p className="text-gray-600 mb-6">
                  Arama kriterlerinizi değiştirerek tekrar deneyin.
                </p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedLocation('');
                    setSelectedCategory('');
                    setSelectedJobType('');
                    loadJobs();
                  }}
                  className="btn-outline"
                >
                  Filtreleri Temizle
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {jobs.map((job) => (
                  <div key={job.id} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                          {job.is_premium && (
                            <span className="bg-accent-100 text-accent-700 px-2 py-1 rounded-full text-xs font-medium">
                              Premium
                            </span>
                          )}
                          {job.is_urgent && (
                            <span className="bg-error-100 text-error-700 px-2 py-1 rounded-full text-xs font-medium">
                              Acil
                            </span>
                          )}
                          {job.is_remote && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                              Uzaktan
                            </span>
                          )}
                        </div>
                        <p className="text-primary-600 font-medium mb-2">
                          {job.company?.name || `${job.employer?.first_name} ${job.employer?.last_name}`}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{job.city}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>{formatSalary(job.salary_min, job.salary_max, job.salary_currency)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatJobType(job.job_type)}</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleSaveJob(job.id)}
                        className="text-gray-400 hover:text-primary-600 transition-colors duration-200"
                        disabled={!user}
                      >
                        {savedJobs.has(job.id) ? (
                          <Bookmark className="h-6 w-6 fill-current text-primary-600" />
                        ) : (
                          <BookmarkPlus className="h-6 w-6" />
                        )}
                      </button>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

                    {job.requirements && job.requirements.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Aranan Özellikler:</h4>
                        <div className="flex flex-wrap gap-2">
                          {job.requirements.slice(0, 3).map((req, index) => (
                            <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                              {req}
                            </span>
                          ))}
                          {job.requirements.length > 3 && (
                            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                              +{job.requirements.length - 3} daha
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(job.created_at)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{job.application_count || 0} başvuru</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{job.view_count || 0} görüntülenme</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors duration-200">
                          <Eye className="h-4 w-4" />
                          <span>Detay</span>
                        </button>
                        <button 
                          onClick={() => handleApplyJob(job.id)}
                          className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                            appliedJobs.has(job.id)
                              ? 'bg-success-100 text-success-700 cursor-not-allowed'
                              : 'btn-primary'
                          }`}
                          disabled={!user || appliedJobs.has(job.id)}
                        >
                          {appliedJobs.has(job.id) ? 'Başvuru Yapıldı' : 'Başvur'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-12">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Önceki
                </button>
                
                {[...Array(Math.min(5, totalPages))].map((_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                        currentPage === pageNumber
                          ? 'bg-primary-600 text-white'
                          : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sonraki
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSeekerPage;