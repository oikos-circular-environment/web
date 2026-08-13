# T06 — Botão de conta no header

**Status:** [x] Concluído
**Depende de:** T04
**Módulos:** `src/components/site-header.tsx`, `src/components/account-menu-button.tsx` (novo)

## Contexto

`site-header.tsx` hoje só tem navegação pública + `ModeToggle`, sem nada relacionado a sessão
(`:38-54`). O usuário pediu, especificamente, o canto superior direito: deslogado mostra
"Entrar"/"Registrar"; logado mostra um único botão combinando ícone de Dashboard + Avatar.

## Passo 1 — `AccountMenuButton` (Client Component)

Lê `useSessionStore` (zustand — não existe `useSession()`, a sessão vem hidratada do server via
`SessionSync`, ver T04). Três estados:
- **Resolvendo** (flash de hidratação entre o HTML do server, que não conhece a store, e o
  `useEffect` do `SessionSync` rodando no client — não é um fetch, é só o instante entre paint e
  efeito): `Skeleton` do tamanho do botão final, sem CLS.
- **Deslogado**: dois botões, "Entrar" (`Link` pra `/login`) e "Registrar" (`Link` pra
  `/registro`).
- **Logado**: um único botão (ícone `LayoutDashboard` do lucide + `Avatar` do usuário) que abre o
  dropdown `NavUser` (mesmo padrão do rodapé da sidebar, T07 — reaproveitar o componente, não
  duplicar) — clicar no botão em si (fora do dropdown) navega pra `/dashboard`. O item "Log out"
  do `NavUser` chama uma Server Action que usa `signOut` de `@/lib/session` (limpa o cookie) e
  redireciona pra `/`.

## Passo 2 — plugar no `site-header.tsx`

Substituir a posição do `ModeToggle` sozinho por `<AccountMenuButton /> <ModeToggle />` (ordem:
conta primeiro, tema depois, canto direito).

## Fora de escopo

- Notificações/badge de contagem no botão — não pedido.

## Verificação

- `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes.
- Manual: deslogado mostra Entrar/Registrar; logado (após T05) mostra o botão combinado; nenhum
  layout shift perceptível na transição de "resolvendo" pra estado final.
