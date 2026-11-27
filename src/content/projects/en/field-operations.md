---
title: Industrial Field Operations Management System
kind: Field and office workflow application
summary: Field teams recorded daily work on paper, and office staff re-entered it into spreadsheets. I designed and built offline-capable tablet and connected office workflows to link field capture with office review.
problem: "Field teams recorded daily work on paper; office staff re-entered it into spreadsheets."
contribution: "I designed and built the offline-capable tablet workflow, the backend and the office application."
status: clientValidation
order: 1
featured: true
stack: [ASP.NET Core, PostgreSQL, React, TypeScript, Docker]
confidential: true
---

## The problem

At an industrial maintenance company, team leads recorded daily work on paper.
An office colleague then re-entered the reports into spreadsheets to prepare
measurement sheets, client documents and SAP-ready data. Field capture and
office review needed different tools, but the information had to move between
them.

## My role and discovery

I worked directly with the client's accountant, the office user responsible
for accounting. The rules were settled in rounds of questions and written
answers, and each answer became a recorded decision. Before building a screen,
I had its interactive prototype reviewed and validated. When the client asked
for changes, I turned each request into a plan of small deliveries, each one
tested on its own. I designed and built the tablet workflow, backend and office
application, using supervised coding agents during development, alongside code
review and automated tests.

## From field to office

- **In the field:** team leads can record crews, hours, waiting periods, safety
  information and signatures on a tablet. The interface is designed for use
  with gloves, and capture works without connectivity.
- **The office work queue:** a guided queue takes each report step by step
  until it is accounted. Values the team lead typed are checked against the
  registers and associated, added or corrected; then the report is reviewed and
  accounted on the positions of the client's order, with a price book whose
  articles carry a coefficient.
- **Closed periods:** the month ends on a closing checklist; changing the
  accounting of a closed month, or accounting on a closed order position, asks
  for a reason.
- **Measurement sheets:** each holds one order position and is versioned. A
  sheet is regenerated while it waits for SAP entry, and corrected as a new
  version once it is registered in SAP.
- **Order ledger:** balances per order position, notices as the order value is
  approached, a below-cost warning that never blocks, and a reconciliation with
  the SAP export.
- **Around the routine:** the client's daily site journal, attendance with its
  hours rules, the registers, and PDF and Excel exports.
- **Audit trail:** every office correction records who made it, when, the
  previous and new value, and the reason. At the client's request, the simple
  cases, such as a first registration, no longer ask for a reason; the system
  records its own.

## Engineering decisions

- **The server is the single source of the rules.** The office screens show
  what the API answers, such as budget warnings and cost coverage, and never
  recompute it, so each rule lives in one place.
- **Signed paper stays true.** When a correction changes the content of a paper
  the client already signed, the client's signature is dropped and the system
  asks for the new edition to be printed and signed again.
- **Offline queue on the tablet.** Reports wait in a queue on the device and
  synchronise with the server when the connection returns.
- **Italian documents, untranslated data.** Each user can choose Italian or
  English for the interface, but the documents and exports are always in
  Italian, and registered data is never translated.

## Quality and current status

The work has been delivered in 230+ pull requests since September 2026, each
one validated by the automated tests: 900+ integration, 2,300+ frontend and
110+ end-to-end tests, with 65+ architecture decision records (27 November
2026). The client is currently testing the system in final validation.
Production rollout and operational impact have not been established.

## What I learned and evidence

Validating accounting rules with the person who uses them, one question and
one prototype at a time, helped me turn a paper process into specific field
and office workflows. This is a private client project; an architecture
walkthrough is available upon request. The client's code, screens and records
remain confidential.
