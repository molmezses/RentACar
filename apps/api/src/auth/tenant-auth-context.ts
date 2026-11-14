
import { UnauthorizedException } from '@nestjs/common';

import type { TenantAuthenticatedRequest } from './guards/tenant-jwt-auth.guard.js';

export type TenantAuthContext = {
  adminId: string;
  tenantId: string;
  sessionId: string;
  email: string;
};

export function getTenantAuthContext(
  request: TenantAuthenticatedRequest,
): TenantAuthContext {
  const admin = request.tenantAdmin;

  if (!admin) {
    throw new UnauthorizedException(
      'Doğrulanmış şirket oturumu bulunamadı.',
    );
  }

  return {
    adminId: admin.id,
    tenantId: admin.tenantId,
    sessionId: admin.sessionId,
    email: admin.email,
  };
}
