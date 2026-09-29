---
title: Work orders and field operations
kind: Full-stack business application
summary: A web application for work orders, daily field reports and cost tracking on an industrial site, with a tablet app for the field team that keeps working offline.
order: 1
stack: [C#, ASP.NET Core, React, TypeScript, PWA, PostgreSQL, Docker]
confidential: true
---

## The problem

Work on an industrial site was followed through paper forms and a chain of
spreadsheets: work orders, attendance, daily reports, and the cost statements
built from them. Each figure was copied by hand from one document to the next,
so errors travelled silently, and nobody had a single view of what had been
done, by whom and against which order.

## What I built

- **A tablet app for the field team**: a step-by-step daily report with large
  touch targets and autosave, which keeps working without a connection and
  synchronises when it comes back.
- **A back office for review and accounting**: each report moves through clear
  states (draft, submitted, reviewed, accounted), and role-based permissions
  decide who can do what at each step.
- **Exports** to PDF and Excel for the documents that still have to leave the
  system.

## Architecture

A modular monolith in ASP.NET Core, with PostgreSQL as the single source of
truth and a React and TypeScript progressive web app as the client. Each
business area (orders, attendance, reports, accounting) is a module with its
own boundary, which keeps a single deployable unit while leaving room to split
it later. The whole system runs with Docker Compose.

## Technical decisions

- **Offline by design.** Report drafts live in the browser's IndexedDB behind a
  service worker. The server stays authoritative: synchronisation resolves
  conflicts explicitly instead of letting the last write win.
- **Automatic, but editable.** Hours, totals and remaining budgets are computed,
  yet anyone with the right permission can override a computed value. The
  original value is kept, a reason is required and the change goes to an audit
  log; recomputing never silently replaces a manual correction.
- **Business rules before code.** The formulas hidden in the existing
  spreadsheets were written down and turned into tests first, so the
  application reproduces the numbers the team already trusts.
- **Decisions on record.** Stack, offline strategy and the override and audit
  model are documented as architecture decision records.

## Result

The path from a field report to the cost statement becomes one traceable flow
instead of a series of retyped documents, and every manual correction stays
visible and explained.
