Vehicle Management — Product Research & Architecture
Project: RentACar
Issue: D1 — Vehicle Management Product Research & Architecture
Phase: D — Vehicle Management
Type: Documentation / Product Research / Architecture
Status: Proposed — Pending Mustafa's review and approval
Owner: Eda
Last drafted: 2026-11-10
Scope and decision status: This is a proposed implementation blueprint, not an implemented feature or an approved specification. The choices labeled Recommended for MVP are pragmatic starting proposals intended for a team learning the architecture while building the product. Reviewers may change them before D2–D4. No Prisma migration, authentication change, endpoint, or UI implementation is authorized by this document alone.

1. Executive Summary
RentACar is a multi-tenant, white-label SaaS platform for independent car rental businesses. An application is submitted through the platform application process; after platform-admin approval a Tenant exists and an authorized TenantAdmin manages that business. The application/approval form is outside D1. D1 describes how an approved business registers and manages its vehicles, not how it applies to join RentACar.

The proposed first vehicle-management release is intentionally small: create, list, inspect, edit and activate/deactivate vehicles; store core identity, specifications, odometer, a base daily rate and optional deposit; support useful fleet search and pagination; enforce tenant isolation on every query. Vehicle photo handling is documented and proposed as a separate, bounded enhancement unless an upload/storage capability is ready before implementation. Actual reservation-aware availability, on-rent transitions, maintenance operations, contracts, customers, payments and financial reporting belong to their respective future modules.

Key architectural distinction: active fleet membership is not the same as being free for a date range. A vehicle can be active yet booked for tomorrow. The initial module must not claim booking-aware availability until reservation/rental/blocked-period data and conflict rules exist.

Source material includes the historical Rent Centric V2.0 operations manual, HQ Rental Software's public knowledge base, RentOkey vendor documentation, vehicle-inspection workflow references, and customer-facing rental sites. These inform requirements but are not evidence of the current behavior of each vendor's private admin app.

Deliverable: This document only, docs/architecture/vehicle-management.md. Review gate: Mustafa approves this proposal before Phase D implementation or PR merge.
2. Industry and Competitor Research
2.1 Scope and evidence quality
Public customer booking pages are useful for understanding vehicle attributes shown to renters, but do not establish how internal fleet-management screens work. Vendor marketing pages describe advertised functionality; a vendor user manual gives stronger evidence of a documented workflow, although the version may be old. None is a substitute for current Turkish legal requirements.
Product / source	Official source	Relevant capabilities	Strengths	Limitations	Suitable for RentACar	Simplify / postpone
Rent Centric V2.0	Official 2011 user manual	Vehicle creation, fleet lookup, active/inactive state, vehicle types and locations, rates, reservations, check-out/in, repairs, reporting	Detailed operational examples; separates reservations and actual rentals; vehicle-based lookup	Manual updated June 24, 2011; not verified against modern software	Vehicle identity, list/detail/edit, tenant-safe inventory, lifecycle/availability distinction	Complex rate matrices, full rental contracts, maintenance reports and financial analytics
HQ Rental Software	Knowledge Base	Fleet setup/import, types/classes/features, blocked periods, maintenance, vehicle checklists, branches, alerts	Exposes a broad fleet-management domain map and operational dependencies	Some individual articles or authenticated screens were not accessible for verification	Separate vehicle, branch, reservation and maintenance concerns	Import, checklists, damage map, alerts and complex availability calendar
RentOkey	Fleet maintenance tracking	Fleet tracking, maintenance and related rental operations (vendor descriptions)	Illustrates ongoing operational tracking beyond vehicle creation	Vendor marketing material; no authenticated admin observation	Separate initial vehicle registry from later operational modules	Full maintenance/expense functionality
AKINSOFT RentAgent	Official product page	Vehicle records, reservations, agreements, payment/reporting features (advertised)	Local-market business-software reference	Public overview, not a verified implementation walkthrough	RentACar module boundaries and operational terminology	Agreement, payment and complex accounting workflows
TopRentApp inspection guide	Pickup/return inspection checklist	Fuel/odometer readings, condition, damage and handover evidence	Explains why condition snapshots belong to rental events	Vendor guide, not legal authority	Keep event-specific readings/photos distinct from vehicle profile	Digital signatures, detailed inspection workflows


Additional background: Titarus — Araç Yönetimi, Rent Centric product overview.

