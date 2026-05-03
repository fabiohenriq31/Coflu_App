# Coflu Mobile

Aplicativo Expo do Coflu com autenticacao real integrada a API.

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

## Rodando

```bash
npm run dev:mobile
```
