import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Development için fallback değerler
const defaultUrl = 'https://placeholder.supabase.co';
const defaultKey = 'placeholder-key';

// Production'da hata fırlat, development'ta uyarı ver
if (!supabaseUrl || !supabaseAnonKey) {
  if (import.meta.env.PROD) {
    throw new Error('Missing Supabase environment variables. Please check your .env file.');
  } else {
    console.warn('⚠️ Supabase environment variables not found. Using placeholder values for development.');
    console.warn('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
  }
}

export const supabase = createClient<Database>(
  supabaseUrl || defaultUrl, 
  supabaseAnonKey || defaultKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'X-Client-Info': 'anlik-eleman-web'
      }
    }
  }
);

// Auth helpers with improved error handling
export const auth = {
  signUp: async (email: string, password: string, userData: any) => {
    try {
      // Validate inputs
      if (!email || !password) {
        return { error: { message: 'E-posta ve şifre gereklidir' } };
      }

      if (!supabaseUrl || supabaseUrl === defaultUrl) {
        return { error: { message: 'Supabase yapılandırması eksik. Lütfen yöneticiye başvurun.' } };
      }

      console.log('Starting signup process for:', email);

      const result = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            user_type: userData.user_type || 'job_seeker',
            phone: userData.phone || '',
            city: userData.city || '',
            company_name: userData.company_name || '',
            company_title: userData.company_title || ''
          }
        }
      });

      if (result.error) {
        console.error('Supabase signup error:', result.error);
        
        // Handle specific Supabase errors
        if (result.error.message.includes('Invalid email')) {
          return { error: { message: 'Geçersiz e-posta adresi formatı' } };
        }
        
        if (result.error.message.includes('Password should be at least')) {
          return { error: { message: 'Şifre en az 6 karakter olmalıdır' } };
        }
        
        if (result.error.message.includes('User already registered')) {
          return { error: { message: 'Bu e-posta adresi zaten kayıtlı' } };
        }
        
        if (result.error.message.includes('signup is disabled')) {
          return { error: { message: 'Kayıt işlemi şu anda devre dışı' } };
        }

        if (result.error.message.includes('fetch')) {
          return { error: { message: 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.' } };
        }
        
        return { error: { message: result.error.message || 'Kayıt sırasında hata oluştu' } };
      }

      console.log('Signup successful:', result.data?.user?.id);
      return result;
    } catch (error: any) {
      console.error('Signup network error:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return { error: { message: 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.' } };
      }
      
      if (error.name === 'AbortError') {
        return { error: { message: 'İstek zaman aşımına uğradı. Tekrar deneyin.' } };
      }
      
      return { error: { message: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.' } };
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      // Validate inputs
      if (!email || !password) {
        return { error: { message: 'E-posta ve şifre gereklidir' } };
      }

      if (!supabaseUrl || supabaseUrl === defaultUrl) {
        return { error: { message: 'Supabase yapılandırması eksik. Lütfen yöneticiye başvurun.' } };
      }

      console.log('Starting signin process for:', email);

      const result = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (result.error) {
        console.error('Supabase signin error:', result.error);
        
        // Handle specific Supabase errors
        if (result.error.message.includes('Invalid login credentials')) {
          return { error: { message: 'E-posta veya şifre hatalı' } };
        }
        
        if (result.error.message.includes('Email not confirmed')) {
          return { error: { message: 'E-posta adresinizi onaylamanız gerekiyor' } };
        }
        
        if (result.error.message.includes('Too many requests')) {
          return { error: { message: 'Çok fazla deneme. Lütfen daha sonra tekrar deneyin.' } };
        }

        if (result.error.message.includes('fetch')) {
          return { error: { message: 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.' } };
        }
        
        return { error: { message: result.error.message || 'Giriş sırasında hata oluştu' } };
      }

      console.log('Signin successful');
      return result;
    } catch (error: any) {
      console.error('Signin network error:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return { error: { message: 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.' } };
      }
      
      if (error.name === 'AbortError') {
        return { error: { message: 'İstek zaman aşımına uğradı. Tekrar deneyin.' } };
      }
      
      return { error: { message: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.' } };
    }
  },

  signOut: async () => {
    try {
      const result = await supabase.auth.signOut();
      if (result.error) {
        console.error('Auth signout error:', result.error);
      }
      return result;
    } catch (error: any) {
      console.error('Signout error:', error);
      return { error: { message: 'Çıkış sırasında beklenmeyen bir hata oluştu' } };
    }
  },

  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Get user error:', error);
      }
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Database helpers with improved error handling
export const db = {
  // Profiles
  getProfile: async (userId: string) => {
    try {
      if (!supabaseUrl || supabaseUrl === defaultUrl) {
        return { data: null, error: { message: 'Veritabanı bağlantısı yapılandırılmamış' } };
      }

      const result = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (result.error && result.error.code !== 'PGRST116') {
        console.error('Get profile error:', result.error);
      }
      
      return result;
    } catch (error: any) {
      console.error('Get profile network error:', error);
      return { data: null, error: { message: 'Profil bilgileri alınamadı' } };
    }
  },

  updateProfile: async (userId: string, updates: any) => {
    try {
      const result = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
      
      if (result.error) {
        console.error('Update profile error:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Update profile error:', error);
      return { data: null, error: { message: 'Profil güncellenemedi' } };
    }
  },

  createProfile: async (profileData: any) => {
    try {
      const result = await supabase
        .from('profiles')
        .insert({
          ...profileData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (result.error) {
        console.error('Create profile error:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Create profile error:', error);
      return { data: null, error: { message: 'Profil oluşturulamadı' } };
    }
  },

  // Job Categories
  getJobCategories: async () => {
    try {
      const result = await supabase
        .from('job_categories')
        .select('*')
        .order('name', { ascending: true });
      if (result.error) {
        console.error('Get job categories error:', result.error);
      }
      return result;
    } catch (error) {
      console.error('Get job categories error:', error);
      return { data: [], error: { message: 'Kategoriler alınamadı' } };
    }
  },

  // Job Postings
  getJobPostings: async (filters: any = {}) => {
    try {
      let query = supabase
        .from('job_postings')
        .select(`
          *,
          employer:profiles(first_name, last_name),
          company:companies(name, city),
          category:job_categories(name)
        `)
        .eq('status', 'active');
      if (filters.category_id) query = query.eq('category_id', filters.category_id);
      if (filters.city) query = query.eq('city', filters.city);
      if (filters.job_type) query = query.eq('job_type', filters.job_type);
      if (filters.is_remote !== undefined) query = query.eq('is_remote', filters.is_remote);
      if (filters.salary_min) query = query.gte('salary_max', filters.salary_min);
      if (filters.salary_max) query = query.lte('salary_min', filters.salary_max);
      const result = await query
        .order('created_at', { ascending: false })
        .range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 20) - 1);
      if (result.error) {
        console.error('Get job postings error:', result.error);
      }
      return result;
    } catch (error) {
      console.error('Get job postings error:', error);
      return { data: [], error: { message: 'İş ilanları alınamadı' } };
    }
  },

  getJobPosting: async (jobId: string) => {
    try {
      const result = await supabase
        .from('job_postings')
        .select(`
          *,
          employer:profiles(first_name, last_name, email, phone),
          company:companies(name, city, address),
          category:job_categories(name)
        `)
        .eq('id', jobId)
        .single();
      if (result.error) {
        console.error('Get job posting error:', result.error);
      }
      return result;
    } catch (error) {
      console.error('Get job posting error:', error);
      return { data: null, error: { message: 'İş ilanı bulunamadı' } };
    }
  },

  // Applications
  getApplications: async (filters: any = {}) => {
    try {
      let query = supabase
        .from('applications')
        .select(`
          *,
          job:job_postings(title, company:companies(name)),
          applicant:profiles(first_name, last_name, email)
        `);
      if (filters.job_id) query = query.eq('job_id', filters.job_id);
      if (filters.applicant_id) query = query.eq('applicant_id', filters.applicant_id);
      if (filters.status) query = query.eq('status', filters.status);
      const result = await query
        .order('created_at', { ascending: false })
        .range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 20) - 1);
      if (result.error) {
        console.error('Get applications error:', result.error);
      }
      return result;
    } catch (error) {
      console.error('Get applications error:', error);
      return { data: [], error: { message: 'Başvurular alınamadı' } };
    }
  },

  updateApplication: async (applicationId: string, updates: any) => {
    try {
      const result = await supabase
        .from('applications')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)
        .select()
        .single();
      if (result.error) {
        console.error('Update application error:', result.error);
      }
      return result;
    } catch (error) {
      console.error('Update application error:', error);
      return { data: null, error: { message: 'Başvuru güncellenemedi' } };
    }
  },

  // Companies
  getCompanies: async (ownerId?: string) => {
    try {
      let query = supabase.from('companies').select('*');
      
      if (ownerId) {
        query = query.eq('owner_id', ownerId);
      }

      const result = await query.order('created_at', { ascending: false });
      
      if (result.error) {
        console.error('Get companies error:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Get companies error:', error);
      return { data: [], error: { message: 'Şirketler alınamadı' } };
    }
  },

  createCompany: async (companyData: any) => {
    try {
      const result = await supabase
        .from('companies')
        .insert({
          ...companyData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (result.error) {
        console.error('Create company error:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Create company error:', error);
      return { data: null, error: { message: 'Şirket oluşturulamadı' } };
    }
  },

  updateCompany: async (id: string, updates: any) => {
    try {
      const result = await supabase
        .from('companies')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (result.error) {
        console.error('Update company error:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Update company error:', error);
      return { data: null, error: { message: 'Şirket güncellenemedi' } };
    }
  },

  // Check if company exists for owner
  checkCompanyExists: async (ownerId: string) => {
    try {
      const result = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', ownerId)
        .single();
      
      // If no error, company exists
      if (!result.error) {
        return { exists: true, data: result.data };
      }
      
      // If PGRST116 error, company doesn't exist
      if (result.error.code === 'PGRST116') {
        return { exists: false, data: null };
      }
      
      // Other errors
      console.error('Check company exists error:', result.error);
      return { exists: false, data: null, error: result.error };
    } catch (error) {
      console.error('Check company exists error:', error);
      return { exists: false, data: null, error: { message: 'Şirket kontrolü yapılamadı' } };
    }
  },

  // Saved Jobs
  getSavedJobs: async (userId: string) => {
    try {
      const result = await supabase
        .from('saved_jobs')
        .select(`
          *,
          job:job_postings(*, company:companies(*))
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (result.error) {
        console.error('Get saved jobs error:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Get saved jobs error:', error);
      return { data: [], error: { message: 'Kaydedilen işler alınamadı' } };
    }
  },

  saveJob: async (userId: string, jobId: string) => {
    try {
      const result = await supabase
        .from('saved_jobs')
        .insert({ 
          user_id: userId, 
          job_id: jobId,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (result.error) {
        console.error('Save job error:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Save job error:', error);
      return { data: null, error: { message: 'İş kaydedilemedi' } };
    }
  },

  unsaveJob: async (userId: string, jobId: string) => {
    try {
      const result = await supabase
        .from('saved_jobs')
        .delete()
        .eq('user_id', userId)
        .eq('job_id', jobId);
      
      if (result.error) {
        console.error('Unsave job error:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Unsave job error:', error);
      return { data: null, error: { message: 'İş kaydedilmekten çıkarılamadı' } };
    }
  },

  // Reviews
  getReviews: async (userId: string) => {
    try {
      const result = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:profiles!reviewer_id(*),
          reviewee:profiles!reviewee_id(*)
        `)
        .eq('reviewee_id', userId)
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      
      if (result.error) {
        console.error('Get reviews error:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Get reviews error:', error);
      return { data: [], error: { message: 'Değerlendirmeler alınamadı' } };
    }
  },

  createReview: async (reviewData: any) => {
    try {
      const result = await supabase
        .from('reviews')
        .insert({
          ...reviewData,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (result.error) {
        console.error('Create review error:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Create review error:', error);
      return { data: null, error: { message: 'Değerlendirme oluşturulamadı' } };
    }
  },

  // Notifications
  getNotifications: async (userId: string, limit: number = 20) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) {
        console.error('Get notifications error:', error);
      }
      return { data, error };
    } catch (error) {
      console.error('Get notifications error:', error);
      return { data: [], error: { message: 'Bildirimler alınamadı' } };
    }
  },

  markNotificationAsRead: async (id: string) => {
    try {
      const result = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      
      if (result.error) {
        console.error('Mark notification as read error:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Mark notification as read error:', error);
      return { data: null, error: { message: 'Bildirim okundu olarak işaretlenemedi' } };
    }
  },

  createNotification: async (notificationData: any) => {
    try {
      const result = await supabase
        .from('notifications')
        .insert({
          ...notificationData,
          created_at: new Date().toISOString()
        });
      
      if (result.error) {
        console.error('Create notification error:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Create notification error:', error);
      return { data: null, error: { message: 'Bildirim oluşturulamadı' } };
    }
  },

  // Statistics and Dashboard Data
  getDashboardStats: async () => {
    try {
      // Get total users count
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total employers count
      const { count: totalEmployers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'employer');

      // Get active job postings count
      const { count: activeJobs } = await supabase
        .from('job_postings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get total companies count
      const { count: totalCompanies } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true });

      return {
        data: {
          totalUsers: totalUsers || 0,
          totalEmployers: totalEmployers || 0,
          activeJobs: activeJobs || 0,
          totalCompanies: totalCompanies || 0
        },
        error: null
      };
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      return { 
        data: { totalUsers: 0, totalEmployers: 0, activeJobs: 0, totalCompanies: 0 }, 
        error: { message: 'İstatistikler alınamadı' } 
      };
    }
  },

  // Get recent job postings for homepage
  getRecentJobPostings: async (limit: number = 6) => {
    try {
      const result = await supabase
        .from('job_postings')
        .select(`
          *,
          company:companies(name, city),
          category:job_categories(name)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (result.error) {
        console.error('Get recent job postings error:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Get recent job postings error:', error);
      return { data: [], error: { message: 'Son iş ilanları alınamadı' } };
    }
  },

  // Get user testimonials (from reviews)
  getTestimonials: async (limit: number = 3) => {
    try {
      const result = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:profiles(first_name, last_name, user_type)
        `)
        .eq('is_public', true)
        .order('rating', { ascending: false })
        .limit(limit);
      
      if (result.error) {
        console.error('Get testimonials error:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Get testimonials error:', error);
      return { data: [], error: { message: 'Kullanıcı yorumları alınamadı' } };
    }
  },

  // Get employer dashboard data
  getEmployerDashboard: async (employerId: string) => {
    try {
      // Get employer's job postings
      const { data: jobPostings } = await supabase
        .from('job_postings')
        .select('*')
        .eq('employer_id', employerId)
        .order('created_at', { ascending: false });

      // Get total applications for employer's jobs
      const { count: totalApplications } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .in('job_id', jobPostings?.map(job => job.id) || []);

      // Get active job count
      const activeJobs = jobPostings?.filter(job => job.status === 'active').length || 0;

      return {
        data: {
          jobPostings: jobPostings || [],
          totalApplications: totalApplications || 0,
          activeJobs,
          totalJobs: jobPostings?.length || 0
        },
        error: null
      };
    } catch (error) {
      console.error('Get employer dashboard error:', error);
      return { 
        data: { jobPostings: [], totalApplications: 0, activeJobs: 0, totalJobs: 0 }, 
        error: { message: 'İşveren paneli verileri alınamadı' } 
      };
    }
  },

  // Get admin dashboard data
  getAdminDashboard: async () => {
    try {
      // Get pending job postings
      const { data: pendingJobs } = await supabase
        .from('job_postings')
        .select(`
          *,
          employer:profiles(first_name, last_name),
          company:companies(name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      // Get recent users
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Get pending reports
      const { data: pendingReports } = await supabase
        .from('reports')
        .select(`
          *,
          reporter:profiles(first_name, last_name),
          reported_user:profiles(first_name, last_name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      return {
        data: {
          pendingJobs: pendingJobs || [],
          recentUsers: recentUsers || [],
          pendingReports: pendingReports || []
        },
        error: null
      };
    } catch (error) {
      console.error('Get admin dashboard error:', error);
      return { 
        data: { pendingJobs: [], recentUsers: [], pendingReports: [] }, 
        error: { message: 'Admin paneli verileri alınamadı' } 
      };
    }
  },

  getUserCompanies: async (userId: string) => {
    try {
      const result = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', userId)
        .order('name', { ascending: true });
      
      if (result.error) {
        console.error('Get user companies error:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Get user companies error:', error);
      return { data: [], error: { message: 'Şirket bilgileri alınamadı' } };
    }
  },

  deleteJobPosting: async (jobId: string) => {
    try {
      const result = await supabase
        .from('job_postings')
        .delete()
        .eq('id', jobId);
      
      if (result.error) {
        console.error('Delete job posting error:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Delete job posting error:', error);
      return { data: null, error: { message: 'İş ilanı silinemedi' } };
    }
  },

  // Favorites System
  addToFavorites: async (userId: string, jobId: string) => {
    try {
      const result = await supabase
        .from('favorites')
        .insert({
          user_id: userId,
          job_id: jobId,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (result.error) {
        console.error('Add to favorites error:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Add to favorites error:', error);
      return { data: null, error: { message: 'Favorilere eklenemedi' } };
    }
  },

  removeFromFavorites: async (userId: string, jobId: string) => {
    try {
      const result = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('job_id', jobId);
      
      if (result.error) {
        console.error('Remove from favorites error:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Remove from favorites error:', error);
      return { data: null, error: { message: 'Favorilerden çıkarılamadı' } };
    }
  },

  getFavorites: async (userId: string) => {
    try {
      const result = await supabase
        .from('favorites')
        .select(`
          *,
          job:job_postings(
            *,
            employer:profiles(first_name, last_name),
            company:companies(name, city),
            category:job_categories(name)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (result.error) {
        console.error('Get favorites error:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Get favorites error:', error);
      return { data: [], error: { message: 'Favoriler alınamadı' } };
    }
  },

  checkFavoriteStatus: async (userId: string, jobId: string) => {
    try {
      const result = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId)
        .eq('job_id', jobId)
        .single();
      
      return { data: result.data ? true : false, error: null };
    } catch (error) {
      return { data: false, error: null };
    }
  },

  // File Upload
  uploadFile: async (filePath: string, file: File) => {
    try {
      const { error } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);
      
      if (error) {
        console.error('File upload error:', error);
      }
      
      return { data: null, error };
    } catch (error) {
      console.error('File upload error:', error);
      return { data: null, error: { message: 'Dosya yüklenemedi' } };
    }
  },

  getFileUrl: async (filePath: string) => {
    try {
      const { data } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);
      
      return { data: data.publicUrl, error: null };
    } catch (error) {
      console.error('Get file URL error:', error);
      return { data: null, error: { message: 'Dosya URL\'i alınamadı' } };
    }
  },

  // Email Verification System
  sendVerificationEmail: async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });
      
      if (error) {
        console.error('Send verification email error:', error);
      }
      
      return { data: null, error };
    } catch (error) {
      console.error('Send verification email error:', error);
      return { data: null, error: { message: 'Doğrulama e-postası gönderilemedi' } };
    }
  },

  verifyEmail: async (token: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email'
      });
      
      if (error) {
        console.error('Verify email error:', error);
      }
      
      return { data, error };
    } catch (error) {
      console.error('Verify email error:', error);
      return { data: null, error: { message: 'E-posta doğrulanamadı' } };
    }
  },

  sendPasswordResetEmail: async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/sifre-sifirla`
      });
      
      if (error) {
        console.error('Send password reset email error:', error);
      }
      
      return { data: null, error };
    } catch (error) {
      console.error('Send password reset email error:', error);
      return { data: null, error: { message: 'Şifre sıfırlama e-postası gönderilemedi' } };
    }
  },

  // Messaging System
  createConversation: async (participant1Id: string, participant2Id: string, jobId: string) => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          participant1_id: participant1Id,
          participant2_id: participant2Id,
          job_id: jobId
        })
        .select()
        .single();
      
      if (error) {
        console.error('Create conversation error:', error);
      }
      
      return { data, error };
    } catch (error) {
      console.error('Create conversation error:', error);
      return { data: null, error: { message: 'Konuşma oluşturulamadı' } };
    }
  },

  getConversations: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('conversation_participants')
        .select('*')
        .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
        .order('conversation_updated_at', { ascending: false });
      
      if (error) {
        console.error('Get conversations error:', error);
      }
      
      return { data, error };
    } catch (error) {
      console.error('Get conversations error:', error);
      return { data: [], error: { message: 'Konuşmalar alınamadı' } };
    }
  },

  getMessages: async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles(first_name, last_name, profile_photo_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Get messages error:', error);
      }
      
      return { data, error };
    } catch (error) {
      console.error('Get messages error:', error);
      return { data: [], error: { message: 'Mesajlar alınamadı' } };
    }
  },

  sendMessage: async (conversationId: string, senderId: string, content: string, messageType: string = 'text', fileUrl?: string, fileName?: string, fileSize?: number) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content,
          message_type: messageType,
          file_url: fileUrl,
          file_name: fileName,
          file_size: fileSize
        })
        .select()
        .single();
      
      if (error) {
        console.error('Send message error:', error);
      }
      
      return { data, error };
    } catch (error) {
      console.error('Send message error:', error);
      return { data: null, error: { message: 'Mesaj gönderilemedi' } };
    }
  },

  markMessagesAsRead: async (conversationId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId);
      
      if (error) {
        console.error('Mark messages as read error:', error);
      }
      
      return { data: null, error };
    } catch (error) {
      console.error('Mark messages as read error:', error);
      return { data: null, error: { message: 'Mesajlar okundu olarak işaretlenemedi' } };
    }
  },

  getUnreadMessageCount: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_unread_message_count', { user_profile_id: userId });
      
      if (error) {
        console.error('Get unread message count error:', error);
      }
      
      return { data, error };
    } catch (error) {
      console.error('Get unread message count error:', error);
      return { data: 0, error: null };
    }
  },

  // Notification System
  markNotificationsAsRead: async (userId: string, notificationIds?: string[]) => {
    try {
      const { data, error } = await supabase
        .rpc('mark_notifications_as_read', { 
          p_user_id: userId, 
          p_notification_ids: notificationIds 
        });
      
      if (error) {
        console.error('Mark notifications as read error:', error);
      }
      
      return { data, error };
    } catch (error) {
      console.error('Mark notifications as read error:', error);
      return { data: null, error: { message: 'Bildirimler okundu olarak işaretlenemedi' } };
    }
  },

  getUnreadNotificationCount: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_unread_notification_count', { p_user_id: userId });
      
      if (error) {
        console.error('Get unread notification count error:', error);
      }
      
      return { data, error };
    } catch (error) {
      console.error('Get unread notification count error:', error);
      return { data: 0, error: null };
    }
  },

  getNotificationPreferences: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Get notification preferences error:', error);
      }
      
      return { data, error };
    } catch (error) {
      console.error('Get notification preferences error:', error);
      return { data: null, error: { message: 'Bildirim tercihleri alınamadı' } };
    }
  },

  updateNotificationPreferences: async (userId: string, preferences: any) => {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .update({
          ...preferences,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) {
        console.error('Update notification preferences error:', error);
      }
      
      return { data, error };
    } catch (error) {
      console.error('Update notification preferences error:', error);
      return { data: null, error: { message: 'Bildirim tercihleri güncellenemedi' } };
    }
  }
};