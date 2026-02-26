/**
 * @typedef {Object} Store
 * @property {string} id - UUID
 * @property {string} name 
 * @property {string} owner_id - UUID (Auth)
 * @property {string} subscription_plan
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Product
 * @property {string} id - UUID
 * @property {string} store_id - UUID (Store)
 * @property {string} name
 * @property {string} description
 * @property {string} brand
 * @property {Object} attributes - JSONB
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Variant
 * @property {string} id - UUID
 * @property {string} product_id - UUID (Product)
 * @property {string} sku
 * @property {string} barcode
 * @property {number} price
 * @property {string} stock_code
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Order
 * @property {string} id - UUID
 * @property {string} store_id - UUID (Store)
 * @property {string|null} customer_id - UUID
 * @property {string|null} integration_id - UUID
 * @property {number} total_amount
 * @property {string} status
 * @property {string} original_order_number
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} AutomationRule
 * @property {string} id - UUID
 * @property {string} store_id - UUID
 * @property {string} name
 * @property {string} trigger_type
 * @property {Object} trigger_value - JSONB
 * @property {string} action_type
 * @property {boolean} is_active
 * @property {string} created_at
 * @property {string} updated_at
 */

module.exports = {};
