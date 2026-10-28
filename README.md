# Kit gerador de agentes para Claude Code

Um gerador que cria um **time de agentes do Claude Code sob medida para cada projeto**, a partir de templates versionados aqui. Você roda o gerador dentro do projeto; ele lê o código, entende a stack e escreve os agentes já com o contexto daquele projeto: diretórios, comandos, padrões de teste, armadilhas.

Os agentes gerados ficam **dentro do projeto** (`.claude/`), são versionados pelo git do projeto e não dependem deste repo depois de prontos.

## Por que gerar em vez de copiar agentes genéricos

Agente genérico lendo um arquivo de contexto continua pensando de forma genérica. Os agentes que funcionam bem têm o conhecimento do projeto **escrito neles**: o revisor sabe qual configuração do compilador está desligada, o test-writer sabe qual teste copiar e qual comando roda um único spec. O gerador junta as duas coisas:

- **Template (igual em todo projeto):** fluxo de trabalho, gates, formato de resposta, rigor do revisor, permissões e guards.
- **Seção `Neste projeto` (gerada):** stack, diretórios, comandos, padrões e armadilhas daquele projeto.

Ele também escolhe **quais** agentes fazem sentido. Uma API sem interface não ganha `frontend` nem `ux`; um projeto sem banco não ganha `dba`.

## Passo a passo

### 1. Clone o kit (uma vez por máquina)

```bash
git clone https://github.com/WesleyDevFranco/agentes-wesley.git ~/agentes-wesley
```

O caminho pode ser qualquer um; os exemplos usam `~/agentes-wesley`.

### 2. Abra o Claude Code na raiz do projeto

```bash
cd ~/caminho/do/projeto
claude --add-dir ~/agentes-wesley
```

O `--add-dir` libera a leitura dos templates. Sem ele, o Claude pede permissão quando for ler o kit; é só aceitar.

### 3. Peça para rodar o gerador

```
Rode o gerador que está em ~/agentes-wesley/gerar-agentes.md
```

O gerador:
1. **Lê o projeto**: estrutura, stack de cada parte, comandos, testes, banco, auth, CI. Em monorepo, lê as partes em paralelo.
2. **Pergunta** o que o código não responde (no máximo 6 perguntas): regras de negócio, o que é legado, se o agente pode commitar ou acessar banco, armadilhas conhecidas. Antes de rodar a suíte de testes para registrar falhas pré-existentes, pede sua autorização.
3. **Mostra o plano**: quais agentes vai gerar e por quê, quais não vai, o que entra no `CLAUDE.md`, e o que ficou **A CONFIRMAR**.
4. **Espera seu "ok"** e só então grava.
5. **Verifica** o resultado e testa os guards.

Se o projeto já tem um `.claude/` feito à mão, o gerador para e pergunta antes de sobrescrever qualquer coisa.

O Claude Code pede aprovação para escrever ou sobrescrever arquivos dentro de `.claude/`. É esperado: aprove quando o gerador for gravar os agentes, o comando e os hooks.

### 4. Depois de gerar

- Confira os agentes com `/agents`. Se não aparecerem, abra uma nova sessão.
- A pasta do projeto precisa estar marcada como **confiável** (o diálogo que o Claude Code mostra na primeira vez que abre a pasta). Sem isso, o Claude Code **ignora os guards dos agentes sem avisar**.
- Revise o que **A CONFIRMAR** e ajuste à mão se precisar.
- Commite `.claude/` e `CLAUDE.md` no projeto.

### 5. Use no dia a dia

```
/techlead implementar filtro por data na listagem de pedidos
```

## O que é gerado no projeto

```
projeto/
  CLAUDE.md                     ← curto, carregado em toda conversa: comandos, regras, estrutura, agentes
  .claude/
    commands/techlead.md        ← /techlead
    agents/<agente>.md          ← só os que fazem sentido no projeto
    hooks/*.js                  ← guards usados pelos agentes
```

