# Ecossistema de Agentes

## Como usar

**Projeto novo:**
1. Copie (ou clone) a pasta `.claude/` para a raiz do projeto
2. Rode `/bootstrap` — ele lê o projeto e gera o `CLAUDE.md` com contexto
3. Comece com `/techlead` passando a task

**Projeto já configurado:**
- Use `/techlead` para qualquer task nova
- Os agentes especializados são chamados pelo Tech Lead

## Agentes disponíveis

| Agente | Quando usar |
|---|---|
| `techlead` | Ponto de entrada para qualquer task. Decompõe e delega. |
| `backend` | APIs, lógica de negócio, integrações |
| `frontend` | Componentes, estado, integração com API |
| `dba` | Schema, migrations, queries |
| `reviewer` | Gate de qualidade entre fases |
| `si` | Auth, permissões, dados sensíveis, vulnerabilidades |
| `dados` | Pipelines, analytics, relatórios |
| `ux` | Fluxos, usabilidade, feedback ao usuário |
| `devops` | Deploy, infra, servidor, variáveis de ambiente, CI/CD |
| `qa` | Estratégia de testes, escrita de unitários, integração e E2E |

## Gates obrigatórios

- `dba` → sempre passa por `reviewer` antes de continuar
- Qualquer mudança em auth/permissões → passa por `si` antes do `backend`
- Subtasks que vão pra prod → `devops` confirma rollback antes de executar
- Critério de aceite de qualquer subtask crítica → `qa` cobre com testes antes de fechar

## Atualizar os agentes

Este `.claude/` é um repositório git. Para puxar melhorias:
```bash
cd .claude && git pull
```

---

<!-- Este arquivo é o template. Quando o /bootstrap rodar, ele gera um CLAUDE.md
     com o contexto real do projeto, substituindo ou complementando este. -->
