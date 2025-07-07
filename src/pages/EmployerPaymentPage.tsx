import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, UploadCloud } from 'lucide-react';

const IBAN = 'TR00 0000 0000 0000 0000 0000 00'; // Gerçek IBAN ile değiştirin
const BANK_NAME = 'Banka Adı';
const ACCOUNT_NAME = 'Hesap Sahibi';

const EmployerPaymentPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    // Simülasyon: Gerçek uygulamada dosya Supabase Storage'a yüklenir ve admin'e bildirilir
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess('Ödeme bildiriminiz başarıyla alındı. En kısa sürede kontrol edilip hesabınız aktif edilecektir.');
      setFile(null);
      setNote('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border">
        <div>
          <h2 className="text-2xl font-bold text-center text-gray-900">Premium Hesap Ödemesi</h2>
          <p className="mt-2 text-center text-gray-600">Aşağıdaki IBAN'a ödeme yaptıktan sonra dekontunuzu yükleyin. Onay sonrası hesabınız aktifleşecektir.</p>
        </div>
        <div className="bg-gray-100 rounded-lg p-4 text-center">
          <div className="font-semibold text-gray-700">Banka Adı: <span className="font-normal">{BANK_NAME}</span></div>
          <div className="font-semibold text-gray-700">Hesap Sahibi: <span className="font-normal">{ACCOUNT_NAME}</span></div>
          <div className="font-semibold text-gray-700">IBAN: <span className="font-mono text-primary-700">{IBAN}</span></div>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">Açıklama / Not (isteğe bağlı)</label>
            <input
              type="text"
              id="note"
              name="note"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="input-field"
              placeholder="Örn: Şirket adı, ödeme yapan kişi"
            />
          </div>
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">Dekont Yükle <span className="text-error-600">*</span></label>
            <input
              type="file"
              id="file"
              name="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="input-field"
              required
            />
          </div>
          {error && (
            <div className="p-3 bg-error-50 border border-error-200 rounded flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-error-600" />
              <span className="text-error-700">{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3 bg-success-50 border border-success-200 rounded flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-success-600" />
              <span className="text-success-700">{success}</span>
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            <UploadCloud className="h-5 w-5" />
            <span>{isSubmitting ? 'Gönderiliyor...' : 'Ödeme Bildir'}</span>
          </button>
        </form>
        <button
          onClick={() => navigate('/')}
          className="mt-4 w-full btn-outline"
        >
          Ana Sayfaya Dön
        </button>
      </div>
    </div>
  );
};

export default EmployerPaymentPage; 