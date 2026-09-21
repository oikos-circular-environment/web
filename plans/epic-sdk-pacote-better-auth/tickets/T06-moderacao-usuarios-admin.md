# T06 Moderação de usuários com admin.*

**Status:** [x] Concluído
**Depende de:** T03
**Módulos:** `dashboard/moderacao`
**Spec:** Tech Plan (decisão 4; Alterados: moderacao)

## Escopo
- Hooks client com TanStack Query sobre `authClient.admin.*`: `listUsers`, `getUser`, `listUserSessions`, `banUser`, `unbanUser`, `setRole`, `revokeUserSessions`, `removeUser`.
- Adaptar `users-list.tsx` e `user-details-drawer.tsx` aos tipos do plugin (elimina os `any` implícitos atuais).
- Moderação de suporte (`/v1`) permanece em Server Actions.

## Fora de escopo
Mudanças de UI.

## Verificação
Com usuário `moderator`, lista, detalhes, ban/unban, troca de role, revogar sessões e excluir funcionam; usuário comum recebe 403 da API e é barrado no layout.
