# Coflu API

API HTTP do Coflu, construida com Node.js, Express, TypeScript, Prisma e PostgreSQL.

## Variaveis de ambiente

Crie `apps/api/.env` com base em `.env.example`.

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/coflu_db?schema=public"
JWT_SECRET="troque-por-um-segredo-longo-e-aleatorio"
JWT_EXPIRES_IN=7d
```

Se a senha do banco tiver caracteres especiais, como `@`, use URL encoding. Exemplo: `L@fc125732` vira `L%40fc125732`.

## Rodando

```bash
npm run dev:api
```

## Rotas de autenticacao

### POST /auth/register

```json
{
  "name": "Fabio",
  "email": "fabio@email.com",
  "password": "SenhaForte123"
}
```

### POST /auth/login

```json
{
  "email": "fabio@email.com",
  "password": "SenhaForte123"
}
```

### GET /auth/me

Enviar o token no header:

```http
Authorization: Bearer seu_access_token
```

### POST /auth/logout

Logout stateless nesta primeira versao. Refresh tokens e revogacao entram em uma etapa futura.

## Testando com curl

```bash
curl -X POST http://localhost:3333/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Fabio","email":"fabio@email.com","password":"SenhaForte123"}'
```

```bash
curl -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"fabio@email.com","password":"SenhaForte123"}'
```

```bash
curl http://localhost:3333/auth/me \
  -H "Authorization: Bearer seu_access_token"
