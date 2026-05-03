# Coflu

Coflu e um aplicativo mobile de financas pessoais e familiares com foco em colaboracao entre casais, familias e pequenos grupos.

**Slogan:** Financas que fluem juntas.

<img width="1024" height="1536" alt="image" src="https://github.com/user-attachments/assets/87c9f3ee-3dc2-45d6-9147-5f579ae803ab" />


A proposta e permitir que pessoas administrem juntas gastos, receitas, metas, orcamentos e decisoes financeiras de forma simples, visual, segura e moderna.

## Stack

- Monorepo com npm workspaces
- Mobile: React Native, Expo e TypeScript
- API: Node.js, Express e TypeScript
- Banco planejado: PostgreSQL com Prisma ORM
- Testes: Vitest e Supertest na API
- Qualidade: ESLint, Prettier e EditorConfig

## Estrutura

```txt
apps/
  mobile/      Aplicativo Expo
  api/         API Express
packages/
  shared/      Tipos e constantes compartilhadas
```

## Instalacao

```bash
npm install
```

## Variaveis de ambiente

Crie os arquivos a partir dos exemplos:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env
```

## Rodando a API

```bash
npm run dev:api
```

Health check:

```bash
curl http://localhost:3333/health
```

Resposta esperada:

```json
{
  "status": "ok",
  "app": "Coflu API",
  "version": "0.1.0"
}
```

Documentacao especifica da API: `apps/api/README.md`.

## Rodando o mobile

```bash
npm run dev:mobile
```

O Expo abrira as opcoes para emulador, dispositivo fisico ou web.

Configure a API do app em `apps/mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3333
```

Para Android Emulator, normalmente use:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3333
```

Para Expo Go em dispositivo fisico, use o IP da maquina na rede local:

```env
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3333
```

Depois do login, o app carrega o primeiro grupo ativo do usuario e exibe o dashboard financeiro real do mes atual.

## Scripts

- `npm run dev`: inicia a API em modo desenvolvimento
- `npm run dev:api`: inicia a API Express
- `npm run dev:mobile`: inicia o Expo
- `npm run build`: compila os workspaces que possuem build
- `npm run test`: executa os testes configurados
- `npm run lint`: roda ESLint no monorepo
- `npm run format`: formata o projeto com Prettier

## Prisma

A API ja possui uma estrutura inicial de Prisma em `apps/api/prisma/schema.prisma`, configurada para PostgreSQL via `DATABASE_URL`.

Neste primeiro passo ainda nao ha migrations. O proximo passo sera desenhar e implementar o banco de dados inicial com Prisma.

## Roadmap

1. Fundacao do projeto
2. Banco de dados e autenticacao
3. Grupos financeiros
4. Transacoes e dashboard
5. Metas e orcamentos
6. WhatsApp e IA
7. Apple Shortcuts/Wallet
8. Open Finance
