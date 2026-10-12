# vera-fe

Aplicação web da [Vera](https://github.com/revtriever-vera/vera), plataforma financeira open source. Em construção: veja o épico de Fundação (revtriever-vera/vera#30).

React 19, Vite, TanStack Router e Query, Tailwind 4, Radix e openapi-fetch. Um único front, um único tema.

## Rodando

```bash
npm install
cp .env.example .env
npm run dev
```

| Comando             | O que faz                                                                                       |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| `npm run dev`       | Servidor de desenvolvimento do Vite                                                             |
| `npm run build`     | `tsc -b` e build de produção em `dist/`                                                         |
| `npm run lint`      | ESLint (inclui as fronteiras de camada)                                                         |
| `npm run typecheck` | TypeScript sem emitir                                                                           |
| `npm test`          | Vitest; `npm run test:cov` aplica o mínimo de 85% de cobertura                                  |
| `npm run api:types` | Gera `src/shared/lib/api/schema.d.ts` a partir do `/docs-json` do `vera-api` local (porta 3333) |

## Variáveis de ambiente

Lidas em `src/shared/config/env.ts` e embutidas no build (não há configuração de runtime).

| Variável            | Padrão                     |
| ------------------- | -------------------------- |
| `VITE_API_URL`      | `http://localhost:3333`    |
| `VITE_POSTHOG_KEY`  | vazio (PostHog desligado)  |
| `VITE_POSTHOG_HOST` | `https://us.i.posthog.com` |

## Estrutura

```
src/app/        providers e layouts
src/routes/     rotas do TanStack Router (routeTree.gen.ts é gerado e versionado)
src/features/   uma pasta por área de negócio (api, components, pages, lib)
src/shared/     ui, lib (cliente da API, cn), config
test/           MSW, helpers de render e setup
```

Telas autenticadas vivem em `src/routes/_auth/_app/` e se registram em `APP_NAV_ITEMS` (`src/app/layouts/app-nav.ts`). Rotas fora de `_auth` ficam públicas; só `/login` e `/_dev/*` podem estar fora.

## Deploy

Cloudflare Pages, um projeto por ambiente (`vera-app-dev` e `vera-app-prod`).

- `deploy-dev.yml`: manual (`workflow_dispatch`).
- `deploy-prod.yml`: roda depois do CI verde na `main`.

Os dois pulam sem erro enquanto faltarem o secret `CLOUDFLARE_API_TOKEN`, o secret `CLOUDFLARE_ACCOUNT_ID` ou a variável de repositório `VERA_DOMAIN`. O deploy de produção também só roda com a variável de repositório `PROD_DEPLOY_ENABLED` igual a `true`; sem ela, o job termina com um aviso. O deploy de dev é manual (`workflow_dispatch`).

Os hosts saem de `${VERA_HOST_PREFIX}<nome>[-dev].${VERA_DOMAIN}`, sempre em um único nível de subdomínio (compatível com o SSL gratuito do Cloudflare). `VERA_HOST_PREFIX` é uma variável de repositório opcional, vazia por padrão: sem ela o app fica em `app.<domínio>` e a API em `api.<domínio>`. Com `VERA_HOST_PREFIX=vera-` e `VERA_DOMAIN=exemplo.com` saem `vera-app.exemplo.com` e `vera-api.exemplo.com` em produção, `vera-app-dev.exemplo.com` e `vera-api-dev.exemplo.com` em dev. O valor só aceita `a-z`, `0-9` e hífen, até 20 caracteres, terminando em hífen, e precisa ser o mesmo do repositório da API. O nome do projeto Pages (`vera-app-dev`, `vera-app-prod`) não depende do prefixo; o domínio customizado é ligado ao projeto no painel do Cloudflare e deve coincidir com o host acima.

O passo `Sonar` do CI só roda no push para a `main` com a variável `SONAR_ENABLED=true` e o secret `SONAR_TOKEN`.

## Licença

AGPL-3.0.
