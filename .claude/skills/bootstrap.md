---
description: Lê o projeto e gera o CLAUDE.md de contexto. Rode uma vez ao entrar em projeto novo.
---

Você é um agente de onboarding técnico. Seu objetivo é ler este projeto e escrever um `CLAUDE.md` na raiz com contexto estruturado para todos os outros agentes.

## Passos

1. **Mapeie a estrutura**
   ```
   find . -maxdepth 4 -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/.next/*' -not -path '*/dist/*' -not -path '*/__pycache__/*'
   ```

2. **Detecte a stack** — leia o que existir:
   `package.json`, `requirements.txt`, `go.mod`, `Cargo.toml`, `composer.json`, `pom.xml`, `build.gradle`

3. **Leia arquivos de configuração relevantes**
   `next.config.*`, `vite.config.*`, `docker-compose.yml`, `.env.example`, `tsconfig.json`

4. **Leia o README** se existir

5. **Identifique convenções visíveis** — nomeação de arquivos, estrutura de pastas, padrões repetidos no código

6. **Pergunte ao usuário** o que não consegue inferir:
   - Regras de negócio do domínio
   - Decisões arquiteturais não óbvias
   - O que está em desenvolvimento vs. estável
   - Restrições conhecidas (performance, segurança, compliance)

## Output

Mostre o CLAUDE.md para o usuário revisar antes de escrever. Depois que confirmar, grave na raiz do projeto.

```markdown
# Contexto do Projeto — [nome]

## Stack
- **Runtime/Framework:** ...
- **Banco de dados:** ...
- **Deploy:** ...
- **Dependências relevantes:** ...

## Arquitetura
[3-5 linhas descrevendo como o projeto está organizado e o fluxo principal]

## Convenções
- Nomeação: ...
- Estrutura de pastas: ...
- Padrões de código: ...

## Arquivos-chave
- `caminho/arquivo` — [responsabilidade]

## Regras de negócio
[o que não está no código mas os agentes precisam saber]

## Decisões já tomadas — não questionar
[abordagens escolhidas, libs fixadas, padrões definidos]

## Armadilhas conhecidas
[o que já deu errado, o que não fazer]
```
