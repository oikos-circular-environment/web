# T09 — Market (exemplo de feature, listagem paginada)

**Status:** [x] Concluído (entrou junto de `987e739`, sem marcação no plano até agora)
**Depende de:** T03, T07
**Módulos:** `src/app/(dashboard)/market/`, `src/components/market/`, `src/contexts/market-context.tsx`

## Contexto

Nome "market" (não "coleta"/"collection-points") — consistente com
`mobile/src/app/(tabs)/market/`. Padrão de estado do mobile a espelhar: Context (filtros) +
`useInfiniteQuery` do TanStack Query sobre o endpoint paginado, não Zustand (Zustand fica só pra
sessão/organização, conforme `AGENTS.md`).

## Passo 1 — `MarketContext`

`src/contexts/market-context.tsx`: filtros validados com zod (`query`, `radius`, `category`),
espelhando `mobile/src/contexts/market-context.tsx` na forma, adaptado pro web (sem
`useGeospatial()` nativo — usar geolocalização do browser como fallback opcional, sem bloquear a
listagem se o usuário negar).

## Passo 2 — listagem

`src/app/(dashboard)/market/page.tsx` (Server Component, prefetch da primeira página) +
`_components/market-list.tsx` (Client Component, `useInfiniteQuery` sobre a função gerada do
SDK). Cards carregando usam `Skeleton`. Sem resultado/sem localização: estado vazio com `Empty*`
do shadcn (mesmo padrão de `verify-email`).

## Fora de escopo

- Mapa (o mobile usa mapa em outras telas de complaints, não no market em si — não replicar
  aqui sem pedido explícito).

## Verificação

- `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes.
- Manual: listagem pagina corretamente (scroll/botão "carregar mais"), filtro de busca funciona.
