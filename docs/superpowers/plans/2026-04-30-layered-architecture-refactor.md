# Layered Architecture Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the `api/` directory in-place to the Node TS Layered Backend Architecture, removing AI/Telegram/Calendar integrations while preserving all business logic and adding full CRUD REST endpoints.

**Architecture:** In-place incremental migration in 9 phases. Each phase is self-contained: remove old code, create new structure, wire factories, write tests, verify. Path aliases (`@factories/`, `@use-cases/`, `@repositories/`, `@errors/`) replace fragile relative imports.

**Tech Stack:** Fastify 5.x + fastify-type-provider-zod 5.0.3 (downgrade from 6.x), Zod 4.x, Vitest, Biome, tsup, Prisma, PostgreSQL, pnpm

---
