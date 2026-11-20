# Arquitetura e decisões técnicas

## Visão geral

A aplicação usa um monólito modular. Há um único processo HTTP e uma única base PostgreSQL, enquanto cada domínio mantém suas rotas, controllers e services próximos. Essa organização reduz a complexidade operacional da primeira entrega e permite evoluir cada módulo sem concentrar regras de negócio em arquivos globais.

```text
src/
├── config/          # ambiente e logging
├── database/        # cliente e ciclo de vida do Prisma
├── middlewares/     # preocupações transversais do Express
├── modules/
│   ├── auth/        # preparado, sem JWT nesta entrega
│   ├── members/     # preparado, sem CRUD nesta entrega
│   ├── workouts/    # preparado, sem CRUD nesta entrega
│   ├── checkins/    # preparado, sem operações nesta entrega
│   └── health/      # endpoints ativos de saúde e prontidão
├── routes/          # composição e versionamento da API
├── shared/          # erros e contrato HTTP comuns
├── app.ts           # construção do Express sem abrir porta
└── server.ts        # inicialização e encerramento do processo
```

`createApp` não abre uma porta e aceita uma sonda de banco injetável. Essa separação mantém testes HTTP rápidos e determinísticos. `server.ts` é o único ponto que escuta a porta e também encerra HTTP e Prisma ao receber `SIGINT` ou `SIGTERM`.

## Pipeline de middlewares

As requisições percorrem a seguinte ordem:

1. `pino-http`: registra método, URL, status e duração da requisição.
2. `helmet`: adiciona cabeçalhos HTTP de segurança.
3. `cors`: aplica a origem configurada por `CORS_ORIGIN`.
4. `express.json`: interpreta JSON e limita o corpo a 1 MiB.
5. router `/api/v1`: encaminha para o módulo correspondente.
6. `notFoundHandler`: transforma rotas sem correspondência em erro padronizado.
7. `errorHandler`: converte erros conhecidos e inesperados para o contrato HTTP comum.

O handler de erro fica por último, conforme o modelo do Express. Erros internos não expõem stack trace nem mensagens de infraestrutura ao cliente.

## Contrato HTTP inicial

Sucesso:

```json
{
  "success": true,
  "data": {}
}
```

Erro:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

`GET /api/v1/health` informa que o processo HTTP está respondendo e não acessa dependências externas. `GET /api/v1/ready` executa `SELECT 1` via Prisma e só retorna `200` quando o PostgreSQL está acessível; caso contrário, retorna `503`.

## Modelo de dados

- `User`: credenciais persistidas como hash e papel futuro (`ADMIN`, `TRAINER` ou `RECEPTIONIST`). Nenhuma autenticação foi implementada.
- `Member`: cadastro básico e estado ativo do aluno.
- `Workout`: treino associado obrigatoriamente a um aluno.
- `CheckIn`: entrada datada associada obrigatoriamente a um aluno.

As relações impedem a exclusão de um aluno que ainda possua treinos ou check-ins (`RESTRICT`). E-mails são únicos e os campos usados em relacionamentos e consultas temporais possuem índices.

## Decisões da primeira entrega

- TypeScript em modo `strict` e módulos ESM.
- Zod valida todas as variáveis de ambiente ao iniciar o processo.
- Prisma centralizado, usando o adapter PostgreSQL oficial, evita múltiplos pools durante recarga no desenvolvimento.
- A migração SQL é versionada; `prisma migrate deploy` deve ser usado fora do desenvolvimento.
- Testes de integração exercitam o Express com Supertest, sem abrir socket de rede.
- Os módulos futuros possuem routers montados, mas deliberadamente não oferecem endpoints nesta versão.

Não fazem parte desta versão: JWT, CRUD dos domínios, Redis, balanceamento, CI/CD e deploy.