Customer-facing UX references: Obilet car rental, Enuygun car rental, Budget Türkiye. Their common useful concepts include pickup/return timing, clear vehicle specifications and visible rental terms. They are not evidence of internal admin UX. No layouts should be copied directly.
2.2 Operational research conclusions
1. A vehicle has stable identity (plate/VIN, make/model/year), changing operational facts (odometer/location) and event-specific snapshots (pickup fuel, return mileage and damage).
2. Fleet inclusion (ACTIVE/`INACTIVE`) and availability for a requested interval are different concepts.
3. A confirmed reservation may reference a vehicle class before a specific physical car is assigned; this remains a future reservation-domain decision.
4. Rates and deposit policies affect quoting but charging/holding a deposit is a later payment workflow.
5. Maintenance, insurance, inspection, damages and utilization are relevant domains, but implementing all of them in Phase D would create avoidable dependencies.
3. Business Owner Workflows
Reading this table: “MVP” means the first vehicle-management implementation proposed in this document, not that the current D1 research task writes runtime code. “Future” means a separate planned domain or later enhancement. Suggested screen names are product requirements, not existing screens.
Workflow	Purpose and required information	Suggested screen / important actions	Important validation and business rules	Dependency	Scope
1. Register vehicle	Introduce physical vehicle; plate, make, model, year, class, transmission, fuel, seats, mileage, daily price, currency	Create form; complete fields, validate, save, view detail	Required fields, uniqueness inside tenant, ranges, trusted tenant ownership	Tenant auth; photo uploads later	MVP
2. Edit vehicle	Correct specs, location, notes, price, odometer	Detail → Edit; change permitted fields, save	Allowlisted fields; record not found across tenants; prohibit changing tenantId; validate changes	Audit trail future	MVP
3. Manage photos	Show identifiable listing images; cover and supporting photos	Media section; upload, preview, select cover, delete	File type/size/ownership, number of images, cleanup	Object storage/media API	Later enhancement; design now
4. Set pricing/deposit	Quote daily rental; price, currency, optional deposit	Pricing fields in vehicle form; edit	Non-negative exact decimal amounts; deposit and rental fee distinct	Pricing engine / reservations	MVP for base values
5. View available vehicles	Determine rentability for a time range; vehicle + interval	Future availability filter/calendar	Active alone does not guarantee free; check reservation, rental and blocks	Reservations, rentals, restrictions	Future module
6. Track reserved/rented	Know booked, out and expected return; reservation/rental refs	Future rental/reservation views	Do not manually infer ON_RENT from a vehicle flag	Reservations and rentals	Future module
7. View customers/drivers	Identify renters and authorized drivers; personal data tied to rental	Rental details with restricted access	Avoid exposing personal data in fleet list; privacy/retention requirements	Customer and rental modules	Future module
8. Check-out/check-in	Capture pickup/return times, odometer, fuel, condition, damage	Future handover form and confirmation	Event snapshots immutable/auditable; return may reveal damage	Rental, inspection, payment modules	Future module
9. Track maintenance	Record repairs, due mileage/date, costs	Future maintenance timeline and alerts	Service should prevent bookings if blocked; define ownership of updates	Maintenance/availability modules	Future module
10. Insurance / inspections	Track insurance/policy and inspection expiration	Future documents/expiry view	Regulatory obligations require current primary-source verification	Document storage/notifications	Future module
11. Disable / reactivate	Remove vehicle from active fleet without discarding details	Vehicle detail → Activate/Deactivate	Inactive cannot be newly offered; handling existing reservations requires future rules	Reservation domain when it exists	MVP for fleet state
12. Search/filter inventory	Quickly find vehicles by plate, make/model, class, activity	Vehicle listing; search, filter, sort, paginate	Tenant-scoped query, allowlisted sort/filter, bounded page size	None beyond inventory	MVP
13. Rental history	Inspect completed rentals, charges, usage	Future vehicle history tab	History must survive deactivation; protect customer data	Rental module	Future module
14. Fleet summary/reporting	Count active/inactive and later rented/overdue/utilization	Simple inventory counts now, detailed reporting later	Report formulas must be defined; no invented rental metrics	Reservation/rental/financial data	MVP for basic counts only; reporting later


3.1 Example end-to-end MVP path
1. Authorized TenantAdmin opens Vehicles and sees only their tenant's records.
2. Chooses Add vehicle, enters the required identity/specs/commercial values and submits.
3. Server validates and creates a record owned by the authenticated tenant (not a client-sent tenant ID).
4. Vehicle starts in ACTIVE fleet state by proposal; this does not assert reservation-aware availability.
5. Owner can view details, edit allowlisted values and deactivate/reactivate the record.
6. The vehicle cannot yet be booked via a fully integrated availability engine until later reservation work exists.
3.2 General business rules
- Do not store the renter's identity, contract price snapshot, per-rental fuel/odometer readings or damage photos as mutable permanent fields on Vehicle.
- The approved Tenant and an enabled authorized TenantAdmin are prerequisites for mutations per C1.
- Errors should identify invalid fields but must not reveal another tenant's vehicle existence.
- Saving changes must not silently change historical rental prices once reservation and rental modules exist.
4. Vehicle Data Requirements
Conventions: R = MVP required; O = MVP optional; F = future, not included in the initial vehicle form. Proposed API property names are camelCase, not committed Prisma names. Numeric ranges are initial proposed validation rules; local legal/operational requirements and UI catalogs can be reviewed before coding. R applies to create operations; PATCH may supply an allowlisted subset of editable values. Operational/computed information must not be directly writable unless explicitly noted.
4.1 Identity and classification
API field	Proposed type	Required	Proposed validation	Business purpose	Priority	UI placement
id	String/cuid	System	Generated, immutable	Stable vehicle reference	R	Detail/internal
tenantId	Relation/String	System	Server-derived only; mandatory tenant ownership	Isolation	R	Never client input
plate	String	Yes	Trim, uppercase, 2–20 chars; tenant-unique; avoid hard-coded Turkey-only regex	Physical identification	R	Create/Edit, List
vin	String	No	If supplied, normalized, up to 17 chars; real VIN policy/older imports to review; tenant-unique when non-null	Additional identity	O	Create/Edit, Detail
make	String	Yes	Trim, 1–60 chars	Brand	R	Create/Edit, List
model	String	Yes	Trim, 1–80 chars	Model	R	Create/Edit, List
modelYear	Int	Yes	Plausible range (e.g. 1950–current year + 1); final policy review	Model vintage	R	Create/Edit, Detail
category	VehicleCategory enum	Yes	One supported value; initial list below	Search/classification	R	Create/Edit, Filter
color	String	No	Trim, max 40 chars	Visual identification	O	Create/Edit, Detail
trim	String	No	Trim, max 80 chars	Variant	O	Create/Edit, Detail
internalCode	String	No	Tenant-unique if present, max 40 chars	Internal fleet lookup	O	Create/Edit, List


