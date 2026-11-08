# API Tests

## Requirements

- Node.js and project dependencies installed.
- Local PostgreSQL running on port `5432`.
- A separate `rentacar_test` database with the required Prisma tables.
- Root `.env.test` file containing `DATABASE_URL` pointing to the local `rentacar_test` database.

**Safety:** Never run database integration tests against the development or production database. Do not commit `.env.test` or credentials.

## Run tests

Run these commands from `apps/api`.

### Backend unit tests

```bash
npx vitest run src
```

### Tenant application E2E tests

```bash
npx vitest run --config ./vitest.config.e2e.ts test/tenant-applications.e2e-spec.ts
```

### All API E2E tests

```bash
npm run test:e2e
```

### TypeScript, lint and build

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## E2E test coverage

The tenant application E2E suite verifies:

- Creating a tenant application via HTTP.
- Listing and retrieving applications with Super Admin authentication.
- Approving an application and creating its Tenant.
- Rejecting an application without creating a Tenant.
- Blocking missing or invalid JWTs with `401`.
- Returning `404` for nonexistent applications.
- Returning `409` for invalid state transitions.

## Test data isolation

The E2E configuration loads the test database connection from `.env.test` and checks that it points to the local `rentacar_test` database.

Each workflow uses unique test identifiers. Temporary application, Tenant, and Super Admin records are cleaned up after execution.

The E2E suite also checks the actual database name before running the application workflow tests.