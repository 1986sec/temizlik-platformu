import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sparkles, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, loading, error, clearError, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      return 'E-posta adresi gereklidir';
    }

    if (!formData.email.includes('@')) {
      return 'Geçerli bir e-posta adresi girin';
    }

    if (!formData.password) {
      return 'Şifre gereklidir';
    }

    if (formData.password.length < 6) {
      return 'Şifre en az 6 karakter olmalıdır';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signIn(formData.email.trim(), formData.password);
      
      if (!error) {
        console.log('Sign in successful, redirecting...');
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormLoading = loading || isLoading;

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-12 h-12 cleaning-gradient rounded-lg flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">AnlıkEleman</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hoş Geldiniz</h1>
          <p className="text-gray-600">Hesabınıza giriş yaparak devam edin</p>
        </div>

        {/* Login Form */}
        <div className="glass-card p-8 rounded-2xl">
          {error && (
            <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-error-600 flex-shrink-0" />
              <span className="text-error-700 text-sm">{error}</span>
            </div>
          )}

          {/* Email Verification Notice */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">E-posta Doğrulama</h3>
                <p className="text-sm text-blue-700 mb-2">
                  Güvenlik için e-posta adresinizi doğrulamanız gerekmektedir.
                </p>
                <Link
                  to="/email-dogrula"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  E-posta doğrulama sayfasına git →
                </Link>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-posta Adresi
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10 input-field"
                  placeholder="ornek@email.com"
                  required
                  disabled={isFormLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10 input-field"
                  placeholder="••••••••"
                  required
                  disabled={isFormLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  disabled={isFormLoading}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  disabled={isFormLoading}
                />
                <span className="ml-2 text-sm text-gray-600">Beni hatırla</span>
              </label>
              <Link 
                to="/sifremi-unuttum" 
                className="text-sm text-primary-600 hover:text-primary-700 transition-colors duration-200"
              >
                Şifremi unuttum
              </Link>
            </div>

            {/* Login Button */}
            <button 
              type="submit" 
              className="w-full btn-primary text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              disabled={isFormLoading}
            >
              {isFormLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Giriş yapılıyor...</span>
                </div>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Hesabınız yok mu?{' '}
              <Link 
                to="/kayit" 
                className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
              >
                Hemen kayıt olun
              </Link>
            </p>
          </div>
        </div>

        {/* Terms */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Giriş yaparak{' '}
            <Link to="/kullanim-kosullari" className="text-primary-600 hover:underline">
              Kullanım Koşulları
            </Link>{' '}
            ve{' '}
            <Link to="/gizlilik-politikasi" className="text-primary-600 hover:underline">
              Gizlilik Politikası
            </Link>
            'mızı kabul etmiş olursunuz.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;