# T01 Orquestração com opencode

**Status:** [x] Concluído
**Depende de:** nenhuma
**Módulos:** `.opencode/prompt/`, `.claude/agents/`, `AGENTS.md`
**Spec:** Brief (Resumo); Tech Plan (Abordagem)

O mobile e a api têm `.opencode/prompt` (oikos-exec, oikos-review, oikos-text) e `.claude/agents` (executor, code-review, qa-runner). O web só tem `opencode.json` e `agents/api-sdk-client.md`.

## Escopo
- Copiar e adaptar os prompts e agentes do mobile para Next.js, biome (`npx biome check`), knip e Playwright.
- Registrar em `AGENTS.md` o fluxo do epic: orquestrador delega cada ticket a um executor, code-review revisa o diff, qa-runner roda `tsc`, biome, build e e2e.
- Remover ou atualizar `api-sdk-client.md` para refletir o SDK como pacote.

## Fora de escopo
Qualquer código de produto.

## Verificação
Agente executor consegue ler um ticket e rodar `npx tsc --noEmit` e `npx biome check` no web.
