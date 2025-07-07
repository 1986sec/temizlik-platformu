import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  DollarSign, 
  Clock, 
  Users, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  Save,
  Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/supabase';

interface JobFormData {
  title: string;
  description: string;
  requirements: string[];
  benefits: string[];
  job_type: 'full_time' | 'part_time' | 'contract' | 'temporary';
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  city: string;
  address: string;
  category_id: string;
  is_remote: boolean;
  is_urgent: boolean;
  is_premium: boolean;
  expires_at: string;
}

const CreateJobPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    requirements: [''],
    benefits: [''],
    job_type: 'full_time',
    salary_min: null,
    salary_max: null,
    salary_currency: 'TRY',
    city: '',
    address: '',
    category_id: '',
    is_remote: false,
    is_urgent: false,
    is_premium: false,
    expires_at: ''
  });

  useEffect(() => {
    if (!user || profile?.user_type !== 'employer') {
      navigate('/');
      return;
    }
    loadInitialData();
  }, [user, profile, navigate]);

  const loadInitialData = async () => {
    try {
      // Load job categories
      const { data: categoriesData } = await db.getJobCategories();
      if (categoriesData) {
        setCategories(categoriesData);
      }

      // Load user's companies
      const { data: companiesData } = await db.getUserCompanies(user?.id || '');
      if (companiesData) {
        setCompanies(companiesData);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError('Veriler yüklenirken hata oluştu');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear errors when user types
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleArrayInputChange = (index: number, field: 'requirements' | 'benefits', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'requirements' | 'benefits') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (index: number, field: 'requirements' | 'benefits') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.title.trim()) {
      errors.push('İş başlığı gereklidir');
    }

    if (!formData.description.trim()) {
      errors.push('İş açıklaması gereklidir');
    }

    if (!formData.city.trim()) {
      errors.push('Şehir seçimi gereklidir');
    }

    if (!formData.category_id) {
      errors.push('Kategori seçimi gereklidir');
    }

    if (formData.salary_min && formData.salary_max && formData.salary_min > formData.salary_max) {
      errors.push('Minimum maaş, maksimum maaştan büyük olamaz');
    }

    if (formData.expires_at && new Date(formData.expires_at) <= new Date()) {
      errors.push('Bitiş tarihi bugünden sonra olmalıdır');
    }

    if (errors.length > 0) {
      setError(errors.join(', '));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'pending' = 'pending') => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError(null);

      const jobData = {
        ...formData,
        employer_id: user?.id,
        status,
        requirements: formData.requirements.filter(req => req.trim()),
        benefits: formData.benefits.filter(ben => ben.trim()),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await db.createJobPosting(jobData);
      
      if (error) {
        setError(error.message || 'İş ilanı oluşturulurken hata oluştu');
      } else {
        setSuccess(status === 'draft' ? 'Taslak kaydedildi' : 'İş ilanı başarıyla oluşturuldu');
        setTimeout(() => {
          navigate('/isveren');
        }, 2000);
      }
    } catch (err) {
      console.error('Error creating job posting:', err);
      setError('Beklenmeyen bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const cities = [
    'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep', 
    'Şanlıurfa', 'Kocaeli', 'Mersin', 'Diyarbakır', 'Hatay', 'Manisa', 'Kayseri',
    'Samsun', 'Balıkesir', 'Kahramanmaraş', 'Van', 'Aydın', 'Denizli', 'Sakarya',
    'Muğla', 'Eskişehir', 'Tekirdağ', 'Ordu', 'Edirne', 'Elazığ', 'Trabzon', 'Erzurum'
  ];

  if (!user || profile?.user_type !== 'employer') {
    return null;
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/isveren')}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Yeni İş İlanı Oluştur</h1>
                <p className="text-gray-600">Kaliteli elemanlar bulmak için detaylı bir ilan hazırlayın</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={(e) => handleSubmit(e, 'draft')}
                disabled={saving}
                className="btn-outline flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Taslak Kaydet</span>
              </button>
              <button
                onClick={(e) => handleSubmit(e, 'pending')}
                disabled={saving}
                className="btn-primary flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>İlanı Yayınla</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-lg flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-success-600" />
            <span className="text-success-700">{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-error-600" />
            <span className="text-error-700">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={(e) => handleSubmit(e, 'pending')} className="space-y-8">
          {/* Basic Information */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary-600" />
              <span>Temel Bilgiler</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  İş Başlığı <span className="text-error-600">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Örn: Ev Temizlik Elemanı"
                  required
                />
              </div>

              <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori <span className="text-error-600">*</span>
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">Kategori seçin</option>
                  {categories.map((category: any) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="job_type" className="block text-sm font-medium text-gray-700 mb-2">
                  İş Türü <span className="text-error-600">*</span>
                </label>
                <select
                  id="job_type"
                  name="job_type"
                  value={formData.job_type}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="full_time">Tam Zamanlı</option>
                  <option value="part_time">Yarı Zamanlı</option>
                  <option value="contract">Sözleşmeli</option>
                  <option value="temporary">Geçici</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-primary-600" />
              <span>Konum Bilgileri</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  Şehir <span className="text-error-600">*</span>
                </label>
                <select
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">Şehir seçin</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Adres
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Detaylı adres bilgisi"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="is_remote"
                    checked={formData.is_remote}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Uzaktan çalışma imkanı var</span>
                </label>
              </div>
            </div>
          </div>

          {/* Salary */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-primary-600" />
              <span>Maaş Bilgileri</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="salary_min" className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Maaş (TL)
                </label>
                <input
                  type="number"
                  id="salary_min"
                  name="salary_min"
                  value={formData.salary_min || ''}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="15000"
                  min="0"
                />
              </div>

              <div>
                <label htmlFor="salary_max" className="block text-sm font-medium text-gray-700 mb-2">
                  Maksimum Maaş (TL)
                </label>
                <input
                  type="number"
                  id="salary_max"
                  name="salary_max"
                  value={formData.salary_max || ''}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="25000"
                  min="0"
                />
              </div>

              <div>
                <label htmlFor="salary_currency" className="block text-sm font-medium text-gray-700 mb-2">
                  Para Birimi
                </label>
                <select
                  id="salary_currency"
                  name="salary_currency"
                  value={formData.salary_currency}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="TRY">TL</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary-600" />
              <span>İş Açıklaması</span>
            </h2>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Detaylı İş Açıklaması <span className="text-error-600">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={8}
                className="input-field"
                placeholder="İş pozisyonu hakkında detaylı bilgi verin..."
                required
              />
            </div>
          </div>

          {/* Requirements */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-primary-600" />
              <span>Gereksinimler</span>
            </h2>
            
            <div className="space-y-4">
              {formData.requirements.map((requirement, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={requirement}
                    onChange={(e) => handleArrayInputChange(index, 'requirements', e.target.value)}
                    className="flex-1 input-field"
                    placeholder="Örn: En az 2 yıl deneyim"
                  />
                  {formData.requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem(index, 'requirements')}
                      className="p-2 text-error-600 hover:text-error-700 hover:bg-error-50 rounded-lg"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => addArrayItem('requirements')}
                className="btn-outline flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Gereksinim Ekle</span>
              </button>
            </div>
          </div>

          {/* Benefits */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-primary-600" />
              <span>Faydalar</span>
            </h2>
            
            <div className="space-y-4">
              {formData.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => handleArrayInputChange(index, 'benefits', e.target.value)}
                    className="flex-1 input-field"
                    placeholder="Örn: Sağlık sigortası"
                  />
                  {formData.benefits.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem(index, 'benefits')}
                      className="p-2 text-error-600 hover:text-error-700 hover:bg-error-50 rounded-lg"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => addArrayItem('benefits')}
                className="btn-outline flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Fayda Ekle</span>
              </button>
            </div>
          </div>

          {/* Additional Options */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary-600" />
              <span>Ek Seçenekler</span>
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="expires_at" className="block text-sm font-medium text-gray-700 mb-2">
                  İlan Bitiş Tarihi
                </label>
                <input
                  type="date"
                  id="expires_at"
                  name="expires_at"
                  value={formData.expires_at}
                  onChange={handleInputChange}
                  className="input-field"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="is_urgent"
                    checked={formData.is_urgent}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Acil iş ilanı (öne çıkar)</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="is_premium"
                    checked={formData.is_premium}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Premium ilan (ek ücret)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/isveren')}
              className="btn-outline"
            >
              İptal
            </button>
            
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'draft')}
                disabled={saving}
                className="btn-outline flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Kaydediliyor...' : 'Taslak Kaydet'}</span>
              </button>
              
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>{saving ? 'Yayınlanıyor...' : 'İlanı Yayınla'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJobPage; 