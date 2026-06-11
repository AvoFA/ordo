# Development Workflow

## Roles

Human:

- принимает продуктовые и архитектурные решения;
- утверждает roadmap;
- определяет приоритеты.

ChatGPT:

- product architect;
- помогает формулировать решения;
- готовит документацию;
- помогает проектировать architecture.

Gravity:

- workspace agent;
- обновляет Vault и markdown-файлы;
- поддерживает структуру документации.

Codex:

- implementation agent;
- пишет код;
- выполняет scoped tasks;
- следует docs и architecture.

## Product Decisions

Новые крупные решения сначала фиксируются в Vault.

Код не должен опережать product decisions.

Стандартный порядок:

Decision → Documentation → Task → Implementation.

## Task Lifecycle

Задачи должны быть:

- small;
- scoped;
- testable;
- understandable.

Плохая задача:
“Сделать весь learning system”.

Хорошая задача:
“Реализовать создание Learning Path”.

## Development Process

Перед изменениями:

1. Прочитать relevant docs.
2. Понять scope задачи.
3. Найти существующие файлы.
4. Сделать минимальное изменение.
5. Запустить проверки.
6. Показать summary и дождаться user review.
7. Сделать commit только после явного разрешения пользователя.

## Commit Convention

Использовать Conventional Commits.

Examples:

- feat(paths): add learning path creation
- feat(sessions): implement session lifecycle
- fix(auth): prevent unauthorized access
- refactor(topic): simplify topic tree state
- docs(architecture): update domain model

## Commit Policy

AI agents must NOT:

- create commits automatically;
- push automatically;
- create branches automatically;
- merge automatically.

Default workflow:

Implementation → Checks → Summary → User Review → User Approval → Commit → Push

Commit and push are allowed only after a direct user request.

This rule has higher priority than local agent habits.

## Documentation Rules

Если изменение затрагивает architecture или workflow:

- обновить docs;
- не создавать лишние документы;
- не дублировать информацию.

Repository docs должны оставаться краткой engineering-выжимкой.

Полный product context хранится в Ordo Vault.

## AI Rules

AI agents не должны:

- менять product direction;
- добавлять крупные features без решения;
- создавать excessive docs;
- делать overengineering;
- игнорировать security.
- создавать commit или push без явного разрешения пользователя.

AI agents должны:

- делать small scoped changes;
- следовать architecture;
- проверять git status;
- писать понятные summary.

Правильный порядок:

Implementation → Checks → Summary → User review → User approval → Commit → Push

## Release Process

Пока проект в MVP foundation stage.

Production release process появится позже.

На раннем этапе достаточно:

- lint;
- typecheck;
- build;
- basic tests later.

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
4. Создайте базу данных `ordo_dev` (с владельцем `ordo`).

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

## Development Mode Without Database

Если вам нужно просто запустить и протестировать продукт как интерактивный UX-прототип (посмотреть экраны, переходы и верстку) без развертывания локальной базы данных:
1. Создайте `.env` файл-заглушку (с любым секретом `AUTH_SECRET`).
2. Запустите dev-сервер: `npm run dev`.
3. Все экраны и переходы будут функционировать с демонстрационными (mock) данными. Реальные операции создания, изменения и сохранения данных в БД в этом режиме работать не будут.



