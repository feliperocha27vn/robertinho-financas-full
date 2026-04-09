# Deploy no Fly.io com Neon (sem migrations no deploy)

Este projeto segue o padrao abaixo:

- O deploy no Fly.io sobe apenas a aplicacao da API.
- O banco de dados PostgreSQL e externo (Neon).
- As migrations do Prisma NAO rodam no Fly.io.
- As migrations devem ser executadas localmente pelo desenvolvedor, antes do deploy.

## Regras de infraestrutura

1. `fly.toml` NAO deve conter `release_command` com `prisma migrate deploy`.
2. `Dockerfile` pode gerar Prisma Client (`prisma generate`), mas NAO deve executar migrations.
3. O secret `DATABASE_URL` no Fly.io deve usar a connection string do Neon com `?sslmode=require`.

## Passo a passo de deploy

1. Validar que as migrations ja foram aplicadas localmente no Neon.
2. Conferir `fly.toml` e garantir ausencia de `release_command` de migration.
3. Configurar secrets no Fly.io:
   - `DATABASE_URL`
   - `GEMINI_API_KEY`
   - `TELEGRAM_BOT_TOKEN`
   - `MOBILE_APP_TOKEN`
4. Rodar deploy:

```bash
fly deploy
```

5. Verificar saude da aplicacao e logs:

```bash
fly status
fly logs
```

## Exemplo de secrets

```bash
fly secrets set DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
fly secrets set GEMINI_API_KEY="seu_valor"
fly secrets set TELEGRAM_BOT_TOKEN="seu_valor"
fly secrets set MOBILE_APP_TOKEN="um_token_forte_e_aleatorio"
```

## Rotas mobile protegidas

As rotas abaixo sao somente leitura e exigem o header `x-mobile-app-token`:

- `GET /mobile/overview`
- `GET /mobile/summary`
- `GET /mobile/accounts-payable/day-fifteen`
- `GET /mobile/installments/remaining`

Exemplo rapido:

```bash
curl -H "x-mobile-app-token: $MOBILE_APP_TOKEN" https://robertinho.fly.dev/mobile/summary
```
