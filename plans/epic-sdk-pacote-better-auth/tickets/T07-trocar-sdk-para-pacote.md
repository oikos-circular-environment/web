# T07 Trocar SDK local pelo pacote

**Status:** [ ] Pendente
**Depende de:** T04, T05, T06
**Módulos:** `package.json`, `.npmrc`, imports, `src/libs/oikos-sdk`, `openapi-ts.config.ts`, `.github/workflows/ci.yml`, `knip.jsonc`, `biome.json`, `.env.example`, `AGENTS.md`
**Spec:** Brief; Tech Plan (decisão 1; Restrições)

Estado prévio: a troca já foi feita na working tree da branch, sem commit (reaplicar após T03 a T06 removerem os `/v2`).

## Escopo
- `@oikos-circular-environment/oikos-sdk@0.1.0-beta.16` (caret na linha beta), `.npmrc` com GitHub Packages.
- Imports `@/libs/oikos-sdk` para o pacote; remover `src/libs/oikos-sdk`, `openapi-ts.config.ts`, `generate:sdk` e `@hey-api/openapi-ts`.
- CI com `GH_TOKEN_PERSONAL_TOKEN`; `knip`, `biome`, `.env.example` e `AGENTS.md` sem referência ao SDK local.

## Pré-requisito externo
Secret `GH_TOKEN_PERSONAL_TOKEN` no repo `web` e na Vercel.

## Verificação
`npm ci` no CI, `tsc`, `biome ci`, `knip` e build verdes.
