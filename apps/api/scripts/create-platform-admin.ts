import { NestFactory } from '@nestjs/core';
import { input, password } from '@inquirer/prompts';
import * as argon2 from 'argon2';

import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  try {
    const prisma = app.get(PrismaService);

    // İlk yönetici kurulumundan sonra yeni hesap oluşturma.
    const adminCount = await prisma.platformAdmin.count();

    if (adminCount > 0) {
      console.log('Platform yöneticisi zaten mevcut.');
      return;
    }

    const email = (
      await input({
        message: 'Yönetici e-posta adresi:',
        validate: (value) =>
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ||
          'Geçerli bir e-posta adresi girin.',
      })
    ).trim().toLowerCase();

    const plainPassword = await password({
      message: 'Yönetici şifresi (en az 12 karakter):',
      mask: '*',
      toggleMask: false,
      validate: (value) =>
        value.length >= 12 || 'Şifre en az 12 karakter olmalıdır.',
    });

    const passwordConfirmation = await password({
      message: 'Şifreyi tekrar girin:',
      mask: '*',
      toggleMask: false,
    });

    if (plainPassword !== passwordConfirmation) {
      console.error('Şifreler eşleşmiyor. İşlem iptal edildi.');
      return;
    }

    const existingAdmin = await prisma.platformAdmin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.error('Bu e-posta adresi zaten kayıtlı.');
      return;
    }

    const passwordHash = await argon2.hash(plainPassword, {
      type: argon2.argon2id,
    });

    await prisma.platformAdmin.create({
      data: {
        email,
        passwordHash,
      },
    });

    console.log('Super Admin hesabı başarıyla oluşturuldu.');
  } finally {
    await app.close();
  }
}

main().catch(() => {
  console.error('Yönetici oluşturulurken hata meydana geldi.');
  process.exitCode = 1;
});