# 📝 Diretrizes para a Camada de Apresentação (Presenters/Formatters)

Este diretório contém as classes e funções responsáveis por formatar os dados brutos da aplicação em mensagens amigáveis para o usuário final (Rich Text, Markdown, HTML para Telegram).

## 🎯 Regras de Ouro (Nunca Quebre Estas Regras):

1. **Separação de Responsabilidades (FSM vs Presenter):**
   - Os **Casos de Uso (Use Cases) e Handlers (FSM)** NUNCA devem conter strings formatadas, emojis ou regras de layout (Markdown/HTML). A FSM lida APENAS com a lógica de negócio, extração de dados da IA e persistência no banco.
   - Toda a formatação visual (UI/UX do bot) pertence EXCLUSIVAMENTE a esta pasta (`presenters`).

2. **A Regra da "Fiação" (The Wiring Rule):**
   - **NUNCA crie um método no Formatter sem plugar a chamada dele no respectivo Handler.**
   - É um erro grave criar testes unitários para o `MessageFormatter` que passam perfeitamente, mas esquecer de injetar/chamar essa função no retorno do `ProcessMessageUseCase`. O dado bruto do banco de dados DEVE passar pelo Formatter antes de ir para o `TelegramProvider`.

3. **Hidratação de Dados Reais:**
   - Para relatórios (ex: resumos mensais), o Handler deve buscar os dados REAIS no banco de dados (Prisma) e passá-los como argumentos (DTOs) para os métodos do Formatter (ex: `monthlySummary(expenses)`). Não use dados falsos ou listas vazias nas implementações de produção.

## ❌ O que NÃO Fazer (Bad Practice):
```typescript
// DENTRO DO HANDLER / FSM:
// ❌ Errado: Retornar string crua e chumbada.
return "Despesa de R$ 50 registrada no mercado.";

// ❌ Errado: Misturar lógica visual na FSM.
return `✅ *Despesa Registrada!* \n Valor: R$ ${expense.value}`;
```

## ✅ Regra Obrigatoria de UX para Somas e Relatorios

- Qualquer resposta de totalizacao, resumo ou consulta financeira deve usar um Presenter/Formatter com layout detalhado.
- E proibido retornar frases curtas cruas como `Total: R$ X` em producao.
- Toda resposta de soma deve, sempre que possivel, incluir:
  - titulo contextual (mes/periodo),
  - total principal destacado,
  - quantidade de itens,
  - lista de itens/detalhamento relevante.
- Se um novo comando financeiro retornar valores numericos, crie/atualize metodo no `MessageFormatter` e plugue no `ProcessMessageUseCase` antes de finalizar a feature.
