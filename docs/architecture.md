# Architecture

## Product Overview

Ordo — это calm premium learning OS для структурированного самообучения.

Основной формат продукта:

Desktop-first responsive web SaaS.

Продукт не является:

- Notion clone;
- social network;
- AI-first app;
- mobile-first app;
- enterprise LMS.

## Core Learning Loop

Основной цикл:

Roadmap → Topic → Session → Notes → Practice → Progress → Analytics

Главные сущности:

- LearningPath;
- Topic;
- TopicProgress;
- LearningSession;
- Note;
- Resource;
- PracticeTask.

Sessions являются core primitive продукта.

## Tech Stack

Frontend:

- Next.js;
- TypeScript;
- Tailwind CSS;
- shadcn/ui;
- TanStack Query;
- Zustand;
- React Hook Form;
- Zod;
- next-themes.

Backend:

- Next.js server-side layer;
- Prisma;
- PostgreSQL;
- Auth.js.

Tooling:

- ESLint;
- Prettier;
- Vitest later;
- Playwright later.

## Frontend Architecture

Используется feature-based architecture.

Рекомендуемая структура:

```text
src/
  app/
  shared/
  entities/
  features/
  widgets/
  styles/
```

Правила:

- pages должны быть thin;
- UI не содержит сложную бизнес-логику;
- server state через TanStack Query;
- UI state через Zustand;
- forms через React Hook Form + Zod.

## Backend Architecture

Рекомендуемый поток:

```text
Route / Action
→ Validation
→ Auth
→ Service
→ Repository
→ Database
```

Правила:

- route handlers должны быть тонкими;
- business logic живёт в services;
- Prisma-запросы живут в repositories;
- validation через Zod;
- ownership checks обязательны.

## Database Architecture

Основные MVP модели:

- User;
- LearningPath;
- Topic;
- TopicProgress;
- LearningSession;
- Note;
- Resource;
- PracticeTask.

Important decisions:

- Topic хранит структуру roadmap.
- TopicProgress хранит личный прогресс пользователя.
- LearningSession фиксирует реальное обучение.
- У пользователя может быть только одна active session.
- Topic tree depth ограничивается 3 уровнями.

## Security Model

Private-first model.

Все learning data приватны по умолчанию.

Backend всегда проверяет:

- authentication;
- authorization;
- ownership.

Frontend не считается security layer.

Auth foundation:

- Auth.js uses credentials with JWT sessions for the initial private workspace;
- passwords are stored only as hashes;
- auth errors must stay generic;
- OAuth, password reset, and rate limiting are future security tasks.

## AI Workflow Integration

AI agents должны читать:

- `docs/architecture.md`;
- `docs/workflow.md`;
- `docs/ai/project-context.md`.

AI не должен:

- менять architecture самостоятельно;
- добавлять крупные features;
- игнорировать ownership checks;
- создавать лишние abstraction layers.

## Future Architecture Notes

После MVP можно рассматривать:

- sharing roadmap;
- public templates;
- community layer;
- AI assistance;
- advanced analytics.

Но MVP остаётся personal private learning workspace.

## Local Setup

Для запуска Ordo локально необходим работающий сервер PostgreSQL (любой доступный `DATABASE_URL` в файле `.env`).

Шаг 1: `npm install`

Шаг 2: Запуск базы данных (выберите один из вариантов):

### Option A — Docker PostgreSQL
```bash
docker compose up -d
```

### Option B — Local PostgreSQL (без использования Docker)
1. Установите PostgreSQL для Windows.
2. Убедитесь, что служба PostgreSQL запущена.
3. Создайте пользователя `ordo` с паролем `ordo`.
4. Создайте база данных `ordo_dev` (с владельцем `ordo`).

Шаг 3: Настройка переменных окружения:
* Создайте файл `.env` в корне проекта (по шаблону `.env.example`). Убедитесь, что он содержит:
```env
DATABASE_URL="postgresql://ordo:ordo@localhost:5432/ordo_dev"
AUTH_SECRET="your-generated-secret-key"
AUTH_URL="http://localhost:3000"
```

Шаг 4: Инициализация БД и запуск приложения:
```bash
npm run db:migrate -- --name init
npm run db:seed
npm run dev
```


