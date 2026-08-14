# T08 — Profile (exemplo de feature)

**Status:** [ ] Pendente
**Depende de:** T03, T07
**Módulos:** `src/app/(dashboard)/profile/`, `src/components/profile/`

## Contexto

Espelha o padrão do mobile (`mobile/src/app/(tabs)/(home)/profile.tsx`): formulário único de
edição (`react-hook-form` + `zod`), sem split view/edit. Campos: nome, telefone (a api já tem
`Profile` — `full_name`, `display_name`, `phone`, endereço opcional). Confirmar exatamente quais
endpoints o SDK gerado expõe pra profile antes de montar o form (rodar T03 primeiro dá isso de
graça via tipos gerados).

## Passo 1 — `use-profile.ts` (viewmodel, `src/components/profile/hooks/`)

Hook único: busca o profile via SDK gerado + TanStack Query (`useQuery`), expõe `updateProfile`
via `useMutation`. View não chama o SDK direto.

## Passo 2 — página + formulário

`src/app/(dashboard)/profile/page.tsx` (Server Component, prefetch inicial) +
`_components/profile-form.tsx` (Client Component). Loading usa `Skeleton` nos campos; submit usa
`Spinner` no botão.

## Fora de escopo

- Upload de avatar — se o SDK gerado expuser o endpoint, avaliar num ticket separado (não travar
  este).

## Verificação

- `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes.
- Manual: editar nome/telefone de um dos usuários fixos do seed persiste e reflete após reload.