4.2 Technical specifications
API field	Type	Required	Proposed validation	Business purpose	Priority	UI placement
transmission	Transmission enum	Yes	MANUAL or AUTOMATIC	Rental selection	R	Create/Edit, List/Filter
fuelType	FuelType enum	Yes	PETROL, DIESEL, HYBRID, ELECTRIC, LPG, OTHER	Vehicle specification	R	Create/Edit, List/Filter
seatCount	Int	Yes	1–20 (larger vehicle policy later)	Seating capacity	R	Create/Edit, Detail
doorCount	Int	No	1–8	Vehicle specification	O	Create/Edit, Detail
hasAirConditioning	Boolean	No	Boolean	Customer-facing feature	O	Create/Edit, Detail
features	String[] / related feature catalog	No	Allowlisted values; storage decision later	Equipment/specifications	F	Future features editor
luggageCapacity	Int / unit	No	Unit/range not yet specified	Capacity	F	Future detail
engineCapacity	Int	No	Not applicable to all electric cars	Technical detail	F	Future detail


4.3 Rental and commercial details
API field	Type	Required	Proposed validation	Business purpose	Priority	UI placement
dailyPrice	Decimal(12,2)	Yes	Greater than 0; currency-aware precision	Initial rate	R	Create/Edit, List/Detail
currency	CurrencyCode enum/string	Yes	Initially TRY, USD, EUR	Price unit	R	Create/Edit, Detail
depositAmount	Decimal(12,2) nullable	No	≥ 0 if present; no actual charge in D1	Rental guarantee policy	O	Create/Edit, Detail
includedMileageKm	Int nullable	No	≥ 0; null means policy unspecified, not necessarily unlimited	Rental conditions	O	Create/Edit, Detail
extraKmPrice	Decimal(12,2) nullable	No	≥ 0; currency follows vehicle	Excess mileage policy	O	Create/Edit, Detail
minimumRentalHours	Int	No	> 0; default/policy pending	Minimum period	F	Future pricing
weeklyPrice / monthlyPrice	Decimal	No	Rate hierarchy and day-count definitions required	Discounted longer rentals	F	Future pricing
seasonalRates	Related model	No	Date overlaps and priority rules	Dynamic pricing	F	Future rate manager
optionalExtras / discounts	Related models	No	Tax/price rules required	Additional charges	F	Future pricing


4.4 Operations and administrative details
API field	Type	Required	Proposed validation	Business purpose	Priority	UI placement
odometerKm	Int	Yes	≥ 0; should not normally decrease; manual correction policy to review	Current fleet mileage	R	Create/Edit, Detail
fleetStatus	FleetStatus enum	System/default	ACTIVE or INACTIVE; separate status endpoint	Fleet participation	R	List, Detail, Status action
notes	String/Text	No	Up to 2,000 chars; internal-only	Staff context	O	Edit, Detail
currentLocationLabel	String	No	Trim, up to 120 chars; not a validated branch	Simple current location information	O	Create/Edit, Detail
branchId	Relation	No	Tenant-owned branch prerequisite	Multi-branch management	F	Future location editor
operationalCondition	Derived / future event state	No	Do not manually persist ON_RENT as a general vehicle edit	Real current operation	F	Future status/calendar
reservationAvailability	Derived query	No	Requires date interval and booking conflict policy	Rental eligibility	F	Future availability view
fuelOrChargeLevel	Event-specific value	No	Snapshot at checkout/check-in; no pretend current tracking	Handover evidence	F	Future inspection
insuranceExpiresAt	Date / document relation	No	Must verify legal requirements	Expiration monitoring	F	Future documents
inspectionExpiresAt	Date	No	Must verify legal requirements	Compliance	F	Future documents
lastServiceAt / nextServiceAt	Date / maintenance relation	No	Service scheduling rules	Maintenance	F	Future maintenance
createdAt / updatedAt	DateTime	System	Server managed	Record lifecycle	R	Detail/internal
deactivatedAt	DateTime nullable	System	Update with state transition	Status audit context	O	Detail/internal


4.5 Media requirements
Field/concept	Type	Required	Validation / behavior	Purpose	Priority	UI placement
vehicleImages	Related VehicleImage[]	No	Verify tenant and vehicle; max count configurable	Gallery	F	Future media tab
storageKey	String, private/internal	No	Never trust arbitrary user URL/path for ownership	Object-store location	F	Backend only
contentType	String	No	Allow JPEG, PNG, WebP after inspection	File safety	F	Upload errors
fileSizeBytes	Int	No	Suggested max 5 MiB per file, subject to provider validation	Resource limits	F	Upload errors
isCover / sortOrder	Boolean/Int	No	At most one cover; deterministic order	Listing image	F	Media gallery
inspectionImages	Event-related records	No	Attached to checkout/return/damage, not listing image	Evidence history	F	Future inspection


