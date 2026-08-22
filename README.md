# BlogPost

A modern, server-rendered blogging platform built with Astro, Svelte, Better Auth, Drizzle ORM, and Neon PostgreSQL.

## Stack

- **Framework:** Astro 7
- **Rendering:** SSR
- **UI:** Svelte 5
- **UI Components:** shadcn-svelte
- **Styling:** Tailwind CSS v4
- **Authentication:** Better Auth
- **OAuth Providers:** Google, GitHub
- **Database:** Neon PostgreSQL
- **ORM:** Drizzle ORM
- **Secrets:** Doppler
- **Deployment:** Vercel
- **Runtime:** Node.js 24
- **Package Manager:** Bun
- **Task runner:** Just
- **Docs:** Docusaurus (`website/`)
- **Linting:** Oxlint
- **Formatting:** Oxfmt (JS/TS/JSON/CSS/Markdown) and Prettier (Svelte/Astro)
- **Unused code:** Knip
- **Commits:** Commitlint and Commitizen (`cz-git`)

## Architecture

```text
                         ┌──────────────────┐
                         │     Browser      │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │   Astro SSR      │
                         │                  │
                         │   Svelte UI      │
                         └───────┬──────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │ Better Auth  │ │ Astro API    │ │ Blog Pages   │
        │              │ │ Routes       │ │              │
        └──────┬───────┘ └──────┬───────┘ └──────────────┘
               │                │
               └────────┬───────┘
                        ▼
                 ┌──────────────┐
                 │ Drizzle ORM  │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │ Neon         │
                 │ PostgreSQL   │
                 └──────────────┘
```

## Commands

