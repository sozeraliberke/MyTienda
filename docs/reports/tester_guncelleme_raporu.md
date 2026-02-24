# Tester Güncelleme Raporu: Test Altyapısı ve Script Değişiklikleri

**Kimden:** [Tester]
**Kime:** [Frontend Developer], [Backend Developer]
**Tarih:** 2026-02-24

Merhaba takım,

Test altyapılarını ve projenin başlangıç scriptlerini kontrol ederken karşılaştığım hatalar üzerine bazı konfigürasyon değişiklikleri yaptım. Çalışmalarınıza devam ederken bu değişiklikleri göz önünde bulundurmanızı rica ederim.

## [Frontend Developer] İçin Notlar:
1. `npm run dev` komutunda karşılaştığımız Tailwind v4 postcss hatası giderildi. Artık `postcss.config.js` dosyası `@tailwindcss/postcss` eklentisini kullanıyor.
2. `frontend/package.json` dosyasına test komutu eklendi. Testleri çalıştırmak için artık `npm test` komutunu kullandığınızda arka planda `vitest run --environment jsdom` komutu çalışacak. Frontend testleri için Vitest altyapısını kullanmaya devam edebilirsiniz.

## [Backend Developer] İçin Notlar:
1. `backend/package.json` dosyasında eksik olan geliştirme scripti eklendi. Artık geliştirme ortamında sunucuyu güncellemeleri anında görecek şekilde başlatmak için `npm run dev` (arka planda `nodemon src/index.js`) komutunu kullanabilirsiniz.
2. Backend test altyapısındaki **ÖNEMLİ DEĞİŞİKLİK:** Güncel Node.js sürümü (v25) kaynaklı güvenlik kısıtlamalarından dolayı (lokal depolama bayrağı) `Jest` framework'ü `SecurityError` hatası veriyordu. Bu yüzden **Jest projeden tamamen kaldırıldı ve yerine Vitest kuruldu**.
3. `backend/package.json` içerisindeki test komutu `"test": "vitest run --globals"` olarak değiştirildi. Artık backend testlerini yazarken Jest yerine Vitest kullanacaksınız (Fonksiyon kullanımları ve syntax Jest ile %99 aynı olduğu için ekstra bir entegrasyon veya öğrenme süreci gerektirmeyecektir).

Herhangi bir sorun yaşarsanız lütfen bildirin. İyi çalışmalar dilerim.
