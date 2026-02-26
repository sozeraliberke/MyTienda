# Faz 3 Uygulama Planı: Premium Kimlik Doğrulama, Onboarding ve Mağaza Kurulumu

## 🎯 Hedef
Kullanıcılara sadece "Giriş Yap" dedirtmek değil; MyTienda'nın profesyonel, güvenli ve premium bir platform olduğunu hissettiren özel tasarım (Custom UI) bir kimlik doğrulama deneyimi sunmak. Arka planda ise "Otomatik Mağaza Kurulumu" (Zero-Touch Provisioning) ile teknik sürtünmeyi sıfıra indirmek.

## 🎨 Tasarım Vizyonu (UX/UI Manifesto)
* **Hazır Bileşen Yasak:** Supabase'in varsayılan `<Auth />` bileşeni kesinlikle kullanılmayacak.
* **Split Screen (Bölünmüş Ekran):**
    * **Sol Taraf (%50):** MyTienda'nın değer önerisini sunan, koyu modda, hafif hareketli (Framer Motion) soyut grafikler veya 3D illüstrasyonlar içeren "Vizyon Alanı".
    * **Sağ Taraf (%50):** Glassmorphism (Buzlu Cam) efektine sahip, minimalist, modern tipografi (Inter/Geist) ile hazırlanmış "Eylem Alanı" (Form).
* **Mikro-Etkileşimler:** Butonlara basıldığında yüklenme animasyonları, hata durumunda "Shake" (Titreme) efekti, başarılı girişte sayfanın yumuşakça (Fade-out) kaybolması.

## 🛠️ Teknik Mimari

### 1. Veritabanı (PostgreSQL & Supabase)
Kullanıcı kaydolduğu milisaniyede mağazasının hazır olması için veritabanı seviyesinde otomasyon.

* **Trigger (Tetikleyici):** `auth.users` tablosuna yeni kayıt düştüğünde çalışan `create_new_store_trigger` fonksiyonu.
* **Fonksiyon Mantığı:**
    * Yeni kullanıcının `id`sini al.
    * `public.stores` tablosunda bu ID ile yeni satır oluştur.
    * Mağaza adını geçici olarak "My Store" (veya e-posta prefixi) yap.
    * `subscription_plan` sütununu 'free_trial' olarak işaretle.

### 2. Frontend (Next.js + Shadcn/UI)
* **Kütüphaneler:** `lucide-react` (İkonlar), `framer-motion` (Animasyon), `zod` + `react-hook-form` (Form Validasyonu), `shadcn/ui` (Komponent Seti).
* **Sayfalar:**
    * `/login`: Giriş Sayfası.
    * `/register`: Kayıt Sayfası.
    * `/onboarding`: Giriş sonrası yönlendirilecek "Sihirbaz" sayfası.
* **Auth State:** Supabase Auth Helpers (`createClientComponentClient`) kullanılarak oturum yönetimi. Middleware ile korumalı rotalar (`/dashboard` altına izinsiz giriş engeli).

### 3. Backend (Node.js/Express)
* **Middleware (`authMiddleware.js`):**
    * Gelen istekte `Authorization: Bearer <token>` başlığını kontrol et.
    * Supabase üzerinden Token'ı doğrula.
    * Token geçerliyse; kullanıcının `store_id`sini veritabanından bul ve `req.store` objesine ekle.
* **API Endpoints:**
    * `PUT /api/store/onboarding`: Kullanıcının mağaza adını, logosunu ve para birimini güncellediği uç nokta.
    * `POST /api/integrations/check`: (Opsiyonel) Onboarding sırasında API anahtarlarını test eden uç nokta.

## 📋 Adım Adım Görev Dağılımı

### [Database Agent]
1.  `supabase/migrations/` altında yeni bir SQL dosyası oluştur (`20260226_auth_trigger.sql`).
2.  İçine `handle_new_user` adında PL/pgSQL fonksiyonunu yaz.
3.  Bu fonksiyonu `auth.users` tablosuna `AFTER INSERT` trigger'ı olarak bağla.
4.  Migration'ı uygula ve test kullanıcısı oluşturarak `stores` tablosunda otomatik satır oluştuğunu kanıtla.

### [Frontend Agent]
1.  `components/ui` klasörüne Shadcn/UI button, input, label, card bileşenlerini kur.
2.  `app/(auth)/login/page.tsx` ve `register/page.tsx` sayfalarını "Split Screen" vizyonuna göre kodla.
3.  `app/onboarding/page.tsx` sayfasını oluştur (Adım 1: Mağaza Adı, Adım 2: Pazaryeri Bağla/Atla).
4.  Giriş başarılı olduğunda kullanıcıyı `dashboard` yerine önce `onboarding` kontrolüne sokan yönlendirme mantığını kur.

### [Backend Agent]
1.  `src/middlewares/auth.middleware.ts` dosyasını oluştur. JWT doğrulama ve `store_id` bulma mantığını yaz.
2.  `src/routes/store.routes.ts` içinde `updateStoreDetails` controller'ını yaz.
3.  Server tarafında `types/express/index.d.ts` dosyasını güncelle (`req.user` ve `req.store` tiplerini ekle).

## ✅ Kabul Kriterleri (Definition of Done)
- [ ] Tasarım, standart Supabase formlarına benzemiyor, özel ve premium duruyor.
- [ ] Yeni üye olunca veritabanında `stores` tablosunda otomatik satır oluşuyor.
- [ ] Giriş yapmamış kullanıcı `/dashboard` sayfasına girmeye çalıştığında `/login` sayfasına atılıyor.
- [ ] Onboarding tamamlanmadan panele erişim verilmiyor (veya kısıtlı erişim).
- [ ] Backend, Token'sız gelen isteklere `401 Unauthorized` cevabı dönüyor.