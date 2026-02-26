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

    // Create a Supabase client using the service role for server-side validation
    const supabaseAdmin = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
    );

    // Validate the JWT token
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or expired token.' });
    }

    // Find the user's store
    const { data: store, error: storeError } = await supabaseAdmin
        .from('stores')
        .select('*')
        .eq('owner_id', user.id)
        .single();

    if (storeError || !store) {
        return res.status(403).json({ error: 'Forbidden: No store associated with this user.' });
    }

    // Attach user and store to request object
    req.user = user;
    req.store = store;

    next();
}

module.exports = authMiddleware;
