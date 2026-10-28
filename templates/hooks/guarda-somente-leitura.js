#!/usr/bin/env node
// Guarda dos agentes consultivos (reviewer, si, qa, ux) — PreToolUse em Bash.
// Bloqueia comandos que escrevem em disco, mudam o git, instalam dependências ou abrem cliente de banco.
// É um cinto de segurança por lista negra, não uma sandbox: a garantia principal é o agente não ter Write/Edit.
// exit 2 bloqueia a ferramenta e devolve o stderr ao agente.

let entrada = '';
process.stdin.on('data', (pedaco) => (entrada += pedaco));
process.stdin.on('end', () => {
  const comando = JSON.parse(entrada).tool_input?.command ?? '';
  // Redirecionamentos inofensivos não contam; `=>` e `->` (comuns em grep de código) também não.
  const semRuido = comando.replace(/\d?>\s*\/dev\/null|2>&1/g, '');

  const proibidos = [
    [/(^|[^=\-<>])>{1,2}\s*[^\s&|>]/, 'redirecionamento para arquivo'],
    [/(^|[\s;&|])(rm|mv|cp|tee|touch|mkdir|chmod|chown|truncate|ln)\s/, 'comando que altera arquivos'],
    [/\bsed\b[^|;&]*\s-i/, 'sed -i'],
    [/\bgit\s+(add|commit|push|pull|checkout|switch|reset|restore|stash|apply|clean|rm|mv|merge|rebase|cherry-pick|tag)\b/, 'git que altera estado'],
    [/\b(npm|yarn|pnpm)\s+(install|i|add|ci|remove|update|run\s+(lint|format|build))\b/, 'comando que altera dependências ou arquivos'],
    [/\b(pip3?\s+install|composer\s+(install|require|update)|go\s+get|cargo\s+add)\b/, 'comando que altera dependências'],
    [/\s--(fix|write)\b/, 'flag que reescreve arquivos'],
    [/\b(mysql|psql|mongosh?|redis-cli|sqlcmd|sqlite3)\b/, 'acesso a banco'],
  ];

  for (const [padrao, motivo] of proibidos) {
    if (padrao.test(semRuido)) {
      process.stderr.write(`Bloqueado (agente somente leitura): ${motivo}. Comando: ${comando}\n`);
      process.exit(2);
    }
  }
  process.exit(0);
});
