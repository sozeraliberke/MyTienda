# Uygulama Planı: Faz 2 - Veritabanı Mimarisi ve Şema Tasarımı

## 🎯 Hedef
MyTienda'nın SaaS altyapısını destekleyecek, "Master Product" (Ana Ürün) ve "Omnichannel" (Çoklu Kanal) yapısına uygun ilişkisel veritabanı (PostgreSQL/Supabase) şemasının oluşturulması.

## 📜 Mimari Prensipler ve Kurallar
1.  **Multi-Tenancy (Çoklu Kiracı):** Her tablosunda mutlaka `store_id` (Mağaza ID) bulunacak.
2.  **RLS (Row Level Security):** Supabase üzerinde, hiçbir kullanıcının diğer mağazanın verisine erişemeyeceği güvenlik politikaları yazılacak.
3.  **Adapter Pattern Uyumu:** Ürünler ve Siparişler, pazaryeri bağımsız "Ana Veri" olarak tutulacak; pazaryeri detayları alt tablolarda (mappings) saklanacak.
4.  **JSONB Kullanımı:** Trendyol gibi platformların değişken özelliklerini (Materyal, Yıkama Talimatı) tutmak için esnek JSONB sütunları kullanılacak.

## 🛠️ Veritabanı Şeması (Schema Design)

### 1. Mağaza ve Entegrasyonlar (Core)
* **`stores`**: SaaS müşterilerimiz (Dükkanlar).
    * `id` (UUID), `name`, `owner_id` (Auth User), `subscription_plan`.
* **`warehouses`**: Fiziksel stok noktaları (Merkez Depo, Kadıköy Şube vb.).
    * `id`, `store_id`, `name`, `address`.
* **`integrations`**: Pazaryeri API anahtarları.
    * `id`, `store_id`, `platform_name` ('trendyol', 'hepsiburada'), `api_credentials` (Encrypted JSON), `is_active`.

### 2. Ürün Yönetimi (Master Product & Listings)
* **`products` (Master):** MyTienda üzerindeki tekil, ana ürün kartı.
    * `id`, `store_id`, `name`, `description`, `brand`, `attributes` (JSONB - Ortak özellikler).
* **`variants` (SKU):** Ürünün varyasyonları (Beden/Renk).
    * `id`, `product_id`, `sku`, `barcode`, `price`, `stock_code`.
* **`inventory` (Stok):** Hangi depoda kaç adet var?
    * `id`, `variant_id`, `warehouse_id`, `quantity`.
* **`product_listings` (Adapter Link):** Master ürünün pazaryerlerindeki karşılığı.
    * `id`, `variant_id`, `integration_id`, `remote_product_id`, `remote_sku`, `sync_status`, `overridden_price` (Pazaryerine özel fiyat).

### 3. CRM ve Siparişler (Hybrid Customer)
* **`customers` (Unified):** Tekilleştirilmiş ana müşteri kartı.
    * `id`, `store_id`, `email`, `phone`, `full_name`, `total_spent`.
* **`orders` (Master Header):** Siparişin genel başlığı.
    * `id`, `store_id`, `customer_id` (Link), `integration_id` (Nereden geldi?), `total_amount`, `status`, `original_order_number`.
* **`order_items`:** Sipariş satırları.
    * `id`, `order_id`, `variant_id`, `quantity`, `unit_price`.

### 4. Otomasyon (MVP - Simple Rules)
* **`automation_rules`:** Kullanıcının kurduğu basit "Eğer - O zaman" kuralları.
    * `id`, `store_id`, `name`, `trigger_type` (Örn: 'LOW_STOCK'), `trigger_value` (Örn: 5), `action_type` (Örn: 'STOP_SALES'), `is_active`.
* **`automation_logs`:** Çalışan otomasyonların kaydı.
    * `id`, `rule_id`, `executed_at`, `result_message`.

## 📋 Görev Dağılımı

**Adım 1: [System Architect]**
* Yukarıdaki şemayı içeren SQL (DDL) dosyasını (`supabase/schema.sql`) hazırla.
* Tablolar arası Foreign Key (Yabancı Anahtar) ilişkilerini doğru kur (Cascade Delete vb.).
* Özellikle `products` ve `listings` arasındaki ilişkiyi diyagrama uygun tasarla.

**Adım 2: [DevSecOps]**
* Supabase RLS (Row Level Security) politikalarını yaz.
    * Kural: `auth.uid() == store.owner_id` olan verileri göster.
* Veritabanı migration scriptlerini oluştur.

**Adım 3: [Backend Developer]**
* Supabase istemcisi (`supabase-js`) için TypeScript/JSDoc tip tanımlarını (Types) oluşturulan şemaya göre güncelle.
* Otomasyon motorunun dinleyeceği `automation_rules` tablosunu Redis ile senkronize edecek basit bir trigger (tetikleyici) mantığı düşün.

**Adım 4: [Tester]**
* Veritabanına mock (sahte) veri basarak ilişkileri test et.
* Farklı `store_id`'ye sahip kullanıcıların birbirinin verisini göremediğini (RLS) doğrula.

## 📝 Raporlama Beklentisi
İş bitiminde `docs/reports/faz2_database_raporu.md` dosyasına:
* Oluşturulan tabloların tam listesi,
* Uygulanan RLS güvenlik kurallarının kanıtı,
* Master Product yapısının nasıl çalıştığına dair kısa bir örnek veri senaryosu yazılmalı.