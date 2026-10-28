# Agent Ecosystem for Claude Code

A portable, git-versioned multi-agent development ecosystem built on top of [Claude Code](https://claude.ai/code). Drop it into any project and get a structured AI team — from planning to deploy — that you can update across all projects with a single `git pull`.

## Motivation

I experimented with multi-agent setups at work and found that the biggest gains came from two things: a Tech Lead agent that writes tasks in enough detail for smaller models to execute without ambiguity, and mandatory review gates before moving between phases. This template formalizes that pattern into a portable structure.

## How it works

```
You → /techlead "implement X"
         ↓
    reads CLAUDE.md (project context)
    decomposes into subtasks
    assigns agents + defines review gates
         ↓
    backend / frontend / dba / qa / devops / ...
         ↓
    reviewer / si (mandatory gates)
         ↓
    back to you: done or blocked with reason
```

## Agents

| Agent | Role |
|---|---|
| `techlead` | Entry point. Understands the task, decomposes it into atomic subtasks, delegates with full context. Runs on Opus. |
| `backend` | APIs, business logic, server-side integrations |
| `frontend` | Components, state management, client-side API integration |
| `dba` | Schema design, migrations, query optimization |
| `reviewer` | Quality gate — checks correctness, conventions, regressions |
| `si` | Security gate — OWASP, auth, permissions, sensitive data |
| `qa` | Test strategy, unit/integration/E2E tests |
| `devops` | Deploy, infrastructure, environment variables, CI/CD |
| `dados` | Data pipelines, analytics, reporting |
| `ux` | UX review — flows, usability, user feedback |

## Mandatory gates

- `dba` output → always reviewed by `reviewer` before proceeding
- Auth / permissions changes → `si` before `backend` executes
- Subtasks going to production → `devops` defines rollback before running
- Critical acceptance criteria → `qa` covers with tests before closing

## Setup

**New project:**
```bash
# clone directly as .claude
git clone https://github.com/WesleyDevFranco/agentes-wesley.git .claude

# run bootstrap to generate project context
/bootstrap

# start working
/techlead "your task here"
```

**Update all projects after improving an agent:**
```bash
# push improvement to this repo
git commit -m "improve techlead prompt"
git push

# in each project that uses it
cd .claude && git pull
```

## Project context

The `/bootstrap` skill reads the project structure, detects the stack, and generates a `CLAUDE.md` at the project root. This file is auto-loaded by Claude Code, so every agent gets the project context without extra steps.

The agents stay generic. The `CLAUDE.md` is what changes per project.

## Structure

```
.claude/
  agents/
    techlead.md
    backend.md
    frontend.md
    dba.md
    reviewer.md
    si.md
    qa.md
    devops.md
    dados.md
    ux.md
  skills/
    bootstrap.md
CLAUDE.md
```
