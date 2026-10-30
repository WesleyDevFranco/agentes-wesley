# agentes-wesley — kit gerador de agentes

Este repo **não é instalado** nos projetos. Ele guarda templates e um gerador (`gerar-agentes.md`) que, rodado dentro de um projeto, escreve agentes específicos para aquele projeto em `.claude/` dele. Depois de gerados, os agentes não dependem deste repo.

## Estrutura
- `gerar-agentes.md` — o prompt do gerador (modos geração e atualização).
- `templates/agents/*.md` — um template por agente.
- `templates/techlead.md` — vira `.claude/commands/techlead.md` no projeto.
- `templates/professor.md` — vira `.claude/commands/professor.md` no projeto.
- `templates/hooks/*.js` — guards copiados sem alteração para `.claude/hooks/` do projeto.
- `templates/CLAUDE.md` — modelo do `CLAUDE.md` da raiz do projeto.

## Convenção dos templates
- **Frontmatter**: `name`, `tools`, `model`, `hooks` etc. são copiados exatamente pelo gerador; só a `description` é especializada.
- **Corpo universal** (tudo antes de `## Neste projeto`): igual em todo projeto e reaplicado nas atualizações. Só coloque aqui o que vale para qualquer stack.
- **`## Neste projeto`**: entre `<!-- PROJETO:INICIO … -->` e `<!-- PROJETO:FIM -->`, com um `<!-- Preencher com: … -->` dizendo ao gerador o que levantar. Os marcadores são o contrato com o modo de atualização: não mude o texto deles.
- Texto em pt-BR. Hooks em Node, sem dependências.

## Ao mudar algo
- Template novo: siga a convenção acima e acrescente a regra de "gere quando" na Etapa 3 do `gerar-agentes.md`.
- Hook novo ou alterado: teste com JSON na entrada padrão (`echo '{"tool_name":"Bash","tool_input":{"command":"..."}}' | node templates/hooks/x.js; echo $?` — 2 bloqueia, 0 libera).
- Para testar o gerador de verdade, rode-o numa **cópia** de um projeto (nunca no projeto original) e confira os arquivos gerados.
- Mudanças relevantes devem constar no README.
