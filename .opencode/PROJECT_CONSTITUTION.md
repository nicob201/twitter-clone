# PROJECT CONSTITUTION

This document defines the mandatory engineering standards for this repository.

All implementations must follow these rules unless explicitly instructed otherwise.

---

# Project Goals

Build a production-quality Twitter/X clone.

Priorities:

1. Maintainability
2. Correctness
3. Testability
4. Simplicity
5. Performance

Avoid premature optimization.

Favor clarity over cleverness.

---

# Technology Stack

## Backend

* Node.js 20+
* TypeScript
* Express
* Prisma ORM
* PostgreSQL
* Zod
* JWT Authentication
* Vitest
* Supertest

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* TanStack Query
* Axios
* Vitest
* React Testing Library
* Playwright

---

# TypeScript Rules

Strict mode is mandatory.

Never use:

* any
* @ts-ignore
* unsafe type assertions

Prefer:

* explicit types
* inferred types when obvious
* discriminated unions
* readonly where appropriate

Type safety is a requirement.

---

# Backend Architecture

Use feature-based modular architecture.

Structure:

src/
├── config/
├── middleware/
├── modules/
├── shared/
├── app/
└── server.ts

Each module owns its functionality.

Example:

modules/
├── auth/
├── users/
├── tweets/
├── follows/
└── likes/

Each module may contain:

* routes
* controller
* service
* schemas
* types

---

# Backend Responsibilities

Controllers:

* receive request
* validate input
* call service
* return response

Controllers must remain thin.

Services:

* business rules
* domain logic
* orchestration

Services must not contain HTTP concerns.

Prisma:

* database access only
* no business logic

---

# Validation

Use Zod for all external inputs.

Validate:

* request body
* params
* query strings

Never trust client input.

---

# Error Handling

Use centralized error handling.

Avoid duplicated try/catch blocks.

Return consistent API responses.

Do not expose internal errors to clients.

---

# Authentication

Use JWT.

Passwords must be hashed with bcrypt.

Never store plaintext passwords.

Protected routes must verify authentication.

Ownership checks must be enforced.

---

# Frontend Architecture

Use feature-based organization.

Structure:

src/
├── app/
├── features/
├── pages/
├── shared/
└── main.tsx

Features own their logic.

Example:

features/
├── auth/
├── timeline/
├── profile/
└── search/

Avoid cross-feature coupling.

---

# React Rules

Prefer:

* composition
* reusable components
* custom hooks

Avoid:

* oversized components
* duplicated state
* business logic inside UI components

Components should focus on presentation.

---

# Data Fetching

Use TanStack Query.

Do not manually reimplement caching.

Prefer server state in Query.

Prefer local state only for UI concerns.

---

# Styling

Use Tailwind CSS.

Mobile-first design.

Required breakpoints:

* mobile
* tablet
* desktop

Avoid inline styles.

---

# Prisma Rules

Use migrations.

Never edit database manually.

Schema changes must be tracked.

Prefer explicit relations.

Avoid duplicated queries.

---

# Testing Requirements

Every business feature should include tests.

Backend:

* unit tests
* integration tests

Frontend:

* integration tests

Critical user flows:

* authentication
* tweet creation
* follow/unfollow

must be tested.

---

# Git Rules

Use Conventional Commits.

Examples:

* feat(auth): implement login endpoint
* feat(tweets): create tweet service
* test(auth): add authentication integration tests
* docs: update runbook

No squash commits.

Small logical commits preferred.

---

# Code Quality Rules

Always prefer:

* readability
* explicitness
* maintainability

Avoid:

* dead code
* duplicated code
* unused imports
* large files
* unnecessary abstractions

Solve the current problem cleanly.

Do not build speculative abstractions.

---

# AI Implementation Rules

Before generating code:

* understand existing architecture
* reuse existing patterns
* preserve consistency

Never introduce a second pattern when one already exists.

Consistency is more important than personal preference.

AI agents must never create commits.

Follow this constitution strictly.
