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

Cria convite para um usuario existente no Coflu. Envio de e-mail e aceite de convite entram em etapa futura.

```json
{
  "email": "pessoa@email.com",
  "role": "member"
}
```

Roles permitidas para convite: `admin`, `member`, `viewer`. Nao e permitido convidar diretamente como `owner`.

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
