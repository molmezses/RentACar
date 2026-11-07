# Tenant Authentication and Isolation Architecture

**Project:** RentACar
**Phase:** C1 — Architecture
**Status:** Proposed — Pending Review

## 1. Purpose

This document defines the tenant administrator account model, onboarding lifecycle, authentication boundaries, JWT design, and tenant data isolation rules for RentACar.

RentACar is a multi-tenant, white-label car rental SaaS platform.

Each approved car rental company will have one Tenant Admin account responsible for managing its own business.

The architecture must preserve existing Platform Admin functionality.

## 2. Core Architecture Decisions

### ADR-001 — Separate Administrator Account Types

The system will maintain two independent account types:

- `PlatformAdmin`: Manages the RentACar SaaS platform and tenant applications.
- `TenantAdmin`: Manages one approved car rental company.

A Tenant Admin must never receive Platform Admin privileges.

The existing PlatformAdmin model and authentication endpoints will remain supported.

### ADR-002 — One Administrator per Tenant

Each Tenant may have at most one TenantAdmin record.

The database will enforce this requirement using a unique constraint on `TenantAdmin.tenantId`.

A Tenant may temporarily have no administrator during migration, onboarding, or recovery.

The initial version will not support employees, staff accounts, multiple administrators, or tenant memberships.

### ADR-003 — Separate Business and Account Data

The `Tenant` model represents a car rental company.

The `TenantAdmin` model represents the person authorized to manage that company.

Company data, authentication credentials, and activation state must remain separate.

## 3. Proposed Data Models

### TenantAdmin

Proposed fields:

| Field | Type | Description |
|---|---|---|
| id | String | Unique administrator ID |
| tenantId | String, unique | Associated Tenant |
| email | String, unique | Normalized login email |
| passwordHash | String, nullable | Argon2 password hash |
| emailVerifiedAt | DateTime, nullable | Email verification timestamp |
| activatedAt | DateTime, nullable | Account activation timestamp |
| disabledAt | DateTime, nullable | Account deactivation timestamp |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

The Tenant relation will initially be optional from the Tenant side to support existing approved companies without administrator accounts.

### TenantActivationToken

Proposed fields:

| Field | Type | Description |
|---|---|---|
| id | String | Unique activation record |
| tenantAdminId | String | Related TenantAdmin |
| tokenHash | String, unique | Hash of the activation token |
| expiresAt | DateTime | Expiration timestamp |
| consumedAt | DateTime, nullable | Successful consumption timestamp |
| createdAt | DateTime | Creation timestamp |

Activation tokens must be generated using a cryptographically secure random source.

Raw activation tokens must not be stored in plaintext.

Token consumption and account activation must be atomic.

### Invitation Delivery — Transactional Outbox

**Decision:** RentACar will use a PostgreSQL-backed transactional outbox for Tenant Admin activation email delivery.

#### 1. Transaction Boundary

The following operations must be committed in a single database transaction:

1. Claim the pending application for approval.
2. Create the Tenant.
3. Create an inactive TenantAdmin.
4. Generate a cryptographically secure activation token.
5. Store the activation token hash and expiration timestamp.
6. Create a durable invitation delivery record.
7. Associate the approved application with the created Tenant.

External email delivery must happen after the transaction commits.

#### 2. Delivery Persistence

Introduce an `InvitationDelivery` model or equivalent durable outbox record.

Proposed fields:

| Field | Purpose |
|---|---|
| id | Unique delivery identifier |
| tenantAdminId | Associated administrator |
| activationTokenId | Associated activation token |
| recipientEmail | Destination email address |
| encryptedToken | Encrypted token required to construct the activation link |
| status | PENDING, PROCESSING, SENT, FAILED |
| attempts | Number of delivery attempts |
| nextAttemptAt | Next scheduled delivery attempt |
| lockedUntil | Recovery of abandoned processing attempts |
| sentAt | Provider acceptance timestamp |
| lastErrorCode | Safe diagnostic information |
| createdAt | Record creation timestamp |
| updatedAt | Last update timestamp |

The exact Prisma schema and naming will be finalized during C2.

#### 3. Token Protection

- Generate activation tokens using a cryptographically secure random source.
- Store only a cryptographic token hash in `TenantActivationToken`.
- Encrypt the delivery copy using authenticated encryption, such as AES-256-GCM.
- Store the encryption key outside the database.
- Never log raw tokens or decrypted activation URLs.
- Restrict decryption to the email delivery process.
- Delete the encrypted token after the provider confirms acceptance.
- Never use the JWT signing secret as the encryption key.

#### 4. Delivery Worker

The worker must:

