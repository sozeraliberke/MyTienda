const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const authMiddleware = require('../middlewares/auth.middleware');
const TrendyolService = require('../services/TrendyolService');
const { decrypt } = require('../utils/encryption');

const router = express.Router();

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
 * GET /api/qna
 * Source: QnA_Integration → "Müşteri Sorularını Çekme"
 */
router.get('/qna', authMiddleware, async (req, res) => {
    try {
        const trendyol = await getTrendyol(req.supabase, req.store.id);
        const data = await trendyol.getQuestions();
        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/qna/:id/answer
 * Source: QnA_Integration → "Müşteri Sorularını Cevaplama"
 */
router.post('/qna/:id/answer', authMiddleware, async (req, res) => {
    const { answer } = req.body;
    if (!answer || answer.trim().length === 0) {
        return res.status(400).json({ error: 'Answer text is required.' });
    }

    try {
        const trendyol = await getTrendyol(req.supabase, req.store.id);
        const data = await trendyol.answerQuestion(req.params.id, answer);
        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
