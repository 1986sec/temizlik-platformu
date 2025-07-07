import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, auth, db } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, userData: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<any>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const initializeAuth = async () => {
      try {
        setLoading(true);
        console.log('Initializing auth...');

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mounted) {
            setError('Oturum bilgileri alınamadı');
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            console.log('User found in session, loading profile...');
            await loadProfile(session.user.id);
          } else {
            console.log('No user in session');
            setLoading(false);
          }
        }
      } catch (err: any) {
        console.error('Initialize auth error:', err);
        if (mounted) {
          setError('Kimlik doğrulama başlatılamadı');
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state changed:', event, session?.user?.email);
      
      try {
        setSession(session);
        setUser(session?.user ?? null);
        setError(null);
        
        if (session?.user) {
          console.log('Loading profile for user:', session.user.id);
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Auth state change error:', err);
        setError('Kimlik doğrulama durumu güncellenemedi');
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      setLoading(true);
      console.log('Loading profile for user:', userId);
      
      const { data, error } = await db.getProfile(userId);
      
      if (error) {
        console.error('Error loading profile:', error);
        
        // If profile doesn't exist, try to create it
        if (error.code === 'PGRST116') {
          console.log('Profile not found, attempting to create...');
          await createProfileForUser(userId);
        } else {
          setError('Profil bilgileri yüklenemedi');
        }
      } else if (data) {
        console.log('Profile loaded successfully:', data.id);
        setProfile(data);
      }
    } catch (error: any) {
      console.error('Load profile error:', error);
      setError('Profil bilgileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const createProfileForUser = async (userId: string) => {
    try {
      console.log('Creating profile for user:', userId);
      
      // Get user metadata from auth
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not found');
      }

      const metadata = user.user_metadata || {};
      console.log('User metadata:', metadata);
      
      const profileData = {
        id: userId,
        first_name: metadata.first_name || '',
        last_name: metadata.last_name || '',
        user_type: (metadata.user_type || 'job_seeker') as 'job_seeker' | 'employer' | 'admin',
        phone: metadata.phone || null,
        city: metadata.city || null,
        is_active: true,
        is_verified: false,
        is_premium: false,
        is_approved: false
      };

      console.log('Creating profile with data:', profileData);

      const { data, error } = await db.createProfile(profileData);
      
      if (error) {
        console.error('Create profile error:', error);
        setError(`Profil oluşturulamadı: ${error.message || 'Bilinmeyen hata'}`);
      } else if (data) {
        console.log('Profile created successfully:', data.id);
        setProfile(data);
        
        // If user is an employer, create company record
        if (data.user_type === 'employer') {
          console.log('User is employer, creating company...');
          await createCompanyForEmployer(userId, metadata, data.city);
        }
      }
    } catch (error: any) {
      console.error('Create profile for user error:', error);
      setError('Profil oluşturulurken hata oluştu');
    }
  };

  const createCompanyForEmployer = async (userId: string, metadata: any, city: string | null) => {
    try {
      console.log('Creating company for employer:', userId);
      
      // Check if company already exists for this owner
      const { exists } = await db.checkCompanyExists(userId);
      
      if (exists) {
        console.log('Company already exists for this employer');
        return;
      }

      // Extract company information from metadata
      const companyName = metadata.company_name;
      
      if (!companyName || !companyName.trim()) {
        console.log('No company name found in metadata, skipping company creation');
        return;
      }

      const companyData = {
        owner_id: userId,
        name: companyName.trim(),
        city: city || metadata.city || '',
        // Optional fields from metadata
        description: metadata.company_description || null,
        website: metadata.company_website || null,
        phone: metadata.phone || null,
        email: metadata.email || null,
        employee_count: metadata.employee_count || null,
        is_verified: false
      };

      console.log('Creating company with data:', companyData);

      const { data: companyResult, error: companyError } = await db.createCompany(companyData);
      
      if (companyError) {
        console.error('Create company error:', companyError);
        // Don't set error state as this is not critical for user experience
        console.log('Company creation failed, but user profile was created successfully');
      } else if (companyResult) {
        console.log('Company created successfully for employer:', companyResult.id);
      }
    } catch (error: any) {
      console.error('Create company for employer error:', error);
      // Don't set error state as this is not critical for user experience
      console.log('Company creation failed, but user profile was created successfully');
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Starting signup process for:', email);
      
      // Validate required fields
      if (!userData.first_name?.trim()) {
        setError('Ad alanı zorunludur');
        return { error: { message: 'Ad alanı zorunludur' } };
      }
      
      if (!userData.last_name?.trim()) {
        setError('Soyad alanı zorunludur');
        return { error: { message: 'Soyad alanı zorunludur' } };
      }

      // Check network connectivity
      if (!navigator.onLine) {
        setError('İnternet bağlantınızı kontrol edin');
        return { error: { message: 'İnternet bağlantınızı kontrol edin' } };
      }

      const result = await auth.signUp(email, password, userData);
      
      if (result.error) {
        console.error('Sign up error:', result.error);
        setError(result.error.message);
        return result;
      }

      if (result.data.user) {
        console.log('User created successfully:', result.data.user.id);
        
        // If user is confirmed immediately, try to create profile
        if (result.data.user.email_confirmed_at) {
          console.log('User confirmed immediately, loading profile...');
          await loadProfile(result.data.user.id);
        } else {
          console.log('User not confirmed yet, profile will be created on confirmation');
        }
      }
      
      return result;
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      let errorMessage = 'Kayıt olurken beklenmeyen bir hata oluştu';
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.';
      } else if (error.name === 'AbortError') {
        errorMessage = 'İstek zaman aşımına uğradı. Tekrar deneyin.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      return { error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Starting signin process for:', email);
      
      if (!email?.trim()) {
        setError('E-posta adresi gereklidir');
        return { error: { message: 'E-posta adresi gereklidir' } };
      }
      
      if (!password) {
        setError('Şifre gereklidir');
        return { error: { message: 'Şifre gereklidir' } };
      }

      // Check network connectivity
      if (!navigator.onLine) {
        setError('İnternet bağlantınızı kontrol edin');
        return { error: { message: 'İnternet bağlantınızı kontrol edin' } };
      }

      const result = await auth.signIn(email.trim(), password);
      
      if (result.error) {
        console.error('Sign in error:', result.error);
        setError(result.error.message);
      } else {
        console.log('Sign in successful');
        setError(null);
      }
      
      return result;
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      let errorMessage = 'Giriş yapılırken beklenmeyen bir hata oluştu';
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.';
      } else if (error.name === 'AbortError') {
        errorMessage = 'İstek zaman aşımına uğradı. Tekrar deneyin.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      return { error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Signing out user');
      const result = await auth.signOut();
      
      if (result.error) {
        console.error('Sign out error:', result.error);
        setError('Çıkış yapılırken bir hata oluştu');
      } else {
        setUser(null);
        setProfile(null);
        setSession(null);
        console.log('Sign out successful');
      }
    } catch (error: any) {
      console.error('Sign out error:', error);
      setError(error.message || 'Çıkış yapılırken beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      setError('Kullanıcı oturumu bulunamadı');
      return { error: { message: 'No user logged in' } };
    }
    
    setError(null);
    
    try {
      console.log('Updating profile:', updates);
      const result = await db.updateProfile(user.id, updates);
      
      if (result.error) {
        console.error('Update profile error:', result.error);
        setError('Profil güncellenemedi');
      } else {
        await loadProfile(user.id);
        console.log('Profile updated successfully');
      }
      
      return result;
    } catch (error: any) {
      console.error('Update profile error:', error);
      setError(error.message || 'Profil güncellenirken hata oluştu');
      return { error: { message: error.message } };
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    updateProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};