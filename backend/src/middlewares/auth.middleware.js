const { createClient } = require('@supabase/supabase-js');

/**
 * Auth middleware for Express routes.
 * Validates Authorization: Bearer <token> header via Supabase.
 * Attaches user and store to req.
 */
async function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid token.' });
    }

    const token = authHeader.split(' ')[1];

    // Create a Supabase client acting as the authenticated user
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY,
        {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        }
    );

    // Validate the JWT token
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or expired token.' });
    }

    // Find the user's store (now respects RLS because we are authenticated!)
    const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', user.id)
        .single();

    if (storeError || !store) {
        return res.status(403).json({ error: 'Forbidden: No store associated with this user.' });
    }

    // Attach user, store, AND the authenticated Supabase client to the request
    req.user = user;
    req.store = store;
    req.supabase = supabase;

    next();
}

module.exports = authMiddleware;
