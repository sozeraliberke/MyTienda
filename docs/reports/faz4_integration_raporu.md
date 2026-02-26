# Faz 4: Trendyol Entegrasyon Raporu

**Tarih:** 2026-02-26 | **Proje:** MyTienda

---

## 1. Backend Agent

### 🔐 AES-256 Encryption (`src/utils/encryption.js`)
- `encrypt(text)` → Random IV + AES-256-CBC → `iv:ciphertext` hex string
- `decrypt(payload)` → Reverses above. Key from `ENCRYPTION_SECRET` env var.
- Veritabanında API anahtarları şifrelenmiş formda saklanır, okunaksızdır.

### 🤝 TrendyolService (`src/services/TrendyolService.js`)
- Tüm URL'ler **yalnızca** `backend/docs/trendyol_endpoints.json` dosyasından alınmıştır.
- Basic Auth: `base64(apiKey:apiSecret)` → `Authorization: Basic ...`
- Metotlar: `getProducts()`, `getOrders()`, `cancelOrder()`, `splitOrder()`, `getQuestions()`, `answerQuestion()`, `getAddresses()`

### 🔄 TrendyolAdapter (`src/services/adapters/TrendyolAdapter.js`)
- `toProduct()`, `toVariant()`, `toListing()` formatları plan_04 barkod kurallarına uygundur.

### ⚡ BullMQ Queue (`src/queues/productSyncQueue.js`)
- Worker Upstash Redis'e bağlı `product-sync` kuyruğuna job ekler.
- Barkod bazlı eşleştirme (varsa listing ekle, yoksa product+variant+listing oluştur).
- `/sync-products` endpoint'i `202 Accepted` döner, işlem arka planda devam eder.

### 🛣️ API Rotaları
| Endpoint | Açıklama |
|---|---|
| `POST /api/integrations/trendyol/connect` | Kimlik bilgilerini test + şifreleyerek kaydet |
| `POST /api/integrations/trendyol/sync-products` | Ürün sync kuyruğunu tetikle |
| `GET /api/orders` | Siparişleri çek |
| `PUT /api/orders/:id/unsupplied` | İptal (500-506 reason codes) |
| `POST /api/orders/:id/split` | Paketi böl |
| `GET /api/qna` | Bekleyen müşteri sorularını çek |
| `POST /api/qna/:id/answer` | Cevap gönder |

---

## 2. Frontend Agent

- `/settings/integrations` — API Key formu, test+kaydet, "Bağlandı ✓" rozeti
- `/products` — Animasyonlu data table, durum rozetleri (Onaylı/Reddedildi), "Eşitle" butonu
- `/orders` — Sipariş listesi, iptal modal (Trendyol reason codes 500→506), "Paketi Böl"
- `/crm/questions` — Split-pane chat UI, soru listesi + cevap alanı + Trendyol'a gönder

---

## 3. Tester

- `tests/encryption.test.js`: 4 senaryo — encrypt/decrypt roundtrip, random IV doğrulaması, eksik `ENCRYPTION_SECRET` hatası ✅

**Toplam backend test sonucu: 8 test | 3 dosya | hepsi başarılı ✅**

---

## Kabul Kriterleri

| Kriter | Durum |
|---|---|
| API Key'ler DB'de şifreli | ✅ AES-256 |
| BullMQ ile async sync | ✅ |
| Timeout yok, 202 Accepted | ✅ |
| Trendyol URL'leri sadece endpoints.json'dan | ✅ |
| Siparişi iptal sebebiyle iptal etme | ✅ |
| Müşteri sorusu yanıtlama | ✅ |
