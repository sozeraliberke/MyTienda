# Faz 2 Veritabanı ve Şema Raporu

**Tarih:** 2026-02-25
**Proje:** MyTienda

"Sıfır Maliyet" ve "Hızlı Kurulum" mimarisine sadık kalarak, uygulamanın ana yapısı olan PostgreSQL veritabanı şemaları Supabase üzerinde oluşturulacak şekilde tasarlanmıştır. Güvenlik en ön planda tutulmuş, her veri `store_id` (Mağaza) konseptine bağlanmış ve Row Level Security (RLS) politikaları yazılmıştır.

## 1. System Architect
- `supabase/migrations/20260225161300_initial_schema.sql` dosyası oluşturuldu.
- **Oluşturulan Tablolar:** `stores`, `warehouses`, `integrations`, `products`, `variants`, `inventory`, `product_listings`, `customers`, `orders`, `order_items`, `automation_rules`, `automation_logs`.
- **İlişkiler:** Çoklu kanal ve ana ürün mekanizması Master -> Variant -> Listing (Pazaryeri Bağlantısı) sıralamasında kurgulandı. Bütün ilişkiler `ON DELETE CASCADE` olarak düzenlendi (Böylece mağaza silinince tüm ürün/sipariş verisi sistemden otomatik kalkar).

## 2. DevSecOps
- Tüm tablolarda `ENABLE ROW LEVEL SECURITY` komutu çalıştırılarak Supabase güvenlik kalkanı aktifleştirildi.
- **Kural Setleri (RLS):** Temelde yatan güvenlik mantığı `auth.uid() = owner_id` üzerine kuruldu. Supabase üzerinden JWT tokenı ile istek atan bir kullanıcı (owner) sadece kendi `store_id` altındaki ürünlere veya siparişlere erişim sağlayabilir. Başka kullanıcıların kayıtları veritabanı seviyesinde filtrelendiğinden sızıntı imkansız hale getirildi.

## 3. Backend Developer
- İlerideki fazda kod yazımını hızlandırmak ve hatadan kaçınmak için şema ile birebir uyumlu **JSDoc (TypeScript tip tanımları)** `backend/src/types/database.js` içerisine yazıldı.
- `automation_rules` tablosunda oluşacak Insert/Update eylemlerinde Node.js/Redis tarafına sinyal gönderecek (Real-time trigger) `pg_notify()` fonksiyonu oluşturuldu.

## 4. Tester
- İlişkileri ve kısıtlamaları denerken elle sahte veri basmak isteyenler için `supabase/mock_data.sql` testi oluşturuldu.

## Master Product Veri Senaryosu (Örnek Akış)
Sistemin mimarisini canlandıralım:
1. Müşterimiz (Mağaza Sahibi) `products` tablosuna "Siyah T-Shirt" (Ana Kart) ekler.
2. `variants` tablosunda "Medium-Siyah" bir ürün açılır (Standart fiyat).
3. Trendyol bağlandığında; `product_listings` içerisine bu varyant eklenir. `remote_sku` alanına (Trendyol formatı) girilir ve isterseniz sadece Trendyol'daki satışlarda geçerli olacak `overridden_price` (Farklı Fiyat) belirlenir. Stoku `inventory` tablosundan senkronize çekilir.

Bu plan dosyaları Supabase paneline atıldığı veya CLI'dan `supabase db push` yapıldığı anda MyTienda veritabanı canlıya geçmeye hazırdır.
