
import { describe, expect, it } from 'vitest';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

import { UpdateVehicleStatusDto } from './update-vehicle-status.dto.js';

describe('UpdateVehicleStatusDto', () => {
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });

  const validate = (value: unknown) =>
    pipe.transform(value, {
      type: 'body',
      metatype: UpdateVehicleStatusDto,
    });

  it('ACTIVE durumunu kabul eder', async () => {
    const result = await validate({ fleetStatus: 'ACTIVE' });

    expect(result).toBeInstanceOf(UpdateVehicleStatusDto);
    expect(result.fleetStatus).toBe('ACTIVE');
  });

  it('INACTIVE durumunu kabul eder', async () => {
    const result = await validate({ fleetStatus: 'INACTIVE' });

    expect(result.fleetStatus).toBe('INACTIVE');
  });

  it('geçersiz durum değerini reddeder', async () => {
    await expect(
      validate({ fleetStatus: 'PENDING' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('sayısal durum değerini reddeder', async () => {
    await expect(
      validate({ fleetStatus: 123 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('fleetStatus eksikse isteği reddeder', async () => {
    await expect(
      validate({}),
    ).rejects.toThrow(BadRequestException);
  });

  it('fazladan tenantId alanını reddeder', async () => {
    await expect(
      validate({
        fleetStatus: 'ACTIVE',
        tenantId: 'tenant_b',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
