// TrendyolService — ALL endpoint URLs sourced ONLY from backend/docs/trendyol_endpoints.json
// Base URL: https://apigw.trendyol.com

const BASE_URL = 'https://apigw.trendyol.com';

class TrendyolService {
    constructor({ sellerId, apiKey, apiSecret }) {
        this.sellerId = sellerId;
        // Build Basic Auth header as per trendyol_endpoints.json Authentication spec
        const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
        this.headers = {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/json',
            'User-Agent': `${sellerId} - SelfIntegration`,
        };
    }

    async _request(method, url, body = null) {
        const res = await fetch(url, {
            method,
            headers: this.headers,
            body: body ? JSON.stringify(body) : undefined,
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Trendyol API error [${res.status}]: ${text}`);
        }
        return res.json();
    }

    // ---- Product Integration (ecgw/v2/{sellerId}/products) ----
    // Source: Product_Integration → "Mevcut Ürünleri Listeleme (İçeri Alma - V2)"
    getProducts(pageKey = null) {
        let url = `${BASE_URL}/integration/ecgw/v2/${this.sellerId}/products?size=100`;
        if (pageKey) url += `&pageKey=${pageKey}`;
        return this._request('GET', url);
    }

    // ---- Order Integration ----
    // Source: Order_Integration → "Sipariş Paketlerini Çekme"
    getOrders(status = 'Awaiting') {
        const url = `${BASE_URL}/integration/order/sellers/${this.sellerId}/orders?status=${status}&size=200&orderByField=CreatedDate&orderByDirection=DESC`;
        return this._request('GET', url);
    }

    // Source: Order_Integration → "Tedarik Edememe Bildirimi (Unsupplied / İptal)"
    cancelOrder(packageId, reasonCode, lines) {
        const url = `${BASE_URL}/integration/order/sellers/${this.sellerId}/shipment-packages/${packageId}/unsupplied`;
        return this._request('PUT', url, { lines: lines.map(l => ({ ...l, reasonCode })) });
    }

    // Source: Order_Integration → "Sipariş Paketlerini Bölme (Split Shipment)"
    splitOrder(packageId, body) {
        const url = `${BASE_URL}/integration/order/sellers/${this.sellerId}/shipment-packages/${packageId}/split`;
        return this._request('POST', url, body);
    }

    // ---- Q&A Integration ----
    // Source: QnA_Integration → "Müşteri Sorularını Çekme"
    getQuestions() {
        const url = `${BASE_URL}/integration/qna/sellers/${this.sellerId}/questions/filter?status=WAITING_FOR_ANSWER`;
        return this._request('GET', url);
    }

    // Source: QnA_Integration → "Müşteri Sorularını Cevaplama"
    answerQuestion(questionId, answer) {
        const url = `${BASE_URL}/integration/qna/sellers/${this.sellerId}/questions/${questionId}/answers`;
        return this._request('POST', url, { text: answer });
    }

    // Source: Operation_Integration → "İade ve Sevkiyat Adres Bilgileri (Addresses)"
    // Used for connection testing on /connect endpoint
    getAddresses() {
        const url = `${BASE_URL}/integration/sellers/${this.sellerId}/addresses`;
        return this._request('GET', url);
    }
}

module.exports = TrendyolService;
