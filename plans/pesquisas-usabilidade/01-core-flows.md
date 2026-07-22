# Core Flows — Sistema de Pesquisas de Usabilidade

## Suposições assumidas (sem pergunta direta)

- Login é uma página dedicada (e-mail + senha), acessada pelo botão "Entrar" no cabeçalho público.
- Ao clicar em "Criar formulário", já nasce um rascunho ("Formulário sem título") e o admin cai direto no construtor.
- Exclusão de formulário só é permitida em rascunho sem convites gerados; publicado/encerrado não podem ser excluídos (preserva histórico) — para "desfazer", o caminho é duplicar e ajustar.
- Reordenar por arrastar-e-soltar funciona dentro da própria lista (seções entre si, perguntas dentro da própria seção); mover pergunta entre seções fica fora desta entrega.
- Ao encerrar um formulário, o link de código passa a recusar novos acessos, mas fica visível na listagem para referência futura.
- A condição de exibição de uma seção só pode referenciar uma pergunta de escolha (única ou múltipla) de uma seção **anterior** — evita ciclos e referências à própria seção.
- Se a pergunta que controla a condição de uma seção ficar sem resposta (ex.: era opcional e o convidado pulou), a seção condicionada é tratada como não aplicável e fica oculta.
- Não há mecanismo de recuperação de senha do admin nesta entrega — se a senha trocada pela UI for esquecida, o acesso fica bloqueado até intervenção manual (fora de escopo).
- Progresso do convidado é salvo como rascunho a cada seção concluída (avançar pra próxima seção grava as respostas da seção atual) — só "Finalizar" consome o código. Reentrar com o mesmo código, de qualquer dispositivo, retoma o rascunho de onde parou.
- Se duas sessões usarem o mesmo código ao mesmo tempo (ex.: aberto em dois dispositivos), ambas podem editar o rascunho; só quem clicar em "Finalizar" primeiro consome o código — a outra sessão, ao tentar finalizar depois, recebe o mesmo erro genérico de código inválido/expirado (o rascunho dela não se perde, mas não finaliza mais).

---

## 1. Login do administrador

**Gatilho:** botão "Entrar" no cabeçalho público do site.

- Admin clica em "Entrar" → navega para tela de login dedicada (e-mail + senha).
- Envia credenciais → se válidas, é redirecionado para o Painel de Controle.
- Se inválidas, mensagem de erro genérica ("e-mail ou senha inválidos") sem indicar qual campo errou.
- Sessão autenticada some o botão "Entrar" do cabeçalho e passa a mostrar acesso ao Painel/sair.

## 2. Painel de Controle e listagem de formulários

**Gatilho:** login bem-sucedido, ou acesso direto à URL do painel já autenticado.

- Painel abre com barra lateral (sidebar); "Pesquisas" é a primeira (e por ora única) opção.
- Ao entrar em Pesquisas, lista todos os formulários existentes: título, estado (rascunho/publicado/encerrado), data de criação.
- Cada item tem ações contextuais: Editar (abre construtor), Duplicar, Excluir (só disponível em rascunho — publicado/encerrado não podem ser excluídos), e acesso à aba de Convidados (habilitada só após publicar).
- Botão de destaque "Criar formulário" no topo da lista.
- Lista vazia mostra estado vazio convidando a criar o primeiro formulário.

## 3. Criar e montar formulário (construtor)

**Gatilho:** "Criar formulário" na listagem, ou "Editar" em um formulário existente (se rascunho).

- Construtor mostra o formulário como uma sequência de seções, cada uma com suas perguntas empilhadas.
- Admin pode: renomear formulário/seção/pergunta, adicionar seção, adicionar pergunta dentro de uma seção, escolher tipo da pergunta (Texto / Escolha única / Múltipla escolha), adicionar alternativas para perguntas de escolha, marcar pergunta como opcional (obrigatória é o padrão), definir limite de caracteres em perguntas de texto.
- Reordenar seções e perguntas por arrastar-e-soltar.
- Cada seção (a partir da 2ª) tem uma configuração opcional de **condição de exibição**: admin escolhe uma pergunta de escolha (única ou múltipla) de alguma seção anterior e marca quais alternativas dela liberam a exibição desta seção; sem condição, a seção aparece para todo mundo. A lista de perguntas disponíveis como condição só mostra perguntas de seções que vêm antes da atual.
- Uma pergunta ou alternativa referenciada por alguma condição de exibição não pode ser excluída enquanto a condição existir — a tentativa é bloqueada com um aviso indicando quais seções dependem dela; o admin precisa remover a condição primeiro.
- Mudanças ficam pendentes até o admin clicar em "Salvar" — sair sem salvar pergunta se quer descartar.
- Construtor só é editável livremente em rascunho; em publicado, a estrutura só é editável se a opção "permitir edição após respostas" estiver ligada nas configurações do formulário (ver Fluxo 4).

## 4. Publicar e encerrar formulário

**Gatilho:** ações "Publicar" / "Encerrar" disponíveis no construtor ou na listagem.