```

## Testes

```bash
npm run test --workspace @coflu/api
```

Os testes de autenticacao usam mock do Prisma para validar os fluxos HTTP sem depender de um banco local migrado.

## Rotas de grupos financeiros

Todas as rotas abaixo exigem:

```http
Authorization: Bearer seu_access_token
```

### POST /groups

Cria um grupo financeiro e adiciona o usuario autenticado como `owner` ativo.

```json
{
  "name": "Familia Fabio e Bianca",
  "type": "couple",
  "defaultCurrency": "BRL"
}
```

Tipos permitidos: `couple`, `family`, `friends`, `other`.

### GET /groups

Lista apenas grupos onde o usuario autenticado possui membership `active`.

### GET /groups/:groupId

Retorna detalhes do grupo e membros ativos. O usuario precisa ser membro ativo do grupo.

### PATCH /groups/:groupId

Edita dados basicos do grupo. Apenas `owner` e `admin`.

```json
{
  "name": "Novo nome",
  "type": "family",
  "defaultCurrency": "BRL"
}
```

### DELETE /groups/:groupId

Exclui fisicamente o grupo nesta primeira versao. Apenas `owner`.

Se o grupo ja possuir dados financeiros, a API retorna erro seguro. Soft delete de grupos deve entrar depois que as regras de retencao financeira estiverem definidas.

### GET /groups/:groupId/members

Lista membros ativos e convidados. Exige ser membro ativo do grupo.

### POST /groups/:groupId/invite

Cria convite por e-mail para um usuario existente no Coflu. Envio real de e-mail entra em etapa futura; nesta versao a API cria um `GroupMember` com `status=invited`.

```json
{
  "email": "pessoa@email.com",
  "role": "member"
}
```

Roles permitidas para convite: `admin`, `member`, `viewer`. Nao e permitido convidar diretamente como `owner`.

### GET /groups/:groupId/invite-code

Retorna o codigo de convite do grupo. Apenas `owner/admin`.

Resposta:

```json
{
  "invite": {
    "groupId": "uuid-do-grupo",
    "code": "ABC123XYZ0"
  }
}
```

### POST /groups/:groupId/invite-code/regenerate

Gera um novo codigo de convite para o grupo. Apenas `owner/admin`.

### POST /groups/invitations/accept

Aceita convite por codigo:

```json
{
  "code": "ABC123XYZ0"
}
```

Ou aceita convite pendente por e-mail:

```json
{
  "groupId": "uuid-do-grupo"
}
```

Regras:

- Convite por codigo cria membership `member` ativo para o usuario autenticado.
- Convite por e-mail exige que ja exista membership `invited` para o usuario autenticado.
- Usuario ativo no grupo recebe erro seguro de duplicidade.

### PATCH /groups/:groupId/members/:memberId/role

Altera papel de um membro. Apenas `owner`.

```json
{
  "role": "admin"
}
```

Roles permitidas nesta rota: `admin`, `member`, `viewer`.

### DELETE /groups/:groupId/members/:memberId

Remove membro alterando `status` para `removed`, sem apagar o registro.

Regras:

- `owner` remove qualquer membro, exceto a si mesmo.
- `admin` remove membros comuns, mas nao remove `owner`.
- Usuario pode sair do grupo se nao for `owner`.
- `viewer` nao gerencia membros.

## Permissoes de grupos

- `owner`: acesso total ao grupo.
- `admin`: edita grupo e convida/remove membros comuns.
- `member`: base para criar dados financeiros futuramente.
- `viewer`: apenas visualiza.

## Rotas de categorias

Categorias sempre pertencem a um grupo financeiro e exigem autenticacao.

Ao criar um grupo, a API cria automaticamente categorias padrao de despesas e receitas. Essas categorias nao podem ser deletadas, mas `owner/admin` podem editar nome, icone e cor.

### GET /groups/:groupId/categories

Lista categorias do grupo, ordenadas por tipo e nome. A resposta mantem `categories` para compatibilidade com o app e tambem separa por `income` e `expense`.

```json
{
  "categories": [
    {
      "id": "uuid-da-categoria",
      "groupId": "uuid-do-grupo",
      "name": "Alimentação",
      "type": "expense",
      "icon": "utensils",
      "color": "#EF4444",
      "isDefault": true
    }
  ],
  "income": [],
  "expense": []
}
```

### POST /groups/:groupId/categories

Cria categoria customizada. Qualquer membro ativo do grupo pode criar.

```json
{
  "name": "Pets",
  "type": "expense",
  "color": "#F59E0B"
}
```

Tipos permitidos: `income`, `expense`.

### PATCH /groups/:groupId/categories/:categoryId

Edita nome, icone e cor. Apenas `owner/admin`. O `type` da categoria nao pode ser alterado.

```json
{
  "name": "Mercado",
  "color": "#4EBAA4"
}
```

### DELETE /groups/:groupId/categories/:categoryId

Exclui categoria customizada. Apenas `owner/admin`.

Regras:

- Categorias padrao nao podem ser deletadas.
- Categorias com transacoes vinculadas nao podem ser deletadas.
- Categorias sempre sao vinculadas ao `groupId`; nao ha categorias globais nesta versao.

## Rotas de transacoes

Todas as rotas de transacoes ficam dentro de um grupo financeiro e exigem autenticacao:

```http
Authorization: Bearer seu_access_token
```

### POST /groups/:groupId/transactions

Cria receita, despesa ou transferencia. O usuario precisa ser membro ativo do grupo.

```json
{
  "type": "expense",
  "amount": 120.5,
  "categoryId": "uuid-da-categoria",
  "paymentMethodId": "uuid-do-metodo-opcional",
  "description": "Mercado",
  "date": "2026-05-03",
  "isPrivate": false,
  "splits": [
    {
      "userId": "uuid-do-usuario-1",
      "amount": 60.25
    },
    {
      "userId": "uuid-do-usuario-2",
      "amount": 60.25
    }
  ]
}
```

Tipos permitidos: `income`, `expense`, `transfer`.

### Splits

Se `splits` nao for enviado, a transacao pertence 100% ao criador.

Se `splits` for enviado:

- A soma dos valores deve ser igual a `amount`.
- Cada usuario pode aparecer apenas uma vez.
- Todos os usuarios precisam ser membros ativos do grupo.
- A API calcula o percentual de cada divisao.

Ao editar `amount` sem enviar novos `splits`, a API rebalanceia os splits existentes proporcionalmente para manter a transacao consistente.

### GET /groups/:groupId/transactions

Lista transacoes visiveis do grupo, ordenadas por `date DESC`.

Filtros opcionais:

```txt
month=5
year=2026
type=expense
userId=uuid-do-usuario
```

Se `month` for informado, `year` tambem e obrigatorio.

Transacoes privadas (`isPrivate=true`) so aparecem para o criador.

### GET /groups/:groupId/transactions/:transactionId

Retorna a transacao com:

- dados principais
- splits
- categoria
- criador

Transacoes privadas de outro usuario retornam erro seguro.

### PATCH /groups/:groupId/transactions/:transactionId

Permite editar `amount`, `categoryId`, `paymentMethodId`, `description`, `date` e `splits`.

Apenas o criador ou `owner/admin` podem editar. `viewer` nao gerencia transacoes.

```json
{
  "amount": 150,
  "description": "Mercado atualizado",
  "splits": [
    {
      "userId": "uuid-do-usuario-1",
      "amount": 75
    },
    {
      "userId": "uuid-do-usuario-2",
      "amount": 75
    }
  ]
}
```

### DELETE /groups/:groupId/transactions/:transactionId

Exclui fisicamente a transacao nesta primeira versao. Apenas criador ou `owner/admin`.

Soft delete deve ser adicionado depois que auditoria e regras de retencao financeira estiverem fechadas.

## Rotas de dashboard financeiro

Todas as rotas de dashboard exigem autenticacao e membership ativo no grupo:

```http
Authorization: Bearer seu_access_token
```

As agregacoes consideram apenas transacoes `confirmed` e respeitam privacidade: transacoes com `isPrivate=true` so entram nos totais do criador.

### GET /groups/:groupId/dashboard/summary

Resumo financeiro por mes.

```txt
GET /groups/:groupId/dashboard/summary?month=5&year=2026
```

Resposta:

```json
{
  "income": 5000,
  "expense": 3200,
  "balance": 1800
}
```

Regras:

- `income`: soma de receitas.
- `expense`: soma de despesas.
- `balance`: `income - expense`.
- `month` e `year` sao obrigatorios.

### GET /groups/:groupId/dashboard/categories

Agrupa despesas por categoria, do maior total para o menor.

```txt
GET /groups/:groupId/dashboard/categories?month=5&year=2026
```

Resposta:

```json
[
  {
    "categoryId": "uuid-da-categoria",
    "name": "Alimentacao",
    "total": 1200
  }
]
```

`month` e `year` sao opcionais nesta rota, mas devem ser enviados juntos quando usados.

### GET /groups/:groupId/dashboard/members

Agrupa despesas por membro usando os `TransactionSplit`, ou seja, quanto cada pessoa assumiu na divisao.

```txt
GET /groups/:groupId/dashboard/members?month=5&year=2026
```

Resposta:

```json
[
  {
    "userId": "uuid-do-usuario",
    "name": "Fabio",
    "total": 1800
  }
]
```

`month` e `year` sao opcionais nesta rota, mas devem ser enviados juntos quando usados.
