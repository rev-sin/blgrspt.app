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
- **Linting:** Oxlint
- **Formatting:** Oxfmt

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
````

## Setup

### Prerequisites

Install the following:

* [Bun](https://bun.sh/)
* [Node.js 24](https://nodejs.org/)
* [Doppler CLI](https://docs.doppler.com/docs/install-cli)
* A [Neon](https://neon.tech/) PostgreSQL database
* Google OAuth credentials
* GitHub OAuth credentials

### 1. Install dependencies

Clone the repository and install dependencies:

```bash
bun install
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

For example:

```bash
doppler run -- bun run dev
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
doppler run -- bunx drizzle-kit generate
```

Apply migrations to Neon:

```bash
doppler run -- bunx drizzle-kit migrate
```

Verify the migrations:

```bash
doppler run -- bunx drizzle-kit check
```

Test the database connection:

```bash
doppler run -- bun scripts/test-db.ts
```

### 9. Run locally

Start the development server with Doppler injecting the secrets:

```bash
doppler run -- bun run dev
```

The application will be available at:

```text
http://localhost:4321
```

### 10. Validate the project

Run Astro type checking:

```bash
doppler run -- bunx astro check
```

Run linting:

```bash
bun run lint
```

Check formatting:

```bash
bun run fmt:check
```

Run the production build:

```bash
doppler run -- bun run build
```

Or use the Justfile:

```bash
just check
just lint
just fmt-check
just build
```

Run the complete validation:

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
drizzle-kit generate
     │
     ▼
Migration SQL
     │
     ▼
drizzle-kit migrate
     │
     ▼
Neon PostgreSQL
```

For example:

```bash
doppler run -- bunx drizzle-kit generate
doppler run -- bunx drizzle-kit migrate
doppler run -- bunx drizzle-kit check
```

## Development Workflow

```text
Clone repository
       │
       ▼
   bun install
       │
       ▼
   doppler setup
       │
       ▼
Configure Neon + OAuth secrets
       │
       ▼
doppler run -- bun run dev
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
doppler run -- bun run build
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
Astro type checking
        ↓
Oxlint
        ↓
Oxfmt
        ↓
Production build
```

All checks should pass before deployment.


