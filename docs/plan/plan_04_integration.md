# Faz 4 Uygulama Planı: Pazaryeri Entegrasyonu (Trendyol) ve Senkronizasyon

## 🎯 Hedef
MyTienda'yı dış dünyaya bağlamak. Trendyol API'lerini kullanarak çift yönlü (MyTienda <-> Trendyol) ürün, sipariş ve müşteri sorusu senkronizasyonunu sağlamak. Bu işlemler yapılırken sunucunun kilitlenmemesi için asenkron kuyruk (Queue) mimarisi kullanmak.

## 🏗️ Mimari ve Güvenlik Kararları

1.  **Security (Güvenli Kasa):** Trendyol API Key ve Secret Key değerleri `public.integrations` tablosundaki `api_credentials` JSON alanına **AES-256 ile şifrelenerek (encrypted)** kaydedilecektir. Düz metin saklanması KESİNLİKLE YASAKTIR.
2.  **Adapter Pattern (Çevirmen Servis):** Backend'de `src/services/adapters/TrendyolAdapter.ts` oluşturulacak. Dışarıdan gelen karmaşık JSON, doğrudan veritabanına değil, önce bu adaptöre girecek ve "MyTienda Standart Objesi"ne dönüştürülecektir.
3.  **Queue System (Kuyruk Mimarisi):** Binlerce ürünü çekerken Timeout (zaman aşımı) yememek için **BullMQ** ve **Upstash Redis** kullanılacaktır. Kullanıcı "Ürünleri Çek" dediğinde işlem kuyruğa atılacak, arka planda 100'erli sayfalama (pagination) ile işlenecektir.
4.  **🚨 KESİN KURAL (Endpoint Referansı):** Tüm Trendyol API istekleri, HTTP metotları ve uç noktalar için **SADECE VE SADECE `backend/docs/trendyol_endpoints.json`** dosyası referans alınacaktır. Ajanların (Agent) bu dosya dışında varsayılan veya kendi bildikleri endpointleri kullanması KESİNLİKLE YASAKTIR.

## 🔄 Veri Eşleştirme (Mapping) Kuralları

Trendyol'dan çekilen `GET /products` verileri şu kurallara göre Supabase tablolarına yazılacaktır:

* **Barkod Bazlı Eşleştirme (Master Product):** Gelen ürünün `barcode` değeri `variants.barcode` tablosunda aranacak. 
    * *Varsa:* Yeni ürün yaratma! Sadece `product_listings` tablosuna `integration_id`, `remote_product_id` ve `remote_sku` ekle.
    * *Yoksa:* `products` ve `variants` tablolarında yeni ürün oluştur.
* **Fiyatlar:** `salePrice` -> `variants.price` (Ana Satış Fiyatı). `listPrice` -> `variants.compare_at_price` (Üstü Çizili Fiyat).
* **Durumlar:** Sadece "Onaylı" (approved) değil, **tüm ürünler** (rejected, archived) çekilecek. Trendyol statüsü metadata olarak saklanacak.
* **Marka:** Marka adı metin olarak `products.brand` kolonuna, Trendyol Brand ID'si ise `products.attributes` JSON'ı içine gizlenecek.

## 📋 Adım Adım Görev Dağılımı

### [Backend Agent]
1.  **Güvenlik:** `src/utils/encryption.ts` dosyasını oluştur (AES-256 encrypt/decrypt fonksiyonları).
2.  **Trendyol Adapter:** Trendyol API isteklerini yönetecek `TrendyolService.ts` ve veriyi formatlayacak `TrendyolAdapter.ts` sınıflarını yaz. **(DİKKAT: Uç noktalar için `backend/docs/trendyol_endpoints.json` dosyasını oku ve harfiyen uygula!).**
3.  **Kuyruk (BullMQ):** Redis bağlantısını kullanarak `productSyncQueue` oluştur. Bu worker (işçi), Trendyol'dan sayfa sayfa ürün çekip `products`, `variants` ve `product_listings` tablolarına `upsert` yapsın.
4.  **Endpointler:**
    * `POST /api/integrations/trendyol/connect`: API Key'leri al, test et (GET Addresses ile) ve şifreleyerek kaydet.
    * `POST /api/integrations/trendyol/sync-products`: Ürün çekme kuyruğunu tetikler.
    * `GET /api/orders`: Siparişleri getirir.
    * `PUT /api/orders/:id/unsupplied`: Siparişi iptal eder (Sebep kodları: 500, 501, 502, 504, 505, 506).
    * `POST /api/orders/:id/split`: Siparişi kısmi gönderim için böler.
    * `GET /api/qna` ve `POST /api/qna/:id/answer`: Müşteri sorularını çeker ve cevaplar.

### [Frontend Agent]
1.  **Ayarlar (Settings):** `/settings/integrations` sayfası. Trendyol API Key, Secret Key ve Satıcı ID giriş formu. Başarılı bağlantıda "Bağlandı" rozeti gösterilecek.
2.  **Ürünler Tablosu:** `/products` sayfası. Shadcn/UI Data Table kullanılarak ürünler listelenecek. Sütunlar: Görsel, İsim, Barkod, Stok, Fiyat, Pazaryeri Durumu (Onaylı/Reddedildi rozetleri). Sağ üstte "Pazaryerinden Eşitle" butonu.
3.  **Siparişler & İptal Akışı:** `/orders` sayfası. 
    * Sipariş detayında **"Tedarik Edilemedi (İptal)"** butonu. Tıklanınca açılan Modal'da Trendyol İptal Sebepleri listelenecek.
    * Sipariş detayında **"Paketi Böl"** seçeneği eklenecek.
4.  **Müşteri Soruları (CRM):** `/crm/questions` sayfası. Sadece `WAITING_FOR_ANSWER` durumundaki sorular sol tarafta liste, sağ tarafta sohbet penceresi (chat UI) şeklinde tasarlanacak ve cevaplama kutusu konulacak.

## ✅ Kabul Kriterleri (Definition of Done)
- [ ] API Key'ler veritabanında şifreli (okunamaz) halde duruyor.
- [ ] Redis/BullMQ çalışıyor, büyük ürün listeleri çekerken sunucu kilitlenmiyor (Timeout vermiyor).
- [ ] Trendyol'dan ürün çekildiğinde veritabanındaki tablolar (products, variants, product_listings) doğru ilişkilerle doluyor.
- [ ] Kullanıcı panelden siparişi seçip "Stok Tükendi (500)" sebebiyle Trendyol'da iptal edebiliyor.
- [ ] Kullanıcı panelden gelen müşteri sorusuna cevap yazıp Trendyol'a gönderebiliyor.