
# Vehicle API Contract — MVP v1

Status: Proposed for F1 review
Owner: Mustafa
Related: D1, D2, D3, D4, F1
Implementation: Not yet implemented

## 1. Purpose

Define a consistent Vehicle API contract for the NestJS backend and Next.js Tenant Admin frontend.

Sources:
- docs/architecture/vehicle-management.md
- apps/web/types/vehicle.ts
- apps/web/lib/vehicles/list-utils.ts
- apps/web/components/vehicles/VehicleForm.tsx

## 2. Security

Every endpoint requires a valid Tenant Admin session.

- Use TenantJwtAuthGuard.
- Resolve tenantId using getTenantAuthContext(request).
- Never accept tenantId as an authorization input.
- Scope every Vehicle database query by tenantId.
- Return non-disclosing 404 responses for missing or foreign-tenant vehicles.
- Platform Admin credentials do not authorize Tenant Vehicle operations.

## 3. Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /tenant/vehicles | List tenant vehicles |
| GET | /tenant/vehicles/:id | Vehicle detail |
| POST | /tenant/vehicles | Create vehicle |
| PATCH | /tenant/vehicles/:id | Update vehicle |
| PATCH | /tenant/vehicles/:id/status | Activate/deactivate vehicle |

The initial MVP has no DELETE endpoint.

## 4. Vehicle Identity

- id: server-generated identifier
- tenantId: internal ownership field, not part of public Tenant Vehicle responses
- plate: required, normalized, unique within tenant
- make: required
- model: required
- modelYear: required
- category: required

Optional fields:
- vin
- internalCode
- trim
- color

## 5. Technical Fields

Required:
- transmission
- fuelType
- seatCount
- odometerKm

Optional:
- doorCount
- hasAirConditioning
- currentLocationLabel
- notes

The nullable hasAirConditioning field requires an explicit frontend UX decision: unknown versus false must not be silently conflated.

## 6. Commercial Fields

- dailyPrice: required decimal string
- currency: required, TRY/USD/EUR
- depositAmount: optional decimal string or null
- includedMileageKm: optional integer or null
- extraKmPrice: optional decimal string or null

Use Prisma Decimal(12,2) for monetary persistence.

Return money values as strings, for example "1500.00".

Do not use JavaScript Number for billing calculations.

## 7. Enumerations

FleetStatus:
- ACTIVE
- INACTIVE

VehicleCategory:
- ECONOMY
- COMPACT
- SEDAN
- SUV
- LUXURY
- VAN
- OTHER

Transmission:
- MANUAL
- AUTOMATIC

FuelType:
- PETROL
- DIESEL
- HYBRID
- ELECTRIC
- LPG
- OTHER

Currency:
- TRY
- USD
- EUR

## 8. GET /tenant/vehicles

Supported query parameters:

- page: integer, default 1
- limit: integer, default 20, maximum 100
- search: plate/make/model
- category: VehicleCategory
- fleetStatus: FleetStatus
- transmission: Transmission
- fuelType: FuelType
- sortBy: createdAt, make, model, plate, dailyPrice
- sortOrder: asc, desc

Defaults:
- sortBy: createdAt
- sortOrder: desc

Filters and sorting must run on the server before pagination.

Response:

{
  "items": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}

List items must use a documented, consistent Vehicle summary representation.

## 9. Frontend Sort Mapping

| UI option | API sortBy | API sortOrder |
|---|---|---|
| newest | createdAt | desc |
| make | make | asc |
| priceAsc | dailyPrice | asc |
| priceDesc | dailyPrice | desc |

Important: The current demo implementation uses modelYear for "newest". This must be changed during real API integration.

## 10. POST /tenant/vehicles

CreateVehicleInput follows the approved D1 field matrix.

The server assigns:
- id
- tenantId
- fleetStatus (ACTIVE by default)
- createdAt
- updatedAt

Unknown/system-owned properties must be rejected.

Success: 201 with Vehicle detail response.

## 11. PATCH /tenant/vehicles/:id

Only allowlisted fields can be modified.

- Omitted property: keep existing value.
- Explicit null: clear a nullable property.
- Required properties cannot be set to null.
- Empty update payload is invalid.
- tenantId, id, timestamps and fleetStatus are immutable through this endpoint.

Return the updated Vehicle detail.

## 12. PATCH /tenant/vehicles/:id/status

Request:

{
  "fleetStatus": "INACTIVE"
}

Only ACTIVE and INACTIVE are valid.

Repeated requests for the same state are idempotent.

Changing fleet status does not change reservation availability.

## 13. Error Responses

- 400: invalid request or validation
- 401: missing/invalid session
- 403: authenticated but forbidden
- 404: vehicle not found or belongs to another tenant
- 409: duplicate vehicle identifier or business conflict
- 500: unexpected server failure

Do not expose raw SQL/Prisma errors or foreign-tenant record details.

## 14. Future Modules — Out of Scope

- Vehicle image upload
- Physical vehicle deletion
- Reservation-aware availability
- Rental agreements and handover
- Customer/driver management
- Advanced pricing and payments
- Maintenance and inspection workflows

## 15. Coordination

Backend implementation: F2–F5 and G4.
Frontend integration: G1–G6 and F7.

Any breaking contract change requires coordination between Mustafa and Eda.

Update docs/team/PROJECT_STATUS.md when the contract is approved and merged.
