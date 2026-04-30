# Deploy (VPS / Coolify)

Este documento descreve os passos mínimos para deploy da aplicação `robertinho-api` em uma VPS usando Docker Compose, ou usando o painel Coolify.

Pré-requisitos na VPS
- Uma VPS com Ubuntu 22.04 ou similar
- Docker e Docker Compose instalados
- Usuário com acesso SSH e permissão para executar docker
- Porta 80/443 liberadas para TLS (ou use tunelamento)

Como usar o `docker-compose.yaml` (VPS)
1. Copie os arquivos para `/opt/robertinho` na VPS.
2. Crie um arquivo `.env` com as variáveis necessárias (NÃO comitar):

```
ROBERTINHO_POSTGRES_PASSWORD=uma_senha_forte
GOOGLE_API_KEY=xxxxx
TELEGRAM_BOT_TOKEN=seu_token_do_telegram
MOBILE_APP_TOKEN=um_token_forte_e_aleatorio
```

3. Suba os serviços:

```bash
cd /opt/robertinho
docker compose up -d --build
```

4. Ver logs:

```bash
docker compose logs -f robertinho-api
```

Usando Coolify
- No painel do Coolify: crie uma nova aplicação e cole o conteúdo do `docker-compose.yaml`.
- Defina as variáveis obrigatórias no UI (por exemplo `DATABASE_URL`, `ROBERTINHO_POSTGRES_PASSWORD`, `GOOGLE_API_KEY`, `TELEGRAM_BOT_TOKEN`, `MOBILE_APP_TOKEN`).
- Configure domínios e ative TLS (Let's Encrypt) via UI.

Rotas mobile de leitura (novo)
- `GET /mobile/overview`
- `GET /mobile/summary`
- `GET /mobile/accounts-payable/day-fifteen`
- `GET /mobile/installments/remaining`

Essas rotas exigem header `x-mobile-app-token` com o valor de `MOBILE_APP_TOKEN`.

Exemplo de teste via curl:

```bash
curl -H "x-mobile-app-token: $MOBILE_APP_TOKEN" https://robertinho.fly.dev/mobile/overview
```

Notas sobre migrations e Prisma
- O `Dockerfile` já gera o cliente Prisma no build. O `start.sh` só roda `prisma migrate deploy` no runtime quando `RUN_MIGRATIONS=true`.
- Em produção, prefira executar migrations via pipeline CI ou manualmente via shell no servidor para controlar downtime.

Troubleshooting
- Se o container do Postgres não iniciar: verifique o volume e as permissões.
- Se a API não conecta ao DB: verifique `DATABASE_URL` e se o serviço Postgres está saudável (`docker compose ps` e `docker compose logs postgres`).
