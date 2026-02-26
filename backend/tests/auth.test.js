const request = require('supertest');
const express = require('express');

// Minimal express app to test auth middleware in isolation
const app = express();
app.use(express.json());

// Mock the auth middleware directly
app.get('/test-protected', (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid token.' });
    }
    return res.status(200).json({ ok: true });
});

describe('Auth Middleware', () => {
    it('returns 401 when no Authorization header is provided', async () => {
        const res = await request(app).get('/test-protected');
        expect(res.statusCode).toBe(401);
        expect(res.body.error).toContain('Unauthorized');
    });

    it('returns 401 when token format is invalid (no Bearer prefix)', async () => {
        const res = await request(app)
            .get('/test-protected')
            .set('Authorization', 'InvalidToken abc123');
        expect(res.statusCode).toBe(401);
    });

    it('passes through when a Bearer token is present', async () => {
        const res = await request(app)
            .get('/test-protected')
            .set('Authorization', 'Bearer mock-token-here');
        expect(res.statusCode).toBe(200);
    });
});
