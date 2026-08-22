# Show available commands
default:
    @just --list

[group('setup')]
install:
    bun install

[group('dev')]
dev:
    doppler run -- bun run dev

[group('dev')]
preview:
    doppler run -- bun run preview

[group('docs')]
docs:
    bun run docs:dev

[group('docs')]
docs-build:
    bun run docs:build

[group('docs')]
docs-serve:
    bun run docs:serve

[group('docs')]
docs-check:
    bun run docs:check

[group('quality')]
check:
    doppler run -- bun run check

[group('quality')]
lint:
    bun run lint

[group('quality')]
lint-fix:
    bun run lint:fix

[group('quality')]
fmt:
    bun run fmt

[group('quality')]
fmt-check:
    bun run fmt:check

[group('quality')]
knip:
    bun run knip

[group('quality')]
test:
    bun run test

[group('deps')]
deps-check:
    bun run deps:check

[group('deps')]
deps-update:
    bun run deps:update

[group('git')]
commit:
    bun run commit

[group('db')]
db-test:
    doppler run -- bun run db:test

[group('db')]
db-generate:
    doppler run -- bun run db:generate

[group('db')]
db-migrate:
    doppler run -- bun run db:migrate

[group('db')]
db-check:
    doppler run -- bun run db:check

[group('db')]
db-push:
    doppler run -- bun run db:push

[group('db')]
db-studio:
    doppler run -- bun run db:studio

[group('db')]
db-seed:
    doppler run -- bun run db:seed

[group('search')]
search-reindex:
    doppler run -- bun run search:reindex

[group('deploy')]
vercel-sync-secrets:
    bun run vercel:sync-secrets

[group('build')]
build:
    doppler run -- bun run build

[group('quality')]
validate:
    just check
    just lint
    just fmt-check
    just test

[group('quality')]
ci:
    just check
    just lint
    just fmt-check
    just test
    just build

[group('turbo')]
turbo-build:
    bun run turbo:build

[group('turbo')]
turbo-check:
    bun run turbo:check

[group('turbo')]
turbo-lint:
    bun run turbo:lint

[group('turbo')]
turbo-fmt:
    bun run turbo:fmt

[group('turbo')]
turbo-test:
    bun run turbo:test
