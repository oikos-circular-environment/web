# T05 /v1 e conta com cookie encaminhado

**Status:** [ ] Pendente
**Depende de:** T03
**Módulos:** `src/libs/api/oikos-api.ts`, `dashboard/account`, `dashboard/profile`, `dashboard/market`, `device-preview`, `suporte`
**Spec:** Tech Plan (decisão 6; Alterados: account, profile)

## Escopo
- `oikos-api.ts` vira só cliente server: sem `withCredentials` e sem `Authorization`; `createServerApiClient(headers)` encaminha o `cookie`.
- Conta em Server Actions pelo SDK: `getV1UsersMe`, `patchV1UsersMeChangePassword`, `deleteV1UsersMe`, `patchV1UsersMeCancelDeletion`.
- Ajustar profile, market, device-preview e suporte para o cliente com cookie.

## Fora de escopo
Troca do pacote (T07), moderação de usuários.

## Verificação
Trocar senha, excluir e cancelar exclusão funcionam contra a API local; profile e market carregam logado; `tsc`, biome e build verdes.