Review boundary: The issue requests media requirements, not necessarily a production uploader in the initial MVP. If uploads become an MVP requirement, storage, image moderation/security, quota, ownership, cleanup and additional endpoints must be separately specified before implementation.
4.6 Proposed enum vocabulary
// Documentation-only candidates; not implementation.
type FleetStatus = 'ACTIVE' | 'INACTIVE';
type VehicleCategory = 'ECONOMY' | 'COMPACT' | 'SEDAN' | 'SUV' | 'LUXURY' | 'VAN' | 'OTHER';
type Transmission = 'MANUAL' | 'AUTOMATIC';
type FuelType = 'PETROL' | 'DIESEL' | 'HYBRID' | 'ELECTRIC' | 'LPG' | 'OTHER';
type CurrencyCode = 'TRY' | 'USD' | 'EUR';
The categories above are an initial platform catalog, not an externally standardized universal rental class system. Localized labels belong in the UI, not in API enums. Fixed enums simplify MVP but need a migration/change procedure when new categories appear.
5. Vehicle Status and Availability
5.1 Distinct concepts
Concept	MVP source of truth	Example	Consequence
Fleet lifecycle	Persist Vehicle.fleetStatus	ACTIVE, INACTIVE	INACTIVE excluded from new rental offers
Current rental	Future RentalAgreement / checkout records	ON_RENT	Derived, not writable as a generic Vehicle status
Reserved for dates	Future Reservation records + period	Booked Nov 15–17	Derived for requested dates, not permanent vehicle attribute
Maintenance / blocked	Future maintenance/block intervals	Unavailable for servicing	Separate restriction, may overlap dates
Available for interval	Future computed eligibility query	Available Nov 20–22	Must consider active state, reservations, rentals and blocks


For example, ACTIVE and “reserved tomorrow” can both be true; they are not conflicting status values.
5.2 MVP transitions and prohibitions
Event	Initial state	Next state	Allowed? / rule
Create valid vehicle	—	ACTIVE	Proposed default; vehicle exists in inventory, not guaranteed bookable until reservation module exists
Tenant admin deactivates	ACTIVE	INACTIVE	Allowed now; future rental/reservation conflict checks required before relying on it for booking
Tenant admin reactivates	INACTIVE	ACTIVE	Allowed if vehicle record valid; future compliance/maintenance checks to be added
Repeated deactivate/activate	Same	Same	Idempotent return or explicit no-op; document behavior consistently
Generic edit attempts fleetStatus	Either	—	Forbidden; use dedicated status route
Other tenant changes status	Either	—	Forbidden; return non-disclosing 404
Reservation confirmed	ACTIVE	Remains ACTIVE	Later reservation domain adds date-specific blocking
Vehicle checked out/in	ACTIVE	Remains ACTIVE	Later rental domain governs on-rent and return records
Maintenance scheduled	ACTIVE	Remains ACTIVE	Later restriction domain governs unavailable dates


Future reservations and active rentals may make an immediate deactivation unsafe. Before reservation implementation, decide whether to block deactivation, warn, or require conflict resolution. Never silently cancel or reassign a customer's reservation in the vehicle endpoint.
5.3 Booking interval questions for future modules
Define time zone, whether [pickupAt, returnAt) half-open ranges are used, overlap detection, buffers between rentals, grace periods, late return, no-show, cancellation, and concurrency/transaction safety. These are intentionally not implemented in vehicle CRUD.
6. Pricing and Rental Rules
6.1 MVP representation
- Store vehicle-specific base dailyPrice, explicit currency, and optional depositAmount with that currency.
- Use PostgreSQL DECIMAL(12,2) through Prisma Decimal for proposed monetary fields. In TypeScript calculate with decimal arithmetic, not binary-floating-point number.
- Validate the amount and currency together. Return money values as decimal strings in JSON to avoid precision loss, e.g. "dailyPrice": "1750.50".
- Deposit means policy amount only; no capture, hold, refund or financial ledger exists in D1.
- An includedMileageKm limit is meaningful only with a defined per-day/per-contract basis. The MVP field can store a disclosed policy, but no automatic excess charge calculation is promised.
6.2 Longer-term rate engine
Future pricing might support weekly/monthly, seasons, weekend overrides, optional equipment, promotions, different tax treatment, mileage overages and minimum periods. A dedicated VehicleRate/`RatePlan` model becomes appropriate when date validity, rate precedence or reusable tariffs are actually required. Do not prematurely implement a rate engine as part of the initial inventory CRUD.
6.3 Future contract and pricing invariants
- A confirmed reservation/rental must preserve the agreed currency, calculation rules and price breakdown independently of later vehicle rate edits.
- Define exact rental-day computation (24-hour periods versus calendar-day, overtime/grace), rounding and tax policy during reservation/pricing implementation.
- Multi-currency support means stored per-vehicle currency, not automatic FX conversion. Currency conversion requires exchange-rate timestamps and separate rules.
- Deposit legality, maximums, collection methods and Turkish rental obligations require current primary-source legal review; do not assert fixed legal limits based solely on vendor sources.
7. UX and Dashboard Research
7.1 Vehicle list — recommended MVP
Recommended desktop table, with a mobile-responsive stacked representation. Suggested columns: thumbnail placeholder, plate, make/model, year, category, daily price + currency, ACTIVE/`INACTIVE`, last update, actions. Keep one obvious Add vehicle action. Search by plate/make/model; filter by category/status; allowlist sort options (e.g. recently updated, plate). Page-based pagination initially (default 20, maximum 100). All controls issue tenant-scoped server queries.

States: first-use empty fleet (CTA to add), no search results (clear filters), loading skeleton, request failure (retry), forbidden session (sign-in/access error). “Active” must never be labeled “available on your dates” before availability integration.
7.2 Vehicle detail — recommended MVP
Header: plate + make/model, fleet status badge, edit and activate/deactivate actions. Information groups: identity, specifications, current odometer/location, price/deposit, internal notes. A placeholder/disabled tab for future media or booking history must not imply functionality exists. Display creation/update timestamps if useful. Explicitly show unavailable optional fields as Not provided.
7.3 Create/edit forms — recommended MVP
For a manageable first release, one accessible form with labeled groups: Identity, Specifications, Operations, Pricing. Indicate required fields, select enums through controlled dropdowns, accept decimal strings for money, show inline field validation and server conflict feedback, provide Save/Cancel and unsaved-change warning. Client validation improves UX but backend validation is authoritative. Edit form should not allow tenant owner or record ID changes.
7.4 Wireframes (illustrative, not competitor copies)
+-------------------------------------------------------------------+
| Vehicles                                      [+ Add vehicle]       |
| Search [plate, brand, model...]  Category [All]  Status [All]       |
+-------------------------------------------------------------------+
| Plate    | Vehicle          | Category | Daily price | Fleet status|
| 38 ABC   | Toyota Corolla   | Sedan    | 1500 TRY    | ACTIVE      |
| 34 XYZ   | Renault Clio     | Economy  | 1200 TRY    | INACTIVE    |
+-------------------------------------------------------------------+
| Showing 1-20 of N                               [Prev] [Next]       |
+-------------------------------------------------------------------+

