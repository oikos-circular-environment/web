# T07 — App shell privado + sidebar (org switcher + nav-user)

**Status:** [x] Concluído (entrou junto de `987e739`, sem marcação no plano até agora)
**Depende de:** T04
**Módulos:** `src/app/(dashboard)/`, `src/components/app-sidebar/`

## Contexto

Hoje só existe o shell público (header/main/footer em `layout.tsx`). Este ticket cria o shell das
rotas privadas — `/dashboard`, `/dashboard/profile`, `/dashboard/market`,
`/dashboard/moderacao` (as três últimas são T08/T09/T10). Referência visual: sidebar dark
ícone-first estilo Cloudflare (rail colapsável + navegação expandida por seções), com
`TeamSwitcher` no topo e `NavUser` no rodapé — os dois já são blocos oficiais do shadcn, buscar
via `shadcn` CLI (já é devDependency) e restilizar com os tokens do `DESIGN.md`.

## Passo 1 — grupo de rotas `(dashboard)`

`src/app/(dashboard)/layout.tsx` (Server Component): chama `getSession()` de `@/lib/session`
(mesma função que hidrata a store no layout raiz, T04); sem sessão, `redirect("/login")`. Envolve
`children` no `SidebarProvider` + `AppSidebar` (shadcn `sidebar` primitivo já vendorizado em
`src/components/ui/sidebar.tsx`).

## Passo 2 — `AppSidebar`

Não existe endpoint de "trocar organização ativa" na api (não foi criado na Trilha A) — a troca é
inteiramente client-side, na store (`use-session-store.ts`, T04).

- **Topo**: `TeamSwitcher` adaptado — lê `organizations` de `useSessionStore` (já vem hidratada
  do server, sem fetch próprio). Zero organizações: não mostra nada. Uma: nome fixo, sem chevron
  de troca. Mais de uma: dropdown de troca, chamando `useSessionStore().setActiveOrganizationId(id)`
  ao selecionar — só muda qual organização a UI mostra, não é uma chamada à api.
- **Meio**: itens de navegação condicionados por papel — todo usuário logado vê Profile e
  Market; só quem tem `role === "moderator"` (de `useSessionStore`) vê a seção Moderação.
- **Rodapé**: `NavUser` — mesmo componente reaproveitado pelo `AccountMenuButton` (T06), com o
  mesmo item "Log out" chamando a Server Action de `signOut` (ver T06).

## Passo 3 — `/dashboard/page.tsx`

Placeholder simples por agora (o módulo pago/dashboard avançado é trabalho futuro, fora deste
plano) — só confirma que a autenticação e o shell funcionam.

## Fora de escopo

- Conteúdo real do dashboard (métricas, gráficos) — não pedido neste plano.

## Verificação

- `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes.
- Manual: usuário sem organização não vê switcher; `christian.cesar@oikos.company` (seed, dono de
  uma company) vê o nome da organização fixo; só ele vê a seção Moderação.
