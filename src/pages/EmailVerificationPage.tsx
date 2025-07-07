import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  ArrowLeft,
  Shield,
  Clock
} from 'lucide-react';
import { db } from '../lib/supabase';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
    
    if (token) {
      verifyEmail(token);
    }
  }, [token, emailParam]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      setVerifying(true);
      setError(null);
      
      const { data, error } = await db.verifyEmail(verificationToken);
      
      if (error) {
        setError('E-posta doğrulanamadı. Lütfen tekrar deneyin.');
      } else {
        setSuccess('E-posta adresiniz başarıyla doğrulandı! Artık platformu tam olarak kullanabilirsiniz.');
      }
    } catch (err) {
      console.error('Email verification error:', err);
      setError('E-posta doğrulama sırasında bir hata oluştu.');
    } finally {
      setVerifying(false);
    }
  };

  const resendVerificationEmail = async () => {
    if (!email) {
      setError('Lütfen e-posta adresinizi girin.');
      return;
    }

    try {
      setResending(true);
      setError(null);
      
      const { error } = await db.sendVerificationEmail(email);
      
      if (error) {
        setError('Doğrulama e-postası gönderilemedi. Lütfen tekrar deneyin.');
      } else {
        setSuccess('Doğrulama e-postası tekrar gönderildi. Lütfen gelen kutunuzu kontrol edin.');
      }
    } catch (err) {
      console.error('Resend verification email error:', err);
      setError('Doğrulama e-postası gönderilirken bir hata oluştu.');
    } finally {
      setResending(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await resendVerificationEmail();
  };

  if (verifying) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">E-posta Doğrulanıyor</h2>
          <p className="text-gray-600">Lütfen bekleyin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4">
              <Mail className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              E-posta Doğrulama
            </h1>
            <p className="text-gray-600">
              Hesabınızı aktifleştirmek için e-posta adresinizi doğrulayın
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-lg flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-success-600" />
              <span className="text-success-700">{success}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-error-600" />
              <span className="text-error-700">{error}</span>
            </div>
          )}

          {/* Email Verification Info */}
          <div className="mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-1">Güvenlik İçin Gerekli</h3>
                  <p className="text-sm text-blue-700">
                    E-posta doğrulama, hesabınızın güvenliği ve platformun güvenilirliği için gereklidir.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                <span>E-posta adresinize doğrulama linki gönderildi</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                <span>Gelen kutunuzu ve spam klasörünüzü kontrol edin</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                <span>Linke tıklayarak e-posta adresinizi doğrulayın</span>
              </div>
            </div>
          </div>

          {/* Resend Email Form */}
          {!success && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta Adresi
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="ornek@email.com"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={resending}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                {resending ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Gönderiliyor...</span>
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    <span>Doğrulama E-postası Gönder</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Action Buttons */}
          <div className="mt-8 space-y-3">
            {success && (
              <Link
                to="/"
                className="w-full btn-primary text-center"
              >
                Ana Sayfaya Git
              </Link>
            )}
            
            <Link
              to="/giris"
              className="w-full btn-outline flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Giriş Sayfasına Dön</span>
            </Link>
          </div>

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Yardıma mı ihtiyacınız var?</h3>
              <p className="text-sm text-gray-600 mb-4">
                E-posta doğrulama ile ilgili sorun yaşıyorsanız bizimle iletişime geçin.
              </p>
              <Link
                to="/iletisim"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Destek Al
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage; 