# Coflu Mobile

Aplicativo Expo do Coflu com autenticacao real, grupos financeiros, dashboard e CRUD de transacoes integrado a API.

## Variaveis de ambiente

Crie `apps/mobile/.env` com:

```env
EXPO_PUBLIC_API_URL=http://localhost:3333
```

Em Android Emulator, use:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3333
```

Em dispositivo fisico com Expo Go, use o IP local da maquina que roda a API.

Durante desenvolvimento, o app tambem tenta uma URL fallback derivada do host do Expo quando a URL configurada nao responde. Isso ajuda no Expo Go em celular fisico, onde `localhost` e `10.0.2.2` podem apontar para o lugar errado.

## Fluxo atual

- Login com `POST /auth/login`
- Registro com `POST /auth/register`
- Sessao persistida com AsyncStorage
- Token enviado em `Authorization: Bearer`
- Restauracao de sessao via `GET /auth/me`
- Logout local com chamada stateless para `POST /auth/logout`
- Busca de grupos apos login com `GET /groups`
- Criacao do primeiro grupo com `POST /groups`
- Grupo ativo persistido com AsyncStorage
- Navegacao autenticada com abas para Dashboard, Transacoes, Grupos e Perfil

## Grupos

O app direciona o usuario sem grupos para a tela de criacao inicial. Se houver grupos, o usuario pode selecionar o grupo ativo e abrir detalhes:

- `GET /groups`
- `POST /groups`
- `GET /groups/:groupId`
- `PATCH /groups/:groupId`
- `GET /groups/:groupId/members`
- `POST /groups/:groupId/invite`

Convites exigem que o usuario convidado ja exista na base. Envio real de email fica para uma etapa futura.

## Dashboard

A tela autenticada usa o grupo ativo e busca dados reais do mes atual:

- `GET /groups/:groupId/dashboard/summary`
- `GET /groups/:groupId/dashboard/categories`
- `GET /groups/:groupId/dashboard/members`

Se o usuario ainda nao tiver grupo, o app direciona para criacao do primeiro grupo.

## Transacoes

O app permite listar, criar, editar, detalhar e excluir transacoes reais do grupo ativo:

- `GET /groups/:groupId/transactions`
- `POST /groups/:groupId/transactions`
- `GET /groups/:groupId/transactions/:transactionId`
- `PATCH /groups/:groupId/transactions/:transactionId`
- `DELETE /groups/:groupId/transactions/:transactionId`

Categorias sao carregadas via `GET /groups/:groupId/categories`. Se o grupo ainda nao tiver categorias, a API cria categorias iniciais no banco.

O split visual avancado ainda nao foi implementado. Nesta versao, quando o app nao envia `splits`, a API registra 100% da transacao para o criador.

## Perfil e Configuracoes

O Perfil exibe nome, email, tema, moeda e logout. Configuracoes mostra o grupo ativo e placeholders bloqueados como "Em breve" para WhatsApp, IA, Apple Shortcuts e Open Finance.

## Rodando

```bash
npm run dev:mobile
```
