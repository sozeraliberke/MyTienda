const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * PUT /api/store/onboarding
 * Updates the store's name, logo URL, and currency.
 * Protected by authMiddleware.
 */
router.put('/store/onboarding', authMiddleware, async (req, res) => {
    const { name, logo_url, currency } = req.body;
    const storeId = req.store.id;

    if (!name) {
        return res.status(400).json({ error: 'Store name is required.' });
    }

    const supabase = req.supabase;

    const { data, error } = await supabase
        .from('stores')
        .update({ name, logo_url, currency, updated_at: new Date().toISOString() })
        .eq('id', storeId)
        .select()
        .single();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Store updated successfully.', store: data });
});

module.exports = router;
