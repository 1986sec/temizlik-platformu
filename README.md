# 🧹 AnlıkEleman - Temizlik Sektörü İş Pazarı

Modern ve güvenli temizlik sektörü iş pazarı platformu. İş arayanlar ve işverenler için profesyonel bir platform.

## ✨ Özellikler

### 🔐 Güvenlik
- E-posta doğrulama sistemi
- Güvenli kimlik doğrulama
- RLS (Row Level Security)
- KVKK uyumlu veri işleme

### 💼 İş Yönetimi
- İş ilanı oluşturma ve yönetimi
- Gelişmiş arama ve filtreleme
- Başvuru sistemi
- Favori iş ilanları

### 💬 İletişim
- Gerçek zamanlı mesajlaşma
- Dosya ve resim paylaşımı
- Okundu durumu takibi

### 🔔 Bildirimler
- Anlık bildirimler
- E-posta bildirimleri
- Özelleştirilebilir tercihler

### 👤 Profil Yönetimi
- Detaylı profil oluşturma
- CV yükleme
- Yetenek ve dil ekleme
- Sosyal medya linkleri

## 🚀 Teknolojiler

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Icons:** Lucide React
- **Deployment:** Netlify

## 📦 Kurulum

### Gereksinimler
- Node.js 18+
- npm veya yarn
- Supabase hesabı

### Adımlar

1. **Projeyi klonlayın**
```bash
git clone <repository-url>
cd anlik-eleman
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Environment değişkenlerini ayarlayın**
```bash
cp .env.example .env.local
```

4. **Supabase ayarlarını yapın**
- Supabase projesi oluşturun
- Environment değişkenlerini güncelleyin
- Veritabanı migration'larını çalıştırın

5. **Geliştirme sunucusunu başlatın**
```bash
npm run dev
```

## 🔧 Environment Değişkenleri

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📊 Veritabanı Migration'ları

Supabase Dashboard'da SQL Editor'da sırasıyla çalıştırın:

1. `20250702202653_crimson_unit.sql` - Temel tablolar
2. `20250702202914_mellow_river.sql` - İş ilanları
3. `20250702203000_email_verification.sql` - E-posta doğrulama
4. `20250702203100_messaging_system.sql` - Mesajlaşma
5. `20250702203200_notification_system.sql` - Bildirimler

## 🚀 Deployment

### Netlify'da Deploy

1. **GitHub'a push edin**
```bash
git add .
git commit -m "Deploy to Netlify"
git push origin main
```

2. **Netlify'da yeni site oluşturun**
- GitHub repository'nizi bağlayın
- Build command: `npm run build`
- Publish directory: `dist`

3. **Environment değişkenlerini ayarlayın**
- Netlify Dashboard > Site settings > Environment variables
- Supabase URL ve Anon Key ekleyin

4. **Deploy edin**
- Otomatik deploy aktif
- Her push'ta yeni versiyon deploy edilir

### Manuel Deploy

```bash
# Build oluşturun
npm run build

# Dist klasörünü Netlify'a yükleyin
# veya Netlify CLI kullanın
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

## 📁 Proje Yapısı

```
src/
├── components/          # React bileşenleri
│   ├── common/         # Ortak bileşenler
│   └── layout/         # Layout bileşenleri
├── contexts/           # React context'leri
├── lib/               # Utility fonksiyonları
├── pages/             # Sayfa bileşenleri
└── main.tsx           # Ana giriş noktası

supabase/
└── migrations/        # Veritabanı migration'ları
```

## 🔍 Kullanım

### İş Arayanlar
1. Kayıt olun ve e-posta doğrulayın
2. Profilinizi oluşturun ve CV yükleyin
3. İş ilanlarını arayın ve filtreleyin
4. Başvuru yapın ve mesajlaşın

### İşverenler
1. Premium üyelik satın alın
2. İş ilanı oluşturun
3. Başvuruları inceleyin
4. Adaylarla mesajlaşın

### Admin
1. Kullanıcı onaylarını yönetin
2. Ödeme onaylarını kontrol edin
3. Platform istatistiklerini görüntüleyin

## 🛠️ Geliştirme

### Scripts
```bash
npm run dev          # Geliştirme sunucusu
npm run build        # Production build
npm run preview      # Build önizleme
npm run lint         # ESLint kontrolü
```

### Kod Standartları
- TypeScript strict mode
- ESLint + Prettier
- Tailwind CSS
- Component-based architecture

## 🔒 Güvenlik

- Tüm API çağrıları Supabase RLS ile korunur
- E-posta doğrulama zorunlu
- Güvenli dosya yükleme
- XSS ve CSRF koruması

## 📈 Performans

- Vite ile hızlı build
- Code splitting
- Lazy loading
- Optimized images
- CDN desteği

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- **Website:** [anlik-eleman.netlify.app](https://anlik-eleman.netlify.app)
- **Email:** support@anlik-eleman.com
- **GitHub:** [github.com/anlik-eleman](https://github.com/anlik-eleman)

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın! 