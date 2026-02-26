/**
 * TrendyolAdapter
 * Maps raw Trendyol API data → MyTienda standard database objects.
 * Barcode-based matching rules (per plan_04_integration.md):
 *   - If barcode exists in variants → add listing only
 *   - If not → create new product + variant
 */

class TrendyolAdapter {
    /**
     * Maps a Trendyol product item to a MyTienda `products` row.
     * @param {Object} item - Raw Trendyol product object
     * @returns {{ name, brand, attributes }}
     */
    toProduct(item) {
        return {
            name: item.productName || item.title || '',
            brand: item.brandName || '',
            attributes: {
                trendyol_brand_id: item.brandId,
                trendyol_category_id: item.categoryId,
                trendyol_status: item.approved ? 'approved' : item.archived ? 'archived' : 'rejected',
                ...(item.attributes || {}),
            },
        };
    }

    /**
     * Maps a Trendyol product item to a MyTienda `variants` row.
     * @param {Object} item - Raw Trendyol product item
     * @returns {{ sku, barcode, price, compare_at_price, stock_code }}
     */
    toVariant(item) {
        return {
            sku: item.stockCode || item.barcode || `TY-${item.id}`,
            barcode: item.barcode || null,
            price: parseFloat(item.salePrice) || 0,
            compare_at_price: parseFloat(item.listPrice) || null,
            stock_code: item.stockCode || null,
        };
    }

    /**
     * Maps a Trendyol product item to a MyTienda `product_listings` row.
     * @param {Object} item - Raw Trendyol product item
     * @param {string} variantId - UUID of the variant in our DB
     * @param {string} integrationId - UUID of the integration in our DB
     * @returns {{ variant_id, integration_id, remote_product_id, remote_sku, sync_status }}
     */
    toListing(item, variantId, integrationId) {
        return {
            variant_id: variantId,
            integration_id: integrationId,
            remote_product_id: String(item.id || item.productId || ''),
            remote_sku: item.stockCode || item.barcode || '',
            sync_status: 'synced',
        };
    }
}

module.exports = new TrendyolAdapter();
