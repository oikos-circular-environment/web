# Epic Brief — Sistema de Pesquisas de Usabilidade

## Resumo

Este épico introduz um sistema próprio de pesquisas (questionários) dentro da aplicação web da Oikos, para substituir ferramentas externas como Google Forms e Typeform no processo de pesquisa de usabilidade. Um administrador único monta formulários compostos por seções e perguntas (texto, escolha única ou múltipla escolha), sem que o conteúdo fique atrelado a deploys — tudo vive no banco de dados. O acesso de quem responde é controlado por convites individuais com código de 6 dígitos, sem exigir cadastro ou e-mail. O escopo desta entrega cobre a criação e publicação de formulários, a geração de convites e a coleta de respostas; análise e visualização de resultados ficam para uma entrega futura.

## Contexto & Problema

Quem é afetado: o administrador da aplicação (usuário único, responsável por conduzir pesquisas de usabilidade), e os participantes convidados a responder — hoje leva-se entrevistados guiados por um "entrevistador" que aplica a pesquisa e distribui o acesso.

Onde no produto: uma área nova e privada da aplicação web, dedicada à criação/gestão de formulários, mais uma rota pública (mas protegida por código) onde os convidados respondem.

Dor atual: pesquisas de usabilidade da aplicação hoje dependem de serviços de terceiros (Google Forms, Typeform), que impõem limitações de funcionalidades ou de custo à medida que o uso cresce. Além disso, qualquer alternativa que embutisse o conteúdo do questionário no código da aplicação exigiria um novo deploy a cada ajuste de texto ou pergunta — algo indesejado, já que perguntas e alternativas mudam com frequência conforme a pesquisa evolui. Não há hoje nenhuma forma de controlar quem tem acesso a uma pesquisa específica nem de rastrear qual entrevistador coletou qual resposta.

## Critério de sucesso

A entrega é considerada pronta quando os fluxos críticos (construtor, publicação, geração/uso de convite, resposta com lógica condicional de seções) têm cobertura de testes automatizados — end-to-end com Cypress cobrindo as jornadas de admin e de respondente, e testes unitários para a lógica de estado/condição — comprovando que as ações executam corretamente. Cypress é adotado especificamente para este módulo de pesquisas; o Playwright existente no projeto continua cobrindo os testes que já existem, sem migração. Como validação de uso real, o sistema precisa suportar a reprodução de uma pesquisa de campo completa (nos moldes do walkthrough de avaliação de usabilidade do mestrado, com seções condicionadas por persona) sem depender de Google Forms ou Typeform.