| Agente | Função | Gerado quando | Pode escrever? |
|---|---|---|---|
| `/techlead` (comando) | Planeja em fatias, delega e pausa para aprovação | sempre | — |
| `reviewer` | Revisa o diff: bugs, contrato, regressões. Máx. 10 itens com `arquivo:linha` | sempre | não (guard) |
| `test-writer` | Escreve e roda testes só dos arquivos da fatia; bug no código é reportado, não corrigido | há framework de teste | só arquivos de teste (guard) |
| `qa` | Estratégia de testes e validação contra critério de aceite | há testes e fluxos críticos | não (guard) |
| `backend` | APIs, regra de negócio, integrações, jobs, scrapers | há código servidor | sim |
| `frontend` | Telas, componentes, estado, integração com API | há interface | sim |
| `ux` | Fluxos, estados de tela, microcopy, acessibilidade | há interface usada por pessoas | não |
| `dba` | Schema, migrations, índices, queries | há banco com schema próprio | sim |
| `si` | Auth, permissões, dados sensíveis, superfície exposta | há auth, dado sensível ou API exposta | não (guard) |
| `devops` | Deploy, CI/CD, infra, variáveis de ambiente | há Docker, CI ou deploy | sim |
| `dados` | Pipelines, ETL, lotes, relatórios | há processamento de dados | sim |

Partes com o mesmo papel e stacks diferentes (ex.: API Node + legado PHP) ganham um agente cada: `backend-api`, `backend-legado`.

## Como o `/techlead` trabalha

```
/techlead "task"
   ↓
lê o CLAUDE.md e o mapa do projeto (seção Neste projeto)
planeja em fatias verticais (≤ ~5 arquivos de produção cada) → você aprova
   ↓
para cada fatia:
  si (se toca auth) → backend / frontend / dba / ... → test-writer → reviewer (+ ux se tem tela)
  resumo da fatia → você aprova → próxima fatia
   ↓
fechamento: arquivos, pendências, sugestão de mensagem de commit (quem commita é você)
```

Gates obrigatórios, quando os agentes existem no projeto:
- Entrega do `dba` → `reviewer` antes de qualquer código que dependa do schema novo.
- Mudança em auth/permissões → `si` antes de implementar.
- Fatia que vai pra produção → `devops` define rollback antes.
- Toda fatia → `test-writer` e `reviewer` antes de fechar.

## Ensinar um agente

Quando um agente errar algo específico do projeto, acrescente a regra na seção `## Neste projeto` dele (`.claude/agents/<agente>.md`, entre os marcadores `PROJETO:INICIO` e `PROJETO:FIM`). É assim que ele vai ficando melhor. Essa seção é preservada nas atualizações.

Não edite o resto do arquivo no projeto: essa parte vem do template e é substituída quando você atualiza.

## Atualizar os agentes de um projeto

Quando o kit melhorar ou o projeto mudar (ganhou banco, trocou de stack):

```bash
cd ~/agentes-wesley && git pull
```
e, no projeto:
```
Rode o gerador que está em ~/agentes-wesley/gerar-agentes.md
```

Ele detecta que o projeto já tem agentes gerados e entra em **modo atualização**:
- aplica o template novo;
- **mantém intacta** a seção `Neste projeto` (inclusive o que você escreveu à mão);
- propõe acréscimos como diff;
- só grava com o seu ok.

## Requisitos

- **Claude Code.**
- **Node.js no PATH** do projeto: os guards são scripts Node, sem dependências. Sem Node, os agentes funcionam, mas sem guards.
- **Pasta do projeto confiável** no Claude Code, para os guards rodarem.

## Estrutura deste repo

```
gerar-agentes.md        ← o gerador (você passa este caminho ao Claude)
templates/
  CLAUDE.md             ← modelo do CLAUDE.md da raiz do projeto
  techlead.md           ← vira .claude/commands/techlead.md
  agents/*.md           ← um template por agente
  hooks/
    guarda-somente-leitura.js   ← reviewer, si, qa: bloqueia escrita, git que muda estado, cliente de banco
    guarda-test-writer.js       ← test-writer: só edita arquivo de teste, não roda a suíte inteira
CLAUDE.md               ← instruções para manter este kit
```

