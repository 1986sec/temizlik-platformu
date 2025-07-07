import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Users, 
  Building2, 
  Star,
  CheckCircle,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import { db } from '../lib/supabase';

const HomePage = () => {
  const [stats, setStats] = useState([
    { number: '0', label: 'Aktif İş İlanı', icon: Search },
    { number: '0', label: 'Kayıtlı İş Arayan', icon: Users },
    { number: '0', label: 'Güvenilir İşveren', icon: Building2 },
    { number: '95%', label: 'Memnuniyet Oranı', icon: Star },
  ]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomePageData();
  }, []);

  const loadHomePageData = async () => {
    try {
      setLoading(true);
      
      // Load dashboard stats
      const { data: statsData } = await db.getDashboardStats();
      if (statsData) {
        setStats([
          { number: statsData.activeJobs.toString(), label: 'Aktif İş İlanı', icon: Search },
          { number: statsData.totalUsers.toString(), label: 'Kayıtlı İş Arayan', icon: Users },
          { number: statsData.totalEmployers.toString(), label: 'Güvenilir İşveren', icon: Building2 },
          { number: '95%', label: 'Memnuniyet Oranı', icon: Star },
        ]);
      }

      // Load recent job postings
      const { data: jobsData } = await db.getRecentJobPostings(6);
      if (jobsData) {
        setRecentJobs(jobsData);
      }

      // Load testimonials
      const { data: testimonialsData } = await db.getTestimonials(3);
      if (testimonialsData) {
        setTestimonials(testimonialsData);
      }
    } catch (error) {
      console.error('Error loading home page data:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Search,
      title: 'Akıllı İş Arama',
      description: 'Yapay zeka destekli algoritmalar ile size en uygun işleri bulun.'
    },
    {
      icon: Building2,
      title: 'Güvenli Platform',
      description: 'KVKK uyumlu, güvenli veri işleme ve 2FA koruması.'
    },
    {
      icon: CheckCircle,
      title: 'Doğrulanmış İşverenler',
      description: 'Tüm işverenler kimlik ve belge kontrolünden geçer.'
    }
  ];

  const formatSalary = (min: number, max: number) => {
    if (min && max) {
      return `${min.toLocaleString()} - ${max.toLocaleString()} TL`;
    } else if (min) {
      return `${min.toLocaleString()} TL`;
    }
    return 'Müzakere edilebilir';
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 cleaning-gradient opacity-10"></div>
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/4099114/pexels-photo-4099114.jpeg')] bg-cover bg-center opacity-5"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Gündelik İşçilere Özel Güvenilir Platform
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary">
              Deneyimli Garson, Komi ve Gündelik Personel Burada
            </h2>
            <p className="mb-8 text-lg text-gray-700 max-w-2xl mx-auto">
              Gündelik iş arayanlar ve işverenler için hızlı, güvenli ve şeffaf buluşma noktası. Deneyimli garson, komi ve diğer gündelik personel ihtiyaçlarınız için en doğru adres.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
              <Link to="/isler" className="btn-primary text-lg px-8 py-4 flex items-center space-x-2 group">
                <Briefcase className="h-5 w-5" />
                <span>İş İlanları</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link to="/is-arayan" className="btn-outline text-lg px-8 py-4 flex items-center space-x-2 group">
                <Users className="h-5 w-5" />
                <span>İş Arıyorum</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link to="/isveren" className="btn-outline text-lg px-8 py-4 flex items-center space-x-2 group">
                <Building2 className="h-5 w-5" />
                <span>Eleman Arıyorum</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>

            {/* Quick Search */}
            <div className="max-w-2xl mx-auto">
              <Link to="/isler">
                <div className="glass-card p-6 rounded-2xl hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="İş pozisyonu arayın..."
                        className="input-field"
                        readOnly
                      />
                    </div>
                    <div className="flex-1">
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Şehir seçin..."
                          className="input-field pl-10"
                          readOnly
                        />
                      </div>
                    </div>
                    <button className="btn-primary px-8 py-3 flex items-center space-x-2">
                      <Search className="h-4 w-4" />
                      <span>Ara</span>
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ number, label, icon: Icon }, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-200">
                  <Icon className="h-8 w-8" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{number}</div>
                <div className="text-gray-600 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Neden AnlıkEleman?
            </h2>
            <p className="text-xl text-gray-600">
              Platformumuzun avantajları
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map(({ icon: Icon, title, description }, index) => (
              <div key={index} className="card p-8 text-center group hover:shadow-xl transition-all duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-200">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
                <p className="text-gray-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Jobs Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Son Eklenen İş İlanları
            </h2>
            <p className="text-xl text-gray-600">
              En güncel fırsatları kaçırmayın
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="card p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="flex space-x-2">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentJobs.map((job: any) => (
                <div key={job.id} className="card p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {job.company?.name || 'Şirket bilgisi yok'}
                      </p>
                      <div className="flex items-center text-gray-500 text-sm">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.city}
                      </div>
                    </div>
                    {job.is_premium && (
                      <div className="flex items-center space-x-1 text-yellow-600">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-xs font-medium">Premium</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {job.description.substring(0, 100)}...
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{job.job_type}</span>
                    </div>
                    <div className="text-sm font-medium text-primary-600">
                      {formatSalary(job.salary_min, job.salary_max)}
                    </div>
                  </div>
                  
                  <Link 
                    to={`/is/${job.id}`} 
                    className="btn-primary w-full mt-4 text-center"
                  >
                    Detayları Gör
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz İş İlanı Yok</h3>
              <p className="text-gray-600">İlk iş ilanını eklemek için işveren olarak kayıt olun.</p>
            </div>
          )}

          {recentJobs.length > 0 && (
            <div className="text-center mt-12">
              <Link to="/isler" className="btn-outline text-lg px-8 py-3">
                Tüm İş İlanlarını Gör
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nasıl Çalışır?
            </h2>
            <p className="text-xl text-gray-600">
              Sadece 3 adımda hayalinizdeki işe ulaşın
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 text-white rounded-full text-2xl font-bold mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Kayıt Ol</h3>
              <p className="text-gray-600">
                Hızlı ve kolay kayıt işlemi ile platforma üye olun.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-600 text-white rounded-full text-2xl font-bold mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Profil Oluştur</h3>
              <p className="text-gray-600">
                Detaylı profilinizi oluşturun ve yeteneklerinizi gösterin.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-success-600 text-white rounded-full text-2xl font-bold mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Başvur & Çalış</h3>
              <p className="text-gray-600">
                Size uygun işlere başvurun ve kariyerinizi başlatın.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Kullanıcılarımız Ne Diyor?
            </h2>
            <p className="text-xl text-gray-600">
              Binlerce memnun kullanıcımızdan bazı yorumlar
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="card p-8 animate-pulse">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-5 w-5 bg-gray-200 rounded mr-1"></div>
                    ))}
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial: any) => (
                <div key={testimonial.id} className="card p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic">"{testimonial.comment}"</p>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold text-lg">
                        {testimonial.reviewer?.first_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {testimonial.reviewer?.first_name} {testimonial.reviewer?.last_name}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {testimonial.reviewer?.user_type === 'job_seeker' ? 'İş Arayan' : 'İşveren'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz Yorum Yok</h3>
              <p className="text-gray-600">İlk yorumu siz yapın!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 cleaning-gradient text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Sparkles className="h-16 w-16 mx-auto mb-8 animate-bounce-light" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Hemen Başlayın!
          </h2>
          <p className="text-xl mb-12 opacity-90">
            Temizlik sektöründeki kariyerinizi bugün başlatın. 
            Binlerce fırsat sizi bekliyor.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/kayit" className="bg-white text-primary-600 hover:bg-gray-100 font-medium px-8 py-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center space-x-2">
              <span>Ücretsiz Kayıt Ol</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/iletisim" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-medium px-8 py-4 rounded-lg transition-all duration-200 flex items-center space-x-2">
              <span>Daha Fazla Bilgi</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;