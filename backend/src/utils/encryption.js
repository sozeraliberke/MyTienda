const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';

function getKey() {
    const secret = process.env.ENCRYPTION_SECRET;
    if (!secret) throw new Error('ENCRYPTION_SECRET environment variable is not set.');
    // Derive a 32-byte key from the secret
    return crypto.createHash('sha256').update(String(secret)).digest();
}

/**
 * Encrypts a plaintext string using AES-256-CBC.
 * @param {string} text - The plaintext to encrypt.
 * @returns {string} - "iv:ciphertext" in hex format.
 */
function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
    const encrypted = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypts an AES-256-CBC encrypted payload.
 * @param {string} payload - "iv:ciphertext" in hex format.
 * @returns {string} - The original plaintext.
 */
function decrypt(payload) {
    const [ivHex, encryptedHex] = payload.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return decrypted.toString('utf8');
}

module.exports = { encrypt, decrypt };
