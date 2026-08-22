# Show available commands
default:
    @just --list
# Start the development server
dev:
    doppler run -- bun run dev

# Install dependencies
install:
    bun install

# Type-check Astro and TypeScript
check:
    doppler run -- bunx astro check

# Run linter
lint:
    bun run lint

# Fix lint issues
lint-fix:
    bun run lint:fix

# Format the project
fmt:
    bun run fmt

# Check formatting
fmt-check:
    bun run fmt:check

# Test database connection
db-test:
    doppler run -- bun scripts/test-db.ts

# Generate Drizzle migration
db-generate:
    doppler run -- bunx drizzle-kit generate

# Apply Drizzle migrations
db-migrate:
    doppler run -- bunx drizzle-kit migrate

# Check Drizzle migrations
db-check:
    doppler run -- bunx drizzle-kit check

# Build the production application
build:
    doppler run -- bun run build
# Run type checking, linting and formatting checks
validate:
    just check
    just lint
    just fmt-check

# Run all checks including production build
ci:
    just check
    just lint
    just fmt-check
    just build