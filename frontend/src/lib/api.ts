import { createClient } from '@/lib/supabase/client';

/**
 * Shared API client for all frontend → backend fetch calls.
 * Reads base URL from NEXT_PUBLIC_API_URL environment variable.
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not set. Add it to .env.local.');
}

type RequestOptions = {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: unknown;
    token?: string;
};

export async function apiRequest<T = unknown>(
    path: string,
    { method = 'GET', body, token }: RequestOptions = {}
): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    let authToken = token;

    if (!authToken) {
        // Automatically fetch the current user's session from Supabase
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
            authToken = session.access_token;
        }
    }

    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        // Avoid 'Unexpected token <' — always parse as text first
        const text = await res.text();
        let message = text;
        try {
            const json = JSON.parse(text);
            message = json.error ?? json.message ?? text;
        } catch {
            // HTML or plain text error — use as-is
        }
        throw new Error(`[${res.status}] ${message}`);
    }

    return res.json() as Promise<T>;
}
