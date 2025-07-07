import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Save, 
  Edit3, 
  Download,
  Upload,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Linkedin,
  Github,
  Twitter,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/supabase';

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  bio: string;
  experience_years: number;
  education_level: string;
  skills: string[];
  languages: string[];
  website: string;
  linkedin: string;
  github: string;
  twitter: string;
  cv_url: string;
  profile_photo_url: string;
}

const ProfilePage = () => {
  const { user, profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    city: '',
    bio: '',
    experience_years: 0,
    education_level: '',
    skills: [],
    languages: [],
    website: '',
    linkedin: '',
    github: '',
    twitter: '',
    cv_url: '',
    profile_photo_url: ''
  });

  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: user?.email || '',
        phone: profile.phone || '',
        city: profile.city || '',
        bio: profile.bio || '',
        experience_years: profile.experience_years || 0,
        education_level: profile.education_level || '',
        skills: profile.skills || [],
        languages: profile.languages || [],
        website: profile.website || '',
        linkedin: profile.linkedin || '',
        github: profile.github || '',
        twitter: profile.twitter || '',
        cv_url: profile.cv_url || '',
        profile_photo_url: profile.profile_photo_url || ''
      });
    }
  }, [profile, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !formData.languages.includes(newLanguage.trim())) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== language)
    }));
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePhoto(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File, path: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      const { error: uploadError } = await db.uploadFile(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }

      return filePath;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      let cvUrl = formData.cv_url;
      let profilePhotoUrl = formData.profile_photo_url;

      // Upload CV if new file selected
      if (cvFile) {
        cvUrl = await uploadFile(cvFile, 'cvs');
      }

      // Upload profile photo if new file selected
      if (profilePhoto) {
        profilePhotoUrl = await uploadFile(profilePhoto, 'profile-photos');
      }

      const updateData = {
        ...formData,
        cv_url: cvUrl,
        profile_photo_url: profilePhotoUrl
      };

      const result = await updateProfile(updateData);
      
      if (result.error) {
        setError(result.error.message || 'Profil güncellenirken hata oluştu');
      } else {
        setSuccess('Profil başarıyla güncellendi');
        setIsEditing(false);
        setCvFile(null);
        setProfilePhoto(null);
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError('Profil güncellenirken beklenmeyen bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const educationLevels = [
    'İlkokul',
    'Ortaokul',
    'Lise',
    'Ön Lisans',
    'Lisans',
    'Yüksek Lisans',
    'Doktora'
  ];

  if (!user || !profile) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profil Bulunamadı</h2>
          <p className="text-gray-600">Profil bilgileriniz yüklenemedi.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profil Yönetimi</h1>
              <p className="text-gray-600">Kişisel bilgilerinizi ve CV'nizi güncelleyin</p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn-outline flex items-center space-x-2"
            >
              {isEditing ? <Eye className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
              <span>{isEditing ? 'Önizleme' : 'Düzenle'}</span>
            </button>
          </div>
        </div>

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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Photo */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Profil Fotoğrafı</h2>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                  {formData.profile_photo_url ? (
                    <img 
                      src={formData.profile_photo_url} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{formData.first_name} {formData.last_name}</h3>
                <p className="text-gray-600">{formData.email}</p>
                {isEditing && profilePhoto && (
                  <p className="text-sm text-primary-600 mt-1">Yeni fotoğraf seçildi</p>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Kişisel Bilgiler</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Ad <span className="text-error-600">*</span>
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Soyad <span className="text-error-600">*</span>
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="input-field"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta <span className="text-error-600">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="input-field bg-gray-50"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="input-field"
                />
              </div>
              
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  Şehir
                </label>
                <select
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="input-field"
                >
                  <option value="">Şehir seçin</option>
                  <option value="İstanbul">İstanbul</option>
                  <option value="Ankara">Ankara</option>
                  <option value="İzmir">İzmir</option>
                  <option value="Bursa">Bursa</option>
                  <option value="Antalya">Antalya</option>
                  <option value="Adana">Adana</option>
                  <option value="Konya">Konya</option>
                  <option value="Gaziantep">Gaziantep</option>
                  <option value="Şanlıurfa">Şanlıurfa</option>
                  <option value="Kocaeli">Kocaeli</option>
                  <option value="Mersin">Mersin</option>
                  <option value="Diyarbakır">Diyarbakır</option>
                  <option value="Hatay">Hatay</option>
                  <option value="Manisa">Manisa</option>
                  <option value="Kayseri">Kayseri</option>
                  <option value="Samsun">Samsun</option>
                  <option value="Balıkesir">Balıkesir</option>
                  <option value="Kahramanmaraş">Kahramanmaraş</option>
                  <option value="Van">Van</option>
                  <option value="Aydın">Aydın</option>
                  <option value="Denizli">Denizli</option>
                  <option value="Sakarya">Sakarya</option>
                  <option value="Muğla">Muğla</option>
                  <option value="Eskişehir">Eskişehir</option>
                  <option value="Tekirdağ">Tekirdağ</option>
                  <option value="Ordu">Ordu</option>
                  <option value="Edirne">Edirne</option>
                  <option value="Elazığ">Elazığ</option>
                  <option value="Trabzon">Trabzon</option>
                  <option value="Erzurum">Erzurum</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="education_level" className="block text-sm font-medium text-gray-700 mb-2">
                  Eğitim Seviyesi
                </label>
                <select
                  id="education_level"
                  name="education_level"
                  value={formData.education_level}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="input-field"
                >
                  <option value="">Eğitim seviyesi seçin</option>
                  {educationLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Hakkımda</h2>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                Biyografi
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={4}
                className="input-field"
                placeholder="Kendinizi tanıtın, deneyimlerinizi ve hedeflerinizi paylaşın..."
              />
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Yetenekler</h2>
            <div className="space-y-4">
              {isEditing && (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Yeni yetenek ekle"
                    className="flex-1 input-field"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="btn-primary"
                  >
                    Ekle
                  </button>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                  >
                    {skill}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-primary-600 hover:text-primary-800"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Languages */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Diller</h2>
            <div className="space-y-4">
              {isEditing && (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    placeholder="Yeni dil ekle"
                    className="flex-1 input-field"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                  />
                  <button
                    type="button"
                    onClick={addLanguage}
                    className="btn-primary"
                  >
                    Ekle
                  </button>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                {formData.languages.map((language, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-success-100 text-success-800"
                  >
                    {language}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeLanguage(language)}
                        className="ml-2 text-success-600 hover:text-success-800"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Sosyal Medya</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="input-field"
                  placeholder="https://example.com"
                />
              </div>
              
              <div>
                <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn
                </label>
                <input
                  type="url"
                  id="linkedin"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="input-field"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              
              <div>
                <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-2">
                  GitHub
                </label>
                <input
                  type="url"
                  id="github"
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="input-field"
                  placeholder="https://github.com/username"
                />
              </div>
              
              <div>
                <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter
                </label>
                <input
                  type="url"
                  id="twitter"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="input-field"
                  placeholder="https://twitter.com/username"
                />
              </div>
            </div>
          </div>

          {/* CV Upload */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">CV</h2>
            <div className="space-y-4">
              {formData.cv_url ? (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Mevcut CV</p>
                      <p className="text-sm text-gray-600">CV'niz yüklü</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.open(formData.cv_url, '_blank')}
                    className="btn-outline flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>İndir</span>
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Henüz CV yüklenmemiş</p>
                </div>
              )}
              
              {isEditing && (
                <div>
                  <label htmlFor="cv" className="block text-sm font-medium text-gray-700 mb-2">
                    CV Yükle
                  </label>
                  <input
                    type="file"
                    id="cv"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCvUpload}
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC veya DOCX formatında</p>
                  {cvFile && (
                    <p className="text-sm text-primary-600 mt-1">Yeni CV seçildi: {cvFile.name}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          {isEditing && (
            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn-outline"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Kaydediliyor...' : 'Kaydet'}</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProfilePage; 