
import { randomBytes } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { describe, expect, it } from 'vitest';

import { InvitationSecurityService } from './invitation-security.service.js';

const createService = (key?: string): InvitationSecurityService => {
  const encryptionKey = key ?? randomBytes(32).toString('hex');

  const configService = {
    getOrThrow: (name: string) => {
      if (name === 'TENANT_INVITATION_ENCRYPTION_KEY') {
        return encryptionKey;
      }

      throw new Error(`Unexpected configuration key: ${name}`);
    },
  } as ConfigService;

  return new InvitationSecurityService(configService);
};

describe('InvitationSecurityService', () => {
  it('generates random 256-bit URL-safe tokens', () => {
    const service = createService();

    const firstToken = service.generateToken();
    const secondToken = service.generateToken();

    expect(firstToken).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(secondToken).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(firstToken).not.toBe(secondToken);

    expect(Buffer.from(firstToken, 'base64url')).toHaveLength(32);
  });

  it('generates deterministic SHA-256 hashes', () => {
    const service = createService();
    const token = service.generateToken();

    const firstHash = service.hashToken(token);
    const secondHash = service.hashToken(token);

    expect(firstHash).toBe(secondHash);
    expect(firstHash).toMatch(/^[a-f0-9]{64}$/);
    expect(firstHash).not.toBe(token);
  });

  it('encrypts and decrypts activation tokens', () => {
    const service = createService();
    const token = service.generateToken();

    const encrypted = service.encryptToken(token);
    const decrypted = service.decryptToken(encrypted);

    expect(encrypted).toMatch(/^v1\./);
    expect(encrypted).not.toContain(token);
    expect(decrypted).toBe(token);
  });

  it('uses a fresh IV for every encryption', () => {
    const service = createService();
    const token = service.generateToken();

    const first = service.encryptToken(token);
    const second = service.encryptToken(token);

    expect(first).not.toBe(second);
    expect(service.decryptToken(first)).toBe(token);
    expect(service.decryptToken(second)).toBe(token);
  });

  it('rejects modified ciphertext', () => {
    const service = createService();
    const token = service.generateToken();
    const encrypted = service.encryptToken(token);

    const parts = encrypted.split('.');
    const ciphertext = Buffer.from(parts[3], 'base64url');

    ciphertext[0] ^= 0xff;
    parts[3] = ciphertext.toString('base64url');

    expect(() => service.decryptToken(parts.join('.'))).toThrow();
  });

  it('rejects decryption with a different key', () => {
    const firstService = createService();
    const secondService = createService();

    const token = firstService.generateToken();
    const encrypted = firstService.encryptToken(token);

    expect(() => secondService.decryptToken(encrypted)).toThrow();
  });

  it('rejects invalid encryption keys', () => {
    expect(() => createService('short-key')).toThrow(
      'TENANT_INVITATION_ENCRYPTION_KEY must be 32 bytes encoded as hexadecimal.',
    );
  });

  it('rejects malformed encrypted token formats', () => {
    const service = createService();

    expect(() => service.decryptToken('invalid')).toThrow(
      'Invalid invitation token format.',
    );

    expect(() => service.decryptToken('v2.abc.def.ghi')).toThrow(
      'Invalid invitation token format.',
    );
  });
});
