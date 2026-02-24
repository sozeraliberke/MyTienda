# Uygulama Planı: Faz 1 - Proje İskeleti ve Temel Kurulum

## 🎯 Hedef
MyTienda projesinin sıfır maliyet ($0) kuralına sadık kalarak, Vercel (Frontend) ve Render (Backend) platformlarına uygun, hızlı, temiz ve "Monorepo" (tek depo) mimarisinin kurulması.

## 📜 Genel Kurallar
1. **Sıfır Maliyet:** Yalnızca açık kaynaklı araçlar ve Free-Tier (ücretsiz katman) uyumlu yapılar kullanılacaktır.
2. **Monorepo Mimarisi:** Ana dizin altında kodların karışmaması için ayrıştırılmış `frontend` ve `backend` klasörleri olacaktır.
3. **Kod Standartları (Linter):** Temel sağlam atılacaktır. Ancak ajanların geliştirme yaparken ufak stil hataları (boşluk, tırnak vb.) yüzünden bloke olmaması için ESLint/Prettier kuralları "temelde katı, özellik geliştirmede esnek" olacak şekilde yapılandırılacaktır.
4. **Belgeleme:** Atılan her adım, kurulan her paket görev sonunda raporlanacaktır.

## 🛠️ Görev Dağılımı ve Sıralaması

**Adım 1: [System Architect] & [DevSecOps] (Altyapı ve Güvenlik)**
* Proje ana dizininde `frontend` ve `backend` adında iki ayrı ana klasör oluşturun.
* Ana dizine `.gitignore` (içinde `.env` mutlaka olmalı) ve `.env.example` (Supabase ve Redis değişken şablonları içeren) dosyalarını ekleyin.
* Kök dizinde ESLint ve Prettier kurulumlarını yapın. Kuralları projenin iskeletini koruyacak düzeyde belirleyin ancak ajanları stil hatalarıyla döngüye sokmayacak esneklikte tutun.

**Adım 2: [Frontend Developer] (Ön Yüz Kurulumu)**
* `frontend` klasörü içine Vercel'de çalışmaya hazır, hafif bir React (veya Next.js) iskeleti kurun.
* Hızlı ve standart UI geliştirimi için Tailwind CSS entegrasyonunu tamamlayın.
* Varsayılan boilerplate (gereksiz logo, örnek CSS vb.) dosyalarını silerek yapıyı temizleyin.

**Adım 3: [Backend Developer] (Arka Uç Kurulumu)**
* `backend` klasörü içine Render platformunda çalışmaya uygun bir Node.js (Express vb.) iskeleti kurun.
* İleride Supabase ve Upstash (Redis) bağlantılarının yapılacağı temel yapılandırma dosyalarının şablonlarını (boş fonksiyonlar/iskeletler olarak) oluşturun.
* Sistemin ayakta olduğunu test etmek için basit bir `/health` API endpoint'i yazın.

**Adım 4: [Tester] (Test Altyapısı)**
* `frontend` ve `backend` klasörleri içine test klasörleri/yapılandırmaları (örn: Jest) ekleyin.
* Kurulan mimarinin ve `/health` endpoint'inin çalışır durumda olduğunu doğrulayacak ilk temel testi yazın.

## 📝 Kabul Kriterleri ve Raporlama
Tüm ajanlar kendi görevlerini tamamladıktan sonra `docs/reports/faz1_kurulum_raporu.md` adlı bir dosya oluşturup aşağıdaki formatta notlarını düşmelidir:
* **Ne kuruldu?** (Örn: Tailwind CSS, Express.js)
* **Neden kuruldu?** (Örn: Güvenli ve hızlı API yönlendirmeleri için)
* **Ne işe yarayacak?** (Projedeki rolü nedir?)

**[Team Lead]:** Tüm ajanların süreci tamamladığından emin ol, yazılan raporu derle ve kullanıcıya sun.