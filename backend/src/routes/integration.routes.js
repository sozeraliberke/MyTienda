const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const authMiddleware = require('../middlewares/auth.middleware');
const TrendyolService = require('../services/TrendyolService');
const { encrypt, decrypt } = require('../utils/encryption');
const { productSyncQueue } = require('../queues/productSyncQueue');

const router = express.Router();

/**
 * POST /api/integrations/trendyol/connect
 * Validates and saves Trendyol API credentials (encrypted).
 */
router.post('/integrations/trendyol/connect', authMiddleware, async (req, res) => {
    const { apiKey, apiSecret, sellerId } = req.body;
    const storeId = req.store.id;

    if (!apiKey || !apiSecret || !sellerId) {
        return res.status(400).json({ error: 'apiKey, apiSecret and sellerId are required.' });
    }

    try {
        // Test the credentials using getAddresses (Operation_Integration)
        const trendyol = new TrendyolService({ sellerId, apiKey, apiSecret });
        await trendyol.getAddresses();

        // Credentials valid — encrypt before saving
        const encryptedCredentials = {
            sellerId,
            apiKey: encrypt(apiKey),
            apiSecret: encrypt(apiSecret),
        };

        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

        const { data, error } = await supabase
            .from('integrations')
            .upsert(
                {
                    store_id: storeId,
                    platform_name: 'trendyol',
                    api_credentials: encryptedCredentials,
                    is_active: true,
                },
                { onConflict: 'store_id,platform_name' }
            )
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });

        return res.status(200).json({ message: 'Trendyol connected successfully.', integration: { id: data.id, platform_name: data.platform_name, is_active: data.is_active } });
    } catch (err) {
        return res.status(401).json({ error: `Trendyol API validation failed: ${err.message}` });
    }
});

/**
 * POST /api/integrations/trendyol/sync-products
 * Enqueues a background product sync job. Returns 202 immediately.
 */
router.post('/integrations/trendyol/sync-products', authMiddleware, async (req, res) => {
    const storeId = req.store.id;
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

    const { data: integration, error } = await supabase
        .from('integrations')
        .select('id, api_credentials')
        .eq('store_id', storeId)
        .eq('platform_name', 'trendyol')
        .eq('is_active', true)
        .single();

    if (error || !integration) {
        return res.status(404).json({ error: 'No active Trendyol integration found.' });
    }

    const { sellerId, apiKey: encryptedApiKey, apiSecret: encryptedApiSecret } = integration.api_credentials;

    await productSyncQueue.add('sync', {
        integrationId: integration.id,
        sellerId,
        encryptedApiKey,
        encryptedApiSecret,
        storeId,
    });

    return res.status(202).json({ message: 'Product sync queued. This will run in the background.' });
});

module.exports = router;
