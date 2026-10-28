#!/usr/bin/env node
// Guarda do test-writer (PreToolUse). Garante por código o que o prompt pede:
// - Edit/Write só em arquivos de teste (código de produção nunca é tocado);
// - Bash sem git que altera estado, sem banco, sem instalar dependência e sem suíte inteira.
// exit 2 bloqueia a ferramenta e devolve o stderr ao agente.

const path = require('path');

let entrada = '';
process.stdin.on('data', (pedaco) => (entrada += pedaco));
process.stdin.on('end', () => {
  const { tool_name: ferramenta, tool_input: parametros = {} } = JSON.parse(entrada);

  if (ferramenta === 'Edit' || ferramenta === 'Write' || ferramenta === 'MultiEdit') {
    // Relativo ao projeto: um projeto dentro de ~/test/ não pode liberar qualquer arquivo.
    const arquivo = path.relative(process.env.CLAUDE_PROJECT_DIR || process.cwd(), parametros.file_path ?? '');
    const ehArquivoDeTeste =
      /\.(spec|test)\.[cm]?[jt]sx?$/.test(arquivo) || // JS/TS: x.spec.ts, x.test.jsx
      /(^|\/)test_[^/]+\.py$|_test\.(py|go)$/.test(arquivo) || // Python/Go: test_x.py, x_test.go
      /Test\.(php|java|kt)$/.test(arquivo) || // PHP/Java/Kotlin: XTest.php
      /(^|\/)(__tests__|__mocks__|tests?|spec|e2e)\//.test(arquivo); // pastas de teste e fixtures
    if (!ehArquivoDeTeste) {
      bloquear(
        `test-writer só pode escrever arquivos de teste (*.spec.*, *.test.*, test_*.py, *_test.go, *Test.php, ` +
          `__tests__/, __mocks__/, tests/). Tentou: ${arquivo}. Se o teste falhou por bug no código, NÃO corrija: reporte no resumo.`,
      );
    }
  }

  if (ferramenta === 'Bash') {
    const comando = parametros.command ?? '';
    const suite = 'suíte inteira (rode só os testes dos arquivos indicados)';
    const proibidos = [
      [/\bgit\s+(add|commit|push|pull|checkout|switch|reset|restore|stash|apply|clean|rm|mv|merge|rebase|cherry-pick)\b/, 'git que altera estado'],
      [/\b(mysql|psql|mongosh?|redis-cli|sqlcmd)\b/, 'acesso a banco'],
      // Runner sem arquivo, só com flags (`python3 -m pytest -v`, `npm test -- --coverage`), também é a suíte inteira.
      [/\b(npm|yarn|pnpm)\s+(run\s+)?test(\s+-\S*)*\s*($|&&|;|\|)/, suite],
      [/\b(npx\s+|python3?\s+-m\s+)?(jest|vitest|pytest|phpunit)(\s+-\S*)*\s*($|&&|;|\|)/, suite],
      [/\bphp\s+artisan\s+test(\s+-\S*)*\s*($|&&|;|\|)/, suite],
      [/\b(npm|yarn|pnpm)\s+(install|i|add|ci|remove|update|run\s+(lint|format|build))\b/, 'comando que altera dependências ou reescreve arquivos'],
      [/\b(pip3?\s+install|composer\s+(install|require|update)|go\s+get|cargo\s+add)\b/, 'comando que altera dependências'],
    ];
    // Flag de filtro (`--filter=X`, `-k X`, `-t X`) restringe a execução: não é a suíte inteira.
    const temFiltro = /\s(-k|-t|-run|--filter|--grep|--testNamePattern)(\s|=)/.test(comando);
    for (const [padrao, motivo] of proibidos) {
      if (motivo === suite && temFiltro) continue;
      if (padrao.test(comando)) bloquear(`Bloqueado para o test-writer: ${motivo}. Comando: ${comando}`);
    }
  }

  process.exit(0);
});

function bloquear(mensagem) {
  process.stderr.write(mensagem + '\n');
  process.exit(2);
}
