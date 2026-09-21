# T08 Testes e verificação final

**Status:** [x] Concluído
**Depende de:** T07
**Módulos:** `e2e/`, `e2e/fake-api-server.mjs`, `playwright.config.ts`
**Spec:** Tech Plan (Falhas; Alterados: e2e)

## Escopo
- `fake-api-server.mjs` simula `/auth/*` nativo (`sign-in/email`, `sign-up/email`, `get-session`, `sign-out`, `verify-email`, `admin/*`) no lugar de `/v2/auth/*`.
- e2e de login, cadastro, guard do dashboard, conta e moderação.
- Rodar `biome`, `knip`, `tsc`, build e `graphify update .`.

## Fora de escopo
Novos fluxos.

## Verificação
Playwright verde localmente e no CI; PR pronto para `development`.
