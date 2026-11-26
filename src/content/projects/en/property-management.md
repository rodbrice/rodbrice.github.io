---
title: Property management application
kind: Private project · MVP in development
summary: Administering rented units means keeping contracts, meter readings, energy costs and monthly charges consistent. I am building the MVP of an application for this, with an ASP.NET Core backend and PostgreSQL.
order: 3
stack: [ASP.NET Core, PostgreSQL, Docker, CI/CD]
confidential: true
clientWork: false
---

## The need

Administering rented units involves contracts and their changes over time,
meter readings and the energy used by each unit, and the monthly charges and
payments that follow from them. These figures depend on each other: a reading
feeds an energy amount, which feeds a charge. Corrections must stay traceable
rather than overwrite what was recorded.

## My role

I am designing and building the application, from the data model to the API.
I work with supervised coding agents; my part is defining the rules from a
written specification, reviewing each change and checking it with automated
tests.

## Technical decisions

- **Insert-only records enforced by the database.** The audit log and the
  records meant to be permanent can be added but not changed or deleted by the
  application: its database user has no right to update or delete them. The
  guarantee lives in the database permissions, not only in the code, and an
  architecture test checks that every insert-only record is covered.
- **Money as decimal, with one explicit rounding rule.** Amounts are stored and
  calculated as decimals, never floating point. A single rounding function, to
  two places with halves rounded away from zero, is used everywhere, and the
  rounding policy is recorded with the calculation of each charge.
- **Sign-in with TOTP.** Accounts are created by invitation. The first sign-in
  sets up a time-based one-time password with recovery codes, and every later
  sign-in takes two steps.

## Quality and current status

The code has unit, integration and architecture tests, with integration tests
running against a real PostgreSQL database. This is a private project and an
MVP in development; this page makes no claim about deployment or use.

## Evidence

The code is private. I can walk through these decisions in an interview.
