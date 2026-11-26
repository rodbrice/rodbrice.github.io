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

I worked directly with the office user responsible for accounting to clarify
rules and review interactive prototypes before implementation. I designed and
built the tablet workflow, backend and office application. I used supervised
coding assistance during development, alongside code review and automated
tests.

## From field to office

- **In the field:** team leads can record crews, hours, waiting periods, safety
  information and signatures on a tablet. The interface is designed for use
  with gloves, and capture works without connectivity.
- **In the office:** reports enter a review and validation queue. The
  application supports rates, allocation to order positions, measurement
  sheets, PDF and Excel exports, and data prepared for SAP entry.

## Engineering decisions

Offline capture addresses the connectivity constraint of field work, while
glove-friendly interaction shapes the tablet input. Keeping capture and office
validation as distinct workflows lets the office user check reports before
generating documents. The output formats follow that office workflow.

## Quality and current status

The implementation has automated integration, frontend and end-to-end tests:
900+ integration, 2,300+ frontend and 100+ end-to-end tests, with 60+
architecture decision records (November 2026).
The client is currently testing the system in final validation. Production
rollout and operational impact have not been established.

## What I learned and evidence

Validating accounting rules with the person who uses them helped me turn a
paper process into specific field and office workflows. This is a private
client project; an architecture walkthrough is available upon request. The
client's code, screens and records remain confidential.
