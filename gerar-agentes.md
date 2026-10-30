# Gerador de agentes

Você vai gerar um time de agentes do Claude Code **específico para o projeto atual**, a partir dos templates deste kit. Os agentes gerados ficam dentro do projeto e não dependem mais deste kit depois de prontos.

## Onde está cada coisa

- **KIT** = a pasta onde está este arquivo (o usuário te passou o caminho). Os templates ficam em `KIT/templates/`:
  - `agents/*.md` — um template por agente
  - `techlead.md` — o comando `/techlead`
  - `professor.md` — o comando `/professor`
  - `hooks/*.js` — guards que impedem agentes somente leitura de escrever e o test-writer de mexer em código de produção
  - `CLAUDE.md` — modelo do `CLAUDE.md` da raiz do projeto
- **PROJETO** = o diretório de trabalho atual. Destinos:
  - `PROJETO/.claude/agents/<nome>.md`
  - `PROJETO/.claude/commands/techlead.md`
  - `PROJETO/.claude/hooks/*.js`
  - `PROJETO/CLAUDE.md`

**Nunca escreva nada dentro do KIT.**

## Anatomia de um template

Todo template (agentes e `techlead.md`) tem três partes:

1. **Frontmatter.** Copie `name`, `tools`, `model`, `maxTurns`, `color`, `hooks`, `argument-hint` e `disable-model-invocation` exatamente como estão. A `description` você pode especializar com a stack e o domínio do projeto. Mantenha o "Use para/quando…" e o que o agente não faz, porque é pela description que o Claude decide quando chamar o agente.
2. **Corpo universal**: tudo antes de `## Neste projeto`. Copie exatamente, sem editar. É a parte que melhora no kit e é reaplicada nas atualizações.
3. **`## Neste projeto`**: entre `<!-- PROJETO:INICIO … -->` e `<!-- PROJETO:FIM -->`. Substitua o comentário `<!-- Preencher com: … -->` pelo conteúdo do projeto, seguindo o que ele pede. Mantenha os dois marcadores.

## Modo

Olhe `PROJETO/.claude/`:
- Não existe, ou não tem `agents/` nem `commands/` → **geração** (etapas 1 a 6).
- Tem agentes com o marcador `PROJETO:INICIO` → **atualização** (seção no fim).
- Tem agentes ou commands **sem** o marcador (setup feito à mão) → PARE. Liste os arquivos que colidiriam e pergunte: gerar só os que não colidem, substituir ou cancelar. Nunca sobrescreva sem resposta.

## Etapa 1 — Ler o projeto

1. Estrutura:
   ```
   find . -maxdepth 4 -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/dist/*' -not -path '*/build/*' -not -path '*/vendor/*' -not -path '*/__pycache__/*' -not -path '*/.venv/*' -not -path '*/.next/*'
   ```
   Identifique as **partes** do sistema (ex.: `api/`, `web/`, `legado/`, `scraper/`) e se cada uma tem dependências próprias.
2. Por parte, levante:
   - **Stack e versões**: `package.json`, `requirements.txt`, `pyproject.toml`, `composer.json`, `go.mod`, `pom.xml`…
   - **Estrutura**, com um exemplo real de módulo ou tela (caminhos).
   - **Comandos exatos**: rodar **um único** teste, typecheck, lint (e se o script usa `--fix`), subir local (porta).
   - **Padrões de teste**: onde ficam, como montam mocks, um arquivo real para servir de exemplo.
   - **Banco**: SGBD, ORM, onde ficam as migrations e como funcionam.
   - **Auth**: mecanismo, onde é aplicado, roles.
   - **Integrações externas** e onde está o código delas.
   - **Armadilhas visíveis**: configs estranhas, `TODO`/`FIXME` relevantes, scripts perigosos.
3. Leia também o README, o `.env.example` (nunca o `.env`), os arquivos de CI/deploy e `git log --oneline -15` (estilo de commit e modelo de branch).
4. **Repositório grande ou monorepo:** delegue a leitura de cada parte a um agente `Explore`, em paralelo, pedindo exatamente a lista do item 2. Ele devolve a conclusão sem encher sua janela de contexto.
5. **Estado atual:** pergunte antes de rodar a suíte de testes e o typecheck (pode demorar). Se o usuário topar, registre as falhas pré-existentes (quantas, onde). Sem isso, os agentes perdem tempo "consertando" o que já estava quebrado.

## Etapa 2 — Perguntas

Faça **de uma vez**, no máximo 6, só o que o código não responde:
- Regras de negócio do domínio e quem são os usuários/roles.
- O que é legado ou não deve ser mexido.
- Restrições operacionais: o agente pode commitar? Pode conectar em banco? Em qual ambiente?
- Armadilhas conhecidas (o que já deu errado).
- Decisões que não devem ser questionadas.

Se o usuário pedir para não perguntar, assuma o mais conservador e marque como **A CONFIRMAR**.

## Etapa 3 — Escolher os agentes

| Agente | Gere quando |
|---|---|
| `techlead` (command) | sempre |
| `professor` (command) | sempre |
| `reviewer` | sempre |
| `test-writer` | o projeto tem framework de teste, ou o usuário quer começar a ter |
| `qa` | há testes e o sistema tem fluxos críticos ou mais de uma parte |
| `backend` | há código servidor (API, jobs, CLI, scrapers, workers) |
| `frontend` | há interface (web, mobile, desktop) |
| `ux` | há frontend usado por pessoas |
| `dba` | há banco com schema próprio (migrations, ORM, SQL versionado) |
| `si` | há autenticação, dados pessoais ou financeiros, ou superfície exposta (API pública, upload, webhook) |
| `devops` | há Dockerfile, CI/CD, IaC ou processo de deploy |
| `dados` | há pipeline, ETL, processamento em lote ou relatórios |