## Mexer no kit

Cada template tem frontmatter, corpo universal e a seção `## Neste projeto` com um `<!-- Preencher com: … -->` que diz ao gerador o que levantar. Detalhes da convenção e de como testar estão no `CLAUDE.md` deste repo. Depois de mudar, commite e dê `git push`; nos projetos, rode o gerador em modo atualização.

---

# Agent generator kit for Claude Code

A generator that creates a **Claude Code agent team tailored to each project**, from templates versioned here. You run the generator inside the project; it reads the code, understands the stack and writes agents that already carry that project's context: directories, commands, test patterns, pitfalls.

Generated agents live **inside the project** (`.claude/`), are versioned by the project's git and don't depend on this repo once created.

## Why generate instead of copying generic agents

A generic agent reading a context file still thinks generically. Agents that work well have the project knowledge **written into them**. The generator combines:

- **Template (same everywhere):** workflow, gates, output format, reviewer rigor, permissions and guards.
- **`Neste projeto` section (generated):** that project's stack, directories, commands, patterns and pitfalls.

It also picks **which** agents make sense: an API with no UI gets no `frontend` or `ux`; a project with no database gets no `dba`.

## Step by step

1. **Clone the kit (once per machine):**
   ```bash
   git clone https://github.com/WesleyDevFranco/agentes-wesley.git ~/agentes-wesley
   ```
2. **Open Claude Code at the project root:**
   ```bash
   cd ~/path/to/project
   claude --add-dir ~/agentes-wesley
   ```
   `--add-dir` lets it read the templates. Without it, Claude asks for permission when reading the kit; just accept.
3. **Ask it to run the generator:**
   ```
   Rode o gerador que está em ~/agentes-wesley/gerar-agentes.md
   ```
   It works in five steps:
   1. Reads the project.
   2. Asks up to 6 questions the code can't answer.
   3. Shows the plan: agents to generate and why, `CLAUDE.md` changes, items marked **A CONFIRMAR** (to confirm).
   4. **Waits for your ok** before writing.
   5. Verifies the result.

   If the project already has a hand-made `.claude/`, it stops and asks before overwriting anything. Claude Code asks for approval to write inside `.claude/`; that's expected, approve it when the generator writes the files.
4. **After generating:**
   - Check `/agents`; open a new session if they don't show up.
   - Make sure the project folder is **trusted** in Claude Code. Otherwise agent guards are **silently ignored**.
   - Review the **A CONFIRMAR** items.
   - Commit `.claude/` and `CLAUDE.md` in the project.
5. **Daily use:** `/techlead <task>`. It plans in vertical slices, delegates to the agents and pauses for your approval after each slice.

## Teaching an agent

When an agent gets something project-specific wrong, add the rule to its `## Neste projeto` section (between the `PROJETO:INICIO` / `PROJETO:FIM` markers). That section is preserved on updates. Don't edit the rest of the file in the project: it comes from the template and is replaced on update.

## Updating a project's agents

Run `git pull` in `~/agentes-wesley`, then run the generator again in the project. It detects the generated agents and switches to **update mode**:
- applies the new templates;
- keeps the `Neste projeto` sections intact, including your manual rules;
- proposes additions as a diff;
- writes only after your ok.

## Requirements

- Claude Code.
- Node.js on PATH (guards are dependency-free Node scripts).
- A trusted project folder, so the guards run.

## Repo structure

```
gerar-agentes.md        ← the generator (give this path to Claude)
templates/
  CLAUDE.md             ← template for the project's root CLAUDE.md
  techlead.md           ← becomes .claude/commands/techlead.md
  agents/*.md           ← one template per agent
  hooks/*.js            ← guards (read-only agents, test-writer)
CLAUDE.md               ← instructions for maintaining this kit
```