- Rascunho → "Publicar": valida que há ao menos uma seção com uma pergunta; confirma a ação (é o que libera o link para convidados); formulário passa a aceitar convites/respostas.
- Publicado → "Encerrar": pede confirmação (ação não pode ser desfeita); formulário para de aceitar novas respostas, convites ainda não usados deixam de funcionar.
- Não existe caminho de volta (publicado → rascunho, ou encerrado → publicado); para reabrir algo parecido, o admin duplica o formulário.
- Nas configurações do formulário (visível em qualquer estado), o toggle "permitir edição após respostas" controla se a estrutura pode ser editada depois da 1ª resposta enquanto publicado.

## 5. Duplicar formulário

**Gatilho:** ação "Duplicar" na listagem ou dentro do construtor.

- Cria uma cópia do formulário em rascunho, com todas as seções, perguntas, alternativas e configurações — sem convites e sem respostas.
- Título da cópia é sugerido como "[Título original] (cópia)", editável imediatamente no construtor.
- Condições de exibição das seções são preservadas na cópia, apontando para as perguntas/alternativas correspondentes da própria cópia (não para as do formulário original).
- Admin cai automaticamente no construtor da cópia para revisar/editar antes de publicar.

## 6. Gerar e gerenciar convites

**Gatilho:** aba "Convidados" dentro da página de um formulário — só fica disponível depois que o formulário é publicado (em rascunho, a aba aparece desabilitada).

- Lista de convites já gerados: nome/apelido do entrevistador, código, status (ativo / usado / expirado / revogado), data de criação.
- Botão "Gerar convite" abre um formulário curto: nome/apelido (obrigatório) e validade em dias (opcional, vazio = sem prazo).
- Ao gerar, mostra o código de 6 dígitos e a URL pública do formulário lado a lado, com botão de copiar cada um — admin repassa manualmente a quem for entrevistar.
- Convites ativos podem ser revogados a qualquer momento (deixam de funcionar imediatamente); convites usados/expirados/revogados ficam na lista só como histórico.

## 7. Acessar formulário via código (respondente)

**Gatilho:** convidado abre a URL pública do formulário (recebida do entrevistador).

- Se o formulário não está publicado (rascunho/encerrado), mostra mensagem de indisponibilidade — não avança para código.
- Se publicado, mostra uma tela pedindo o código de 6 dígitos antes de qualquer pergunta.
- Código inválido, já finalizado, expirado ou revogado → mensagem genérica de erro ("Código inválido ou expirado"), sem distinguir o motivo; permite tentar novamente.
- Código válido e sem rascunho salvo ainda → convidado começa do zero na primeira seção.
- Código válido com rascunho já salvo (de uma sessão anterior, mesmo dispositivo ou outro) → convidado retoma exatamente de onde parou, com as respostas já dadas preenchidas.

## 8. Responder formulário (uma seção por vez)

**Gatilho:** código validado com sucesso.

- Mostra uma seção por vez (título, descrição, suas perguntas), com indicador de progresso (ex: "Seção 2 de 4").
- Seções com condição de exibição são avaliadas automaticamente contra as respostas já dadas: se não bater, a seção é pulada silenciosamente (o convidado nunca a vê) e não conta como etapa pendente. A barra de progresso reflete apenas as seções que se aplicam ao convidado, recalculada conforme ele responde.
- Perguntas obrigatórias sem resposta bloqueiam o avanço, com aviso inline na pergunta pendente.
- Botões "Voltar" (exceto na 1ª seção) e "Próximo"; respostas ficam retidas ao navegar entre seções da mesma sessão. Ao voltar para uma seção cuja pergunta de condição controla seções seguintes, mudar a resposta pode alterar quais seções aparecerão dali pra frente.
- Cada vez que o convidado avança de seção ("Próximo"), as respostas da seção que ele acabou de responder são salvas como rascunho — fechar a aba, trocar de dispositivo ou perder conexão não perde o que já foi respondido até ali.
- Na última seção, o botão vira "Finalizar", com confirmação antes de submeter — é só essa ação que consome o código; salvar rascunho não finaliza.

```
┌─────────────────────────────┐
│ ●●○○  Seção 2 de 4          │
│                              │
│ Título da seção              │
│ Descrição da seção           │
│                              │
│ Pergunta 1 (obrigatória) *   │
│ [________________]           │
│                              │
│ Pergunta 2                   │
│ ( ) Alternativa A             │
│ ( ) Alternativa B             │
│                              │
│ [Voltar]           [Próximo]│
└─────────────────────────────┘
```

## 9. Confirmação de envio

**Gatilho:** convidado clica em "Finalizar" na última seção.

- Mostra uma tela de agradecimento simples confirmando o recebimento das respostas.
- Código do convite é marcado como usado nesse momento (não permite reenvio nem edição posterior); se outra sessão com o mesmo código tentar finalizar depois, vê o erro genérico de código inválido — o rascunho dela fica órfão, sem efeito.
- Não há próxima ação — a jornada do convidado termina aqui, sem exigir login/cadastro em nenhum momento.
