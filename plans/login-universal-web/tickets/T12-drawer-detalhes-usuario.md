# T12 — Drawer de detalhes do usuário (moderação)

**Status:** [x] Concluído (api entregou profile/accounts/sessões; SDK regenerado; drawer
implementado — verificado com tsc/lint/build/87 testes Playwright + validação manual no browser)
**Depende de:** T10, e de uma mudança na api (repo `api`, ainda não iniciada)
**Módulos:** `src/app/(dashboard)/dashboard/moderacao/`, `src/components/moderacao/`,
`src/components/ui/sheet.tsx`

## Contexto

Ao clicar num usuário (linha da tabela ou item do dropdown) na tela de moderação, abrir um drawer
lateral com as informações completas do usuário: dados core (nome, e-mail, papel, banimento),
`profile` (nome completo, telefone, endereço), `accounts` (métodos de login vinculados) e
`sessions` (com IP/user-agent).

Visual de referência: shadcn drawer/sheet lateral direito, mas **flutuante** — não colado nas
bordas da viewport, cantos arredondados, sombra, margens em vez de altura cheia (ver captura
compartilhada na conversa que originou este ticket). O drawer deve renderizar **contido dentro do
container da página de moderação** (não sobrepor a sidebar do app), usando o `container` prop do
`SheetPrimitive.Portal` (Radix) apontando pra um ref do container da página, em vez do `body`
padrão.

A coluna "Status" (Banido/Ativo) já existe na tabela (`users-list.tsx`) — não precisa recriar.

## Dependência bloqueante (repo `api`)

`GET /v2/moderation/users/:id` hoje só retorna dados core do usuário (sem `profile`/`accounts`).
`GET /v2/moderation/users/:id/sessions` não retorna `ip_address`/`user_agent`. Spec completa da
mudança necessária na api foi passada para implementação em outro agente/sessão (contexto:
conversa que criou este ticket). Resumo do que falta lá:

1. `GET /v2/moderation/users/:id` passa a incluir `profile` (via `ProfilesRepository.findByUserId`,
   já existe) e `accounts` (repositório novo, só campos seguros: `id`, `provider_id`,
   `account_id`, `created_at`, `updated_at`, `scope` — **nunca** `password`/`access_token`/
   `refresh_token`/`id_token`).
2. `GET /v2/moderation/users/:id/sessions` passa a incluir `ip_address`/`user_agent` por sessão
   (colunas já existem no model `Session`, só não são repassadas pela camada de tipagem da api).

Este ticket só pode ser retomado depois que a api expuser esses campos **e** o SDK do web for
regenerado (`src/libs/oikos-sdk/`, aponta pro `/docs/openapi.json`).

## Passo 1 — estender `SheetPortal`/`SheetContent` (`src/components/ui/sheet.tsx`)

Adicionar suporte a `container` opcional (repassado pro `SheetPrimitive.Portal`) sem quebrar os
usos atuais (default continua `body`). Variante de estilo "flutuante" (rounded, inset margin,
shadow) como classe adicional, não como novo componente.

## Passo 2 — `UserDetailsDrawer`

Novo componente em `src/app/(dashboard)/dashboard/moderacao/_components/user-details-drawer.tsx`.
Busca via `useQuery` (`getV2ModerationUsersById` + `getV2ModerationUsersByIdSessions`) ao abrir.
Seções: dados core, profile, accounts (lista de métodos de login), sessions (IP/user-agent/
expiração), informações de banimento (motivo/expiração quando `banned`).

## Passo 3 — abrir o drawer

Clique na linha da tabela ou item novo no dropdown ("Ver detalhes") em `users-list.tsx` seta o
usuário selecionado e abre o drawer.

## Verificação

- `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes.
- `npx playwright test` verde.
- Manual: abrir o drawer de um usuário banido e um ativo, conferir que profile/accounts/sessions
  aparecem, e que o drawer não cobre a sidebar do app.
