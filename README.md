# Twitter Clone

A full-stack Twitter/X clone with authentication, tweeting, likes, follows, user profiles, search, and image uploads.

---

## 🚀 Overview

This is a feature-complete social media application built as a technical challenge submission. The application supports user registration and authentication, a paginated timeline, tweet creation with image uploads, likes, follows, profile pages, and user search. It is fully containerized with Docker for easy evaluation.

**Backend**: Node.js + Express + TypeScript + Prisma 7 + PostgreSQL 17  
**Frontend**: React 18 + Vite 6 + TypeScript + Tailwind CSS 3  
**Testing**: Vitest — 84 backend tests / 144 frontend tests

---

## 🐳 Quick Start (Docker)

This is the fastest way to evaluate the application.

### Prerequisites

- Docker and Docker Compose

### Steps

```bash
# 1. Create environment configuration
cp .env.example .env

# 2. Build and start all services
docker compose up --build

# 3. In a separate terminal, seed the database with demo data
docker compose run --rm seed
```

### Accessing the application

| Service  | URL                   |
| -------- | --------------------- |
| Frontend | http://localhost:5173 |
| Backend  | http://localhost:3000 |
| DB       | localhost:5432        |

### Login

Use the demo account credentials below to log in.

---

## 👤 Demo Account

| Field    | Value              |
| -------- | ------------------ |
| Email    | `demo@example.com` |
| Password | `password123`      |

This account follows several users and has tweets visible in the timeline. All 10 seeded users share the password `password123`.

---

## 📘 Runbook (Setup & Operation)

The following sections collectively form the operational runbook for this application:

