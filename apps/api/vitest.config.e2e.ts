import { defineConfig } from 'vitest/config';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import dotenv from 'dotenv';

const envPath = resolve(process.cwd(), '../../.env.test');
const testEnv = dotenv.parse(readFileSync(envPath));

const databaseUrl = testEnv['DATABASE_URL'];

if (!databaseUrl) {
  throw new Error('Test DATABASE_URL bulunamadı.');
}

const url = new URL(databaseUrl);

if (
  url.pathname !== '/rentacar_test' ||
  !['localhost', '127.0.0.1'].includes(url.hostname) ||
  url.port !== '5432'
) {
  throw new Error(
    'E2E testleri yalnızca yerel rentacar_test veritabanında çalışabilir.',
  );
}

// Test uygulaması oluşturulmadan önce bağlantıyı ayarla.
process.env.DATABASE_URL = databaseUrl;

// E2E testleri için geliştirme ortamından bağımsız JWT anahtarı.
process.env.JWT_SECRET =
  'rentacar-e2e-only-local-jwt-secret-not-for-production';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    fileParallelism: false,
  },
});
