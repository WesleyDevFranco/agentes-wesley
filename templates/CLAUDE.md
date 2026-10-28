# CLAUDE.md

<!-- Gerado por gerar-agentes.md. Curto de propósito: é carregado em toda conversa (alvo: menos de 60 linhas).
     O detalhe de cada área fica na seção "Neste projeto" de cada agente em .claude/agents/.
     Os colchetes abaixo são instruções para o gerador; nenhum deve sobrar no arquivo final. -->

[1-2 linhas: o que é o sistema e para quem.]
- `[pasta]/` — [stack em 1 linha]

Idioma do código: [pt-BR | inglês].

## Comandos
| | [parte 1] | [parte 2] |
|---|---|---|
| Um teste | `...` | `...` |
| Tipos | `...` | `...` |
| Lint | `...` | `...` |
| Subir | `...` (porta N) | `...` (porta N) |

## Regras que você erraria sem saber
[Só o que um agente erraria lendo o código. Exemplos do tipo de regra que vale estar aqui:]
- [Nunca `git add`/`git commit` — commits são só do usuário.]
- [Nunca conectar em banco de produção — entregue o SQL.]
- [~N testes já falham no HEAD limpo — rode só os afetados.]
- [Não rode `npm run lint`: usa `--fix` e reescreve arquivos.]
- [Mudança de schema = migration manual em `migrations/`.]
- Branches: [modelo]. Commits: [estilo].

## Estrutura e nomes
- [como um módulo/feature é organizado, sufixos de arquivo, estilo de import]

## Padrões de teste
- [onde fica o teste, como monta mocks, como nomeia os casos]

## Agentes
Para qualquer task maior que um ajuste pontual, use `/techlead <task>`: ele planeja em fatias verticais, delega aos agentes de `.claude/agents/` e pausa para aprovação a cada fatia.
- Agentes deste projeto: [lista]
- Gates: [só os que se aplicam — ex.: `dba` → `reviewer` antes de seguir; auth/permissões → `si` antes de implementar; prod → `devops` define rollback]