| Section                                                 | Purpose                                                  |
| ------------------------------------------------------- | -------------------------------------------------------- |
| [🐳 Quick Start (Docker)](#-quick-start-docker)         | Primary onboarding — run the full stack with one command |
| [💻 Local Development Setup](#-local-development-setup) | Run without Docker for active development                |
| [⚙️ Environment Variables](#️-environment-variables)     | All required configuration values                        |
| [Database Migrations](#database-migrations)             | Schema management workflow                               |
| [Seed Data](#seed-data)                                 | Generate demo users and content                          |
| [🧪 Testing](#-testing)                                 | Run tests and measure coverage                           |

### Verification Commands

```bash
# Lint all code
npm run lint

# Build both workspaces
npm run build

# Run all tests
npm test

# Run tests with v8 coverage (separate per workspace)
npm run test:coverage -w backend      # Backend: 84 tests, 93.68% stmts
npm run test:coverage -w frontend     # Frontend: 144 tests, 85.71% stmts
```

Coverage reports are written to `backend/coverage/` and `frontend/coverage/` in both `text` and `lcov` formats.

---

## ✅ Challenge Requirements Coverage

| Requirement       | Status | Notes                                                  |
| ----------------- | ------ | ------------------------------------------------------ |
| Registration      | ✅     | POST /api/auth/register with Zod validation            |
| Login             | ✅     | POST /api/auth/login returns JWT                       |
| Logout            | ✅     | Client-side token removal                              |
| Protected Routes  | ✅     | requireAuth middleware, ProtectedRoute wrapper         |
| User Profiles     | ✅     | GET /api/users/:id with counts                         |
| Timeline          | ✅     | Paginated, chronological, follows-based                |
| Create Tweet      | ✅     | POST /api/tweets with optional image                   |
| Delete Tweet      | ✅     | DELETE /api/tweets/:id (owner only)                    |
| Like / Unlike     | ✅     | POST /api/tweets/:id/like, DELETE /api/tweets/:id/like |
| Follow / Unfollow | ✅     | POST /api/users/:id/follow, DELETE .../follow          |
| Followers List    | ✅     | GET /api/users/:id/followers                           |
| Following List    | ✅     | GET /api/users/:id/following                           |
| User Search       | ✅     | GET /api/users/search?q= (partial match)               |
| Responsive Design | ✅     | Desktop sidebar + mobile bottom nav                    |
| Image Uploads     | ✅     | multer, JPEG/PNG/WebP, 5 MB limit                      |
| Docker Support    | ✅     | 3 containers + seed service                            |
| Seed Data         | ✅     | 10 users, 35 tweets, 34 follows, 50 likes              |

---

## Features

- **Authentication** – Register and login with JWT-based sessions (7-day expiry).
- **Timeline** – Paginated feed of tweets from followed users and self.
- **Tweet creation** – Text content with optional image upload.
- **Tweet deletion** – Users can delete their own tweets.
- **Likes** – Like and unlike tweets with optimistic UI updates.
- **Follow / unfollow** – Follow and unfollow other users.
- **User profiles** – View any user's profile with their tweet count, followers, and following.
- **User search** – Search users by username (partial match).
- **Image uploads** – JPEG/PNG/WebP images up to 5 MB, served from a persistent uploads directory.
- **Responsive UI** – Mobile-first approach. Mobile: bottom navigation bar (`lg:hidden`). Tablet/Desktop: sticky sidebar + right panel (`lg:block`). Breakpoints align with Tailwind's `sm` (640px), `md` (768px), and `lg` (1024px) defaults.
- **Docker support** – Full containerized stack with PostgreSQL 17, automated migrations, and persistent volumes.

---

## Tech Stack

### Backend

| Layer        | Technology                       |
| ------------ | -------------------------------- |
| Runtime      | Node.js 22                       |
| Framework    | Express 4                        |
| Language     | TypeScript 5 (ESM, strict mode)  |
| ORM          | Prisma 7 + PrismaPg adapter      |
| Database     | PostgreSQL 17                    |
| Validation   | Zod 3                            |
| Auth         | jsonwebtoken (JWT)               |
| File uploads | multer                           |
| Security     | helmet, express-rate-limit, cors |
| Testing      | Vitest + supertest               |

### Frontend

| Layer         | Technology                 |
| ------------- | -------------------------- |
| Framework     | React 18                   |
| Build tool    | Vite 6                     |
| Language      | TypeScript 5 (strict mode) |
| Styling       | Tailwind CSS 3             |
| HTTP client   | Axios                      |
| Routing       | React Router 7             |
| Data fetching | TanStack React Query 5     |
| Testing       | Vitest + Testing Library   |

---

## 🤔 Stack Selection Rationale

### Backend

**Node.js / Express** – Chosen for its lightweight, unopinionated nature. Express provides routing and middleware without imposing architectural constraints, which suits a feature-based monorepo where each module owns its own structure.

**TypeScript (strict mode)** – Provides compile-time type safety across both client and server. Shared type definitions prevent contract mismatches between API layers. The `noUncheckedIndexedAccess` and `noImplicitOverride` flags catch entire classes of runtime errors at compile time.

**PostgreSQL 17** – Relational integrity is essential for a social graph (users, follows, likes). PostgreSQL's JSON support and indexing capabilities provide room for future iteration while maintaining ACID guarantees for transactional operations like follows and likes.

**Prisma 7 with PrismaPg adapter** – Provides type-safe database access without the boilerplate of a full ORM. The PrismaPg adapter uses the `pg` driver directly, avoiding the Prisma binary engine and simplifying Docker deployment. The `prisma.config.ts` format separates connection configuration from schema definition, which is important for the adapter-based setup.

**Zod** – Schema validation at the HTTP boundary. Zod's `safeParse` pattern allows controllers to validate input before it reaches service logic, with TypeScript-inferred output types. Co-located schemas keep validation rules close to the routes they protect.

**Vitest** – Jest-compatible API with native TypeScript and ESM support. The test runner is shared between backend (`supertest` for integration tests) and frontend (`@testing-library/react` for component tests), reducing cognitive overhead.

### Frontend

**React 18** – Stable, widely understood component model. The concurrency features in React 18 provide a foundation for future performance improvements without architectural changes.

**Vite 6** – Fast cold starts and HMR through native ESM. Zero-config TypeScript and JSX support. The build output is a static site that can be served by nginx in production or Docker.

**Tailwind CSS 3** – Utility-first CSS that eliminates context-switching between HTML and stylesheet files. The class-based approach keeps component files self-contained and avoids the selector specificity issues common with traditional CSS-in-JS solutions.

**TanStack React Query 5** – Manages server state with automatic cache invalidation, background refetching, and optimistic updates. The likes feature uses optimistic updates to reflect UI changes immediately, with automatic rollback on failure.

**React Router 7** – Declarative routing with nested layouts. The `ProtectedRoute` wrapper and `Layout` component provide a clear separation between authenticated and public routes.

### Docker

Three-container compose setup. Using `node:22-alpine` for backend and `nginx:alpine` for static frontend serving minimizes image size. Secrets are excluded from the build context via `.dockerignore` and injected at runtime through Docker Compose environment variables.

---

## 🏗️ Architecture

The project follows a **feature-based architecture** within an npm workspaces monorepo. Each workspace (backend, frontend) is independently buildable and testable.

### Backend

```
src/
  app/          – Express app factory and route registration
  config/       – Environment variable configuration
  middleware/    – Error handler, file upload
  modules/      – Feature modules (auth, tweets, likes, follows, etc.)
  shared/       – Shared utilities (db, auth, errors, response, schemas)
```

Each module contains its own `routes`, `controller`, `service`, `schemas`, and `tests`. Authentication middleware (`requireAuth`) is applied at the route level per module. The database is accessed through a shared singleton `PrismaClient` with the `PrismaPg` driver adapter.

### Frontend

```
src/
  app/          – Router configuration, app root
  features/     – Feature modules (auth, timeline, tweets, user-profile, etc.)
  shared/       – Shared components, API client, config
```

Each feature contains `components/`, `pages/`, `hooks/`, `api/`, `types/`, and `__tests__/`. The API client is a shared Axios instance that attaches JWT tokens from `localStorage` and targets the backend URL from `VITE_API_URL`.

### Validation

Backend request bodies and query parameters are validated with Zod schemas at the controller layer. Invalid input returns a `400` with the validation error message.

---

## Timeline Design

The timeline is the core data display feature. It retrieves tweets from users the authenticated user follows, plus the user's own tweets, ordered chronologically.

### Query strategy

The timeline endpoint (`GET /api/timeline`) performs a single Prisma query:

```
Find tweets where:
  authorId IN (my follow list + my own ID)
ORDER BY createdAt DESC
LIMIT 20
OFFSET (page - 1) * 20
```

### N+1 prevention

Each timeline tweet includes a pre-computed `likedByCurrentUser` boolean. This is determined at query time by checking whether a `Like` record exists for the current user and tweet combination. The query uses a single Prisma `include` with a nested condition, avoiding N+1 lookups per tweet.

### Response structure

```json
{
  "data": [
    {
      "id": "string",
      "content": "string",
      "imageUrl": "string | null",
      "createdAt": "ISO date string",
      "author": { "id": "string", "username": "string" },
      "likesCount": 5,
      "likedByCurrentUser": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42
  }
}
```

### Presentation

The frontend renders tweets as individual `TweetCard` components within `TimelineList`. Each card shows the author's avatar initial, username, @handle, timestamp, content, optional image, and a like button. Hover states and border styling provide visual hierarchy. The feed refreshes after creating or deleting a tweet.

---

## Follow Graph Design

The follow relationship is modeled as a many-to-many join table with explicit bidirectional relations.

### Schema

```prisma
model Follow {
  followerId  String
  followingId String
  createdAt   DateTime @default(now())

  follower  User @relation("following", fields: [followerId], references: [id])
  following User @relation("followers", fields: [followingId], references: [id])

  @@id([followerId, followingId])
}
```

### Relationship semantics

- **followerId** – The user who performs the follow action.
- **followingId** – The user being followed.
- The composite primary key `@@id([followerId, followingId])` prevents duplicate follows at the database level.

### Bidirectional access

The `User` model defines two relations:

- `follower Follow[] @relation("followers")` – Who follows this user.
- `following Follow[] @relation("following")` – Who this user follows.

This dual relation enables efficient queries for:

- **Followers list** (`GET /api/users/:id/followers`) – Users who follow this user.
- **Following list** (`GET /api/users/:id/following`) – Users this user follows.
- **Timeline generation** – The timeline service queries `follow` records to find all `followingId` values for the current user, then retrieves tweets whose `authorId` is in that set.

### Why this design

A dedicated `Follow` model with composite key was chosen over alternative approaches (array columns, JSON fields) because:

- Referential integrity is enforced at the database level via foreign keys.
- Composite primary keys prevent duplicate follows without application-level checks.
- Prisma's generated types provide full type safety for join queries.
- The bidirectional relation syntax mirrors the social graph semantics directly in the schema.

---

## 🤖 AI-Assisted Development Process

This project was developed using a structured AI-assisted workflow where multiple models were used for distinct purposes, each under human direction and review.

### Tools used

| Tool     | Model             | Role                                |
| -------- | ----------------- | ----------------------------------- |
| OpenCode | DeepSeek V4 Flash | Primary implementation              |
| ChatGPT  | GPT-4o            | Architecture, planning, reviews     |
| OpenCode | Minimax M3        | Independent code audit              |
| OpenCode | Nemotron Ultra    | Independent security and test audit |

### Workflow

**Feature planning** – Requirements were decomposed into discrete tasks with explicit constraints. Each task specified what files to modify, what patterns to follow, and what invariants to preserve.

**Architecture reviews** – Before implementing cross-cutting concerns (Docker setup, ESM compatibility, Prisma 7 configuration), the architecture approach was reviewed against the application's existing patterns to ensure consistency.

**Implementation** – Each task was implemented iteratively: understand the codebase context, plan the change, implement, verify tests pass. Changes to shared infrastructure (routing, layout, auth) were done with smaller, more frequent validation steps.

**Code reviews** – All generated code was reviewed for:

- Consistency with existing patterns (import style, error handling, component structure).
- Test preservation (no existing test was modified unless required by a spec change).
- Tailwind class hygiene (no unnecessary nesting or duplication).
- TypeScript strict mode compliance.

**Security reviews** – The authentication flow, JWT handling, and protected route implementation were audited for common vulnerabilities (token exposure, missing auth checks, CSRF).

**Test reviews** – Test coverage was verified after each feature implementation. Backend tests use mocked Prisma with supertest for HTTP-level assertions. Frontend tests use `@testing-library/react` with mocked API responses and AuthContext providers.

### Principle

AI tools generated implementation code and suggested approaches, but every change was reviewed, validated against existing tests, and manually confirmed to integrate correctly with the rest of the codebase. No code was merged without test verification.

---

## 🧪 Testing

### Backend (84 tests across 13 files)

| Category          | Description                                                                                                                                                     |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit tests        | Isolated service logic (auth service, AppError, API response helpers)                                                                                           |
| Validation tests  | Zod schema edge cases (boundary values, missing fields, type mismatches)                                                                                        |
| Integration tests | HTTP-level tests with supertest, mocked Prisma client. Cover auth, tweets, likes, follows, timeline, user profiles, followers list, following list, user search |

**Coverage (v8):** 93.68% statements, 85.62% branches, 94.82% functions, 93.68% lines.

### Frontend (144 tests across 20 files)

| Category           | Description                                                                                                             |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Component tests    | `@testing-library/react` for TweetCard, SearchResults, CreateTweetForm, ProfilePage, Layout, Header, Sidebar, MobileNav |
| Auth flow tests    | AuthContext, ProtectedRoute, LoginPage                                                                                  |
| Hook tests         | `renderHook` for useAuth, useCreateTweet, useLikeTweet, useFollowUser, useUserProfile, useUserSearch                    |
| Router integration | Full route rendering with AuthContext + MemoryRouter                                                                    |

**Coverage (v8):** 85.71% statements, 89.69% branches, 77.21% functions, 85.71% lines.

### Running tests

```bash
# All tests
npm test

# Backend only
npm run test -w backend          # without coverage
npm run test:coverage -w backend # with v8 coverage

# Frontend only
npm run test -w frontend          # without coverage
npm run test:coverage -w frontend # with v8 coverage
```

---

## 💻 Local Development Setup

### Prerequisites

- Node.js 22+
- PostgreSQL 17 (running locally)
- npm

### Installation

```bash
# Install all workspace dependencies (root, backend, frontend)
npm install

# Generate Prisma client
npm run db:generate -w backend

# Run database migrations
npm run db:migrate:dev -w backend

# Seed the database (optional)
npm run db:seed -w backend
```

### Environment configuration

Each workspace has its own `.env` file:

**`backend/.env`**

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/twitter_clone
JWT_SECRET=change-me-to-a-random-string-at-least-32-characters
FRONTEND_URL=http://localhost:5173
```

**`frontend/.env`**

```env
VITE_API_URL=http://localhost:3000
```

### Running

```bash
# Start both backend and frontend in parallel
npm run dev

# Or start individually:
npm run dev -w backend    # http://localhost:3000
npm run dev -w frontend   # http://localhost:5173
```

The backend runs with `tsx watch` for hot reload. The frontend runs with `vite` with HMR.

---

## ⚙️ Environment Variables

### Backend

| Variable       | Required | Default                 | Purpose                        |
| -------------- | -------- | ----------------------- | ------------------------------ |
| `NODE_ENV`     | No       | `development`           | Runtime environment            |
| `PORT`         | No       | `3000`                  | HTTP server port               |
| `DATABASE_URL` | Yes      | —                       | PostgreSQL connection string   |
| `JWT_SECRET`   | Yes      | —                       | JWT signing key (min 32 chars) |
| `FRONTEND_URL` | No       | `http://localhost:5173` | CORS origin for the frontend   |

### Frontend

| Variable       | Required | Default                 | Purpose                           |
| -------------- | -------- | ----------------------- | --------------------------------- |
| `VITE_API_URL` | No       | `http://localhost:3000` | Backend base URL (baked at build) |

### Docker (root `.env`)

| Variable            | Purpose                        |
| ------------------- | ------------------------------ |
| `POSTGRES_USER`     | PostgreSQL user                |
| `POSTGRES_PASSWORD` | PostgreSQL password            |
| `POSTGRES_DB`       | PostgreSQL database name       |
| `JWT_SECRET`        | JWT signing key (min 32 chars) |

---

## Database Migrations

```bash
# Create a new migration after schema changes
npm run db:migrate:dev -w backend

# Apply migrations in production
npm run db:migrate:deploy -w backend
```

In Docker, `prisma migrate deploy` runs automatically at container startup. The `migrate dev` command is only used in local development — it's not executed inside containers.

---

## Seed Data

```bash
# Local
npm run db:seed -w backend

# Docker
docker compose run --rm seed
```

The seed script generates:

- **10 users** with realistic bios (demo, alice, bob, carol, dave, eve, frank, grace, hank, iris)
- **35 tweets** with varied content and timestamps, some with images
- **34 follow relationships** creating a realistic social graph
- **50 likes** distributed across tweets

All users have password `password123`.

---

## Project Structure

```
twitter-clone/
├── docker-compose.yml
├── .env.example
├── .dockerignore
├── package.json              # npm workspaces root
├── tsconfig.base.json        # Shared TypeScript config
├── backend/
│   ├── Dockerfile
│   ├── docker-entrypoint.sh
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   ├── seed.ts
│   │   └── config.ts
│   ├── src/
│   │   ├── server.ts
│   │   ├── app/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── tweets/
│   │   │   ├── timeline/
│   │   │   ├── likes/
│   │   │   ├── follows/
│   │   │   ├── followers-list/
│   │   │   ├── following-list/
│   │   │   ├── user-profile/
│   │   │   ├── user-search/
│   │   │   └── health/
│   │   └── shared/
│   │       ├── auth/
│   │       ├── db/
│   │       ├── errors/
│   │       ├── middleware/
│   │       ├── response/
│   │       └── schemas/
│   ├── seed-assets/
│   └── uploads/              # Created at runtime
└── frontend/
    ├── Dockerfile
    ├── src/
    │   ├── main.tsx
    │   ├── app/
    │   │   ├── App.tsx
    │   │   └── router.tsx
    │   ├── features/
    │   │   ├── auth/
    │   │   ├── timeline/
    │   │   ├── tweets/
    │   │   ├── likes/
    │   │   ├── follows/
    │   │   ├── user-profile/
    │   │   └── user-search/
    │   └── shared/
    │       ├── api/
    │       ├── components/
    │       └── config/
    ├── index.html
    ├── vite.config.ts
    └── tailwind.config.js
```

---

## 📐 Design Decisions

### JWT authentication

Tokens are issued at login/register with a 7-day expiry. The backend verifies the token via `requireAuth` middleware on protected routes. The frontend stores the token in `localStorage` and attaches it to every API request via an Axios interceptor. No refresh token mechanism — the session expires when the token does.

### Prisma with driver adapter

The project uses `@prisma/adapter-pg` with the `pg` driver instead of the built-in Prisma engine. This is configured through `prisma.config.ts` (Prisma 7 config file format) which supplies `DATABASE_URL`. The `schema.prisma` datasource block has no `url` — it's provided exclusively by the config file. The runtime `PrismaClient` is initialized with the `PrismaPg` adapter.

### Feature-based organization

Both frontend and backend are organized by feature rather than by technical layer. This keeps related code (routes, controllers, services, tests) co-located and makes modules self-contained. Shared utilities (db client, auth, error handling) live in `shared/` directories.

### Validation

Zod schemas are co-located with their modules (`*.schemas.ts`). They validate incoming request bodies and query parameters at the controller boundary. The error handler catches `ZodError` instances and returns `400` responses with the validation message.

### ESM compatibility

The project uses `"type": "module"` with `.js` extensions on all relative imports. TypeScript compiles with `moduleResolution: "bundler"` — barrel exports must include the `.js` extension manually to produce valid Node.js ESM output.

---

## ⚠️ Known Limitations

- **No image resizing** – Uploaded images are stored as-is at their original resolution.
- **No paginated user search** – The search endpoint returns all matching users, not paginated results.
- **No password reset** – No email-based password recovery flow.
- **No notifications** – No real-time or polling-based notification system for likes/follows.
- **No edit tweet** – Tweets cannot be edited after creation.
- **Single image per tweet** – Only one image can be attached per tweet.
- **Token expiry without refresh** – No refresh token mechanism; the user must re-authenticate after 7 days.
- **No CDN for uploads** – Images are served directly from the backend's `uploads/` directory.

---

## 👨‍💻 Author

**Nicolás Boscasso**

- LinkedIn: https://www.linkedin.com/in/nicolas-boscasso/
- GitHub: https://github.com/nicob201
- Portfolio: https://nicolas-boscasso.vercel.app/
