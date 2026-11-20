# API de gerenciamento de academia

Base técnica do Trabalho Final de Programação para a Web II da UFPI. A versão `0.1.0` entrega a infraestrutura inicial da API RESTful, sem antecipar autenticação ou CRUDs das próximas etapas.

## Tecnologias e requisitos

- Node.js 20 ou superior
- npm
- Docker com Docker Compose (recomendado para o PostgreSQL local)
- PostgreSQL 17, caso não seja usado Docker

## Configuração local

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie `.env.example` para `.env`:

   PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

   Linux/macOS:

   ```bash
   cp .env.example .env
   ```

3. Inicie o PostgreSQL:

   ```bash
   docker compose up -d postgres
   ```

4. Gere o Prisma Client e aplique a migração:

   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

   A migração inicial já está versionada. Em um ambiente não interativo, use `npm run prisma:deploy`.

5. Inicie a API em modo de desenvolvimento:

   ```bash
   npm run dev
   ```

A aplicação escuta `http://localhost:3000` por padrão.

## Endpoints disponíveis

| Método | Caminho | Finalidade |
| --- | --- | --- |
| `GET` | `/api/v1/health` | Confirma que o processo HTTP está ativo. |
| `GET` | `/api/v1/ready` | Confirma a conexão com PostgreSQL usando Prisma. |

Exemplo:

```bash
curl http://localhost:3000/api/v1/health
curl http://localhost:3000/api/v1/ready
```

Rotas desconhecidas respondem `404` no contrato padronizado. Os namespaces `/auth`, `/members`, `/workouts` e `/checkins` estão reservados, mas ainda não possuem operações nesta entrega.

## Verificações

```bash
npm run typecheck
npm run build
npm test
npm run prisma:generate
npx prisma validate
```

Para testar a API compilada:

```bash
npm run build
npm start
```

## Variáveis de ambiente

| Variável | Obrigatória | Padrão | Descrição |
| --- | --- | --- | --- |
| `DATABASE_URL` | sim | — | URL PostgreSQL entendida pelo Prisma. |
| `NODE_ENV` | não | `development` | `development`, `test` ou `production`. |
| `PORT` | não | `3000` | Porta HTTP. |
| `CORS_ORIGIN` | não | `*` | Uma origem ou lista separada por vírgulas. |
| `LOG_LEVEL` | não | `info` | Nível do Pino. |

As variáveis `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` e `POSTGRES_PORT` podem personalizar o container, mantendo os valores padrão indicados no `docker-compose.yml`. O PostgreSQL do projeto é publicado em `5433` para não colidir com uma instalação local comum na porta `5432`; ao alterar essa porta, ajuste também `DATABASE_URL`.

## Organização e documentação

O código segue um monólito modular: cada domínio pode receber suas próprias rotas, controllers, services e validações conforme for implementado. A composição da API, configurações, banco, middlewares e utilitários compartilhados ficam separados por responsabilidade.

As decisões, o modelo e a ordem exata dos middlewares estão descritos em [`docs/architecture.md`](docs/architecture.md). O histórico entregue está no arquivo [`CHANGELOG`](CHANGELOG).

## Escopo futuro (não implementado)

- autenticação e autorização JWT;
- CRUD de alunos e treinos;
- registro e consulta de check-ins;
- Redis, balanceamento e otimizações distribuídas;
- CI/CD e deploy.
