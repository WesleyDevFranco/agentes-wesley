# Ecossistema de Agentes para Claude Code

Um ecossistema multi-agente portátil e versionado com git, construído sobre o [Claude Code](https://claude.ai/code). Cole numa pasta de qualquer projeto e tenha um time de IA estruturado — do planejamento ao deploy — que você atualiza em todos os projetos com um único `git pull`.

## Motivação

Experimentei setups multi-agente no trabalho e percebi que os maiores ganhos vieram de duas coisas: um agente Tech Lead que escreve as tasks com detalhe suficiente para modelos menores executarem sem ambiguidade, e gates de revisão obrigatórios entre as fases. Esse template formaliza esse padrão numa estrutura portátil.

## Como funciona

```
Você → /techlead "implementar X"
           ↓
      lê o CLAUDE.md (contexto do projeto)
      decompõe em subtasks
      atribui agentes + define gates de revisão
           ↓
      backend / frontend / dba / qa / devops / ...
           ↓
      reviewer / si (gates obrigatórios)
           ↓
      de volta pra você: concluído ou bloqueado com motivo
```

## Agentes

| Agente | Função |
|---|---|
| `techlead` | Ponto de entrada. Entende a task, decompõe em subtasks atômicas e delega com contexto completo. Roda em Opus. |
| `backend` | APIs, lógica de negócio, integrações server-side |
| `frontend` | Componentes, estado, integração com API no cliente |
| `dba` | Schema, migrations, otimização de queries |
| `reviewer` | Gate de qualidade — correção, convenções, regressões |
| `si` | Gate de segurança — OWASP, auth, permissões, dados sensíveis |
| `qa` | Estratégia de testes, unitários, integração e E2E |
| `devops` | Deploy, infra, variáveis de ambiente, CI/CD |
| `dados` | Pipelines de dados, analytics, relatórios |
| `ux` | Revisão de UX — fluxos, usabilidade, feedback ao usuário |

## Gates obrigatórios

- Saída do `dba` → sempre revisada pelo `reviewer` antes de continuar
- Mudanças em auth/permissões → `si` antes do `backend` executar
- Subtasks que vão pra produção → `devops` define rollback antes de rodar
- Critério de aceite crítico → `qa` cobre com testes antes de fechar

## Como usar

**Projeto novo:**
```bash
# clone direto como .claude
git clone https://github.com/WesleyDevFranco/agentes-wesley.git .claude

# rode o bootstrap para gerar o contexto do projeto
/bootstrap

# comece a trabalhar
/techlead "sua task aqui"
```

**Atualizar todos os projetos depois de melhorar um agente:**
```bash
# empurra a melhoria pra este repo
git commit -m "melhora techlead"
git push

# em cada projeto que usa o ecossistema
cd .claude && git pull
```

## Contexto do projeto

O skill `/bootstrap` lê a estrutura do projeto, detecta a stack e gera um `CLAUDE.md` na raiz. Esse arquivo é carregado automaticamente pelo Claude Code, então todos os agentes recebem o contexto do projeto sem passos extras.

Os agentes ficam genéricos. O `CLAUDE.md` é o que muda por projeto.

## Estrutura

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

---

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
| `reviewer` | Quality gate — correctness, conventions, regressions |
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
