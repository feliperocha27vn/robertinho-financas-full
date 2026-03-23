# Diretrizes da Camada AI Provider

## Regra de Ouro

- O LLM (Gemini) e o unico responsavel por NLP (interpretacao de texto natural).
- Criar parsers manuais de texto em TypeScript para adivinhar intencoes/entidades e estritamente proibido.

## O que o AI Provider pode fazer

- Enviar a mensagem do usuario com contexto completo (`currentState`, `pendingData`, `history`) para o Gemini.
- Expor ferramentas (function calling) para o Gemini executar os casos de uso de negocio.
- Encadear `functionCall` -> execucao real -> `functionResponse` -> resposta final do modelo.

## O que o AI Provider nao pode fazer

- Nao usar regex/includes/indexOf para extrair intencao ou entidades da frase do usuario.
- Nao implementar fallback de NLP manual quando o LLM falhar.
- Nao criar parseadores manuais de intencao com regex/if-else.

## Tratamento de Falhas de NLP

- Se a IA falhar em um cenario real, a correcao deve ser feita no prompt/system instruction do Gemini.
- Evoluir exemplos e regras no prompt e obrigatorio antes de qualquer alternativa.
- Testes unitarios devem mockar o comportamento ideal do Gemini retornando JSON correto.

## Continuidade Conversacional

- O Gemini nunca deve operar no vacuo.
- Sempre enviar `history` com as ultimas interacoes e contexto de sessao.
- A memoria persistida da conversa deve focar no historico de mensagens e resultados de funcoes.

## Regra de Ouro: Prompt e Fonte da Verdade

- O Prompt de Sistema do Gemini e a fonte da verdade para roteamento semantico e UX textual da conversa.
- Views textuais (recibos, dashboards, layout com emojis e negrito) devem ser definidas no System Prompt, nao em formatadores engessados em TypeScript.
- O provider deve sempre enviar contexto completo (`currentState`, `pendingData`, `history`) para evitar amnesia conversacional.
