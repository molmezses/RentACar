import dotenv from 'dotenv';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'prisma/config';

// Test ortamı değişkenlerini ayrı dosyadan oku.
const envFile = new URL('../../.env.test', import.meta.url);

const testEnv = dotenv.parse(readFileSync(envFile));

const databaseUrl = testEnv['DATABASE_URL'];

if (!databaseUrl) {
  throw new Error('Test DATABASE_URL bulunamadı.');
}

const parsedUrl = new URL(databaseUrl);



// Yanlış veritabanına bağlanmayı engelle.
if (
  parsedUrl.pathname !== '/rentacar_test' ||
  !['localhost', '127.0.0.1'].includes(parsedUrl.hostname) ||
  parsedUrl.port !== '5432'
) {
  throw new Error(
    'Güvenlik hatası: Test işlemleri yalnızca yerel rentacar_test veritabanında çalışabilir.',
  );
}

export default defineConfig({
  schema: 'prisma/schema.prisma',

  migrations: {
    path: 'prisma/migrations',
  },

  datasource: {
    url: databaseUrl,
  },
});