+-------------------------------------------------------------------+
| Add vehicle                                                       |
| Identity: Plate* Make* Model* Year* Category* VIN Color            |
| Specifications: Transmission* Fuel* Seats* Doors AC               |
| Operations: Odometer* Location Notes                              |
| Pricing: Daily price* Currency* Deposit Included km               |
|                                    [Cancel] [Save vehicle]        |
+-------------------------------------------------------------------+
* indicates proposed MVP required fields. Final visual design, accessibility review and breakpoints belong to UI implementation. Vehicle photos may be added when upload support is scoped and approved.
8. Domain and Data Architecture
8.1 Current schema and C1 compatibility
The Prisma schema inspected during research contained Tenant, TenantApplication, PlatformAdmin, TenantAdmin, activation-token and invitation-delivery models, but no Vehicle, Reservation, Rental or Maintenance model at that time. Repository state must be checked again before implementation. Application approved → Tenant created; rejected → no Tenant. D1 does not change onboarding or auth.

Reference: [`docs/architecture/tenant-authentication.md`](./tenant-authentication.md). C1 keeps platform-admin and tenant-admin authentication separate; a vehicle request must use validated tenant-admin credentials, verify an authorized active admin and approved tenant per current C1 rules, and read tenant identity from trusted server-side context.
8.2 Proposed Prisma schema excerpt (documentation ONLY)
// PROPOSAL ONLY. Do not paste into schema.prisma as part of D1.

enum FleetStatus {
  ACTIVE
  INACTIVE
}

enum VehicleCategory {
  ECONOMY
  COMPACT
  SEDAN
  SUV
  LUXURY
  VAN
  OTHER
}

enum Transmission {
  MANUAL
  AUTOMATIC
}

enum FuelType {
  PETROL
  DIESEL
  HYBRID
  ELECTRIC
  LPG
  OTHER
}

enum VehicleCurrency {
  TRY
  USD
  EUR
}

model Vehicle {
  id                 String          @id @default(cuid())
  tenantId           String
  tenant             Tenant          @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  plate              String
  vin                String?
  internalCode       String?
  make               String
  model              String
  modelYear          Int
  category           VehicleCategory
  trim               String?
  color              String?
  transmission       Transmission
  fuelType           FuelType
  seatCount          Int
  doorCount          Int?
  hasAirConditioning Boolean?
  odometerKm         Int
  currentLocationLabel String?
  notes              String?
  dailyPrice         Decimal         @db.Decimal(12, 2)
  currency           VehicleCurrency
  depositAmount      Decimal?        @db.Decimal(12, 2)
  includedMileageKm  Int?
  extraKmPrice       Decimal?        @db.Decimal(12, 2)
  fleetStatus        FleetStatus     @default(ACTIVE)
  deactivatedAt      DateTime?
  createdAt          DateTime        @default(now())
  updatedAt          DateTime        @updatedAt

  @@unique([tenantId, plate])
  @@unique([tenantId, vin])
  @@unique([tenantId, internalCode])
  @@index([tenantId, fleetStatus])
  @@index([tenantId, make, model])
}

// Existing model Tenant would need an inverse relation:
// vehicles Vehicle[]
Schema cautions: (1) This excerpt deliberately omits unrelated existing Tenant fields. (2) PostgreSQL permits multiple NULL values under a composite unique index; optional VIN/internalCode must still be normalized and validated. (3) Normalized plate comparisons must match the database uniqueness strategy (case/spacing/collation); a mere @@unique on raw input is insufficient without normalization. (4) Prisma and PostgreSQL type/index support should be checked against the installed versions before migration. (5) For a later global plate/VIN uniqueness policy, change the constraints only after validating cross-business ownership and lawful reuse/transfer cases. (6) Vehicle deletion must not cascade-delete tenant or historical rental records.
8.3 Relationships and future separation
Tenant (existing, approved business)
  └── Vehicle (proposed MVP; belongs to exactly one Tenant)
        ├── VehicleImage (later media infrastructure)
        ├── Reservation / assigned vehicle (future; optional assignment rules)
        ├── RentalAgreement (future; actual checkout/return)
        ├── VehicleRestriction / MaintenanceRecord (future)
        └── VehicleInspection / condition images (future)
