# Coflu - Product Requirements Document (PRD)

Versão: 1.0  
Data: Maio/2026  
Produto: Coflu  
Descrição: Aplicativo financeiro colaborativo para casais e famílias  

---

# 🎯 Visão do Produto

O Coflu é um aplicativo de finanças pessoais com foco em colaboração, permitindo que casais, famílias ou grupos gerenciem juntos suas finanças, metas e gastos de forma simples, visual e inteligente.

---

# 🧱 Metodologia

Este documento utiliza:

- Épicos
- User Stories
- Critérios de Aceite (Given / When / Then)
- Priorização MoSCoW

---

# 📦 ÉPICO 1 - Autenticação e Conta

## 🧾 User Story 1.1 - Cadastro de usuário

**Como** usuário  
**Quero** criar uma conta  
**Para** acessar o Coflu  

### Critérios de Aceite

- Dado que estou na tela de cadastro  
- Quando preencho nome, email e senha válidos  
- Então minha conta é criada com sucesso  

- Dado que o email já existe  
- Então o sistema deve retornar erro  

### Prioridade: MUST

---

## 🧾 User Story 1.2 - Login

**Como** usuário  
**Quero** fazer login  
**Para** acessar minhas finanças  

### Critérios de Aceite

- Dado que tenho conta  
- Quando informo email e senha corretos  
- Então sou autenticado  

- Dado senha incorreta  
- Então recebo erro  

### Prioridade: MUST

---

## 🧾 User Story 1.3 - Recuperação de senha

**Como** usuário  
**Quero** recuperar minha senha  
**Para** voltar a acessar minha conta  

### Critérios de Aceite

- Dado que informo email válido  
- Então recebo instruções de recuperação  

### Prioridade: SHOULD

---

# 👥 ÉPICO 2 - Grupos Financeiros

## 🧾 User Story 2.1 - Criar grupo

**Como** usuário  
**Quero** criar um grupo (casal/família)  
**Para** compartilhar finanças  

### Critérios de Aceite

- Dado usuário autenticado  
- Quando cria grupo  
- Então se torna owner  

### Prioridade: MUST

---

## 🧾 User Story 2.2 - Convidar membro

**Como** usuário  
**Quero** convidar outra pessoa  
**Para** compartilhar o grupo  

### Critérios de Aceite

- Dado grupo existente  
- Quando envio convite  
- Então usuário pode aceitar  

### Prioridade: MUST

---

## 🧾 User Story 2.3 - Papéis de usuário

**Como** sistema  
**Quero** diferenciar permissões  
**Para** controlar acesso  

### Critérios de Aceite

- Owner gerencia tudo  
- Admin gerencia membros  
- Member registra dados  
- Viewer apenas visualiza  

### Prioridade: MUST

---

# 💰 ÉPICO 3 - Transações

## 🧾 User Story 3.1 - Registrar gasto

**Como** usuário  
**Quero** registrar um gasto  
**Para** controlar minhas despesas  

### Critérios de Aceite

- Dado usuário autenticado  
- Quando cria despesa  
- Então ela aparece no dashboard  

### Prioridade: MUST

---

## 🧾 User Story 3.2 - Registrar receita

**Como** usuário  
**Quero** registrar uma receita  
**Para** controlar ganhos  

### Critérios de Aceite

- Receita soma ao saldo  

### Prioridade: MUST

---

## 🧾 User Story 3.3 - Categorizar transação

**Como** usuário  
**Quero** categorizar gastos  
**Para** organizar finanças  

### Critérios de Aceite

- Categoria obrigatória  
- Pode ser padrão ou custom  

### Prioridade: MUST

---

## 🧾 User Story 3.4 - Dividir gastos

**Como** usuário  
**Quero** dividir despesas  
**Para** compartilhar custos  

### Critérios de Aceite

- Divisão por valor ou percentual  

### Prioridade: MUST

---

# 📊 ÉPICO 4 - Dashboard

## 🧾 User Story 4.1 - Visualizar saldo

**Como** usuário  
**Quero** ver saldo atual  
**Para** entender minha situação  

### Critérios de Aceite

- Exibe receitas - despesas  

### Prioridade: MUST

---

## 🧾 User Story 4.2 - Visualizar categorias

**Como** usuário  
**Quero** ver gastos por categoria  
**Para** entender onde gasto mais  

### Critérios de Aceite

- Exibe gráfico por categoria  

### Prioridade: SHOULD

---

# 🎯 ÉPICO 5 - Metas

## 🧾 User Story 5.1 - Criar meta

**Como** usuário  
**Quero** criar metas financeiras  
**Para** planejar objetivos  

### Critérios de Aceite

- Meta possui valor alvo e prazo  

### Prioridade: MUST

---

## 🧾 User Story 5.2 - Acompanhar progresso

**Como** usuário  
**Quero** acompanhar progresso  
**Para** saber quanto falta  

### Critérios de Aceite

- Mostra percentual atingido  

### Prioridade: MUST

---

# 📉 ÉPICO 6 - Orçamentos

## 🧾 User Story 6.1 - Definir limite

**Como** usuário  
**Quero** definir orçamento por categoria  
**Para** controlar gastos  

### Critérios de Aceite

- Sistema alerta quando próximo do limite  

### Prioridade: SHOULD

---

# 🤖 ÉPICO 7 - IA (Pós-MVP)

## 🧾 User Story 7.1 - Interpretar texto

**Como** usuário  
**Quero** digitar gasto em linguagem natural  
**Para** registrar rapidamente  

### Critérios de Aceite

- IA transforma texto em transação  

### Prioridade: COULD

---

## 🧾 User Story 7.2 - Insights financeiros

**Como** usuário  
**Quero** receber recomendações  
**Para** melhorar minha vida financeira  

### Critérios de Aceite

- Sistema gera resumo semanal  

### Prioridade: COULD

---

# 📲 ÉPICO 8 - WhatsApp (Pós-MVP)

## 🧾 User Story 8.1 - Registrar via WhatsApp

**Como** usuário  
**Quero** enviar mensagem  
**Para** registrar gasto  

### Critérios de Aceite

- Sistema cria transação pendente  
- Usuário confirma  

### Prioridade: COULD

---

# 🔐 ÉPICO 9 - Segurança

## 🧾 User Story 9.1 - Isolamento de dados

**Como** sistema  
**Quero** isolar dados por grupo  
**Para** evitar vazamento  

### Critérios de Aceite

- Usuário não acessa grupo que não pertence  

### Prioridade: MUST

---

## 🧾 User Story 9.2 - Logs de auditoria

**Como** sistema  
**Quero** registrar ações  
**Para** rastrear alterações  

### Critérios de Aceite

- Toda ação relevante é logada  

### Prioridade: SHOULD

---

# 📦 Priorização MoSCoW

## MUST (essencial para MVP)
- Autenticação
- Grupos
- Transações
- Dashboard básico
- Metas
- Segurança básica

## SHOULD (importante)
- Orçamentos
- Gráficos
- Logs
- Recuperação de senha

## COULD (diferencial)
- IA
- WhatsApp
- Apple Shortcuts
- Relatórios avançados

## WON’T (agora)
- Open Finance completo
- Integração bancária direta