1. Find eligible pending or retryable delivery records.
2. Claim a delivery record atomically.
3. Prevent concurrent workers from processing the same record.
4. Confirm the invitation is still valid.
5. Decrypt the activation token only when necessary.
6. Construct the configured activation URL.
7. Send the email through the configured provider.
8. Mark the delivery as SENT when the provider accepts it.
9. Remove the encrypted token after successful delivery.
10. Schedule a retry when delivery fails.

Processing locks must expire so abandoned jobs can be recovered.

#### 5. Retry Strategy

- Use bounded retries with exponential backoff.
- Reuse the same valid invitation during delivery retries.
- Avoid creating a new activation token for every transient failure.
- Treat email provider timeouts as potentially ambiguous delivery outcomes.
- Use provider idempotency features where supported.
- Accept that email delivery is at-least-once rather than guaranteed exactly-once.

If an invitation expires before successful delivery, the system must safely invalidate it and issue a new invitation through a controlled recovery flow.

#### 6. Activation Expiration

- Activation tokens expire 24 hours after issuance.
- Tokens are single-use.
- Token consumption and account activation must be atomic.
- Reissuing an invitation invalidates previous unused activation tokens.
- Invitation reissuance must require an authorized operation.
- Public endpoints must not allow unrestricted invitation generation.

#### 7. Failure Handling

- A temporary email provider failure must not roll back an approved Tenant.
- Delivery failure must be visible through persisted status.
- Failed deliveries must be recoverable.
- A permanently failed delivery must not silently activate an administrator.
- Approved Tenants without active administrators must remain identifiable.
- A valid invitation must never be reused to activate a different account.

#### 8. Implementation Ownership

- C2: Prisma persistence models and constraints.
- C3: Administrator provisioning, token generation and outbox record creation.
- C4: Email adapter, delivery worker, retries and delivery tests.
- C5: Token validation and account activation.

All implementations must use the same architecture and agreed API contracts.

## 4. Tenant Onboarding Lifecycle

The expected onboarding process is:

1. A company submits a tenant application.
2. Platform Admin reviews the application.
3. Platform Admin approves the application.
4. The backend creates the Tenant.
5. The backend provisions an inactive TenantAdmin.
6. The system records the activation invitation and delivery intent.
7. An email delivery process sends the activation link.
8. The administrator opens the activation link.
9. The backend validates the activation token.
10. The administrator creates a password.
11. The account is activated and the email is verified.
12. The administrator can log in to the tenant dashboard.

### Transaction Requirements

Tenant approval, Tenant creation, administrator provisioning, and durable invitation intent creation must be designed to preserve database consistency.

External email sending must not occur inside an open database transaction.

Duplicate or concurrent approval attempts must not create duplicate Tenant or TenantAdmin records.

### Existing Approved Tenants

Existing approved Tenant records without an administrator require a safe onboarding/backfill process.

The system must not reapprove an application merely to create an administrator account.

## 5. Authentication Boundaries

### Platform Admin

Existing endpoints:

- `POST /auth/login`
- `GET /auth/me`

These endpoints must remain compatible with the existing Super Admin dashboard.

### Tenant Admin

Proposed endpoints:

- `POST /tenant-auth/activate`
- `POST /tenant-auth/login`
- `GET /tenant-auth/me`

Tenant authentication will use a dedicated controller and service.

The frontend will use a separate Tenant Admin session cookie.

JWTs must not be stored in browser localStorage.

## 6. JWT Architecture

### Platform Admin Token

Existing claims include:

- `sub`
- `type: platform_admin`

The current implementation uses HS256 and a 15-minute access token lifetime.

### Tenant Admin Token

Proposed claims:

- `sub`: TenantAdmin ID
- `tenantId`: Tenant ID
- `type: tenant_admin`
- `aud`: rentacar-tenant
- `iss`: rentacar-api
- `iat`: issued-at timestamp
- `exp`: expiration timestamp

The token must be signed and validated using approved server-side configuration.

Platform Admin and Tenant Admin tokens should use separate signing secrets and explicit token-type validation.

Audience and issuer must be validated for the relevant security domain.

The introduction of stronger Platform Admin token verification must include a backward-compatible or explicitly coordinated session migration.

## 7. Tenant Authorization

A Tenant Admin must access only resources belonging to the associated Tenant.

The backend must:

- Validate the tenant administrator's JWT.
- Confirm the administrator still exists.
- Verify the administrator account is active.
- Confirm the associated Tenant is authorized to operate.
- Resolve the trusted tenant context server-side.
- Scope all tenant-owned data queries to that tenant.

Tenant IDs supplied by clients must not grant access.

The presence of a resource ID does not prove ownership.

Future vehicle, reservation, and customer modules must enforce tenant ownership for reads, creates, updates, and deletes.

