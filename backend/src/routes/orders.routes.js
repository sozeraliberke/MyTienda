const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const authMiddleware = require('../middlewares/auth.middleware');
const TrendyolService = require('../services/TrendyolService');
const { decrypt } = require('../utils/encryption');

const router = express.Router();

// Helper: get TrendyolService instance for the authenticated store
async function getTrendyol(supabase, storeId) {
    const { data: integration, error } = await supabase
        .from('integrations')
        .select('api_credentials')
        .eq('store_id', storeId)
        .eq('platform_name', 'trendyol')
        .eq('is_active', true)
        .single();

    if (error || !integration) throw new Error('No active Trendyol integration found.');
    const { sellerId, apiKey, apiSecret } = integration.api_credentials;
    return new TrendyolService({ sellerId, apiKey: decrypt(apiKey), apiSecret: decrypt(apiSecret) });
}

/**
 * GET /api/orders
 * Source: Order_Integration → "Sipariş Paketlerini Çekme"
 */
router.get('/orders', authMiddleware, async (req, res) => {
    try {
        const trendyol = await getTrendyol(req.supabase, req.store.id);
        const data = await trendyol.getOrders(req.query.status || 'Awaiting');
        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * PUT /api/orders/:id/unsupplied
 * Source: Order_Integration → "Tedarik Edememe Bildirimi (Unsupplied / İptal)"
 * Valid reason codes: 500, 501, 502, 504, 505, 506
 */
router.put('/orders/:id/unsupplied', authMiddleware, async (req, res) => {
    const { reasonCode, lines } = req.body;
    const validReasonCodes = [500, 501, 502, 504, 505, 506];

    if (!reasonCode || !validReasonCodes.includes(Number(reasonCode))) {
        return res.status(400).json({ error: `Invalid reasonCode. Must be one of: ${validReasonCodes.join(', ')}` });
    }

    if (!lines || !Array.isArray(lines) || lines.length === 0) {
        return res.status(400).json({ error: 'lines array is required.' });
    }

    try {
        const trendyol = await getTrendyol(req.supabase, req.store.id);
        const data = await trendyol.cancelOrder(req.params.id, reasonCode, lines);
        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/orders/:id/split
 * Source: Order_Integration → "Sipariş Paketlerini Bölme (Split Shipment)"
 */
router.post('/orders/:id/split', authMiddleware, async (req, res) => {
    try {
        const trendyol = await getTrendyol(req.supabase, req.store.id);
        const data = await trendyol.splitOrder(req.params.id, req.body);
        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
