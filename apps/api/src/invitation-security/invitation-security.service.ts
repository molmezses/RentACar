
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InvitationSecurityService {
  private readonly encryptionKey: Buffer;

  constructor(private readonly configService: ConfigService) {
    const keyHex = this.configService.getOrThrow<string>(
      'TENANT_INVITATION_ENCRYPTION_KEY',
    );

    if (!/^[0-9a-fA-F]{64}$/.test(keyHex)) {
      throw new Error(
        'TENANT_INVITATION_ENCRYPTION_KEY must be 32 bytes encoded as hexadecimal.',
      );
    }

    this.encryptionKey = Buffer.from(keyHex, 'hex');
  }

  generateToken(): string {
    return randomBytes(32).toString('base64url');
  }

  hashToken(token: string): string {
    return createHash('sha256')
      .update(token, 'utf8')
      .digest('hex');
  }

  encryptToken(token: string): string {
    const iv = randomBytes(12);

    const cipher = createCipheriv(
      'aes-256-gcm',
      this.encryptionKey,
      iv,
    );

    const ciphertext = Buffer.concat([
      cipher.update(token, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return [
      'v1',
      iv.toString('base64url'),
      authTag.toString('base64url'),
      ciphertext.toString('base64url'),
    ].join('.');
  }

  decryptToken(encryptedToken: string): string {
    const parts = encryptedToken.split('.');

    if (parts.length !== 4 || parts[0] !== 'v1') {
      throw new Error('Invalid invitation token format.');
    }

    const [, encodedIv, encodedAuthTag, encodedCiphertext] = parts;

    const iv = Buffer.from(encodedIv, 'base64url');
    const authTag = Buffer.from(encodedAuthTag, 'base64url');
    const ciphertext = Buffer.from(encodedCiphertext, 'base64url');

    if (iv.length !== 12 || authTag.length !== 16) {
      throw new Error('Invalid invitation token format.');
    }

    const decipher = createDecipheriv(
      'aes-256-gcm',
      this.encryptionKey,
      iv,
    );

    decipher.setAuthTag(authTag);

    const plaintext = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return plaintext.toString('utf8');
  }
}
