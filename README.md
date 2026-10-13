# RentACar

**A Multi-Tenant Car Rental Management SaaS Platform**

RentACar is a web-based SaaS platform in development, designed to help multiple car rental businesses manage their vehicles, rental pricing, and reservations from one platform.

Each rental business will have its own workspace and access only to its authorized data. Platform administrators will manage tenant onboarding and platform-level operations. Business-specific branding and custom domains are planned capabilities.

> **Project status:** In development. Items described as planned are not yet implemented unless explicitly stated otherwise.

## Table of Contents

- [Project Overview](#project-overview)
- [Planned Features](#planned-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Multi-Tenant Design](#multi-tenant-design)
- [API Documentation](#api-documentation)
- [Planned Repository Structure](#planned-repository-structure)
- [Development Setup](#development-setup)
- [Roadmap](#roadmap)
- [Security Principles](#security-principles)
- [Contributing](#contributing)
- [License](#license)

## Project Overview

RentACar aims to provide a maintainable and scalable foundation for car rental businesses to manage day-to-day operations online.

### Goals

- Support multiple independent rental businesses on one platform.
- Manage vehicle information, availability, and rental prices.
- Create and manage reservations.
- Enforce tenant-level data isolation on the backend.
- Provide a documented REST API for frontend/backend integration.
- Establish automated testing and repeatable deployment practices.

**Initial scope:** vehicle management, pricing, and reservations. Online payment processing is outside the initial release scope.

## Planned Features

### Tenant and Platform Administration
- Business onboarding and approval by platform administrators.
- Tenant-specific settings and operational data.
- Role-based access for platform and business users.
- Business branding and custom-domain support as a later capability.

### Vehicle and Pricing Management
- Create and update vehicle records.
- Store vehicle specifications and availability.
- Configure rental prices.
- Display vehicle listings and detail pages.

### Reservation Management
- Create and manage reservations.
- Set rental start and end dates.
- Calculate reservation totals.
- Track reservation statuses.
- Validate vehicle availability and prevent overlapping bookings.

### Developer Experience
- REST API built with NestJS.
- Interactive API documentation with Swagger UI / OpenAPI.
- Automated tests and continuous integration as development progresses.

## Technology Stack

| Technology | Purpose |
|---|---|
| Next.js | Web application |
| React | User interface |
| TypeScript | Type-safe development |
| Tailwind CSS | Styling |
| NestJS | Backend and REST API |
| PostgreSQL | Relational database |
| Prisma ORM | Database access, schema, and migrations |
| Swagger / OpenAPI | API documentation and interactive testing |
| Node.js and npm | Runtime and package management |
| Git and GitHub | Version control and source hosting |
| Jest | Unit testing |
| Supertest | HTTP/API testing (planned) |
| Playwright | End-to-end browser testing (planned) |
| Docker / Docker Compose | Containerized development and deployment (planned) |
| GitHub Actions | Continuous integration workflows (planned) |

## Architecture

The intended architecture separates the web interface, backend API, and relational database:

```text
Users and Rental Businesses
            |
            v
    Next.js Web Application
            |
          REST API
            |
            v
       NestJS Backend
  Authentication / Authorization
       Tenant-aware Logic
            |
            v
         Prisma ORM
            |
            v
        PostgreSQL
```

The frontend will communicate with the backend through REST endpoints. NestJS will handle business rules, validation, authentication, authorization, and tenant-aware operations. PostgreSQL will store application data, accessed through Prisma.

## Multi-Tenant Design

Tenant isolation is a core requirement, not an optional frontend feature.

The backend must verify the authenticated user's permissions and tenant ownership for every protected operation. Tenant-scoped records—including vehicles, reservations, pricing, and business settings—must not be accessible across tenants without explicit platform-level authorization.

The implementation will prioritize:

- Server-side tenant authorization.
- Tenant-scoped database queries.
- Role-based access control.
- Validation of incoming requests.
- Tests for unauthorized cross-tenant access.

Business-specific branding and custom domains are planned for a later stage.

## API Documentation

The backend is built with NestJS, and Swagger / OpenAPI is intended to document the REST API and provide an interactive interface for exploring endpoints and testing requests.

When the backend is running locally and Swagger is configured, the expected Swagger UI address is:

**http://localhost:3001/api**

The available documentation will grow as API endpoints are implemented. The address is local to the development machine and is not a public production URL.

## Planned Repository Structure

The repository is intended to evolve toward the following monorepo layout:

```text
RentACar/
├── apps/
│   ├── web/                 # Next.js frontend
│   └── api/                 # NestJS backend
├── docs/                    # Architecture and technical documentation
├── .github/
│   └── workflows/           # CI workflows (planned)
├── .gitignore
├── README.md
└── package.json             # Workspace configuration (planned)
```

This is the target structure, not a claim that every directory or configuration file already exists.

## Development Setup

### Prerequisites

- Node.js and npm
- PostgreSQL
- Git
- A GitHub account

Docker may be added to the workflow later.

### Setup status

The exact installation commands will be documented after the repository and workspace structure are finalized. The intended setup flow is:

1. Clone the repository.
2. Install dependencies.
3. Configure local environment variables.
4. Create or configure the PostgreSQL database.
5. Apply Prisma migrations.
6. Start the API and web applications.

### Environment variables

Store database credentials, secrets, and other environment-specific configuration in local environment files or a secure secret manager. Do not commit `.env` files or credentials. An example environment file will be added when configuration is finalized.

## Roadmap

### Phase 1 — Foundation
- [x] Select the initial technology stack.
- [x] Set up the local development tools.
- [ ] Finalize repository structure and documentation.
- [ ] Establish development conventions.

### Phase 2 — Data and Backend
- [ ] Design the tenant-aware data model.
- [ ] Complete Prisma models and migrations.
- [ ] Integrate Prisma with NestJS.
- [ ] Implement authentication and authorization.
- [ ] Implement tenant onboarding and permissions.
- [ ] Build vehicle, pricing, and reservation API endpoints.
- [ ] Maintain Swagger / OpenAPI documentation.

### Phase 3 — Web Application
- [ ] Build vehicle listing and detail pages.
- [ ] Build tenant administration screens.
- [ ] Add vehicle and pricing management.
- [ ] Implement reservation workflows.
- [ ] Connect the frontend to the REST API.

### Phase 4 — Quality and Security
- [ ] Add unit and integration tests.
- [ ] Add HTTP API tests with Supertest.
- [ ] Add end-to-end tests with Playwright.
- [ ] Test tenant isolation and authorization boundaries.
- [ ] Improve validation, error handling, and logging.

### Phase 5 — Delivery and Operations
- [ ] Add Docker and Docker Compose configuration.
- [ ] Configure GitHub Actions for automated checks.
- [ ] Document deployment and environment configuration.
- [ ] Establish backup and recovery procedures.

## Security Principles

Security will be built into the application as features are implemented. Key requirements include:

- Secure authentication and authorization.
- Server-side tenant isolation.
- Input validation and safe error handling.
- Secure password hashing.
- Least-privilege access control.
- Protection of secrets and database credentials.
- Automated tests for authorization and tenant boundaries.

These are design and implementation goals; they should not be interpreted as a claim that all controls are already implemented or audited.

## Contributing

RentACar is currently under development. Contribution guidelines, branching conventions, and pull request procedures will be documented as the project matures. Changes should prioritize readability, maintainability, security, and testability.

## License

A license has not yet been selected. Until a license is added, no permissions to reuse, distribute, or modify this project should be assumed.

---

**Built with Next.js, NestJS, TypeScript, PostgreSQL, and Prisma.**