[Just](https://github.com/casey/just) is the project task runner. Recipes wrap Bun scripts and inject secrets with Doppler where needed.

List every recipe:

```bash
just
```

| Recipe                                                                         | What it does                                |
| ------------------------------------------------------------------------------ | ------------------------------------------- |
| `just install`                                                                 | Install dependencies with Bun               |
| `just dev`                                                                     | Start the Astro dev server (Doppler)        |
| `just docs`                                                                    | Start the Docusaurus docs site              |
| `just docs-build` / `just docs-serve` / `just docs-check`                      | Build, serve, or type-check docs            |
| `just check`                                                                   | Astro and Svelte type checks (Doppler)      |
| `just lint` / `just lint-fix`                                                  | Oxlint                                      |
| `just fmt` / `just fmt-check`                                                  | Oxfmt and Prettier                          |
| `just knip`                                                                    | Unused files, exports, and dependencies     |
| `just validate`                                                                | Typecheck, lint, and format check           |
| `just ci`                                                                      | `validate` plus a production build          |
| `just build`                                                                   | Production build (Doppler)                  |
| `just db-test`                                                                 | Test the Neon connection                    |
| `just db-generate`                                                             | Generate a Drizzle migration                |
| `just db-migrate`                                                              | Apply Drizzle migrations                    |
| `just db-check`                                                                | Verify Drizzle migrations                   |
| `just db-push`                                                                 | Push the schema without a migration         |
| `just db-studio`                                                               | Open Drizzle Studio                         |
| `just db-seed`                                                                 | Seed the database (`src/lib/db/seed.ts`)    |
| `just commit`                                                                  | Commitizen (`cz-git`)                       |
| `just deps-check` / `just deps-update`                                         | Check or write dependency updates with Taze |
| `just turbo-build` / `just turbo-check` / `just turbo-lint` / `just turbo-fmt` | Turbo-cached variants                       |

Commands that need `DATABASE_URL` or auth secrets run through `doppler run`.

## Setup

### Prerequisites

Install the following:

- [Bun](https://bun.sh/)
- [Node.js 24](https://nodejs.org/)
- [Just](https://github.com/casey/just)
- [Doppler CLI](https://docs.doppler.com/docs/install-cli)
- A [Neon](https://neon.tech/) PostgreSQL database
- Google OAuth credentials
- GitHub OAuth credentials

### 1. Install dependencies

Clone the repository and install dependencies:

```bash
just install
```

### 2. Configure Doppler

BlogPost uses Doppler to manage all environment variables.

Authenticate with Doppler:

```bash
doppler login
```

Connect the local project to the Doppler project:

```bash
doppler setup
```

Select the appropriate:

```text
Project: app
Config:  dev
```

Verify the configuration:

```bash
doppler secrets
```

### 3. Configure Neon

Create a PostgreSQL database on Neon.

From the Neon dashboard, copy the PostgreSQL connection string.

Add it to Doppler as:

```bash
doppler secrets set DATABASE_URL="your-neon-connection-string"
```

For example:

```text
DATABASE_URL=postgresql://user:password@host/neondb?sslmode=require
```

The database URL is **never stored in the repository**. Doppler injects it into the application at runtime.

### 4. Configure Better Auth

Generate a secure Better Auth secret:

```bash
openssl rand -base64 32
```

Add it to Doppler:

```bash
doppler secrets set BETTER_AUTH_SECRET="your-generated-secret"
```

For local development:

```bash
doppler secrets set BETTER_AUTH_URL="http://localhost:4321"
```

For production, use the deployed domain instead:

```text
BETTER_AUTH_URL=https://your-domain.com
```

### 5. Configure Google OAuth

Create OAuth credentials in Google Cloud Console.

Add the credentials to Doppler:

```bash
doppler secrets set GOOGLE_CLIENT_ID="your-google-client-id"
doppler secrets set GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

For local development, configure the Google OAuth callback URL as:

```text
http://localhost:4321/api/auth/callback/google
```

For production:

```text
https://your-domain.com/api/auth/callback/google
```

### 6. Configure GitHub OAuth

Create an OAuth application in GitHub Developer Settings.

Add the credentials to Doppler:

```bash
doppler secrets set GITHUB_CLIENT_ID="your-github-client-id"
doppler secrets set GITHUB_CLIENT_SECRET="your-github-client-secret"
```

For local development, use:

```text
http://localhost:4321/api/auth/callback/github
```

For production:

```text
https://your-domain.com/api/auth/callback/github
```

### 7. Environment variables

The application expects the following secrets:

```text
DATABASE_URL
BETTER_AUTH_SECRET
BETTER_AUTH_URL

GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET

GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
```

These values are stored in Doppler rather than in `.env` files or the Git repository.

The application receives them through:

```bash
doppler run -- <command>
```

Just recipes that need secrets already wrap that for you. For example:

```bash
just dev
```

### 8. Database schema

Better Auth uses Drizzle ORM to store authentication data in Neon.

The schema is located at:

```text
src/lib/db/schema.ts
```

Current authentication tables:

```text
user
session
account
verification
```

Generate a migration after modifying the schema:

```bash
just db-generate
```

Apply migrations to Neon:

```bash
just db-migrate
```

Verify the migrations:

```bash
just db-check
```

Test the database connection:

```bash
just db-test
```

### 9. Run locally

Start the development server with Doppler injecting the secrets:

```bash
just dev
```

The application will be available at:

```text
http://localhost:4321
```

### 10. Documentation site

Project docs are a Docusaurus workspace in `website/` (`@blgrspt/docs`).

```bash
just docs
```

The docs site is available at:

```text
http://localhost:3000
```

Build and serve a static copy:

```bash
just docs-build
just docs-serve
```

### 11. Validate the project

Type-check Astro and Svelte:

```bash
just check
```

Lint:

```bash
just lint
```

Check formatting:

```bash
just fmt-check
```

Run the production build:

```bash
just build
```

Run typecheck, lint, and format together:

```bash
just validate
```

Run the complete CI suite (includes the production build):

```bash
just ci
```

## Secrets Flow

Secrets never need to be committed to the repository.

```text
                 ┌──────────────────┐
                 │     Doppler      │
                 │                  │
                 │ DATABASE_URL     │
                 │ BETTER_AUTH_*    │
                 │ GOOGLE_*         │
                 │ GITHUB_*         │
                 └────────┬─────────┘
                          │
                    doppler run
                          │
                          ▼
                 ┌──────────────────┐
                 │   Astro / Bun    │
                 └────────┬─────────┘
                          │
             ┌────────────┼────────────┐
             │            │            │
             ▼            ▼            ▼
          Better       Drizzle       OAuth
           Auth          ORM        Providers
             │            │
             └──────┬─────┘
                    ▼
             ┌──────────────┐
             │     Neon     │
             │  PostgreSQL  │
             └──────────────┘
```

## Database Workflow

The normal database workflow is:

```text
Modify schema
     │
     ▼
just db-generate
     │
     ▼
Migration SQL
     │
     ▼
just db-migrate
     │
     ▼
Neon PostgreSQL
```

For example:

```bash
just db-generate
just db-migrate
just db-check
```

## Development Workflow

```text
Clone repository
       │
       ▼
   just install
       │
       ▼
   doppler setup
       │
       ▼
Configure Neon + OAuth secrets
       │
       ▼
    just dev
       │
       ▼
   Develop
       │
       ▼
    just ci
       │
       ▼
   Vercel
```

## Production

The application uses Astro SSR with the Vercel adapter.

Build:

```bash
just build
```

Production secrets should be configured in the deployment environment.

For production OAuth, update the callback URLs to:

```text
https://your-domain.com/api/auth/callback/google
https://your-domain.com/api/auth/callback/github
```

The production Better Auth URL should also point to the deployed domain:

```text
BETTER_AUTH_URL=https://your-domain.com
```

> `astro preview` is not supported by the `@astrojs/vercel` adapter. Production behavior should be tested through a Vercel deployment.

## Code Quality

Before committing changes:

```bash
just ci
```

This runs:

```text
Astro + Svelte type checking
        ↓
Oxlint
        ↓
Oxfmt + Prettier
        ↓
Production build
```

Husky runs lint-staged on commit, Commitlint on the commit message, and the unit test suite on push. Use `just commit` for a conventional Commitizen prompt.

All checks should pass before deployment.

**Doppler stores secrets → `doppler run` injects them → Astro/Better Auth/Drizzle use them → Drizzle connects to Neon.**
