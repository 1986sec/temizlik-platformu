import React from 'react';
import { AlertCircle, Clock, DollarSign } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ApprovalBanner = () => {
  const { profile } = useAuth();

  // Eğer kullanıcı onaylanmışsa banner gösterme
  if (!profile || profile.is_approved) {
    return null;
  }

  const isEmployer = profile.user_type === 'employer';
  const isJobSeeker = profile.user_type === 'job_seeker';

  return (
    <div className="bg-warning-50 border-b border-warning-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-warning-600" />
            <div>
              <p className="text-sm font-medium text-warning-800">
                {isEmployer ? (
                  <>
                    <DollarSign className="inline h-4 w-4 mr-1" />
                    Premium hesap onayınız bekleniyor
                  </>
                ) : (
                  <>
                    <Clock className="inline h-4 w-4 mr-1" />
                    Hesap onayınız bekleniyor
                  </>
                )}
              </p>
              <p className="text-xs text-warning-700">
                {isEmployer 
                  ? 'Ödemeniz onaylandıktan sonra iş ilanı oluşturabileceksiniz.'
                  : 'Admin onayından sonra platformu tam olarak kullanabileceksiniz.'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isEmployer && (
              <button className="text-xs text-warning-700 hover:text-warning-800 underline">
                Ödeme Durumu
              </button>
            )}
            <button className="text-xs text-warning-700 hover:text-warning-800 underline">
              Yardım
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalBanner; 