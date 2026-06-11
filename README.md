# Ordo

Ordo is a private learning operating system for structured self-education.

It connects learning paths, topics, focused sessions, knowledge notes, resources,
practice tasks, completion signals, and analytics into one continuous learning
context.

## Product Idea

Most self-learning gets scattered across browser tabs, random notes, saved links,
unfinished courses, and disconnected practice. Ordo is designed to keep the
question clear:

> What am I learning now, where did I stop, and what should I do next?

Ordo is not a social network, a Notion clone, a task manager, or an AI-first
gimmick. The product direction is calm, focused, private-first, and desktop-first.

## Current Status

The project is in an active prototype / MVP foundation state.

Implemented foundations:

- Auth.js credentials auth
- private workspace shell
- learning paths
- topic tree
- learning sessions
- notes / knowledge workspace
- resources and learning inbox foundation
- practice tasks and attempts
- command center
- dark / light / system themes
- English / Ukrainian UI language foundation
- Prisma data model with PostgreSQL

Still intentionally incomplete:

- production deployment
- advanced analytics
- password reset
- OAuth
- sharing / collaboration
- browser extension
- file storage hardening
- automated test suite

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style primitives
- Auth.js
- Prisma
- PostgreSQL
- TanStack Query
- Zustand
- Zod
- Tiptap
- next-themes

## Repository Structure

```text
src/
  app/        Next.js routes and layouts
  entities/   domain models and repositories
  features/   user actions and feature-level UI
  shared/     UI primitives, utilities, providers, i18n
  widgets/    composed product sections

prisma/
  schema.prisma
  migrations/
  seed.ts

docs/
  architecture.md
  workflow.md
  ai/
```

## Local Setup

Install dependencies:

```bash
npm install
```

Create `.env` from `.env.example` and set:

```env
DATABASE_URL="postgresql://ordo:ordo@localhost:5432/ordo_dev"
AUTH_SECRET="replace-with-a-local-secret"
AUTH_URL="http://localhost:3000"
```

Start PostgreSQL with Docker:

```bash
docker compose up -d
```

The Docker service is configured with `restart: "no"`, so it does not auto-start
when Docker Desktop opens.

Prepare the database:

```bash
npm run db:migrate -- --name init
npm run db:seed
```

Run the app:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Demo Account

After seeding, use:

```text
Email: demo@ordo.app
Password: password123
```

## Quality Checks

```bash
npm run lint
npm run build
npx prisma format
npx prisma validate
npx prisma generate
```

## Documentation

Important project docs:

- `docs/architecture.md`
- `docs/workflow.md`
- `docs/ai/project-context.md`
- `docs/ai/commit-convention.md`

## Project Notes

This repository is a solo product exploration and implementation prototype. The
main goal is to validate the Ordo learning workflow before hardening deployment,
testing, storage, and production security.
