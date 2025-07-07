import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone, MapPin, Sparkles, Users, Building2, AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState('job_seeker');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [formData, setFormData] = useState({
    userType: 'job_seeker',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city: '',
    companyName: '',
    companyTitle: '',
    agreedToTerms: false,
    agreedToPrivacy: false,
    allowMarketing: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const { signUp, loading, error, clearError, user } = useAuth();
  const navigate = useNavigate();

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear validation errors for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Clear global error when user types
    if (error) {
      clearError();
    }
  };

  const handleUserTypeChange = (type: string) => {
    setUserType(type);
    setFormData(prev => ({
      ...prev,
      userType: type
    }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Required fields validation
    if (!formData.firstName.trim()) {
      errors.firstName = 'Ad alanı zorunludur';
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'Ad en az 2 karakter olmalıdır';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Soyad alanı zorunludur';
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = 'Soyad en az 2 karakter olmalıdır';
    }

    if (!formData.email.trim()) {
      errors.email = 'E-posta alanı zorunludur';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Geçerli bir e-posta adresi girin';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Telefon alanı zorunludur';
    } else if (!/^[0-9\s\-\+\(\)]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Geçerli bir telefon numarası girin';
    }

    if (!formData.city) {
      errors.city = 'Şehir seçimi zorunludur';
    }

    if (!formData.password) {
      errors.password = 'Şifre alanı zorunludur';
    } else if (formData.password.length < 6) {
      errors.password = 'Şifre en az 6 karakter olmalıdır';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Şifre tekrarı zorunludur';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    if (formData.userType === 'employer' && !formData.companyName.trim()) {
      errors.companyName = 'Şirket adı alanı zorunludur';
    }

    if (!formData.agreedToTerms) {
      errors.agreedToTerms = 'Kullanım koşullarını kabul etmelisiniz';
    }

    if (!formData.agreedToPrivacy) {
      errors.agreedToPrivacy = 'Gizlilik politikasını kabul etmelisiniz';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check network connectivity
    if (!isOnline) {
      alert('İnternet bağlantınızı kontrol edin ve tekrar deneyin.');
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        user_type: formData.userType,
        phone: formData.phone.trim(),
        city: formData.city,
        ...(formData.userType === 'employer' && {
          company_name: formData.companyName.trim(),
          company_title: formData.companyTitle.trim()
        })
      };

      console.log('Submitting registration with data:', userData);

      const { error, data } = await signUp(formData.email.trim(), formData.password, userData);
      
      if (!error && data.user) {
        console.log('Registration successful:', data);
        
        // İşveren ise ödeme sayfasına yönlendir
        if (formData.userType === 'employer') {
          alert('Kayıt başarılı! Premium hesap için ödeme yapmanız gerekmektedir.');
          navigate('/employer-payment');
        } else {
          // İş arayan ise normal akış
          if (!data.user.email_confirmed_at) {
            alert('Kayıt başarılı! E-posta adresinizi kontrol ederek hesabınızı onaylayın.');
          } else {
            alert('Kayıt başarılı! Hesabınız admin onayından sonra aktifleşecektir.');
          }
          navigate('/');
        }
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Handle specific network errors
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        alert('Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.');
      } else if (err.name === 'AbortError') {
        alert('İstek zaman aşımına uğradı. Tekrar deneyin.');
      } else {
        alert('Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const cities = [
    'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep', 
    'Şanlıurfa', 'Kocaeli', 'Mersin', 'Diyarbakır', 'Hatay', 'Manisa', 'Kayseri',
    'Samsun', 'Balıkesir', 'Kahramanmaraş', 'Van', 'Aydın', 'Denizli', 'Sakarya',
    'Muğla', 'Eskişehir', 'Tekirdağ', 'Ordu', 'Edirne', 'Elazığ', 'Trabzon', 'Erzurum'
  ];

  const isFormLoading = loading || isLoading;

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Network Status */}
        {!isOnline && (
          <div className="mb-4 p-4 bg-error-50 border border-error-200 rounded-lg flex items-center space-x-2">
            <WifiOff className="h-5 w-5 text-error-600" />
            <span className="text-error-700 text-sm">İnternet bağlantısı yok. Lütfen bağlantınızı kontrol edin.</span>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-12 h-12 cleaning-gradient rounded-lg flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">AnlıkEleman</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hesap Oluşturun</h1>
          <p className="text-gray-600">Temizlik sektöründeki kariyerinize başlayın</p>
        </div>

        <div className="glass-card p-8 rounded-2xl">
          {/* User Type Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hesap Türünüz</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleUserTypeChange('job_seeker')}
                className={`p-6 rounded-lg border-2 transition-all duration-200 ${
                  userType === 'job_seeker'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                disabled={isFormLoading}
              >
                <Users className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">İş Arayan</h4>
                <p className="text-sm text-gray-600">
                  Temizlik sektöründe iş arıyorum
                </p>
              </button>
              <button
                type="button"
                onClick={() => handleUserTypeChange('employer')}
                className={`p-6 rounded-lg border-2 transition-all duration-200 ${
                  userType === 'employer'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                disabled={isFormLoading}
              >
                <Building2 className="h-8 w-8 text-secondary-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">İşveren</h4>
                <p className="text-sm text-gray-600">
                  Temizlik elemanı arıyorum
                </p>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-error-600 flex-shrink-0" />
              <span className="text-error-700 text-sm">{error}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  Ad <span className="text-error-600">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`pl-10 input-field ${validationErrors.firstName ? 'border-error-500' : ''}`}
                    placeholder="Adınız"
                    required
                    disabled={isFormLoading || !isOnline}
                    autoComplete="given-name"
                  />
                </div>
                {validationErrors.firstName && (
                  <p className="mt-1 text-sm text-error-600">{validationErrors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Soyad <span className="text-error-600">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`pl-10 input-field ${validationErrors.lastName ? 'border-error-500' : ''}`}
                    placeholder="Soyadınız"
                    required
                    disabled={isFormLoading || !isOnline}
                    autoComplete="family-name"
                  />
                </div>
                {validationErrors.lastName && (
                  <p className="mt-1 text-sm text-error-600">{validationErrors.lastName}</p>
                )}
              </div>
            </div>

            {/* Company Information (Only for Employers) */}
            {userType === 'employer' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                    Şirket Adı <span className="text-error-600">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className={`pl-10 input-field ${validationErrors.companyName ? 'border-error-500' : ''}`}
                      placeholder="Şirket adınız"
                      required={userType === 'employer'}
                      disabled={isFormLoading || !isOnline}
                      autoComplete="organization"
                    />
                  </div>
                  {validationErrors.companyName && (
                    <p className="mt-1 text-sm text-error-600">{validationErrors.companyName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="companyTitle" className="block text-sm font-medium text-gray-700 mb-2">
                    Unvanınız
                  </label>
                  <input
                    type="text"
                    id="companyTitle"
                    name="companyTitle"
                    value={formData.companyTitle}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Müdür, İnsan Kaynakları vb."
                    disabled={isFormLoading || !isOnline}
                    autoComplete="organization-title"
                  />
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta Adresi <span className="text-error-600">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`pl-10 input-field ${validationErrors.email ? 'border-error-500' : ''}`}
                    placeholder="ornek@email.com"
                    required
                    disabled={isFormLoading || !isOnline}
                    autoComplete="email"
                  />
                </div>
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-error-600">{validationErrors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon Numarası <span className="text-error-600">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`pl-10 input-field ${validationErrors.phone ? 'border-error-500' : ''}`}
                    placeholder="0555 123 45 67"
                    required
                    disabled={isFormLoading || !isOnline}
                    autoComplete="tel"
                  />
                </div>
                {validationErrors.phone && (
                  <p className="mt-1 text-sm text-error-600">{validationErrors.phone}</p>
                )}
              </div>
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                Şehir <span className="text-error-600">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`pl-10 input-field appearance-none ${validationErrors.city ? 'border-error-500' : ''}`}
                  required
                  disabled={isFormLoading || !isOnline}
                >
                  <option value="">Şehir seçin</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              {validationErrors.city && (
                <p className="mt-1 text-sm text-error-600">{validationErrors.city}</p>
              )}
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre <span className="text-error-600">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 input-field ${validationErrors.password ? 'border-error-500' : ''}`}
                    placeholder="••••••••"
                    required
                    disabled={isFormLoading || !isOnline}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    disabled={isFormLoading || !isOnline}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="mt-1 text-sm text-error-600">{validationErrors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre Tekrar <span className="text-error-600">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 input-field ${validationErrors.confirmPassword ? 'border-error-500' : ''}`}
                    placeholder="••••••••"
                    required
                    disabled={isFormLoading || !isOnline}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    disabled={isFormLoading || !isOnline}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-error-600">{validationErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Agreements */}
            <div className="space-y-4">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="agreedToTerms"
                  checked={formData.agreedToTerms}
                  onChange={handleInputChange}
                  className={`mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500 ${validationErrors.agreedToTerms ? 'border-error-500' : ''}`}
                  required
                  disabled={isFormLoading || !isOnline}
                />
                <span className="text-sm text-gray-600">
                  <Link to="/kullanim-kosullari" className="text-primary-600 hover:underline">
                    Kullanım Koşulları
                  </Link>
                  'nı okudum ve kabul ediyorum. <span className="text-error-600">*</span>
                </span>
              </label>
              {validationErrors.agreedToTerms && (
                <p className="text-sm text-error-600 ml-6">{validationErrors.agreedToTerms}</p>
              )}

              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="agreedToPrivacy"
                  checked={formData.agreedToPrivacy}
                  onChange={handleInputChange}
                  className={`mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500 ${validationErrors.agreedToPrivacy ? 'border-error-500' : ''}`}
                  required
                  disabled={isFormLoading || !isOnline}
                />
                <span className="text-sm text-gray-600">
                  <Link to="/gizlilik-politikasi" className="text-primary-600 hover:underline">
                    Gizlilik Politikası
                  </Link>
                  'nı okudum ve kabul ediyorum. <span className="text-error-600">*</span>
                </span>
              </label>
              {validationErrors.agreedToPrivacy && (
                <p className="text-sm text-error-600 ml-6">{validationErrors.agreedToPrivacy}</p>
              )}

              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="allowMarketing"
                  checked={formData.allowMarketing}
                  onChange={handleInputChange}
                  className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  disabled={isFormLoading || !isOnline}
                />
                <span className="text-sm text-gray-600">
                  Pazarlama e-postalarını almak istiyorum. (İsteğe bağlı)
                </span>
              </label>
            </div>

            {/* Register Button */}
            <button 
              type="submit" 
              className="w-full btn-primary text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              disabled={isFormLoading || !isOnline}
            >
              {isFormLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Hesap oluşturuluyor...</span>
                </div>
              ) : !isOnline ? (
                <div className="flex items-center justify-center space-x-2">
                  <WifiOff className="h-5 w-5" />
                  <span>İnternet Bağlantısı Gerekli</span>
                </div>
              ) : (
                'Hesap Oluştur'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Zaten hesabınız var mı?{' '}
              <Link 
                to="/giris" 
                className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
              >
                Giriş yapın
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;