Cross-tenant resource access should use safe error behavior that avoids unnecessarily revealing whether another tenant's resource exists.

## 8. Tenant Status and Account Status

The existing TenantStatus values are:

- PENDING
- APPROVED
- REJECTED

For the initial version, only an APPROVED Tenant with an eligible active TenantAdmin may access protected tenant operations.

Account eligibility requires:

- Successful activation
- Verified email
- A configured password hash
- No active account disablement

A suspended Tenant state is not currently present in the Prisma schema. Suspension support must be introduced through an explicit future schema decision rather than assumed to exist.

## Session and Activation Policies

### Activation Token

- Activation invitations expire 24 hours after issuance.
- Each activation token is cryptographically random and single-use.
- Expired invitations require a new, securely issued invitation.
- Invitation regeneration invalidates previous unused invitations.
- Activation token verification must be enforced server-side.
- Activation and token consumption must occur atomically.

### Tenant Admin Session

- Tenant Admin access tokens expire after 15 minutes.
- Refresh tokens are out of scope for the initial version.
- The frontend stores the Tenant Admin session in a Secure, HttpOnly cookie with an appropriate SameSite policy.
- Platform Admin and Tenant Admin cookies must have separate names and appropriate scopes.
- Cookie-based state-changing requests require CSRF protection appropriate to the application architecture.
- Expired sessions require the administrator to log in again.
- Logout clears the corresponding frontend session cookie.
- Without server-side revocation, a previously issued JWT remains technically valid until expiration. Protected endpoints must additionally check the current administrator and Tenant status.

### Administrator Email Uniqueness

- TenantAdmin email addresses must be normalized before persistence.
- TenantAdmin emails must be unique across all Tenants.
- A single administrator account cannot manage multiple Tenants in the initial version.
- Duplicate email conflicts must not cause existing accounts to be reassigned.
- The approval workflow must handle administrator email conflicts without creating inconsistent Tenant or application records.
- Existing PlatformAdmin accounts remain in a separate authentication domain.
- Any future support for multi-tenant administrators requires a new architecture decision.
### Authentication Security

- Platform Admin and Tenant Admin tokens must be validated against their expected signing configuration and claims.
- Tenant Admin tokens must not be accepted by Platform Admin endpoints.
- Platform Admin tokens must not be accepted by Tenant Admin endpoints.
- The existing Platform Admin authentication flow must remain functional during migration.
- Rate limiting and authentication abuse protection are required before production deployment.

## 9. Security Requirements

- Hash passwords using Argon2.
- Never store plaintext passwords.
- Hash activation tokens before persistence.
- Expire activation tokens.
- Prevent token reuse.
- Prevent concurrent double activation.
- Avoid account enumeration in authentication responses.
- Never log raw passwords, authentication JWTs, or activation secrets.
- Separate Platform Admin and Tenant Admin authentication.
- Use secure HttpOnly cookies for frontend sessions.
- Configure production cookie security and CSRF protections appropriately.
- Apply login rate limiting and abuse protection before production deployment.
- Enforce server-side tenant isolation.
- Do not expose sensitive account fields in API responses.

## 10. Failure and Recovery Scenarios

The implementation must explicitly handle:

- Duplicate administrator provisioning
- Duplicate or concurrent approvals
- Email delivery failure
- Email delivery retries
- Expired activation invitations
- Previously consumed activation tokens
- Invalid passwords
- Disabled administrator accounts
- Tenant status changes
- Expired or invalid JWTs
- Database failures during onboarding
- Existing approved Tenants without administrator accounts

Invitation regeneration and account recovery must not permit unauthorized account takeover.

## 11. Implementation Ownership

| Issue | Responsibility |
|---|---|
| C1 | Architecture and security decisions |
| C2 | Prisma models and migrations |
| C3 | Administrator provisioning and invitation lifecycle |
| C4 | Email delivery |
| C5 | Account activation API |
| C6 | Login and session API |
| C7 | Tenant authorization and isolation |
| C8 | Activation and login frontend |
| C9 | Protected tenant dashboard |
| C10 | End-to-end integration and security tests |

## 12. Out of Scope

- Employee accounts
- Role hierarchy and RBAC
- TenantMembership
- Multiple administrators per company
- Tenant account switching
- Vehicle management
- Reservation management
- Customer management
- Billing and subscription management

## 13. Definition of Done

C1 is complete when:

- The architecture document is committed.
- Data relationships and constraints are agreed upon.
- Onboarding and invitation security are defined.
- JWT authentication boundaries are approved.
- Tenant isolation rules are documented.
- Existing Tenant migration requirements are documented.
- API contracts and implementation dependencies are understood.
- The other developer reviews and approves the architecture PR.