import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import {
  decryptStorageState,
  encryptStorageState,
} from '../../dist/automation/platforms/substack.js';

const state = { cookies: [{ name: 'session', value: 'private', domain: '.substack.com', path: '/', expires: -1, httpOnly: true, secure: true, sameSite: 'Lax' }], origins: [] };

describe('Substack encrypted state', () => {
  it('round-trips storage state with AES-256-GCM', () => {
    const key = randomBytes(32).toString('base64');
    const encrypted = encryptStorageState(state, key);
    assert.equal(JSON.stringify(encrypted).includes('private'), false);
    assert.deepEqual(decryptStorageState(encrypted, key), state);
  });

  it('rejects an incorrect encryption key', () => {
    const encrypted = encryptStorageState(state, randomBytes(32).toString('base64'));
    assert.throws(() => decryptStorageState(encrypted, randomBytes(32).toString('base64')), /decrypt/i);
  });
});
