export const getAllRemainingInstallmentsDeclaration = {
  name: 'get_all_remaining_installments',
  description:
    'Retorna uma lista de todas as despesas parceladas que ainda possuem parcelas em aberto (não pagas). Use esta função quando o usuário perguntar algo como "quais parcelas eu ainda tenho?", "quais são minhas compras parceladas?", ou "o que eu ainda estou pagando?". A função retorna uma lista com a descrição da despesa, o número de parcelas restantes, o valor de cada parcela e o total restante para cada item, além do valor total geral de todas as parcelas pendentes.',
  parametersJsonSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
}
