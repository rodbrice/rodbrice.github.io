---
title: Property management platform
kind: Backend and software architecture
summary: The backend of a property management MVP, from tenants and contracts to meter readings, monthly billing, payments and expenses, built as a modular monolith on .NET 10.
order: 2
stack: [C#, .NET 10, ASP.NET Core, ASP.NET Core Identity, EF Core, PostgreSQL]
confidential: true
---

## The problem

Managing rental units means keeping contracts, meter readings, tariffs, monthly
charges, payments and expenses consistent with each other, month after month.
Mistakes are expensive: a wrong reading or a lost partial payment ends up
directly on a tenant's bill, and has to be explained.

## Approach: a testable specification first

Before any backend code, the MVP was turned into a specification precise enough
to implement without inventing rules: the data model and its relationships,
states and transitions, domain invariants, the contract of each operation, and
explicit formulas with numeric examples and acceptance tests for every critical
calculation.

## Architecture

A modular monolith on .NET 10 and ASP.NET Core: one deployable application,
split into modules with explicit boundaries (organisation and units, people and
contracts, readings and tariffs, billing, payments, expenses). EF Core and
PostgreSQL handle persistence and migrations; ASP.NET Core Identity handles
accounts, with two-factor authentication.

## Technical decisions

- **Closed months are immutable.** The tariffs and readings used for a bill are
  frozen with it; a later correction creates a new version instead of
  rewriting history.
- **Payments are allocations.** Partial payments, reversals and credits are
  recorded as allocations against charges, never as edits to a balance, so
  every amount can be traced back to its origin.
- **Idempotent, transactional writes.** Every operation that touches money runs
  in a single transaction and can be retried safely, so a repeated request
  cannot charge or pay twice.
- **Audit and personal data.** Sensitive changes are audited, and personal data
  is handled according to data protection rules.

## Result

A backend that covers the full monthly cycle, from readings to closing, billing
and payments, with the acceptance tests of the specification as its definition
of done.
