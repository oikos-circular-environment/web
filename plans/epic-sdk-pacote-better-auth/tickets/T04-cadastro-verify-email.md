# T04 Cadastro e verificação de e-mail

**Status:** [ ] Pendente
**Depende de:** T03
**Módulos:** `src/app/(public)/(institutional)/registro`, `src/app/(public)/(institutional)/verify-email`
**Spec:** Tech Plan (Alterados: login, registro, verify-email)

## Escopo
- Formulários `registro` e `verify-email` chamam `authClient.signUp.email` e `authClient.verifyEmail`, mantendo validação zod e mensagens atuais (conflito de e-mail incluído).
- Remover as `actions.ts` de auth dessas rotas.

## Fora de escopo
Login, conta.

## Verificação
Cadastro mostra a tela de sucesso; link do e-mail (`/verify-email?token=`) verifica a conta; erro de e-mail existente aparece igual ao atual.
