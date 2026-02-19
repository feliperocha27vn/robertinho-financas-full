# Deploy no Coolify — Robertinho Finanças API

Este documento descreve os passos e variáveis necessárias para fazer o deploy da API no painel Coolify.

Resumo das mudanças no repositório
- `Dockerfile` (multi-stage): instala pnpm, executa `pnpm install`, aprova build scripts do Prisma (`pnpm approve-builds`) e gera o cliente Prisma durante o build. Copia os artefatos para um estágio de produção enxuto.
- `docker-compose.yaml`: adicionada a versão do compose.

Variáveis de ambiente obrigatórias (no painel do Coolify)
- `DATABASE_URL` — URL do Postgres (ex: `postgresql://user:pass@host:5432/dbname`)
- `GOOGLE_API_KEY` — chave de API Google, se necessária
- `RUN_MIGRATIONS` (opcional) — `true` para rodar migrations no start
- Outras variáveis do `.env` do projeto podem ser adicionadas conforme necessidade (ex.: `API_KEY`, `EVOLUTION_API_URL`)

Notas importantes
- O Dockerfile roda `pnpm approve-builds @prisma/client prisma @prisma/engines` durante o build. Isso é necessário porque o `pnpm` em ambientes não interativos tende a ignorar scripts de instalação (mensagem "Ignored build scripts").
- Se o painel do Coolify não permitir o comando `pnpm approve-builds` (raro), alternativa: mova `prisma` para `dependencies` em `package.json` (assim os artefatos podem ser instalados em etapas de produção), ou crie um step de build customizado que rode `pnpm approve-builds` antes do `pnpm install`.

Como testar localmente (recomendo antes de subir para o Coolify)
1. Build da imagem localmente:

```powershell
# Na raiz do projeto
docker build -t robertinho-api:local .
```

2. Rodar com docker-compose:

```powershell
docker compose up --build
```

3. Verifique os logs e se a aplicação inicia corretamente. Se o erro original ocorrer, verifique os passos de `pnpm install` e `pnpm prisma generate` nos logs do build.

Se algo falhar no pipeline do Coolify, cole aqui os logs do build (especialmente a parte entre `RUN pnpm install` e `RUN pnpm prisma generate`) e eu ajudo a ajustar.
