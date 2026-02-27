require('dotenv').config();
const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const { createClient } = require('@supabase/supabase-js');
const TrendyolService = require('../services/TrendyolService');
const TrendyolAdapter = require('../services/adapters/TrendyolAdapter');
const { decrypt } = require('../utils/encryption');

// Fail fast if REDIS_URL is not configured — no silent localhost fallback
if (!process.env.REDIS_URL) {
    throw new Error(
        '[productSyncQueue] REDIS_URL is not set in your .env file. ' +
        'Please add it (e.g. Upstash Redis URL) before starting the server.'
    );
}

// Redis connection — sourced exclusively from REDIS_URL in .env
const connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,   // Required for some Upstash/TLS setups
});

// BullMQ Queue — jobs are added by the /sync-products endpoint
const productSyncQueue = new Queue('product-sync', { connection });

// BullMQ Worker — runs in background, paginates Trendyol and upserts to Supabase
const productSyncWorker = new Worker(
    'product-sync',
    async (job) => {
        const { integrationId, sellerId, encryptedApiKey, encryptedApiSecret, storeId } = job.data;

        const apiKey = decrypt(encryptedApiKey);
        const apiSecret = decrypt(encryptedApiSecret);

        const trendyol = new TrendyolService({ sellerId, apiKey, apiSecret });
        // Background workers need the Service Role Key to bypass RLS
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
        );

        let pageKey = null;
        let pageCount = 0;

        console.log(`[ProductSyncWorker] Starting sync for integration ${integrationId}`);

        do {
            const response = await trendyol.getProducts(pageKey);
            const items = response.content || [];
            pageKey = response.nextPageKey || null;
            pageCount++;

            console.log(`[ProductSyncWorker] Page ${pageCount}: ${items.length} products`);

            for (const item of items) {
                const barcode = item.barcode || null;

                // Barcode-based matching rule (per plan_04_integration.md)
                let variantId = null;
                if (barcode) {
                    const { data: existingVariant } = await supabase
                        .from('variants')
                        .select('id')
                        .eq('barcode', barcode)
                        .single();

                    if (existingVariant) {
                        // Variant already exists — only add/update listing
                        variantId = existingVariant.id;
                    }
                }

                if (!variantId) {
                    // Create new product and variant
                    const productData = TrendyolAdapter.toProduct(item);
                    const { data: newProduct } = await supabase
                        .from('products')
                        .insert({ ...productData, store_id: storeId })
                        .select('id')
                        .single();

                    if (newProduct) {
                        const variantData = TrendyolAdapter.toVariant(item);
                        const { data: newVariant } = await supabase
                            .from('variants')
                            .insert({ ...variantData, product_id: newProduct.id })
                            .select('id')
                            .single();

                        variantId = newVariant?.id;
                    }
                }

                if (variantId) {
                    // Upsert the product listing
                    const listingData = TrendyolAdapter.toListing(item, variantId, integrationId);
                    await supabase
                        .from('product_listings')
                        .upsert(listingData, { onConflict: 'variant_id,integration_id' });
                }
            }
        } while (pageKey);

        console.log(`[ProductSyncWorker] Sync complete — ${pageCount} pages processed`);
        return { pagesProcessed: pageCount };
    },
    { connection }
);

productSyncWorker.on('failed', (job, err) => {
    console.error(`[ProductSyncWorker] Job ${job?.id} failed:`, err.message);
});

module.exports = { productSyncQueue };
