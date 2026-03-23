# Padrao da camada Conversacional (FSM)

- O fluxo de conversa deve ser guiado por maquina de estados finita (FSM), sem function calling dinamico.
- Estado atual e contexto da sessao devem ser persistidos via `SessionRepository`.
- Cada transicao deve ser deterministica e testavel.
- Estados devem ser nomeados de forma explicita (ex: `idle`, `collecting_installment_due_date`).

## Regras

- Evite efeitos colaterais fora do `ProcessMessageUseCase`.
- Mensagens de fallback devem ser padronizadas para entradas desconhecidas.
- Para qualquer resposta de soma/resumo/relatorio financeiro, o retorno deve ser formatado via Presenter (nunca string crua no switch da FSM).
