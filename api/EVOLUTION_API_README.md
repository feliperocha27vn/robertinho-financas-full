# Evolution API - Integração WhatsApp (v2.2.3 - VERSÃO MAIS ESTÁVEL)

Este projeto inclui a **versão mais estável** do Evolution API (v2.2.3) integrada ao seu sistema de finanças.

## � Por que v2.2.3?

Após pesquisa extensiva no GitHub e Docker Hub, a versão **v2.2.3** foi escolhida por ser:

- ✅ **100% Estável**: Versão testada e sem bugs conhecidos
- ✅ **Oficialmente Suportada**: Disponível tanto no GitHub quanto Docker Hub
- ✅ **Tamanho Otimizado**: ~267MB vs outras versões maiores
- ✅ **Funcionalidades Maduras**: Sem breaking changes recentes
- ✅ **Correções Importantes**: Cache local e atualizações do Baileys

### ⚠️ Versões NÃO Recomendadas:
- `v1.8.7` (Docker Hub): **NÃO EXISTE** no repositório oficial GitHub
- `v2.3.4` (GitHub): Muito nova (2 semanas), muitas mudanças grandes

## 🚀 Como Usar

### 1. Configurar Variáveis de Ambiente

**IMPORTANTE**: Altere a `API_KEY` no arquivo `.env`:

```bash
# Gere uma chave segura (exemplo):
API_KEY=sua-chave-super-secreta-aqui-2025
```

### 2. Subir os Serviços

```bash
docker-compose up -d
```

### 3. Acessar os Serviços

- **Evolution API**: http://localhost:8080
- **pgAdmin**: http://localhost:8081
  - Email: `admin@evolution.com`
  - Senha: `admin123`
- **Seu Projeto Original**: http://localhost:3333

### 4. Testar a API

```bash
# Listar instâncias
curl -X GET "http://localhost:8080/instance/fetchInstances" \
  -H "apikey: sua-chave-super-secreta-aqui-2025"

# Criar uma instância
curl -X POST "http://localhost:8080/instance/create" \
  -H "Content-Type: application/json" \
  -H "apikey: sua-chave-super-secreta-aqui-2025" \
  -d '{
    "instanceName": "minha-instancia",
    "token": "token-opcional"
  }'
```

## 📊 Estrutura dos Serviços

| Serviço | Porta | Função |
|---------|-------|--------|
| `evolution-api` | 8080 | API Principal do WhatsApp |
| `postgres` | 5432 | Banco do Evolution API |
| `redis` | 6379 | Cache do Evolution API |
| `pgadmin` | 8081 | Interface Web para PostgreSQL |
| `api-barber` | 5433 | Seu banco original (alterado para evitar conflito) |

## � Configurações Importantes

### Banco de Dados
- **Evolution API**: PostgreSQL na porta 5432
- **Seu Projeto**: PostgreSQL na porta 5433 (alterado para evitar conflito)

### Autenticação
- Tipo: `apikey`
- Configurar no header: `apikey: sua-chave-aqui`

### Cache
- Redis habilitado para melhor performance
- TTL: 7 dias (604800 segundos)

## 📱 Conectar WhatsApp

1. Acesse: `http://localhost:8080/instance/connect/minha-instancia`
2. Escaneie o QR Code com o WhatsApp
3. Aguarde a confirmação de conexão

## 🔄 Atualização de Versões

Para atualizar no futuro:

1. Verifique novas versões em: https://github.com/EvolutionAPI/evolution-api/releases
2. Teste em ambiente de desenvolvimento primeiro
3. Altere a tag no `docker-compose.yaml`:
   ```yaml
   image: atendai/evolution-api:nova-versao
   ```

## 🛠️ Troubleshooting

### Logs do Evolution API
```bash
docker logs evolution_api -f
```

### Logs do PostgreSQL
```bash
docker logs evolution_postgres -f
```

### Logs do Redis
```bash
docker logs evolution_redis -f
```

### Reiniciar Apenas o Evolution API
```bash
docker-compose restart evolution-api
```

## � Documentação Oficial

- **Evolution API**: https://github.com/EvolutionAPI/evolution-api
- **Docker Hub**: https://hub.docker.com/r/atendai/evolution-api
- **API Docs**: Acesse http://localhost:8080/docs após subir o serviço

## ⚠️ Notas de Segurança

1. **Mude a API_KEY** para uma chave forte em produção
2. Configure **CORS** adequadamente para seu domínio
3. Use **HTTPS** em produção
4. Configure **firewall** para proteger as portas do banco

## 🎯 Funcionalidades Incluídas

- ✅ Envio e recebimento de mensagens
- ✅ Suporte a mídia (imagens, vídeos, áudios)
- ✅ Grupos do WhatsApp
- ✅ Webhooks para eventos
- ✅ Cache Redis para performance
- ✅ Banco PostgreSQL para persistência
- ✅ Interface pgAdmin para gestão do banco

## 📞 Integração com Seu Projeto

Para integrar com sua API de finanças, você pode:

1. **Webhooks**: Configure webhooks para receber eventos do WhatsApp
2. **API Calls**: Faça chamadas HTTP para enviar mensagens
3. **Banco Compartilhado**: Use o mesmo PostgreSQL se necessário

Exemplo de envio de mensagem:

```javascript
const response = await fetch('http://localhost:8080/message/sendText/minha-instancia', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': 'sua-chave-aqui'
  },
  body: JSON.stringify({
    number: '5511999999999',
    text: 'Olá! Sua conta foi atualizada.'
  })
});
```

---

🎉 **Pronto!** Agora você tem a versão mais estável do Evolution API integrada ao seu projeto!