Tenant authorization invariant: WHERE id = :vehicleId AND tenantId = :authenticatedTenantId (and equivalent for nested relations). Never trust tenantId from request body, URL or query. Cross-tenant identifiers produce a non-disclosing 404, rather than revealing their existence. Ensure all nested relations also belong to the same tenant.
8.4 Deletion, auditing and concurrency
MVP proposal: No DELETE endpoint in the five required contracts. Deactivate instead, preserving identity for later history. Physical delete is a separate policy decision for never-used records and needs relational safeguards before addition. Log sensitive changes through existing infrastructure if available; a full audit-event model is a later enhancement. API updates should use allowlisted fields and database uniqueness constraints; consider optimistic concurrency once multiple editing actors are supported.
9. Proposed API Contracts
All endpoint contracts are proposals, not implementations. Base path examples assume /tenant/vehicles; verify current backend route prefixes, DTO conventions and response envelope before coding. Auth: authenticated tenant-admin token/cookie according to C1, authorized active admin and approved Tenant. The server derives tenantId from validated context. JSON money is a string. Errors below are normalized example contracts, not assertions of existing API behavior.
9.1 Shared response, pagination and errors
- id: opaque cuid string; API clients do not infer tenant from it.
- Pagination: page starts at 1; limit default 20, max 100; stable sort by createdAt desc, id desc when not otherwise specified.
- sortBy allowlist: createdAt, plate, dailyPrice; sortOrder: asc or desc.
- Filter: search (plate/make/model, capped at 100 chars), category, fleetStatus.
- Unauthenticated: 401; inactive/non-approved or forbidden access: 403 per C1; missing or other-tenant vehicle: 404; invalid field/query: 400 (or existing project's 422 convention if established); duplicate plate/VIN: 409; invalid state transition: 409; unexpected: 500.
Example error body (proposed):
{
  "statusCode": 409,
  "code": "VEHICLE_PLATE_CONFLICT",
  "message": "A vehicle with this plate already exists in your fleet.",
  "details": [{ "field": "plate", "issue": "duplicate" }]
}
Validation failures should reference public field names, not expose SQL error strings or foreign tenant records.
9.2 GET /tenant/vehicles
Purpose: Paginated tenant-owned inventory.
Auth: TenantAdmin (C1).
Query DTO: { page?: number, limit?: number, search?: string, category?: VehicleCategory, fleetStatus?: FleetStatus, sortBy?: 'createdAt'|'plate'|'dailyPrice', sortOrder?: 'asc'|'desc' }. Numeric query strings are parsed/validated server-side.
Request body: None.

200 example:
{
  "items": [
    { "id": "veh_example_1", "plate": "38 ABC 123", "make": "Toyota", "model": "Corolla", "modelYear": 2022, "category": "SEDAN", "dailyPrice": "1500.00", "currency": "TRY", "fleetStatus": "ACTIVE", "thumbnailUrl": null }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
}
Errors: 400 invalid filter/sort/range, 401 unauthenticated, 403 disallowed tenant admin, 500 unexpected. Empty tenant fleet returns 200 with items: [], total: 0.
9.3 GET /tenant/vehicles/:id
Purpose: Detail for a tenant-owned vehicle.
Auth: TenantAdmin (C1).
Path DTO: { id: string } opaque nonempty identifier.
Body/query: None.

200 example:
{
  "id": "veh_example_1",
  "plate": "38 ABC 123",
  "vin": null,
  "make": "Toyota",
  "model": "Corolla",
  "modelYear": 2022,
  "category": "SEDAN",
  "color": "White",
  "transmission": "AUTOMATIC",
  "fuelType": "PETROL",
  "seatCount": 5,
  "doorCount": 4,
  "odometerKm": 42500,
  "dailyPrice": "1500.00",
  "currency": "TRY",
  "depositAmount": null,
  "fleetStatus": "ACTIVE",
  "currentLocationLabel": "Kayseri",
  "notes": null,
  "createdAt": "2026-11-10T10:00:00.000Z",
  "updatedAt": "2026-11-10T10:00:00.000Z"
}
Errors: 400 malformed ID if route validator rejects it; 401/`403` auth; 404 missing or foreign-tenant ID; 500 unexpected. The exact response serializer should be shared with POST/PATCH.
9.4 POST /tenant/vehicles
Purpose: Create a physical vehicle for the authenticated tenant.
Auth: TenantAdmin (C1).
Body DTO (proposed TypeScript shape; DecimalString is a validated decimal string, not a JS number):
type CreateVehicleDto = {
  plate: string;
  vin?: string | null;
  make: string;
  model: string;
  modelYear: number;
  category: VehicleCategory;
  transmission: Transmission;
  fuelType: FuelType;
  seatCount: number;
  odometerKm: number;
  dailyPrice: string;         // decimal string, e.g. "1500.00"
  currency: CurrencyCode;
  color?: string;
  trim?: string;
  internalCode?: string;
  doorCount?: number;
  hasAirConditioning?: boolean;
  currentLocationLabel?: string;
  notes?: string;
  depositAmount?: string | null;
  includedMileageKm?: number | null;
  extraKmPrice?: string | null;
  // tenantId, id, createdAt, updatedAt, fleetStatus not client-owned.
};
Example body:
{
  "plate": "38 ABC 123", "make": "Toyota", "model": "Corolla", "modelYear": 2022,
  "category": "SEDAN", "transmission": "AUTOMATIC", "fuelType": "PETROL",
  "seatCount": 5, "odometerKm": 42500, "dailyPrice": "1500.00", "currency": "TRY"
}
Success: 201 Created; return the created VehicleDetail (same shape as GET detail, with generated id, fleetStatus: ACTIVE, server timestamps).
Errors: 400 required/format/range/enum invalid, 401/`403` auth, 409 duplicate normalized plate or non-null VIN/internal code within tenant, 500 unexpected. If a client supplies tenantId, reject as an unknown/forbidden property rather than trusting it. Database uniqueness must catch concurrent duplicates.
9.5 PATCH /tenant/vehicles/:id
Purpose: Edit allowlisted profile attributes without changing tenant ownership or fleet state.
Auth: TenantAdmin (C1).
Path DTO: { id: string }.
Body DTO: Partial, nonempty subset of CreateVehicleDto (same validations), excluding any immutable or system fields. Missing means unchanged; null is accepted only for nullable optional fields; explicit null for required fields is invalid. Additional unknown properties rejected.

Example body:
{ "dailyPrice": "1750.00", "odometerKm": 43100, "notes": "Seasonal tire change completed" }
200 example: Updated VehicleDetail using the GET-detail schema, including updated updatedAt.
Errors: 400 invalid body/empty patch, 401/`403`, 404 missing/other-tenant, 409 duplicate plate/VIN or edit conflict, 500 unexpected. A correction that decreases mileage should be refused in the MVP without an audited adjustment flow; existing-record fix policy remains a review item.
9.6 PATCH /tenant/vehicles/:id/status
Purpose: Explicit tenant-authorized ACTIVE/`INACTIVE` fleet lifecycle transition.
Auth: TenantAdmin (C1).
Path DTO: { id: string }.
Body DTO: { "fleetStatus": "INACTIVE", "reason"?: string }; only ACTIVE or INACTIVE, reason optional bounded text (proposed max 500 chars). ON_RENT, RESERVED, AVAILABLE, MAINTENANCE are not accepted in this endpoint.

200 example:
{
  "id": "veh_example_1",
  "fleetStatus": "INACTIVE",
  "deactivatedAt": "2026-11-10T11:00:00.000Z",
  "updatedAt": "2026-11-10T11:00:00.000Z"
}
Errors: 400 invalid status; 401/`403` auth; 404 absent/foreign tenant; 409 future reservation/rental conflicts (once applicable), 500 unexpected. Repeated request for current state may return 200 unchanged; review idempotency against project API conventions. This route must not silently cancel or move reservations.
9.7 Security and contract test cases (for later implementation)
- Tenant A creates a vehicle; Tenant B cannot list, read, edit or change its state.
- Client body tenantId cannot attach vehicle to another tenant.
- Invalid enum, empty required field, negative odometer, out-of-range year and malformed decimal fail validation.
- Same-tenant duplicate normalized plate conflicts, including concurrent creation; other tenant's fleet is not exposed by error messages.
- Optional null semantics and PATCH allowlist are enforced.
- Inactive/disabled admin or non-approved tenant cannot write.
- Stable pagination and no cross-tenant count leakage.
- GET for missing and foreign IDs shares the same external 404 behavior.
10. Phase D MVP Scope and Roadmap
10.1 Phase D MVP — recommended initial implementation
Capability	Why now / acceptance outcome
Create vehicle with required identity, specs, odometer and basic pricing	Establish tenant-owned inventory; valid create returns new ID
List tenant vehicles with pagination, search and basic filters	Owners can find vehicles; no cross-tenant records
View vehicle details	Confirm current information
Edit allowlisted vehicle information	Maintain records without changing ownership
Activate/deactivate fleet membership	Basic operational fleet visibility, distinct from reservations
Base daily rate, currency and optional deposit	Store simple commercial attributes without billing engine
Basic responsive form/list UX and errors	Usable by a business owner
Tenant isolation, validations and contract tests	Security foundation inherited from C1


10.2 Later vehicle enhancements
Feature	Dependency / reason deferred
Listing photo upload/gallery/cover	Requires file storage, authorization, quotas, deletion/cleanup and media endpoints
Tenant-managed branches/transfers	Requires tenant-scoped Branch model and location rules
Vehicle feature catalog / bulk import	Requires catalog rules, data quality and migration workflow
Audit history for corrections	Requires event/retention model; especially mileage corrections
Detailed insurance/inspection fields and reminders	Requires document lifecycle, current legal review and notification jobs
Full archive/delete rules	Must account for references from reservations/rentals and retention


10.3 Future business modules (separate domains)
Module	Vehicle dependency	Why not initial D1/vehicle CRUD
Reservations and date availability	Vehicle/class, status, pricing and time intervals	Booking overlap, concurrency and assignment need a distinct model
Customers and drivers	Reservation/rental customer reference	Personal data and licence checks need privacy-specific design
Rental agreements and pickup/return	Vehicle, snapshots, odometer and fuel readings	Contract state and operational events are distinct from vehicle registry
Payments/deposit capture/refunds	Agreed contract amount and deposit policy	Financial transactions/ledger are not vehicle properties
Maintenance and repairs	Vehicle reference and unavailability periods	Detailed service events and expense tracking need their own records
Advanced rates, weekly/monthly, seasons, discounts	Vehicle/class rate history, date validity	Rule precedence and quote snapshots not required for registry
Damage/condition inspections	Rental/vehicle event history and media	Evidence needs timestamps, actor and retention rules
Reporting and utilization	Reservations, rentals, income and costs	Real utilization cannot be inferred from active fleet count


Scope clarification: D1 itself ships none of the runtime features above. “MVP” is the recommended scope for subsequent Phase D implementation issues after this document is approved.
11. Dependencies and Technical Boundaries
- Depends on: Reviewed/approved C1 tenant authentication architecture, docs/architecture/tenant-authentication.md.
- No runtime dependency on: C3–C10. Do not modify these features as part of D1.
- No edits in D1 to: apps/api/prisma/schema.prisma, migrations, NestJS endpoints, TenantAdmin dashboard, PlatformAdmin auth, TenantAdmin auth, production databases or live backend connections.
- Current repository schema and API conventions may have evolved after research; verify at implementation time, not by silently assuming examples here are already in production.
- Implementation later requires integration testing for tenant ownership and validation; docs review is not a substitute for those tests.
12. Open Questions, Tradeoffs and Review Gates
These items are deliberately documented rather than silently treated as decided. They do not block writing D1, but reviewer sign-off is required before an implementation relies on them.
ID	Open question / tradeoff	Proposed baseline / reason to revisit	Owner/status
Q01	Which vehicle fields must be required at creation?	Section 4 proposes minimal operational set; validate real partner needs	Mustafa / review
Q02	Plate/VIN uniqueness across companies?	Per-tenant proposed; global unique risks rejecting a valid record by another tenant or a transferred vehicle	Mustafa / review
Q03	Which plate countries and VIN variants?	Normalize without Turkey-only assumptions; official format policy to verify	Review
Q04	Fixed category enum or separate lookup catalog?	Fixed enum simplest initially; flexibility tradeoff	Review
Q05	Should newly created vehicle default ACTIVE?	Proposed yes; active does not imply actually available	Review
Q06	Deactivation with existing reservations/rentals?	Must be defined when reservation domain exists; no silent reassign	Review
Q07	Availability computation and status transitions?	Derived from future reservation/rental/restriction records	Review
Q08	Mileage decreases/corrections and auditing?	Reject decreases for basic PATCH; design audited correction path later	Review
Q09	Where does branch/location live?	Simple label now versus tenant Branch model later	Review
Q10	Weekly/monthly/seasonal prices?	Deferred; future rate engine and precedence	Review
Q11	Rental-day rounding, minimum duration, late charges?	Deferred until reservation/pricing rules defined	Review
Q12	Currency conversion/rounding and historical quote snapshots?	No automatic FX in vehicle MVP; confirmed-contract prices preserved later	Review
Q13	Deposit handling and legally permitted limits?	Store amount only; verify current regulations before collection	Legal review
Q14	Image limits, provider and media API?	Later enhancement unless approved upload platform exists	Review
Q15	Can unused vehicles be permanently deleted?	No DELETE route in initial contract; retention-dependent	Review
Q16	Insurance/inspection/maintenance requirements?	Defer workflow; verify compliance independently	Legal/operations
Q17	Current backend DTO conventions, error envelope and route prefix?	Examples here must be reconciled with codebase before implementation	Backend review
Q18	Mobile/card view, screen field density and accessibility?	Start with responsive table + grouped form; usability validation later	UX review
Q19	Exact physical vehicle assignment during reservation?	Must be decided by reservation module	Future
Q20	Audit logging scope, retention and privacy requirements?	Define before sensitive operational history is implemented	Future/review


12.1 D1 acceptance checklist
- [x] At least three documented products/workflows with source URLs, strengths and limitations.
- [x] Business-owner workflows, actions, validation, dependencies and MVP placement.
- [x] Categorized field matrix: proposed API names, types, requiredness, validation, purpose, priority, screen location.
- [x] Fleet lifecycle distinguished from date-based availability; candidate statuses and transitions.
- [x] Pricing/deposit, monetary precision and future rate boundaries documented.
- [x] Maintenance, insurance, inspection, damage and media needs evaluated.
- [x] Proposed list/detail/create/edit UX and illustrative wireframes.
- [x] Proposed Prisma domain model, tenant constraints and relationships.
- [x] Five proposed API contracts with authentication, requests, examples and error behavior.
- [x] MVP, later enhancements and separate future modules differentiated.
- [x] C1 tenant ownership requirements and documentation-only boundaries stated.
- [ ] Reviewer validates architecture options, source accuracy and unresolved tradeoffs.
- [ ] Commit only the architecture document on a dedicated D1 branch.
- [ ] Open PR and obtain Mustafa's approval before merge/implementation.
13. References
1. Rent Centric, V2.0 User Manual, updated June 24, 2011: https://www.rentcentric.com/pdf/RentCentricUserManualV2.pdf — vehicle specifications pp. 59–63; rates pp. 35–38; dashboard pp. 7–9; pickup/return around pp. 70–73. Historical documentation, not a claim about present product behavior.
2. HQ Rental Software, official knowledge base: https://hqrs.notion.site/Knowledge-Base-b3dc775703154b14b2ba62fad43c7032 — fleet setup, availability, blocked periods, checklists and maintenance headings; underlying subpages partly inaccessible during research.
3. RentOkey, official fleet maintenance feature page: https://www.rentokey.com/en/car-rental-fleet-maintenance-tracking — vendor-described fleet and service tracking; not authenticated testing.
4. AKINSOFT RentAgent, official product page: https://www.akinsoft.com.tr/programlar/detay/rentagent-programi--wra2 — rental business software features; vendor descriptions only.
5. Titarus, vehicle management overview: https://www.titarus.com/tr/sistem-ozellikleri/arac-yonetimi — vehicle/fleet features; vendor descriptions only.
6. TopRentApp, vehicle inspection checklist: https://toprentapp.com/en/car-rental-inspection-checklist-check-out-and-check-in-templates — handover/inspection concept reference, not statutory text.
7. Obilet, car rental: https://www.obilet.com/arac-kiralama — customer booking UX reference only.
8. Enuygun, car rental: https://www.enuygun.com/arac-kiralama/ — customer booking UX reference only.
9. Budget Türkiye: https://www.budget.com.tr/ — customer booking UX reference only.
10. RentACar C1 architecture: docs/architecture/tenant-authentication.md — auth domains and server-enforced tenant isolation; confirm approved revision in repository.
11. RentACar existing schema: apps/api/prisma/schema.prisma — baseline reviewed during research; recheck before coding.
12. Vehicle handover form, user-provided sample — pickup/return readings, condition and driver information; illustrative, not an official government form.
Evidence limitation: Business rules and model choices in this document are RentACar proposals inferred from the research. Vendor feature descriptions do not establish mandatory Turkish law. Obtain authoritative, up-to-date legal guidance separately before enforcing regulatory claims or launching legally sensitive operations.