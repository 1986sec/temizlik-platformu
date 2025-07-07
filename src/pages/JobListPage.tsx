import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  DollarSign, 
  Building2, 
  Star,
  Heart,
  Eye,
  Briefcase,
  X,
  Sliders,
  Calendar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/supabase';

interface JobPosting {
  id: string;
  title: string;
  description: string;
  job_type: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  city: string;
  is_remote: boolean;
  is_urgent: boolean;
  is_premium: boolean;
  created_at: string;
  employer: {
    first_name: string;
    last_name: string;
  };
  company: {
    name: string;
    city: string;
  };
  category: {
    name: string;
  };
}

const JobListPage = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('');
  const [isRemoteOnly, setIsRemoteOnly] = useState(false);
  const [salaryRange, setSalaryRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  
  // Data
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([
    'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep', 
    'Şanlıurfa', 'Kocaeli', 'Mersin', 'Diyarbakır', 'Hatay', 'Manisa', 'Kayseri',
    'Samsun', 'Balıkesir', 'Kahramanmaraş', 'Van', 'Aydın', 'Denizli', 'Sakarya',
    'Muğla', 'Eskişehir', 'Tekirdağ', 'Ordu', 'Edirne', 'Elazığ', 'Trabzon', 'Erzurum'
  ]);

  useEffect(() => {
    loadCategories();
    loadJobs();
  }, [currentPage, searchTerm, selectedCity, selectedCategory, selectedJobType, isRemoteOnly, salaryRange]);

  const loadCategories = async () => {
    try {
      const { data } = await db.getJobCategories();
      if (data) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        search: searchTerm,
        city: selectedCity,
        category_id: selectedCategory,
        job_type: selectedJobType,
        is_remote: isRemoteOnly ? true : undefined,
        salary_min: salaryRange.min ? parseInt(salaryRange.min) : undefined,
        salary_max: salaryRange.max ? parseInt(salaryRange.max) : undefined,
        offset: (currentPage - 1) * 12,
        limit: 12
      };

      const { data, error } = await db.getJobPostings(filters);
      
      if (error) {
        setError('İş ilanları yüklenirken hata oluştu');
      } else if (data) {
        setJobs(data);
        // TODO: Get total count for pagination
        setTotalJobs(data.length);
        setTotalPages(Math.ceil(data.length / 12));
      }
    } catch (err) {
      console.error('Error loading jobs:', err);
      setError('İş ilanları yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (jobId: string) => {
    if (!user) {
      // TODO: Redirect to login
      return;
    }

    try {
      // TODO: Implement favorite toggle
      setFavorites(prev => 
        prev.includes(jobId) 
          ? prev.filter(id => id !== jobId)
          : [...prev, jobId]
      );
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCity('');
    setSelectedCategory('');
    setSelectedJobType('');
    setIsRemoteOnly(false);
    setSalaryRange({ min: '', max: '' });
    setCurrentPage(1);
  };

  const formatSalary = (min: number | null, max: number | null, currency: string) => {
    if (min && max) {
      return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
    } else if (min) {
      return `${min.toLocaleString()} ${currency}`;
    }
    return 'Müzakere edilebilir';
  };

  const formatJobType = (type: string) => {
    const types = {
      full_time: 'Tam Zamanlı',
      part_time: 'Yarı Zamanlı',
      contract: 'Sözleşmeli',
      temporary: 'Geçici'
    };
    return types[type as keyof typeof types] || type;
  };

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 gün önce';
    if (diffDays < 7) return `${diffDays} gün önce`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
    return `${Math.floor(diffDays / 30)} ay önce`;
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">İş İlanları</h1>
              <p className="text-gray-600">
                {totalJobs > 0 ? `${totalJobs} iş ilanı bulundu` : 'İş ilanları yükleniyor...'}
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-outline flex items-center space-x-2"
            >
              <Sliders className="h-4 w-4" />
              <span>Filtreler</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="İş başlığı, şirket adı veya anahtar kelime ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-white rounded-lg p-6 border mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* City Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Şehir</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Tüm Şehirler</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Tüm Kategoriler</option>
                    {categories.map((category: any) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>

                {/* Job Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">İş Türü</label>
                  <select
                    value={selectedJobType}
                    onChange={(e) => setSelectedJobType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Tüm İş Türleri</option>
                    <option value="full_time">Tam Zamanlı</option>
                    <option value="part_time">Yarı Zamanlı</option>
                    <option value="contract">Sözleşmeli</option>
                    <option value="temporary">Geçici</option>
                  </select>
                </div>

                {/* Remote Work Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Çalışma Şekli</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="remote"
                      checked={isRemoteOnly}
                      onChange={(e) => setIsRemoteOnly(e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="remote" className="text-sm text-gray-700">Sadece uzaktan çalışma</label>
                  </div>
                </div>
              </div>

              {/* Salary Range */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Maaş (TL)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={salaryRange.min}
                    onChange={(e) => setSalaryRange(prev => ({ ...prev, min: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maksimum Maaş (TL)</label>
                  <input
                    type="number"
                    placeholder="100000"
                    value={salaryRange.max}
                    onChange={(e) => setSalaryRange(prev => ({ ...prev, max: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1"
                >
                  <X className="h-4 w-4" />
                  <span>Filtreleri Temizle</span>
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="btn-primary"
                >
                  Filtreleri Uygula
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Job Listings */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg border animate-pulse">
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-error-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Hata Oluştu</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">İş İlanı Bulunamadı</h3>
            <p className="text-gray-600">Arama kriterlerinize uygun iş ilanı bulunamadı.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white rounded-lg border hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                          <Link to={`/is/${job.id}`} className="hover:text-primary-600">
                            {job.title}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-600">{job.company.name}</p>
                      </div>
                      <button
                        onClick={() => toggleFavorite(job.id)}
                        className={`p-1 rounded ${
                          favorites.includes(job.id)
                            ? 'text-error-600'
                            : 'text-gray-400 hover:text-error-600'
                        }`}
                      >
                        <Heart className={`h-5 w-5 ${favorites.includes(job.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center space-x-2 mb-3">
                      {job.is_urgent && (
                        <span className="bg-error-100 text-error-700 px-2 py-1 rounded-full text-xs font-medium">
                          Acil
                        </span>
                      )}
                      {job.is_premium && (
                        <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs font-medium">
                          Premium
                        </span>
                      )}
                      {job.is_remote && (
                        <span className="bg-success-100 text-success-700 px-2 py-1 rounded-full text-xs font-medium">
                          Uzaktan
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{job.city}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{formatJobType(job.job_type)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatSalary(job.salary_min, job.salary_max, job.salary_currency)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{getDaysAgo(job.created_at)}</span>
                      </div>
                    </div>

                    {/* Description Preview */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {job.description.substring(0, 120)}...
                    </p>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/is/${job.id}`}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Detayları Gör</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Önceki
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`px-3 py-2 text-sm border rounded-lg ${
                        currentPage === index + 1
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Sonraki
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default JobListPage; 