- **Duas partes com o mesmo papel e stacks diferentes** (ex.: API Node + legado PHP): gere um agente por parte, a partir do mesmo template, com sufixo no `name` e no nome do arquivo (`backend-api`, `backend-legado`).
- Não invente papéis que não existem nos templates.

## Etapa 4 — Plano e aprovação

Mostre e PARE:
```
Projeto: <nome> — <1 linha>
Partes: <diretório> → <stack> (1 linha cada)

Agentes a gerar:
  <nome> — <por quê>
Não gerados:
  <nome> — <por quê> (quem cobre o papel, se alguém)

CLAUDE.md da raiz: criar | atualizar (mostre o que entra e o que muda)
A CONFIRMAR: <lista>
```
Termine com **"Aprova?"**. Só grave depois de um ok explícito.

## Etapa 5 — Gerar

1. **Agentes**: para cada um, leia o template, copie frontmatter e corpo como manda a *Anatomia* e preencha `## Neste projeto`. Regras desse conteúdo:
   - Só fatos com evidência, citando caminhos reais (`src/pedidos/pedidos.service.ts`) e exemplos que existem.
   - Específico ganha de genérico: "validação com zod em `src/schemas/`", e não "valide as entradas".
   - Curto: 10 a 40 linhas, em listas.
   - O que você inferiu sem evidência vai marcado **A CONFIRMAR**.
   - Nunca copie valor de secret, token ou `.env`.
   - Texto em pt-BR; nomes de código como estão no projeto.
2. **`techlead`**: mesmo processo. A seção **Neste projeto** dele é o mapa que ele usa para delegar: partes → agente responsável, agentes que não existem e quem cobre, gates específicos. Grave em `PROJETO/.claude/commands/techlead.md`.
3. **`professor`**: mesmo processo. A seção **Neste projeto** é o contexto de stack para o professor dar exemplos concretos: linguagens, frameworks, padrões recorrentes, libs principais e o que cada uma faz neste projeto. Grave em `PROJETO/.claude/commands/professor.md`.
4. **Hooks**: copie `KIT/templates/hooks/*.js` para `PROJETO/.claude/hooks/` sem alterar e rode `chmod +x`. Só copie os hooks que algum agente gerado usa (veja o `hooks:` no frontmatter).
5. **`CLAUDE.md` da raiz**: a partir de `KIT/templates/CLAUDE.md`, trocando todos os colchetes por conteúdo real. Se já existir, preserve o que está lá e só acrescente ou ajuste o que foi aprovado na etapa 4.
6. Não toque em `.claude/settings.json` nem em `.claude/settings.local.json` do projeto.

## Etapa 6 — Verificar e entregar

1. Cada arquivo gerado tem frontmatter com `name` e `description` e os dois marcadores. Nenhum `<!-- Preencher com` nem `[colchete de instrução]` sobrou: rode `grep -rn "Preencher com" .claude/` e confira o `CLAUDE.md`.
2. Os guards funcionam:
   ```
   echo '{"tool_input":{"command":"touch x"}}' | node .claude/hooks/guarda-somente-leitura.js; echo $?   # esperado: 2
   ```
   Se `node` não estiver instalado, avise: sem ele os guards não rodam.
3. Se a convenção de arquivo de teste do projeto não casa com os padrões de `guarda-test-writer.js` (`*.spec.*`, `*.test.*`, `test_*.py`, `*_test.go`, `*Test.php`, pastas `tests/`, `__tests__/`, `spec/`, `e2e/`), avise. O test-writer seria bloqueado ao escrever testes.
4. Resumo final para o usuário:
   - arquivos criados ou alterados;
   - itens **A CONFIRMAR**;
   - próximos passos:
     1. Se os agentes não aparecerem em `/agents`, abra uma nova sessão.
     2. A pasta do projeto precisa ser **confiável** (diálogo de confiança aceito), senão o Claude Code ignora os hooks dos agentes, sem avisar.
     3. Revise e commite `.claude/` e `CLAUDE.md` no projeto. Você não commita.
     4. Use `/techlead <task>`.
     5. Quando quiser aprender o que o techlead planejou antes de implementar, use `/professor <plano>`.
     6. Quando um agente errar algo específico do projeto, acrescente a regra na seção **Neste projeto** dele. É assim que ele melhora.

## Atualização (projeto que já tem agentes gerados)

Use quando o kit evoluiu ou o projeto mudou.

1. Para cada agente existente, monte a versão nova:
   - frontmatter (menos a `description`) e corpo **do template atual**;
   - `description` **do arquivo atual do projeto**;
   - seção `## Neste projeto` **do arquivo atual, intacta**. Ela pode ter regras escritas à mão.
2. **Hooks**: substitua `PROJETO/.claude/hooks/*.js` pelos do template atual (hooks não têm parte do projeto) e copie os que algum agente passou a usar.
3. Releia o projeto (comece por `git log --oneline` desde a última alteração em `.claude/agents/`) e proponha acréscimos ou correções na seção **Neste projeto** como diff. Nunca apague uma linha dessa seção sem aprovação.
4. Agentes que agora se aplicam (o projeto ganhou banco, front…) ou templates novos no kit: proponha.
5. Mostre o diff por arquivo, peça **"Aprova?"** e só então grave. Depois, rode a Etapa 6.
