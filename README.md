# RentACar

**A Multi-Tenant Car Rental Management SaaS Platform**

RentACar is a white-label SaaS platform under active development for independent car rental businesses. It provides a shared technical foundation with separate, tenant-scoped business data and administration interfaces.

## Current capabilities

- Platform Admin authentication and tenant application review, approval, rejection and safe deletion of eligible applications.
- Tenant Admin provisioning, invitation delivery via a transactional outbox, account activation and access/refresh token session management.
- Protected Platform Admin and Tenant Admin dashboards.
- Tenant-scoped vehicle data model and list, detail, create, update and fleet-status APIs.
- Vehicle listing UI integrated with the backend; create/edit UI integration and CRUD security regression testing are in progress.

The project is not yet production-ready. Customer management, reservations, date-based availability, branding and custom domains are planned. Online payments are outside the initial release scope. Active fleet membership does not imply rental availability.

## Technology stack

| Layer | Technology |
|---|---|
| Web | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| API | NestJS 12, TypeScript, REST, Swagger/OpenAPI |
| Persistence | PostgreSQL, Prisma 7 |
| Authentication | JWT, Argon2, HttpOnly cookies |
| Invitation delivery | PostgreSQL transactional outbox, Nodemailer |
| Testing | Vitest, Supertest, React Testing Library |
| Tooling | Node.js, npm, Docker Compose, Git/GitHub, ESLint, Oxlint |

See the application package manifests and lockfiles for exact dependency versions.

## Architecture

```text
Next.js web application
        |
        | REST / server-side session handling
        v
NestJS modular backend
        | authentication, authorization, validation, business rules
        v
Prisma ORM
        v
PostgreSQL
```

Platform Admin and Tenant Admin authentication boundaries are separate. Tenant-owned operations must derive tenant identity from trusted server-side authentication context rather than client-provided IDs. Monetary values use decimal persistence and string serialization. The initial account model supports at most one Tenant Admin per tenant.

## Engineering approach

- Modular monolith with explicit domain boundaries and REST API contracts.
- Transactional onboarding and durable invitation delivery with retry handling.
- Separate development and test databases, tenant isolation tests, and reviewed pull requests.
- Responsive administration interfaces with shared components and distinct visual identities.

## Repository structure

```text
RentACar/
├── apps/
│   ├── api/                # NestJS, Prisma, API tests
│   └── web/                # Next.js, UI and frontend tests
├── docs/
│   ├── architecture/       # Technical decisions and API contracts
│   └── team/               # Project status and issue history
├── .github/                # Pull request template
├── compose.yaml
├── CONTRIBUTING.md
├── SETUP.md
└── README.md
```

The applications have separate npm manifests; there is no root npm workspace currently.

## Local development

Prerequisites: Git, Node.js 24 (recommended), npm, Docker Desktop with Compose, and repository access.

Follow [SETUP.md](SETUP.md) for configuration, dependencies, database migrations, and application startup. Never commit secrets or use production credentials in local development. Use an isolated test database for database integration and E2E tests.

Local web: http://localhost:3000  
Local API: http://localhost:3001  
Swagger UI: http://localhost:3001/api

## Development and project status

- [Project status and active work](docs/team/PROJECT_STATUS.md)
- [Full issue archive](docs/team/ISSUE_HISTORY.md)
- [Team contribution guidelines](CONTRIBUTING.md)
- [Tenant authentication architecture](docs/architecture/tenant-authentication.md)
- [Vehicle management architecture](docs/architecture/vehicle-management.md)
- [Vehicle API contract](docs/architecture/vehicle-api-contract.md)

Some architecture documents describe historical proposals; verify implementation against the current code, migrations and tests. GitHub Issues and Projects track work, and PROJECT_STATUS summarizes the current state. Each task uses a dedicated branch, review and relevant quality checks before merge.

## Roadmap

Current focus: vehicle API security and frontend integration, vehicle detail and fleet summaries, and regression testing. Customer domain design and initial APIs are queued. Reservation, pricing and rental workflows, media, branding, production hardening, CI/CD, deployment and recovery remain future work or require further verification.

## Security

Tenant isolation, server-side authorization, input validation, safe error responses, protected credentials and automated security tests are core requirements. Production readiness and security controls must be verified before launch.

## License

No license has been selected yet. No permission to reuse or distribute the project should be assumed.
