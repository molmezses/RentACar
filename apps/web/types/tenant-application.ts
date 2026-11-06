//Backend başvuryu json olarak gönderdiğinde front hangi alanalrı bekliyor bunu typescripte bildirir
export type TenantApplicationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export type TenantApplication = {
  id: string;
  companyName: string;
  slug: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  status: TenantApplicationStatus;
  tenantId: string | null;
  createdAt: string;
  updatedAt: string;
};