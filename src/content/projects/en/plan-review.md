---
title: plan-review — Terraform change risk review
kind: Python command-line tool
summary: Risky infrastructure changes can hide in a long Terraform plan. plan-review is an early-stage Python command-line tool that reads a saved plan and flags what this change destroys, replaces or opens up.
problem: "Risky infrastructure changes can hide in a long Terraform plan."
contribution: "I chose the scope, defined the rules and checked each milestone against real Terraform output."
status: earlyDevelopment
order: 4
stack: [Python, Terraform, pytest]
source: https://github.com/rodbrice/plan-review
---

## The problem

A long `terraform plan` buries the few lines that matter — a database that must
be replaced, an IAM policy that gains a wildcard — among hundreds of harmless
attribute changes. Static scanners check whether the resulting configuration is
misconfigured. They do not answer what this particular change destroys,
replaces or widens compared with what is running today.

## My role

This is my own public project. I chose the scope, defined the rules and their
limits, and checked each milestone against real Terraform output before merging
it. I worked with supervised coding agents and an automated review step; my
part was the design, the review of each change and the validation.

## The solution

The tool reads the JSON that `terraform show -json` produces for a saved plan
and applies five rules:

- **R1 and R2:** a resource that holds data, such as a database or a bucket, is
  destroyed or replaced.
- **R3:** an IAM policy gains an action or resource with a wildcard.
- **R4:** an ingress rule opens a port to the whole internet.
- **R5:** a bucket loses its public-access protection or becomes public.

The report is text, Markdown or JSON. A `.plan-review.yml` file can ignore a
rule or change its severity, and the exit status tells a pipeline whether a
blocking finding was found.

## Technical decisions

- **Review the delta, not the configuration.** The plan is the only artifact
  that carries both the current and the planned value of every resource. The
  tool therefore never runs Terraform and needs no cloud credentials; a
  misconfiguration the plan does not touch is out of scope.
- **Explicit rather than heuristic.** The resource types that count as holding
  data are an explicit, documented list. Each rule is a pure function from a
  resource change to findings, tested with positive and negative cases.
- **Real plans as test data.** The sample plans are genuine Terraform output,
  generated offline from minimal configurations with placeholder credentials.
  Continuous integration regenerates them and fails if they drift from their
  sources.
- **Nothing sensitive in reports.** Findings quote only what a reviewer needs
  and never a value Terraform marks as sensitive.

## Quality and validation

Continuous integration runs formatting and lint checks (ruff), type checking
(mypy) and the pytest suite on Python 3.12 and 3.13. Each milestone has a
validation record with the commands run and the results observed.

## Current status and limits

Early development. The command-line tool with rules R1 to R5, the configuration
file and the three report formats are done. A GitHub Action that comments on
pull requests and a first release are the next milestone; neither exists yet.
The rules target AWS resource types only. It is not a replacement for Checkov,
Trivy or tfsec, nor a policy engine or a cost estimator.

## What I learned

Writing down what the tool is not was as useful as writing its rules: it kept
the scope small enough to test every rule against real plans.

## Evidence

- [Source code and README](https://github.com/rodbrice/plan-review)
- [Architecture decision record](https://github.com/rodbrice/plan-review/blob/main/docs/adr/0001-review-the-plan-delta-not-the-state.md)
- [Validation records](https://github.com/rodbrice/plan-review/tree/main/docs/validation)
- [Synthetic sample plans](https://github.com/rodbrice/plan-review/tree/main/fixtures)
