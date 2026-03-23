# Diretrizes da Camada AI Provider

## Regra de Ouro

- O LLM (Gemini) e o unico responsavel por NLP (interpretacao de texto natural).
- Criar parsers manuais de texto em TypeScript para adivinhar intencoes/entidades e estritamente proibido.

## O que o AI Provider pode fazer

- Enviar a mensagem do usuario e o estado atual da FSM para o Gemini.
- Exigir saida estruturada em JSON tipado (schema + responseMimeType).
- Mapear o JSON de retorno para o contrato interno (`ParsedAssistantCommand`).

## O que o AI Provider nao pode fazer

- Nao usar regex/includes/indexOf para extrair intencao ou entidades da frase do usuario.
- Nao implementar fallback de NLP manual quando o LLM falhar.
- Nao executar regra de negocio, escrita em banco ou acao financeira.

## Tratamento de Falhas de NLP

- Se a IA falhar em um cenario real, a correcao deve ser feita no prompt/system instruction do Gemini.
- Evoluir exemplos e regras no prompt e obrigatorio antes de qualquer alternativa.
- Testes unitarios devem mockar o comportamento ideal do Gemini retornando JSON correto.

## Fluxos de Update (Obrigatorio)

- Para atualizacao de despesa, padrao canonical: `intent: update_expense`, `expenseName`, `newValue`.
- O prompt deve instruir explicitamente que verbos como "mude", "altere", "atualize" acionam `update_expense`.
- Se o usuario nao informar valor, a IA ainda deve manter `intent: update_expense` com `expenseName` para a FSM continuar a coleta.
