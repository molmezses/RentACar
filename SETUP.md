# RentACar — Development Setup

## Requirements

- Git
- Node.js and npm (Node.js 24 recommended for the current development environment)
- Docker Desktop with Docker Compose
- A code editor such as VS Code

## Repository Structure

```text
RentACar/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # Next.js frontend
├── compose.yaml      # Local development services
├── README.md
└── SETUP.md
```

This repository does not currently use a root npm workspace. Install dependencies and run npm commands within each application directory.

## 1. Clone the Repository

```bash
git clone https://github.com/molmezses/RentACar.git
cd RentACar
```

You must have repository access because it is private.

## 2. Install Dependencies

Backend:

```bash
cd apps/api
npm ci
```

Frontend (from the repository root):

```bash
cd apps/web
npm ci
```

If you are inside `apps/api`, return to the repository root before running the frontend command.

## 3. Configure Environment Variables

Create a local `.env` file at the repository root using the configuration documented in the project README.

The backend Prisma configuration loads environment variables from the repository root.

Do not copy production secrets into development files.

Never commit `.env`, `.env.test`, access tokens or database passwords.

The project also uses a separate test database configuration. Refer to the existing Prisma test configuration before running database integration tests.

## 4. Start Database Services

From the repository root:

```bash
docker compose up -d
docker compose ps
```

The local PostgreSQL service must be running before database migrations or backend integration tests.

## 5. Apply Prisma Migrations

From `apps/api`:

```bash
npx prisma migrate deploy
npx prisma generate
```

Ensure the database connection and root `.env` configuration are correct before applying migrations.

Do not use `prisma migrate reset` on databases containing important data.

## 6. Start Backend

From `apps/api`:

```bash
npm run start:dev
```

The backend is configured for local development on port 3001.

## 7. Start Frontend

Open another terminal and navigate to `apps/web`:

```bash
npm run dev
```

The frontend normally runs at:

http://localhost:3000

## 8. Verify the Applications

Confirm that:

- PostgreSQL is running.
- The NestJS API starts without errors.
- The Next.js frontend starts without errors.
- The Super Admin login page loads at `/admin/login`.

The project requires valid locally configured credentials for authenticated admin functionality.

## 9. Quality Checks

Backend, from `apps/api`:

```bash
npm run lint
npm run build
npm test
```

Frontend, from `apps/web`:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Some backend integration tests use a separate PostgreSQL test database.

Do not assume those tests can run without the correct test environment.

## 10. Working With Git

Always update your local `main` before starting a new task.

```bash
git switch main
git pull origin main
git switch -c feature/your-feature-name
```

Use a separate feature branch for each task and open a Pull Request before merging.

See [CONTRIBUTING.md](CONTRIBUTING.md) for team development rules.

## 11. macOS and Windows

Commands are generally the same on macOS Terminal, Windows PowerShell and Git Bash.

File paths and terminal configuration may differ.

Each developer should maintain an independent local PostgreSQL environment.

If Docker ports are already occupied, check which services are using them before modifying `compose.yaml`.

## 12. Troubleshooting

If the backend cannot connect to PostgreSQL:

- Confirm Docker Desktop is running.
- Run `docker compose ps`.
- Verify local environment variables.
- Check whether the configured PostgreSQL port is occupied.

If Prisma commands fail:

- Confirm you are inside `apps/api`.
- Confirm the correct database is running.
- Check the existing Prisma configuration.
- Verify that dependencies have been installed.

If the frontend cannot communicate with the backend:

- Confirm both applications are running.
- Check the backend API URL configuration.
- Inspect the browser network requests.
- Do not expose server-side secrets in client-side environment variables.