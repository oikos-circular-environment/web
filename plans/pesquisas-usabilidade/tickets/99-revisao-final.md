# T99 — Revisão final

## Escopo

Checklist de fechamento do épico: roda a suíte Cypress completa deste módulo de ponta a ponta, confirma os testes unitários do avaliador de condição, e revalida cada Fluxo do `01-core-flows.md` contra o que foi implementado — o critério de sucesso definido no `00-epic-brief.md`.

## Dependências

Todas as tickets anteriores (T1–T10).

## Checklist

- [ ] Suíte Cypress completa (`cypress/e2e/pesquisas/**`) rodando verde, cobrindo os 9 fluxos do `01-core-flows.md`
- [ ] Testes unitários do avaliador de condição de seção rodando verde
- [ ] Playwright existente (fora deste módulo) continua passando sem alteração — confirma que a introdução do Cypress não afetou a suíte já existente
- [ ] Reprodução manual do cenário do walkthrough do mestrado: formulário com pergunta "Persona" controlando exibição de seções (S1–S6), do zero até respostas finalizadas, sem depender de Google Forms/Typeform
- [ ] Revisão cruzada: cada um dos 9 fluxos de `01-core-flows.md` tem cobertura correspondente implementada (nenhuma suposição documentada ficou sem tratamento)
- [ ] `biome ci .` e `npm run build` passando (gate padrão do CI do repo)
- [ ] Confirmar que T10 (`devops`) está de fato concluída do outro lado — não só o script existe, o pipeline real roda

## Definição de Pronto

Critério de sucesso do Epic Brief satisfeito: cobertura de testes automatizados nos fluxos críticos, validada com a reprodução real da pesquisa de campo do mestrado, tudo rodando dentro da aplicação Oikos sem dependência de ferramenta externa.
