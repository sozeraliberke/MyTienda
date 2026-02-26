process.env.ENCRYPTION_SECRET = 'test-secret-key-for-unit-tests-only-32ch';

const { encrypt, decrypt } = require('../src/utils/encryption');

describe('AES-256 Encryption Utility', () => {
    it('encrypts a string to a non-readable ciphertext', () => {
        const plaintext = 'my-trendyol-api-key-12345';
        const ciphertext = encrypt(plaintext);
        expect(ciphertext).not.toBe(plaintext);
        expect(ciphertext).toContain(':'); // iv:ciphertext format
    });

    it('decrypts back to the original plaintext', () => {
        const plaintext = 'my-trendyol-secret-67890';
        const ciphertext = encrypt(plaintext);
        const decrypted = decrypt(ciphertext);
        expect(decrypted).toBe(plaintext);
    });

    it('produces different ciphertext for the same input (random IV)', () => {
        const plaintext = 'same-input';
        const cipher1 = encrypt(plaintext);
        const cipher2 = encrypt(plaintext);
        // Due to random IV, the two ciphertexts must differ
        expect(cipher1).not.toBe(cipher2);
        // But both must decrypt to the original
        expect(decrypt(cipher1)).toBe(plaintext);
        expect(decrypt(cipher2)).toBe(plaintext);
    });

    it('throws if ENCRYPTION_SECRET is not set', () => {
        const original = process.env.ENCRYPTION_SECRET;
        delete process.env.ENCRYPTION_SECRET;
        expect(() => encrypt('anything')).toThrow('ENCRYPTION_SECRET');
        process.env.ENCRYPTION_SECRET = original;
    });
});
