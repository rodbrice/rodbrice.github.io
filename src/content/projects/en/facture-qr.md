---
title: Facture QR — Swiss QR-bill invoicing
kind: QR-bill invoicing core
summary: Swiss QR-bills must follow strict rules for addresses, references and IBANs. I am building a .NET invoicing core in small, verified steps — QR-bill library, PostgreSQL storage, local HTTP API — with each step's checks published.
problem: "Swiss QR-bills must follow strict rules for addresses, references and IBANs."
contribution: "I set the scope, made the design decisions and checked each step against the standard."
status: inDevelopment
order: 2
stack: [C#, .NET, ASP.NET Core, PostgreSQL, EF Core]
source: https://github.com/rodbrice/facture-qr
---

## The problem

Since September 2022, the QR-bill has been the only payment slip accepted in
Switzerland and Liechtenstein. Producing one correctly means following the SIX
Implementation Guidelines: structured addresses, a QR-IBAN with a QR reference
or an IBAN with a Creditor Reference, an exact payload inside the Swiss QR Code
and a fixed layout. A payment part that breaks these rules can be rejected by
banks. Facture QR is a small invoicing tool for independents that gets this
core right before any screen exists.

## My role

This is my own public project. I set the scope and the non-goals, made the
design decisions recorded in the architecture decision records, and checked
each unit against the standard before merging it. I worked with supervised
coding agents and an automated review step; my part was defining the rules,
reviewing the changes and verifying the results.

## Approach and constraints

The repository grows in small units, each with a written validation record:
the QR-bill core library first, then the invoice model and its storage, then
an HTTP API. The scope is deliberately narrow: CHF only, no VAT logic, and only
synthetic data taken from the examples in the SIX guidelines.

## What exists today

- **QR-bill library:** Swiss IBAN and QR-IBAN checks, structured addresses, QR
  reference and Creditor Reference, and rendering of the payment part as PDF or
  PNG.
- **Invoice model:** an invoice moves from draft to issued to paid, and only a
  draft can change. The total is always the sum of the lines and stays within
  the QR-bill amount range.
- **Storage:** PostgreSQL with EF Core; the schema changes only through
  migrations.
- **Local HTTP API:** customers, drafts with their lines, issuing, recording a
  payment, and the invoice as an A4 PDF with its QR-bill. Errors use
  ProblemDetails, and the OpenAPI document is committed.

## Technical decisions

- **Invoice numbers without duplicates or gaps.** Each year has one counter
  row, incremented and locked inside the transaction that issues the invoice.
  Two invoices issued at the same moment never get the same number, and a
  failed issue rolls the counter back. I rejected `MAX + 1` (duplicates under
  concurrency), a database sequence (gaps after a rollback) and serializable
  transactions with retries (a retry loop on every issuing path). The cost is
  that issues within one year wait for each other during one short transaction.
- **Rules in the domain, repeated where data could break.** The invoice rules
  live in plain C# classes; the database repeats the critical ones with check
  constraints and a unique index on the number.
- **A proven library for the layout.** Rendering the payment part goes through
  an open-source QR-bill library behind a single class, so the project focuses
  on validation rather than redrawing a regulated layout.

## Quality and validation

- QR payloads are compared with expected payloads written by hand from the
  standard, decoded back, and read by an independent QR decoder.
- API tests read the QR code back from the generated invoice PDF with a
  separate decoder and compare it with the invoice.
- A concurrency test issues 40 drafts at once against a real PostgreSQL
  database and checks that the numbers are exactly 1 to 40. Replacing the
  allocator with a naive `MAX + 1` made this test fail, as recorded in the
  validation notes.
- Continuous integration builds with warnings as errors, checks formatting,
  runs the tests and applies the migrations to an empty database.

## Current status and limits

In development. Validation of the samples in the SIX portal is still pending.
There is no user interface yet, and the API has no authentication: it is meant
to run locally for one person. It is not a hosted billing service. A React front
end and bank-statement reconciliation are planned next steps, not features.

## What I learned

Working from a regulated standard pushed me to write the evidence before the
features. Recording each check with its command and result also made it clear
what is verified and what is still pending.

## Evidence

- [Source code and README](https://github.com/rodbrice/facture-qr)
- [Architecture decision records](https://github.com/rodbrice/facture-qr/tree/main/docs/adr)
- [Validation records](https://github.com/rodbrice/facture-qr/tree/main/docs/validation)
- [Synthetic samples](https://github.com/rodbrice/facture-qr/tree/main/docs/samples)
